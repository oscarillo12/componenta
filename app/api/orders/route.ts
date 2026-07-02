import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/orders — pedidos del comprador o vendedor según rol
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rol = searchParams.get('rol') ?? 'buyer'

  const field = rol === 'seller' ? 'seller_id' : 'buyer_id'
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`*, order_events(*)`)
    .eq(field, userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ orders: [] })
  return NextResponse.json({ orders: data ?? [] })
}
