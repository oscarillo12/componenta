import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

type GoogleToken = {
  merchant_id:   string
  access_token:  string
  refresh_token: string
  expires_at:    string
}

async function getValidToken(userId: string): Promise<{ token: string; merchantId: string } | null> {
  const { data } = await supabaseAdmin
    .from('google_tokens')
    .select('merchant_id, access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single<GoogleToken>()

  if (!data) return null

  // Token aún válido (con 5 min de margen)
  if (new Date(data.expires_at) > new Date(Date.now() + 5 * 60_000)) {
    return { token: data.access_token, merchantId: data.merchant_id }
  }

  // Refrescar
  if (!CLIENT_ID || !CLIENT_SECRET) return null
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type:    'refresh_token',
    }),
  })

  if (!res.ok) return null

  const fresh = await res.json()
  await supabaseAdmin.from('google_tokens').update({
    access_token: fresh.access_token,
    expires_at:   new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
  }).eq('user_id', userId)

  return { token: fresh.access_token, merchantId: data.merchant_id }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { product_id?: string }
  if (!body.product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', body.product_id)
    .eq('user_id', userId)
    .single()

  if (prodErr || !product) return NextResponse.json({ error: 'Pieza no encontrada' }, { status: 404 })

  const authData = await getValidToken(userId)
  if (!authData) return NextResponse.json({ error: 'gsc_not_connected' }, { status: 403 })

  const { token, merchantId } = authData

  const title   = [product.pieza, product.marca, product.modelo].filter(Boolean).join(' ').slice(0, 150)
  const desc    = (product.descripcion || `${product.pieza} usado en buen estado. Disponible en Componenta Chile.`).slice(0, 5000)
  const offerId = `componenta-${product.id}`

  const payload = {
    offerId,
    title,
    description: desc,
    link:         `https://componenta.vercel.app/marketplace/${product.id}`,
    imageLink:    product.imagen_url ?? 'https://componenta.vercel.app/og-image.png',
    contentLanguage:     'es',
    targetCountry:       'CL',
    channel:             'online',
    availability:        'in stock',
    condition:           product.estado === 'nuevo' ? 'new' : 'used',
    price:               { value: String(Math.round(product.precio)), currency: 'CLP' },
    brand:               (product.marca ?? 'Universal').slice(0, 70),
    identifierExists:    false,
    googleProductCategory: '916',
    productTypes:        ['Vehículos y repuestos > Repuestos y accesorios para automóviles'],
  }

  const gscRes = await fetch(
    `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/products`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }
  )

  const gscData = await gscRes.json()

  if (!gscRes.ok) {
    return NextResponse.json(
      { error: gscData.error?.message ?? 'Error al publicar en Google Shopping', details: gscData },
      { status: 400 }
    )
  }

  // Marcar como publicado en el array canales
  await supabaseAdmin.from('products').update({
    canales: [...new Set([...(product.canales ?? []), 'google_shopping'])],
  }).eq('id', body.product_id)

  return NextResponse.json({ offer_id: gscData.id })
}
