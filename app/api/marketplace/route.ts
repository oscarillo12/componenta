import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const seller = searchParams.get('seller')

  let query = supabaseAdmin
    .from('products')
    .select('*')
    .eq('disponible', true)
    .order('created_at', { ascending: false })

  if (seller) query = query.eq('user_id', seller)

  const { data, error } = await query

  if (error) return NextResponse.json({ products: [] })

  return NextResponse.json({ products: data ?? [] })
}

