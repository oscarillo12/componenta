import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('taller_profiles')
    .select('slug, nombre, tagline, color, ciudad, direccion, horario, whatsapp, telefono, marcas, servicios, tipo')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ talleres: [] })
  return NextResponse.json({ talleres: data ?? [] })
}
