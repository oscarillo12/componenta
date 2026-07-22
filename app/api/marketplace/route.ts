import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const seller = searchParams.get('seller')
  const q      = searchParams.get('q') ?? ''

  let productQuery = supabaseAdmin
    .from('products')
    .select('*')
    .eq('disponible', true)
    .order('created_at', { ascending: false })

  if (seller) productQuery = productQuery.eq('user_id', seller)

  let fbQuery = supabaseAdmin
    .from('listings_externos')
    .select('id, fuente, titulo, precio, imagen, url_original, ubicacion, vendedor_nombre')
    .eq('activo', true)
    .eq('fuente', 'facebook')
    .order('created_at', { ascending: false })
    .limit(800)

  let meliQuery = supabaseAdmin
    .from('listings_externos')
    .select('id, fuente, titulo, precio, imagen, url_original, ubicacion, vendedor_nombre')
    .eq('activo', true)
    .eq('fuente', 'mercadolibre')
    .order('created_at', { ascending: false })
    .limit(800)

  if (q.length >= 2) {
    fbQuery   = fbQuery.ilike('titulo',   `%${q}%`)
    meliQuery = meliQuery.ilike('titulo', `%${q}%`)
  }

  const [{ data: products }, { data: facebook }, { data: meli_scrapeado }] =
    await Promise.all([productQuery, fbQuery, meliQuery])

  return NextResponse.json({
    products:      products      ?? [],
    facebook:      facebook      ?? [],
    meli_scrapeado: meli_scrapeado ?? [],
  })
}
