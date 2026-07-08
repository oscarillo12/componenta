import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { sendWhatsApp } from '@/lib/twilio'

type Ctx = { params: Promise<{ id: string }> }

const ESTADO_MESSAGES: Record<string, string> = {
  confirmado:  'El vendedor confirmó tu pedido y está preparando el envío.',
  despachado:  'Tu pedido fue despachado. ¡Pronto llegará!',
  entregado:   'Pedido entregado. ¡Gracias por comprar en Componenta!',
  cancelado:   'El pedido fue cancelado.',
}

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`*, order_events(* )`)
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (data.buyer_id !== userId && data.seller_id !== userId)
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  return NextResponse.json({ order: data })
}

// PATCH /api/orders/[id] — el vendedor actualiza el estado
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { estado, tracking_code, mensaje } = body

  // Verificar que el usuario es el vendedor
  const { data: order } = await supabaseAdmin
    .from('orders').select('seller_id, buyer_id, pieza, buyer_phone, precio, envio_costo').eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (order.seller_id !== userId) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  // Actualizar orden
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (estado)        update.estado = estado
  if (tracking_code) update.tracking_code = tracking_code

  await supabaseAdmin.from('orders').update(update).eq('id', id)

  // Crear evento en el timeline
  const eventMsg = mensaje || ESTADO_MESSAGES[estado] || `Estado actualizado a: ${estado}`
  await supabaseAdmin.from('order_events').insert({
    order_id: id,
    estado,
    mensaje: eventMsg,
  })

  // Notificar al comprador (in-app)
  await supabaseAdmin.from('notifications').insert({
    user_id:  order.buyer_id,
    order_id: id,
    tipo:     `pedido_${estado}`,
    mensaje:  `${order.pieza}: ${eventMsg}`,
  })

  // Notificar al comprador por WhatsApp si tiene teléfono
  if (order.buyer_phone && estado !== 'cancelado') {
    const BUYER_MSG: Record<string, string> = {
      confirmado: `✅ *Tu pedido fue confirmado*\n\nPieza: ${order.pieza}\n\nEl vendedor está preparando tu repuesto.`,
      despachado: `🚚 *Tu pedido va en camino*\n\nPieza: ${order.pieza}\n${tracking_code ? `Código de seguimiento: ${tracking_code}` : ''}`,
      entregado:  `🎉 *Pedido entregado*\n\nGracias por comprar ${order.pieza} en Componenta.\n¿Todo bien? Responde esta nota si tienes algún problema.`,
    }
    const msg = BUYER_MSG[estado]
    if (msg) await sendWhatsApp(order.buyer_phone, msg)
  }

  return NextResponse.json({ ok: true })
}
