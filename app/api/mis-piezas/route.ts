import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ products: [] }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id,pieza,marca,modelo,precio,estado,disponible,vistas,imagen_url,created_at,envio')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ products: [] })

  return NextResponse.json({ products: data ?? [] })
}

