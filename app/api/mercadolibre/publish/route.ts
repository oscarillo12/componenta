import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ML_APP_ID     = process.env.ML_APP_ID
const ML_SECRET_KEY = process.env.ML_SECRET_KEY

type MlTokenRow = {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
}

async function getValidToken(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('ml_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single<MlTokenRow>()

  if (!data) return null

  const expiresAt = new Date(data.expires_at)
  if (expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return data.access_token
  }

  // Refrescar token
  if (!ML_APP_ID || !ML_SECRET_KEY) return null
  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     ML_APP_ID,
      client_secret: ML_SECRET_KEY,
      refresh_token: data.refresh_token,
    }),
  })

  if (!res.ok) return null

  const fresh = await res.json()
  await supabaseAdmin.from('ml_tokens').update({
    access_token:  fresh.access_token,
    refresh_token: fresh.refresh_token,
    expires_at:    new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
  }).eq('user_id', userId)

  return fresh.access_token
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { product_id } = body as { product_id?: string }
  if (!product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

  // Verificar que la pieza pertenece al usuario
  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('user_id', userId)
    .single()

  if (prodErr || !product) {
    return NextResponse.json({ error: 'Pieza no encontrada' }, { status: 404 })
  }

  const token = await getValidToken(userId)
  if (!token) {
    return NextResponse.json({ error: 'ml_not_connected' }, { status: 403 })
  }

  // Construir título (ML máx 60 chars)
  const titleParts = [product.pieza, product.marca, product.modelo].filter(Boolean)
  let title = titleParts.join(' ')
  if (title.length > 60) title = title.slice(0, 57) + '...'

  // Descripción
  const descLines = [
    product.descripcion ?? '',
    product.marca && product.modelo
      ? `Compatible con ${product.marca} ${product.modelo}${product.anios ? ` (${product.anios})` : ''}.`
      : '',
    product.oem ? `N° de parte: ${product.oem}` : '',
    'Pieza usada extraída de desarmaduria. Verificada antes de publicar.',
  ].filter(Boolean)

  // Imágenes — ML acepta URLs externas directamente
  const pictures = product.imagen_url
    ? [{ source: product.imagen_url as string }]
    : []

  const payload: Record<string, unknown> = {
    title,
    category_id:     'MLC1747',    // Accesorios para Vehículos — Chile
    price:           product.precio,
    currency_id:     'CLP',
    condition:       'used',
    listing_type_id: 'gold_special',
    description:     { plain_text: descLines.join('\n') },
    ...(pictures.length > 0 && { pictures }),
  }

  const mlRes = await fetch('https://api.mercadolibre.com/items', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify(payload),
  })

  const mlData = await mlRes.json()

  if (!mlRes.ok) {
    // Intentar con listing_type_id: free si gold_special falla
    if (mlData.error === 'not_eligible_for_listing_type') {
      payload.listing_type_id = 'free'
      const retryRes = await fetch('https://api.mercadolibre.com/items', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!retryRes.ok) {
        const retryData = await retryRes.json()
        return NextResponse.json({ error: retryData.message ?? 'Error al publicar en ML', details: retryData }, { status: 400 })
      }
      const retryData = await retryRes.json()
      await supabaseAdmin.from('products').update({
        ml_item_id:  retryData.id,
        ml_permalink: retryData.permalink,
        canales: [...new Set([...(product.canales ?? []), 'mercadolibre'])],
      }).eq('id', product_id)
      return NextResponse.json({ ml_item_id: retryData.id, permalink: retryData.permalink })
    }

    return NextResponse.json({ error: mlData.message ?? 'Error al publicar en ML', details: mlData }, { status: 400 })
  }

  // Guardar el ID y permalink de ML en la pieza
  await supabaseAdmin.from('products').update({
    ml_item_id:   mlData.id,
    ml_permalink: mlData.permalink,
    canales: [...new Set([...(product.canales ?? []), 'mercadolibre'])],
  }).eq('id', product_id)

  return NextResponse.json({ ml_item_id: mlData.id, permalink: mlData.permalink })
}
