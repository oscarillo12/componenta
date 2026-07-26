import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendMatchEmail } from '@/lib/email'
import { sendWhatsApp } from '@/lib/twilio'
import { APP_URL } from '@/lib/config'

const FREE_LIMIT = 5

type VehicleCompat = { marca?: string; modelo?: string; anios?: string }
type Fitment = { make: string; model: string; yearFrom: number; yearTo: number }

function compatToFitment(compat: VehicleCompat[]): Fitment[] {
  return (compat ?? []).map(c => {
    const anios = (c.anios ?? '').replace('–', '-')
    const m = anios.match(/(\d{4})[-](\d{4})/)
    const single = anios.match(/^(\d{4})$/)
    const yearFrom = m ? parseInt(m[1]) : single ? parseInt(single[1]) : 2000
    const yearTo   = m ? parseInt(m[2]) : yearFrom
    return { make: c.marca ?? '', model: c.modelo ?? '', yearFrom, yearTo }
  }).filter(f => f.make && f.model)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = user.publicMetadata as { productsCount?: number; plan?: string; nombre?: string; telefono?: string }
  const count  = meta.productsCount ?? 0
  const plan   = meta.plan ?? 'free'

  if (plan === 'free' && count >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'limite_alcanzado', count, limit: FREE_LIMIT },
      { status: 403 },
    )
  }

  const body = await req.json()

  // Bloquear duplicado solo si pieza + marca + modelo coinciden exactamente
  // (permite múltiples “motor completo” de distintos vehículos)
  let dupQuery = supabaseAdmin
    .from('products')
    .select('id, pieza, marca, modelo')
    .eq('user_id', userId)
    .ilike('pieza', body.pieza ?? '')
    .eq('disponible', true)

  if (body.marca)  dupQuery = (dupQuery as typeof dupQuery).ilike('marca',  body.marca)
  if (body.modelo) dupQuery = (dupQuery as typeof dupQuery).ilike('modelo', body.modelo)

  const { data: existingPieza } = await dupQuery.maybeSingle()

  if (existingPieza) {
    const detalle = [existingPieza.marca, existingPieza.modelo].filter(Boolean).join(' ')
    return NextResponse.json(
      {
        error: 'duplicate_pieza',
        detail: `Ya tienes “${existingPieza.pieza}${detalle ? ` (${detalle})` : ''}” publicada y disponible. Elímínala o márcala como vendida antes de publicar otra igual.`,
      },
      { status: 409 },
    )
  }

  // â”€â”€ Construir nombre visible del vendedor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sellerNombre =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
    'Vendedor Componenta'

  const sellerTelefono =
    user.phoneNumbers[0]?.phoneNumber ?? meta.telefono ?? null

  // â”€â”€ Guardar en Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: inserted, error: dbError } = await supabaseAdmin.from('products').insert({
    user_id:          userId,
    pieza:            body.pieza ?? 'Sin nombre',
    marca:            body.marca ?? null,
    modelo:           body.modelo ?? null,
    anios:            body.anios ?? null,
    oem:              body.oem ?? null,
    estado:           body.estado ?? 'bueno',
    precio:           body.precio ?? 0,
    envio:            body.envio ?? null,
    descripcion:      body.descripcion ?? null,
    canales:          body.canales ?? [],
    fitment:          compatToFitment(body.compatibilidad ?? []),
    disponible:       true,
    vistas:           0,
    imagen_url:       body.imagen_url ?? null,
    image_hash:       body.image_hash ?? null,
    seller_nombre:    sellerNombre,
    seller_telefono:  sellerTelefono,
  }).select('id').single()

  if (dbError) {
    console.error('[publish] Supabase error:', dbError)
    return NextResponse.json(
      { error: 'Error al guardar en base de datos', detail: dbError.message },
      { status: 500 },
    )
  }

  // ── Incrementar contador en Clerk ─────────────────────────────────────────
  await client.users.updateUser(userId, {
    publicMetadata: { ...meta, productsCount: count + 1 },
  })

  // ── Notificar compradores con solicitudes que coincidan (fire-and-forget) ──
  ;(async () => {
    const piezaP  = (body.pieza ?? '').toLowerCase().trim()
    const marcaP  = (body.marca ?? '').toLowerCase().trim()
    const modeloP = (body.modelo ?? '').toLowerCase().trim()
    if (!piezaP) return

    const { data: solicitudes } = await supabaseAdmin
      .from('solicitudes')
      .select('pieza, marca, modelo, anio, buyer_name, buyer_email, buyer_phone')
      .eq('activa', true)
      .or('buyer_email.not.is.null,buyer_phone.not.is.null')

    if (!solicitudes?.length) return

    const matched = solicitudes.filter(s => {
      const piezaS = (s.pieza ?? '').toLowerCase()
      const keyP = piezaP.split(' ')[0]
      const keyS = piezaS.split(' ')[0]
      if (!piezaP.includes(keyS) && !piezaS.includes(keyP)) return false
      if (s.marca && marcaP) {
        const marcaS = s.marca.toLowerCase()
        if (!marcaP.includes(marcaS) && !marcaS.includes(marcaP)) return false
      }
      if (s.modelo && modeloP) {
        const modeloS = s.modelo.toLowerCase()
        if (!modeloP.includes(modeloS) && !modeloS.includes(modeloP)) return false
      }
      return true
    })

    const auto = [body.marca, body.modelo].filter(Boolean).join(' ')
    const waMsg =
      `✅ Componenta: Encontramos tu ${body.pieza}${auto ? ` para ${auto}` : ''}.\n` +
      `${sellerNombre} lo tiene disponible.` +
      (sellerTelefono ? `\nContáctalo: wa.me/${sellerTelefono.replace(/\D/g, '')}` : '')

    await Promise.allSettled(
      matched.flatMap(s => {
        const notifs: Promise<void>[] = []
        if (s.buyer_email) {
          notifs.push(sendMatchEmail({
            buyerEmail: s.buyer_email,
            buyerName:  s.buyer_name,
            pieza:      s.pieza,
            marca:      s.marca,
            modelo:     s.modelo,
            anio:       s.anio,
            sellerNombre,
            sellerTelefono,
          }))
        }
        if (s.buyer_phone) {
          notifs.push(sendWhatsApp(s.buyer_phone, waMsg))
        }
        return notifs
      })
    )
  })().catch(() => {})

  const productId = inserted?.id

  // ── Auto-push Google Shopping (plataforma, fire-and-forget) ──────────────
  ;(async () => {
    const platformUserId = process.env.GOOGLE_PLATFORM_USER_ID
    if (!platformUserId || !productId) return

    const { data: tok } = await supabaseAdmin
      .from('google_tokens')
      .select('merchant_id, access_token, refresh_token, expires_at')
      .eq('user_id', platformUserId)
      .maybeSingle()
    if (!tok) return

    let at = tok.access_token
    if (new Date(tok.expires_at) <= new Date(Date.now() + 5 * 60_000)) {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id:     process.env.GOOGLE_CLIENT_ID     ?? '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          refresh_token: tok.refresh_token,
          grant_type:    'refresh_token',
        }),
      })
      if (r.ok) {
        const f = await r.json()
        at = f.access_token
        await supabaseAdmin.from('google_tokens').update({
          access_token: f.access_token,
          expires_at:   new Date(Date.now() + f.expires_in * 1000).toISOString(),
        }).eq('user_id', platformUserId)
      }
    }

    const title = [body.pieza, body.marca, body.modelo, body.anios].filter(Boolean).join(' — ').slice(0, 150)
    await fetch(`https://shoppingcontent.googleapis.com/content/v2.1/${tok.merchant_id}/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId:      `componenta-${productId}`,
        title,
        description: (body.descripcion || `${body.pieza} usado en buen estado, disponible en Componenta Chile.`).slice(0, 5000),
        link:         `${APP_URL}/p/${productId}`,
        imageLink:    body.imagen_url ?? `${APP_URL}/og-image.png`,
        contentLanguage: 'es', targetCountry: 'CL', channel: 'online',
        availability: 'in stock',
        condition:    body.estado === 'nuevo' ? 'new' : 'used',
        price:        { value: String(Math.round(body.precio ?? 0)), currency: 'CLP' },
        brand:        (body.marca ?? 'Universal').slice(0, 70),
        identifierExists: false,
        googleProductCategory: '916',
        productTypes: ['Vehículos y repuestos > Repuestos y accesorios para automóviles'],
      }),
    })
  })().catch(() => {})

  // ── Auto-push Meta Catalog (fire-and-forget) ─────────────────────────────
  ;(async () => {
    const catalogId   = process.env.META_CATALOG_ID
    const accessToken = process.env.META_ACCESS_TOKEN
    if (!catalogId || !accessToken || !productId) return

    const title = [body.pieza, body.marca, body.modelo].filter(Boolean).join(' — ').slice(0, 150)
    await fetch(`https://graph.facebook.com/v19.0/${catalogId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        retailer_id:  `componenta-${productId}`,
        name:          title,
        description:  (body.descripcion || `${body.pieza} usado en buen estado`).slice(0, 5000),
        url:          `${APP_URL}/p/${productId}`,
        image_url:    body.imagen_url ?? `${APP_URL}/og-image.png`,
        condition:    'used',
        availability: 'in stock',
        price:        Math.round(body.precio ?? 0),
        currency:     'CLP',
        brand:        body.marca ?? 'Universal',
        category:     'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts',
        access_token: accessToken,
      }),
    })
  })().catch(() => {})

  return NextResponse.json({ ok: true, id: productId ?? null, productsCount: count + 1, limit: FREE_LIMIT })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = user.publicMetadata as { productsCount?: number; plan?: string }

  return NextResponse.json({
    productsCount: meta.productsCount ?? 0,
    limit:         FREE_LIMIT,
    plan:          meta.plan ?? 'free',
  })
}

