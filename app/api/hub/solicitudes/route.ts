import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

function validateSecret(req: Request): boolean {
  const secret = req.headers.get('x-componenta-secret')
  return secret === process.env.COMPONENTA_WEBHOOK_SECRET
}

export async function GET(req: Request) {
  if (!validateSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('solicitudes')
    .select('id, pieza, marca, modelo, anio, descripcion, buyer_name, buyer_phone, created_at')
    .eq('activa', true)
    .order('created_at', { ascending: false })
    .limit(80)

  if (error) return NextResponse.json({ solicitudes: [] })
  return NextResponse.json({ solicitudes: data ?? [] })
}
