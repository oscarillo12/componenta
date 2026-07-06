import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const nombre = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Mi Taller'

  const { data } = await supabaseAdmin
    .from('taller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({
    user_id:     userId,
    slug:        data?.slug        ?? `taller-${userId.slice(0, 10).toLowerCase()}`,
    nombre:      data?.nombre      ?? nombre,
    tagline:     data?.tagline     ?? '',
    descripcion: data?.descripcion ?? '',
    color:       data?.color       ?? '#dc2626',
    banner_url:  data?.banner_url  ?? null,
    whatsapp:    data?.whatsapp    ?? '',
    telefono:    data?.telefono    ?? '',
    direccion:   data?.direccion   ?? '',
    horario:     data?.horario     ?? '',
    ciudad:      data?.ciudad      ?? 'Chile',
    marcas:      data?.marcas      ?? [],
    servicios:   data?.servicios   ?? [],
    tipo:        data?.tipo        ?? 'taller',
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()

  if (body.slug) {
    const { data: existing } = await supabaseAdmin
      .from('taller_profiles').select('user_id').eq('slug', body.slug).maybeSingle()
    if (existing && existing.user_id !== userId)
      return NextResponse.json({ error: 'Slug ya en uso' }, { status: 409 })
  }

  const { error } = await supabaseAdmin
    .from('taller_profiles')
    .upsert({ user_id: userId, ...body, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
