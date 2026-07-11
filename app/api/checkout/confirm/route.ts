import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getFlowPaymentStatus } from '@/lib/flow'
import { sendWhatsApp } from '@/lib/twilio'

// Flow llama a este endpoint con POST cuando el pago se procesa
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const token = body.get('token') as string
  if (!token) return NextResponse.json({ error: 'Sin token' }, { status: 400 })

  const { data: order } = await supabaseAdmin
    .from('orders').select('*').eq('flow_token', token).single()
  if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

  const status = await getFlowPaymentStatus(token)

  if (status.status === 2) {
    // Pago exitoso
    await Promise.all([
      supabaseAdmin.from('orders').update({
        payment_status: 'pagado',
        estado: 'pagado',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id),
      // Marcar pieza como no disponible para evitar doble venta
      supabaseAdmin.from('products').update({ disponible: false }).eq('id', order.product_id),
    ])

    await supabaseAdmin.from('order_events').insert({
      order_id: order.id,
      estado:   'pagado',
      mensaje:  'Pago confirmado por Flow. El vendedor fue notificado.',
    })

    // Notificar al vendedor (in-app)
    await supabaseAdmin.from('notifications').insert({
      user_id:  order.seller_id,
      order_id: order.id,
      tipo:     'pedido_nuevo',
      mensaje:  `Nueva compra: ${order.pieza} — $${(order.precio + order.envio_costo).toLocaleString('es-CL')}`,
    })

    // Notificar al vendedor por WhatsApp
    const { data: sellerProfile } = await supabaseAdmin
      .from('seller_profiles')
      .select('whatsapp, nombre')
      .eq('user_id', order.seller_id)
      .maybeSingle()

    if (sellerProfile?.whatsapp) {
      const total = (order.precio + order.envio_costo).toLocaleString('es-CL')
      await sendWhatsApp(
        sellerProfile.whatsapp,
        `🛒 *Nuevo pedido en Componenta*\n\nPieza: ${order.pieza}\nComprador: ${order.buyer_name}\nTotal: $${total}\n\nRevisa tu panel: https://componenta.vercel.app/pedidos`
      )
    }
  } else {
    await supabaseAdmin.from('orders').update({
      payment_status: 'fallido',
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)

    await supabaseAdmin.from('order_events').insert({
      order_id: order.id,
      estado:   'fallido',
      mensaje:  `Pago rechazado o cancelado (código ${status.status}).`,
    })
  }

  return NextResponse.json({ ok: true })
}
