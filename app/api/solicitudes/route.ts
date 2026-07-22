import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendWhatsApp } from '@/lib/twilio'
import { APP_URL } from '@/lib/config'

// GET — lista solicitudes activas (más recientes primero)
// Si el usuario está autenticado, incluye buyer_phone para que vendedores puedan contactar
export async function GET() {
  const { userId } = await auth()
  const fields = userId
    ? 'id, pieza, marca, modelo, anio, descripcion, buyer_name, buyer_phone, buyer_email, created_at'
    : 'id, pieza, marca, modelo, anio, descripcion, buyer_name, created_at'

  const { data, error } = await supabaseAdmin
    .from('solicitudes')
    .select(fields)
    .eq('activa', true)
    .order('created_at', { ascending: false })
    .limit(80)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ solicitudes: data ?? [] })
}

// POST — nueva solicitud + WhatsApp a todos los vendedores
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { pieza, marca, modelo, anio, descripcion, buyer_name, buyer_phone, buyer_email } = body

  if (!pieza?.trim() || !buyer_name?.trim()) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Anti-spam: un mismo teléfono no puede enviar más de una solicitud por hora
  if (buyer_phone) {
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString()
    const { data: recent } = await supabaseAdmin
      .from('solicitudes')
      .select('id')
      .eq('buyer_phone', buyer_phone)
      .gte('created_at', oneHourAgo)
      .limit(1)

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: 'Ya enviaste una solicitud en la última hora. Espera un momento antes de enviar otra.' },
        { status: 429 }
      )
    }
  }

  // Insertar solicitud
  const { data: nueva, error } = await supabaseAdmin
    .from('solicitudes')
    .insert({ pieza: pieza.trim(), marca: marca?.trim() || null, modelo: modelo?.trim() || null, anio: anio?.trim() || null, descripcion: descripcion?.trim() || null, buyer_name: buyer_name.trim(), buyer_phone: buyer_phone?.trim() || null, buyer_email: buyer_email?.trim() || null })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notificar a todos los vendedores con teléfono registrado (fire-and-forget)
  ;(async () => {
    const { data: sellers } = await supabaseAdmin
      .from('products')
      .select('seller_telefono')
      .eq('disponible', true)
      .not('seller_telefono', 'is', null)

    // Deduplicar teléfonos
    const telefonos = [...new Set((sellers ?? []).map(s => s.seller_telefono as string))]

    const detalle = [
      marca  ? `🚗 ${[marca, modelo, anio].filter(Boolean).join(' ')}` : null,
      descripcion ? `📝 ${descripcion}` : null,
    ].filter(Boolean).join('\n')

    const msg =
      `🔍 *Nueva búsqueda en Componenta*\n\n` +
      `*${buyer_name}* busca:\n` +
      `📦 *${pieza}*\n` +
      (detalle ? `${detalle}\n` : '') +
      (buyer_phone ? `\n¿Tienes esta pieza? Contacta al comprador:\n📞 ${buyer_phone}\n` : '') +
      `\n🔗 Ver todas las búsquedas:\n${APP_URL}/solicitudes`

    await Promise.allSettled(telefonos.map(tel => sendWhatsApp(tel, msg)))
  })().catch(() => {})

  return NextResponse.json({ ok: true, id: nueva?.id })
}
