import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

// GET — detalle de un producto por ID
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ product: null }, { status: 404 })
  }

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

// PATCH — marcar como vendida o volver a disponible
export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const { disponible } = await req.json() as { disponible: boolean }

  const { error } = await supabaseAdmin
    .from('products')
    .update({ disponible })
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
