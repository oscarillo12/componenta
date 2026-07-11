import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

type Meta = { plan?: string; telefono?: string }

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = (user.publicMetadata ?? {}) as Meta

  const nombre = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Mi Tienda'

  const { data } = await supabaseAdmin
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({
    user_id:     userId,
    slug:        data?.slug        ?? userId.slice(0, 12).toLowerCase(),
    nombre:      data?.nombre      ?? nombre,
    tagline:     data?.tagline     ?? '',
    descripcion: data?.descripcion ?? '',
    color:       data?.color       ?? '#16a34a',
    banner_url:  data?.banner_url  ?? null,
    whatsapp:    data?.whatsapp    ?? meta.telefono ?? '',
    direccion:   data?.direccion   ?? '',
    horario:     data?.horario     ?? '',
    ciudad:      data?.ciudad      ?? 'Chile',
    especialidades: data?.especialidades ?? [],
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json() as {
    slug?: string; nombre?: string; tagline?: string; descripcion?: string
    color?: string; banner_url?: string; whatsapp?: string; direccion?: string
    horario?: string; ciudad?: string; especialidades?: string[]
  }

  if (body.slug) {
    const { data: existing } = await supabaseAdmin
      .from('seller_profiles').select('user_id').eq('slug', body.slug).maybeSingle()
    if (existing && existing.user_id !== userId)
      return NextResponse.json({ error: 'Slug ya en uso' }, { status: 409 })
  }

  const { error } = await supabaseAdmin
    .from('seller_profiles')
    .upsert({ user_id: userId, ...body, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sincronizar whatsapp → publicMetadata.telefono para que aparezca en products
  if (body.whatsapp) {
    const client = await clerkClient()
    const user   = await client.users.getUser(userId)
    const meta   = (user.publicMetadata ?? {}) as Meta
    await client.users.updateUser(userId, {
      publicMetadata: { ...meta, telefono: body.whatsapp },
    })
  }

  return NextResponse.json({ ok: true, slug: body.slug })
}

