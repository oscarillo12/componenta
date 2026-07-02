import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getFlowPaymentStatus } from '@/lib/flow'

// Flow redirige al comprador aquí después del pago
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/mis-pedidos', req.url))

  const { data: order } = await supabaseAdmin
    .from('orders').select('id, payment_status').eq('flow_token', token).single()

  if (!order) return NextResponse.redirect(new URL('/mis-pedidos', req.url))

  // Si aún no procesó el webhook, verificar aquí también
  if (order.payment_status === 'pendiente') {
    try {
      const status = await getFlowPaymentStatus(token)
      if (status.status === 2) {
        await supabaseAdmin.from('orders').update({
          payment_status: 'pagado',
          estado: 'pagado',
          updated_at: new Date().toISOString(),
        }).eq('id', order.id)
      }
    } catch {}
  }

  return NextResponse.redirect(new URL(`/mis-pedidos/${order.id}`, req.url))
}
