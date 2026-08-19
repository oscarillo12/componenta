import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { APP_URL } from '@/lib/config'
import { supabaseAdmin } from '@/lib/supabase-server'
import sharp from 'sharp'

const ML_APP_ID = process.env.ML_APP_ID
const ML_SECRET_KEY = process.env.ML_SECRET_KEY

// ─── MercadoLibre helpers ────────────────────────────────────────────────────

async function getMlToken(): Promise<string | null> {
  const userId = process.env.COMPONENTA_SYSTEM_USER_ID
  if (!userId || !ML_APP_ID || !ML_SECRET_KEY) return null

  const { data } = await supabaseAdmin
    .from('ml_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return null

  if (new Date(data.expires_at) > new Date(Date.now() + 5 * 60_000)) {
    return data.access_token
  }

  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ML_APP_ID,
      client_secret: ML_SECRET_KEY,
      refresh_token: data.refresh_token,
    }),
  })
  if (!res.ok) return null
  const fresh = await res.json()
  await supabaseAdmin.from('ml_tokens').update({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
    expires_at: new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
  }).eq('user_id', userId)
  return fresh.access_token
}

async function detectarCategoria(query: string): Promise<string> {
  const FALLBACK = 'MLC174408'
  try {
    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLC/domain_discovery/search?q=${encodeURIComponent(query)}&limit=1`
    )
    if (!res.ok) return FALLBACK
    const data = await res.json()
    return Array.isArray(data) && data[0]?.category_id ? data[0].category_id : FALLBACK
  } catch { return FALLBACK }
}

async function subirImagenML(imageUrl: string, token: string): Promise<{ id: string } | { err: string }> {
  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return { err: `HTTP ${imgRes.status}` }
    const rawBuffer = Buffer.from(await imgRes.arrayBuffer())
    const meta = await sharp(rawBuffer).metadata()
    const minSide = Math.min(meta.width ?? 0, meta.height ?? 0)
    const imgBuffer =
      minSide < 500 && minSide > 0
        ? await sharp(rawBuffer)
            .resize(
              Math.round((meta.width ?? 500) * (500 / minSide)),
              Math.round((meta.height ?? 500) * (500 / minSide))
            )
            .jpeg({ quality: 88 })
            .toBuffer()
        : rawBuffer
    const fd = new FormData()
    fd.append('file', new Blob([new Uint8Array(imgBuffer)], { type: 'image/jpeg' }), 'image.jpg')
    const mlRes = await fetch('https://api.mercadolibre.com/pictures/items/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!mlRes.ok) {
      const b = await mlRes.json().catch(() => ({}))
      return { err: b?.message ?? `HTTP ${mlRes.status}` }
    }
    const mlImg = await mlRes.json()
    return mlImg?.id ? { id: mlImg.id } : { err: 'ML no devolvió ID' }
  } catch (e) {
    return { err: String(e) }
  }
}

async function pushMercadoLibre(
  body: Record<string, unknown>,
  productId: string
): Promise<{ ok: boolean; permalink?: string; error?: string }> {
  const token = await getMlToken()
  if (!token) return { ok: false, error: 'no_ml_token — configura COMPONENTA_SYSTEM_USER_ID' }

  const nombre = (body.nombre || body.pieza || 'Producto') as string
  const imageUrl = body.imagen_url as string | undefined

  if (!imageUrl) return { ok: false, error: 'sin imagen' }

  const pictureResult = await subirImagenML(imageUrl, token)
  if ('err' in pictureResult) return { ok: false, error: pictureResult.err }

  const catQuery = [nombre, body.marca, body.modelo].filter(Boolean).join(' ')
  const category_id = await detectarCategoria(catQuery as string)

  const titulo = nombre.length > 60 ? nombre.slice(0, 57) + '...' : nombre

  const payload: Record<string, unknown> = {
    title: titulo,
    category_id,
    price: body.precio ?? 0,
    currency_id: 'CLP',
    available_quantity: 1,
    condition: 'used',
    sale_terms: [{ id: 'WARRANTY_TYPE', value_name: 'Sin garantía' }],
    shipping: { mode: 'not_specified', local_pick_up: true, free_shipping: false },
    pictures: [{ id: pictureResult.id }],
  }

  // Intentar bronze primero, fallback a free
  for (const tipo of ['bronze', 'free']) {
    const res = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ...payload, listing_type_id: tipo }),
    })
    const data = await res.json()
    if (res.ok) {
      if (data.id && body.descripcion) {
        await fetch(`https://api.mercadolibre.com/items/${data.id}/description`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ plain_text: body.descripcion }),
        }).catch(() => {})
      }
      // Guardar ml_item_id en Supabase si existe el producto
      if (data.id) {
        await supabaseAdmin
          .from('products')
          .update({ ml_item_id: data.id, ml_permalink: data.permalink })
          .eq('id', productId)
          .catch(() => {})
      }
      return { ok: true, permalink: data.permalink }
    }
    const causes: string[] = Array.isArray(data.cause)
      ? data.cause.map((c: { message?: string }) => c.message ?? '').filter(Boolean)
      : []
    const isEligibility =
      data.error === 'not_eligible_for_listing_type' ||
      causes.some((m) => m.toLowerCase().includes('picture'))
    if (!isEligibility) {
      return { ok: false, error: causes.join(' | ') || data.message || data.error }
    }
  }
  return { ok: false, error: 'Sin tipo de publicación disponible' }
}

// ─── Google Shopping ─────────────────────────────────────────────────────────

async function pushGoogleShopping(
  body: Record<string, unknown>,
  productId: string
): Promise<{ ok: boolean; reason?: string }> {
  const platformUserId = process.env.GOOGLE_PLATFORM_USER_ID
  if (!platformUserId) return { ok: false, reason: 'no_platform_user' }

  const { data: tok } = await supabaseAdmin
    .from('google_tokens')
    .select('merchant_id, access_token, refresh_token, expires_at')
    .eq('user_id', platformUserId)
    .maybeSingle()
  if (!tok) return { ok: false, reason: 'no_token' }

  let at = tok.access_token
  if (new Date(tok.expires_at) <= new Date(Date.now() + 5 * 60_000)) {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        refresh_token: tok.refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    if (r.ok) {
      const f = await r.json()
      at = f.access_token
      await supabaseAdmin
        .from('google_tokens')
        .update({ access_token: f.access_token, expires_at: new Date(Date.now() + f.expires_in * 1000).toISOString() })
        .eq('user_id', platformUserId)
    }
  }

  const nombre = (body.nombre || body.pieza || 'Producto') as string
  const title = [nombre, body.marca, body.modelo, body.anios].filter(Boolean).join(' — ').slice(0, 150)
  const res = await fetch(
    `https://shoppingcontent.googleapis.com/content/v2.1/${tok.merchant_id}/products`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: `componenta-${productId}`,
        title,
        description: ((body.descripcion as string) || `${nombre} disponible.`).slice(0, 5000),
        link: `${APP_URL}/p/${productId}`,
        imageLink: body.imagen_url ?? `${APP_URL}/og-image.png`,
        contentLanguage: 'es',
        targetCountry: 'CL',
        channel: 'online',
        availability: 'in stock',
        condition: 'used',
        price: { value: String(Math.round((body.precio as number) ?? 0)), currency: 'CLP' },
        brand: ((body.marca as string) ?? 'Universal').slice(0, 70),
        identifierExists: false,
        googleProductCategory: '916',
      }),
    }
  )
  return { ok: res.ok }
}

// ─── Meta Catalog ────────────────────────────────────────────────────────────

async function pushMetaCatalog(
  body: Record<string, unknown>,
  productId: string
): Promise<{ ok: boolean; reason?: string }> {
  const catalogId = process.env.META_CATALOG_ID
  const accessToken = process.env.META_ACCESS_TOKEN
  if (!catalogId || !accessToken) return { ok: false, reason: 'no_config' }

  const nombre = (body.nombre || body.pieza || 'Producto') as string
  const title = [nombre, body.marca, body.modelo].filter(Boolean).join(' — ').slice(0, 150)
  const res = await fetch(`https://graph.facebook.com/v19.0/${catalogId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailer_id: `componenta-${productId}`,
      name: title,
      description: ((body.descripcion as string) || `${nombre} disponible.`).slice(0, 5000),
      url: `${APP_URL}/p/${productId}`,
      image_url: body.imagen_url ?? `${APP_URL}/og-image.png`,
      condition: 'used',
      availability: 'in stock',
      price: Math.round((body.precio as number) ?? 0),
      currency: 'CLP',
      brand: (body.marca as string) ?? 'Universal',
      category: 'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts',
      access_token: accessToken,
    }),
  })
  return { ok: res.ok }
}

// ─── Guardar en Supabase (para tener product_id y ML permalink) ──────────────

async function saveToSupabase(
  body: Record<string, unknown>,
  productId: string
): Promise<void> {
  const userId = process.env.COMPONENTA_SYSTEM_USER_ID
  if (!userId) return
  const nombre = (body.nombre || body.pieza || 'Producto') as string
  await supabaseAdmin.from('products').insert({
    id: productId,
    user_id: userId,
    pieza: nombre,
    marca: body.marca ?? null,
    modelo: body.modelo ?? null,
    anios: body.anios ?? null,
    precio: body.precio ?? 0,
    descripcion: body.descripcion ?? null,
    imagen_url: body.imagen_url ?? null,
    disponible: true,
    vistas: 0,
    canales: [],
    fitment: [],
    seller_nombre: process.env.COMPONENTA_SELLER_NOMBRE ?? 'Tienda',
    seller_telefono: process.env.COMPONENTA_SELLER_PHONE ?? null,
    estado: 'bueno',
  }).catch(() => {})
}

// ─── Main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-componenta-secret')
  if (!secret || secret !== process.env.COMPONENTA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const productId = randomUUID()

  // Guardar en Supabase primero (para que MeLi pueda actualizar ml_item_id)
  await saveToSupabase(body, productId)

  const [mlResult, googleResult, metaResult] = await Promise.allSettled([
    pushMercadoLibre(body, productId),
    pushGoogleShopping(body, productId),
    pushMetaCatalog(body, productId),
  ])

  return NextResponse.json({
    ok: true,
    productId,
    mercadolibre: mlResult.status === 'fulfilled' ? mlResult.value : { ok: false },
    google: googleResult.status === 'fulfilled' ? googleResult.value : { ok: false },
    meta: metaResult.status === 'fulfilled' ? metaResult.value : { ok: false },
  })
}
