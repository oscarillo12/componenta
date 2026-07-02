import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data, error } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ notFound: true }, { status: 404 })

  return NextResponse.json(data)
}
