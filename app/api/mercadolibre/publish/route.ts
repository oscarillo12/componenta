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

type Fitment = { make: string; model: string; yearFrom: number; yearTo: number }

async function getValidToken(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('ml_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single<MlTokenRow>()

  if (!data) return null

  if (new Date(data.expires_at) > new Date(Date.now() + 5 * 60 * 1000)) {
    return data.access_token
  }

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

  if (!res.ok) {
    const errText = await res.text().catch(() => 'sin detalle')
    console.error(`[ML] Refresh token falló para user ${userId}:`, res.status, errText)
    return null
  }

  const fresh = await res.json()
  await supabaseAdmin.from('ml_tokens').update({
    access_token:  fresh.access_token,
    refresh_token: fresh.refresh_token,
    expires_at:    new Date(Date.now() + fresh.expires_in * 1000).toISOString(),
  }).eq('user_id', userId)

  return fresh.access_token
}

async function detectarCategoria(query: string): Promise<string> {
  const FALLBACK = 'MLC174408' // Repuestos para Autos y Camionetas
  try {
    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLC/domain_discovery/search?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return FALLBACK
    const data = await res.json()
    return (Array.isArray(data) && data[0]?.category_id) ? data[0].category_id : FALLBACK
  } catch {
    return FALLBACK
  }
}

async function subirImagen(imageUrl: string, token: string): Promise<{ id: string } | null> {
  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = await imgRes.arrayBuffer()
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : 'jpg'
    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: contentType }), `image.${ext}`)
    const mlRes = await fetch('https://api.mercadolibre.com/pictures/items/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!mlRes.ok) return null
    const mlImg = await mlRes.json()
    return mlImg?.id ? { id: mlImg.id } : null
  } catch {
    return null
  }
}

// Intenta publicar degradando el tipo de publicación si la cuenta no es elegible
async function publicarConFallback(
  payload: Record<string, unknown>,
  token: string,
  tipoSolicitado: string,
): Promise<{ mlData: Record<string, unknown>; tipoUsado: string }> {
  const cola = [tipoSolicitado]
  if (tipoSolicitado !== 'bronze') cola.push('bronze')
  if (!cola.includes('free')) cola.push('free')

  const intentos: string[] = []

  for (const tipo of cola) {
    const res = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify({ ...payload, listing_type_id: tipo }),
    })
    const data = await res.json()
    if (res.ok) return { mlData: data, tipoUsado: tipo }
    const causes: string[] = Array.isArray(data.cause)
      ? data.cause.map((c: { message?: string }) => c.message ?? '').filter(Boolean)
      : []
    const needsPictures = causes.some(m => m.toLowerCase().includes('picture'))
    if (data.error !== 'not_eligible_for_listing_type' && !needsPictures) {
      throw new Error(causes.join(' | ') || data.message || `Error ML: ${data.error}`)
    }
    const razon = needsPictures ? 'fotos requeridas' : (causes[0] ?? data.error ?? 'inelegible')
    intentos.push(`${tipo}: ${razon}`)
  }

  throw new Error(`Sin tipo disponible — ${intentos.join(' | ')}`)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { product_id, listing_type = 'gold_special' } = body as {
    product_id?: string
    listing_type?: string
  }
  if (!product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

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

  const fitment: Fitment[] = Array.isArray(product.fitment) ? product.fitment : []

  // ── Título (máx 60 chars) ─────────────────────────────────────────────────
  const yearFrom = fitment.length > 0 ? Math.min(...fitment.map(f => f.yearFrom)) : null
  const yearTo   = fitment.length > 0 ? Math.max(...fitment.map(f => f.yearTo))   : null
  const yearStr  = yearFrom
    ? (yearFrom === yearTo ? ` ${yearFrom}` : ` ${yearFrom}-${yearTo}`)
    : ''
  let title = [product.pieza, product.marca, product.modelo, yearStr]
    .filter(Boolean).join(' ').trim()
  if (title.length > 60) title = title.slice(0, 57) + '...'

  // ── Categoría ─────────────────────────────────────────────────────────────
  const catQuery = [product.pieza, product.marca, product.modelo].filter(Boolean).join(' ')
  const category_id = await detectarCategoria(catQuery)

  // ── Imágenes ──────────────────────────────────────────────────────────────
  const imageUrls = [product.imagen_url].filter(Boolean) as string[]
  const pictureResults = await Promise.all(imageUrls.map(url => subirImagen(url, token)))
  const pictures = pictureResults.filter((p): p is { id: string } => p !== null)

  // ── Descripción (se enviará también como paso separado post-creación) ─────
  const estadoLabel: Record<string, string> = {
    excelente:      'Excelente estado — como nuevo, sin detalles.',
    bueno:          'Buen estado — uso normal, funciona perfectamente.',
    'con-detalles': 'Con detalles menores — funciona bien.',
    'para-reparar': 'Para reparar — requiere reparación.',
  }
  const compatLines = fitment.map(f =>
    `• ${f.make} ${f.model} ${f.yearFrom === f.yearTo ? f.yearFrom : `${f.yearFrom}–${f.yearTo}`}`
  )
  const descripcion = [
    estadoLabel[product.estado as string] ?? '',
    product.descripcion ?? '',
    product.oem ? `Número de parte OEM: ${product.oem}` : '',
    compatLines.length > 0 ? `\nVehículos compatibles:\n${compatLines.join('\n')}` : '',
    product.envio ? `\nEnvío: ${product.envio}` : '',
    '\nPieza extraída de desarmaduria. Verificada y probada antes de publicar.',
    'Consultas sin compromiso.',
  ].filter(Boolean).join('\n')

  // ── Atributos ─────────────────────────────────────────────────────────────
  type MlAttribute = { id: string; value_name?: string; value_id?: string }
  const attributes: MlAttribute[] = []
  if (product.marca)  attributes.push({ id: 'BRAND',             value_name: product.marca })
  if (product.modelo) attributes.push({ id: 'MODEL',             value_name: product.modelo })
  if (product.oem)    attributes.push({ id: 'PART_NUMBER',       value_name: product.oem })
  if (product.oem)    attributes.push({ id: 'SELLER_SKU',        value_name: product.oem })
  if (yearFrom)       attributes.push({ id: 'VEHICLE_YEAR_FROM', value_name: String(yearFrom) })
  if (yearTo)         attributes.push({ id: 'VEHICLE_YEAR_TO',   value_name: String(yearTo) })

  const marcasCompat  = [...new Set(fitment.map(f => f.make).filter(Boolean))]
  const modelosCompat = [...new Set(fitment.map(f => f.model).filter(Boolean))]
  for (const m of marcasCompat)  attributes.push({ id: 'COMPATIBLE_BRANDS', value_name: m })
  for (const m of modelosCompat) attributes.push({ id: 'COMPATIBLE_MODELS', value_name: m })

  // ── Envío ─────────────────────────────────────────────────────────────────
  // ME1/ME2 requieren que la cuenta ML tenga esos modos activados; not_specified es seguro
  const shipping = {
    mode:           'not_specified',
    local_pick_up:  true,
    free_shipping:  false,
  }

  const payload: Record<string, unknown> = {
    title,
    category_id,
    price:              product.precio,
    currency_id:        'CLP',
    available_quantity: 1,
    condition:          'used',
    sale_terms: [{ id: 'WARRANTY_TYPE', value_name: 'Sin garantía' }],
    shipping,
    ...(attributes.length > 0 && { attributes }),
    ...(pictures.length > 0   && { pictures }),
  }

  // ── Publicar con fallback gold_special → bronze → free ───────────────────
  let mlData: Record<string, unknown>
  let tipoUsado: string
  try {
    ;({ mlData, tipoUsado } = await publicarConFallback(payload, token, listing_type))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al publicar en MercadoLibre'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // ── Descripción como paso separado (más confiable por categoría) ──────────
  if (mlData.id) {
    await fetch(`https://api.mercadolibre.com/items/${mlData.id}/description`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify({ plain_text: descripcion }),
    }).catch(() => {})
  }

  // ── Guardar resultado en Supabase ─────────────────────────────────────────
  await supabaseAdmin.from('products').update({
    ml_item_id:   mlData.id,
    ml_permalink: mlData.permalink,
    canales: [...new Set([...(product.canales ?? []), 'mercadolibre'])],
  }).eq('id', product_id)

  return NextResponse.json({
    ml_item_id:   mlData.id,
    permalink:    mlData.permalink,
    listing_type: tipoUsado,
  })
}
