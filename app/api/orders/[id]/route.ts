import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

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
    .from('orders').select('seller_id, buyer_id, pieza').eq('id', id).single()
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

  // Notificar al comprador
  await supabaseAdmin.from('notifications').insert({
    user_id:  order.buyer_id,
    order_id: id,
    tipo:     `pedido_${estado}`,
    mensaje:  `${order.pieza}: ${eventMsg}`,
  })

  return NextResponse.json({ ok: true })
}
