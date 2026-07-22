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
  const estadoLabel: Record<string, string> = {
    excelente: 'Excelente estado — como nuevo, sin detalles.',
    bueno: 'Buen estado — uso normal, funciona perfectamente.',
    'con-detalles': 'Con detalles menores — funciona bien.',
    'para-reparar': 'Para reparar — requiere reparación.',
  }
  const fitment: { make: string; model: string; yearFrom: number; yearTo: number }[] =
    Array.isArray(product.fitment) ? product.fitment : []

  const compatLines = fitment.map(f =>
    `• ${f.make} ${f.model} ${f.yearFrom === f.yearTo ? f.yearFrom : `${f.yearFrom}–${f.yearTo}`}`
  )

  const descLines = [
    estadoLabel[product.estado as string] ?? '',
    product.descripcion ?? '',
    product.oem ? `N° de parte OEM: ${product.oem}` : '',
    product.envio ? `Envío: ${product.envio}` : '',
    compatLines.length > 0 ? `\nVehículos compatibles:\n${compatLines.join('\n')}` : '',
    '\nPieza usada extraída de desarmaduria. Verificada antes de publicar.',
  ].filter(Boolean)

  // Subir imagen directamente a ML (más confiable que pasar URL externa)
  let pictures: { id: string }[] = []
  if (product.imagen_url) {
    try {
      const imgRes = await fetch(product.imagen_url as string)
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer()
        const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
        const ext = contentType.includes('png') ? 'png' : 'jpg'
        const formData = new FormData()
        formData.append('file', new Blob([imgBuffer], { type: contentType }), `image.${ext}`)
        const mlImgRes = await fetch('https://api.mercadolibre.com/pictures/items/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (mlImgRes.ok) {
          const mlImg = await mlImgRes.json()
          if (mlImg?.id) pictures = [{ id: mlImg.id }]
        }
      }
    } catch { /* sin foto si falla */ }
  }

  // Buscar categoría hoja por título usando domain_discovery
  let category_id = 'MLC174408' // fallback: Repuestos para Autos
  try {
    const catRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/domain_discovery/search?q=${encodeURIComponent(title)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    )
    if (catRes.ok) {
      const catData = await catRes.json()
      if (Array.isArray(catData) && catData[0]?.category_id) {
        category_id = catData[0].category_id
      }
    }
  } catch { /* usa fallback */ }

  const attributes: { id: string; value_name: string }[] = []
  if (product.marca) attributes.push({ id: 'BRAND', value_name: product.marca })
  if (product.oem)   attributes.push({ id: 'PART_NUMBER', value_name: product.oem })

  // Compatibilidad de vehículos desde fitment
  const marcasCompat = [...new Set(fitment.map(f => f.make).filter(Boolean))]
  const modelosCompat = [...new Set(fitment.map(f => f.model).filter(Boolean))]
  for (const m of marcasCompat)  attributes.push({ id: 'COMPATIBLE_BRANDS', value_name: m })
  for (const m of modelosCompat) attributes.push({ id: 'COMPATIBLE_MODELS', value_name: m })

  // Condición detallada
  if (product.estado) {
    const condMap: Record<string, string> = {
      excelente: 'Excelente', bueno: 'Bueno', 'con-detalles': 'Con detalles', 'para-reparar': 'Para reparar',
    }
    const condLabel = condMap[product.estado as string]
    if (condLabel) attributes.push({ id: 'ITEM_CONDITION', value_name: condLabel })
  }

  // Envío según opción elegida
  const localPickup = (product.envio as string ?? '').includes('retiro')
  const shipping = {
    mode: localPickup ? 'not_specified' : 'me2',
    local_pick_up: true,
    free_shipping: false,
  }

  const payload: Record<string, unknown> = {
    title,
    category_id,
    price:              product.precio,
    currency_id:        'CLP',
    available_quantity: 1,
    condition:          'used',
    listing_type_id:    'free',
    description:        { plain_text: descLines.join('\n') },
    sale_terms: [
      { id: 'WARRANTY_TYPE', value_name: 'Sin garantía' },
    ],
    shipping,
    ...(attributes.length > 0 && { attributes }),
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
