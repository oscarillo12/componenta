import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const FREE_LIMIT = 5

type VehicleCompat = { marca?: string; modelo?: string; anios?: string }
type Fitment = { make: string; model: string; yearFrom: number; yearTo: number }

function compatToFitment(compat: VehicleCompat[]): Fitment[] {
  return (compat ?? []).map(c => {
    const anios = (c.anios ?? '').replace('–', '-')
    const m = anios.match(/(\d{4})[-](\d{4})/)
    const single = anios.match(/^(\d{4})$/)
    const yearFrom = m ? parseInt(m[1]) : single ? parseInt(single[1]) : 2000
    const yearTo   = m ? parseInt(m[2]) : yearFrom
    return { make: c.marca ?? '', model: c.modelo ?? '', yearFrom, yearTo }
  }).filter(f => f.make && f.model)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = user.publicMetadata as { productsCount?: number; plan?: string; nombre?: string; telefono?: string }
  const count  = meta.productsCount ?? 0
  const plan   = meta.plan ?? 'free'

  if (plan === 'free' && count >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'limite_alcanzado', count, limit: FREE_LIMIT },
      { status: 403 },
    )
  }

  const body = await req.json()

  // â”€â”€ Bloquear pieza duplicada (mismo pieza+marca activa para este usuario) â”€â”€
  const { data: existingPieza } = await supabaseAdmin
    .from('products')
    .select('id, pieza')
    .eq('user_id', userId)
    .ilike('pieza', body.pieza ?? '')
    .eq('disponible', true)
    .maybeSingle()

  if (existingPieza) {
    return NextResponse.json(
      {
        error: 'duplicate_pieza',
        detail: `Ya tienes "${existingPieza.pieza}" publicada y disponible. ElimÃ­nala o mÃ¡rcala como vendida antes de publicar otra igual.`,
      },
      { status: 409 },
    )
  }

  // â”€â”€ Construir nombre visible del vendedor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sellerNombre =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
    'Vendedor Componenta'

  const sellerTelefono =
    user.phoneNumbers[0]?.phoneNumber ?? meta.telefono ?? null

  // â”€â”€ Guardar en Supabase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { error: dbError } = await supabaseAdmin.from('products').insert({
    user_id:          userId,
    pieza:            body.pieza ?? 'Sin nombre',
    marca:            body.marca ?? null,
    modelo:           body.modelo ?? null,
    anios:            body.anios ?? null,
    oem:              body.oem ?? null,
    estado:           body.estado ?? 'bueno',
    precio:           body.precio ?? 0,
    envio:            body.envio ?? null,
    descripcion:      body.descripcion ?? null,
    canales:          body.canales ?? [],
    fitment:          compatToFitment(body.compatibilidad ?? []),
    disponible:       true,
    vistas:           0,
    imagen_url:       body.imagen_url ?? null,
    image_hash:       body.image_hash ?? null,
    seller_nombre:    sellerNombre,
    seller_telefono:  sellerTelefono,
  })

  if (dbError) {
    console.error('[publish] Supabase error:', dbError)
    return NextResponse.json(
      { error: 'Error al guardar en base de datos', detail: dbError.message },
      { status: 500 },
    )
  }

  // â”€â”€ Incrementar contador en Clerk â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await client.users.updateUser(userId, {
    publicMetadata: { ...meta, productsCount: count + 1 },
  })

  return NextResponse.json({ ok: true, productsCount: count + 1, limit: FREE_LIMIT })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = user.publicMetadata as { productsCount?: number; plan?: string }

  return NextResponse.json({
    productsCount: meta.productsCount ?? 0,
    limit:         FREE_LIMIT,
    plan:          meta.plan ?? 'free',
  })
}

