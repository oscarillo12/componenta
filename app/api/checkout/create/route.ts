import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createFlowPayment } from '@/lib/flow'
import { sendWhatsApp } from '@/lib/twilio'
import { APP_URL } from '@/lib/config'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 })

  const body = await req.json()
  const { product_id, pieza, precio, envio_costo = 0, seller_id, imagen_url,
          buyer_name, buyer_phone, buyer_address } = body

  if (!product_id || !precio || !seller_id)
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  // Verificar que la pieza siga disponible (evita doble venta)
  const { data: product } = await supabaseAdmin
    .from('products').select('disponible').eq('id', product_id).single()
  if (!product?.disponible) {
    return NextResponse.json({ error: 'Esta pieza ya no está disponible. Puede que otro comprador la haya reservado.' }, { status: 409 })
  }

  // Obtener email del comprador desde Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const buyer_email = user.emailAddresses[0]?.emailAddress
  if (!buyer_email) return NextResponse.json({ error: 'Sin email registrado' }, { status: 400 })

  const total = precio + envio_costo

  // Crear orden en estado "pendiente_pago"
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      product_id,
      pieza,
      precio,
      envio_costo,
      buyer_id:      userId,
      buyer_name:    buyer_name || user.fullName || 'Comprador',
      buyer_email,
      buyer_phone:   buyer_phone || null,
      buyer_address: buyer_address || null,
      seller_id,
      imagen_url:    imagen_url || null,
      estado:        'pendiente',
      payment_status:'pendiente',
    })
    .select()
    .single()

  if (error || !order) {
    console.error('[checkout/create]', error)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }

  // Crear primer evento en timeline
  await supabaseAdmin.from('order_events').insert({
    order_id: order.id,
    estado:   'pendiente',
    mensaje:  'Orden creada. Esperando confirmación de pago.',
  })

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  // Si no hay keys de Flow configuradas, usar modo simulado
  const flowKey = process.env.FLOW_API_KEY
  if (!flowKey) {
    // Modo demo: marcar como pagado directamente
    await Promise.all([
      supabaseAdmin.from('orders').update({ payment_status: 'pagado', estado: 'pagado' }).eq('id', order.id),
      supabaseAdmin.from('products').update({ disponible: false }).eq('id', product_id),
    ])

    await supabaseAdmin.from('order_events').insert({
      order_id: order.id,
      estado:   'pagado',
      mensaje:  'Pago simulado (modo demo sin Flow configurado).',
    })

    await supabaseAdmin.from('notifications').insert({
      user_id:  seller_id,
      order_id: order.id,
      tipo:     'pedido_nuevo',
      mensaje:  `Nueva compra: ${pieza} — $${total.toLocaleString('es-CL')}`,
    })

    // Confirmar al comprador por WhatsApp (demo)
    if (buyer_phone) {
      sendWhatsApp(
        buyer_phone,
        `✅ *¡Pedido confirmado en Componenta!*\n\n` +
        `Pieza: *${pieza}*\n` +
        `Total: $${total.toLocaleString('es-CL')}\n\n` +
        `El vendedor te contactará para coordinar la entrega.\n\n` +
        `Sigue tu pedido aquí:\n${APP_URL}/mis-pedidos/${order.id}`
      ).catch(() => {})
    }

    return NextResponse.json({ redirect: `/mis-pedidos/${order.id}?demo=1` })
  }

  // Crear pago en Flow
  try {
    const flow = await createFlowPayment({
      commerceOrder:   order.id,
      subject:         `Componenta: ${pieza}`,
      amount:          total,
      email:           buyer_email,
      urlConfirmation: `${origin}/api/checkout/confirm`,
      urlReturn:       `${origin}/api/checkout/return`,
    })

    await supabaseAdmin.from('orders').update({ flow_token: flow.token }).eq('id', order.id)
    return NextResponse.json({ redirect: flow.url })
  } catch (e) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    const msg = e instanceof Error ? e.message : 'Error con Flow'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
