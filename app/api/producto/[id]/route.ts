import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('disponible', true)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  // Incrementar vistas (fire-and-forget)
  supabaseAdmin
    .from('products')
    .update({ vistas: (product.vistas ?? 0) + 1 })
    .eq('id', id)
    .then(() => {})

  // Obtener perfil del vendedor
  const { data: sellerProfile } = await supabaseAdmin
    .from('seller_profiles')
    .select('slug, nombre, color, ciudad, whatsapp, banner_url')
    .eq('user_id', product.user_id)
    .maybeSingle()

  return NextResponse.json({ product, sellerProfile })
}
