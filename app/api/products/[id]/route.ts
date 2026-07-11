import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// GET — detalle de un producto por ID
export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ product: null }, { status: 404 })
  }

  // Fire-and-forget: incrementa vistas + registra región
  ;(async () => {
    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
    const ip = rawIp && rawIp !== '::1' && !rawIp.startsWith('127.') ? rawIp : null

    let region: string | null = null
    if (ip) {
      try {
        const geo = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(2500) })
        if (geo.ok) {
          const j = await geo.json()
          region = (j.region as string | null) ?? (j.city as string | null) ?? null
        }
      } catch { /* ignore */ }
    }

    await Promise.all([
      supabaseAdmin.from('products').update({ vistas: (data.vistas ?? 0) + 1 }).eq('id', id),
      supabaseAdmin.from('product_views').insert({ product_id: id, seller_id: data.user_id, region }),
    ])
  })().catch(() => {})

  return NextResponse.json({
    product: {
      id:              data.id,
      pieza:           data.pieza,
      marca:           data.marca ?? '',
      modelo:          data.modelo ?? '',
      anios:           data.anios ?? '',
      oem:             data.oem ?? null,
      estado:          data.estado,
      precio:          data.precio,
      disponible:      data.disponible,
      zona:            'motor',
      vendedorSlug:    'flores',
      fitment:         data.fitment ?? [],
      vistas:          data.vistas,
      imagen_url:      data.imagen_url ?? null,
      descripcion:     data.descripcion ?? null,
      envio:           data.envio ?? null,
      seller_nombre:   data.seller_nombre ?? null,
      seller_telefono: data.seller_telefono ?? null,
      seller_id:       data.user_id ?? null,
    },
  })
}

// PATCH — actualizar campos del producto
export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowed = ['disponible', 'pieza', 'marca', 'modelo', 'anios', 'oem', 'estado', 'precio', 'envio', 'descripcion']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — eliminar producto
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
