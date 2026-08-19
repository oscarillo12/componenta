import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

function validateSecret(req: Request): boolean {
  const secret = req.headers.get('x-componenta-secret')
  return secret === process.env.COMPONENTA_WEBHOOK_SECRET
}

export async function GET(req: Request) {
  if (!validateSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = process.env.COMPONENTA_SYSTEM_USER_ID
  if (!userId) return NextResponse.json({ products: [] })

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, pieza, marca, modelo, anios, precio, imagen_url, estado, disponible, vistas, ml_item_id, ml_permalink, fb_item_id, fb_permalink, created_at, descripcion')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ products: [] })
  return NextResponse.json({ products: data ?? [] })
}
