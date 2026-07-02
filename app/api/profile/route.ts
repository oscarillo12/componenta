import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

type Meta = {
  plan?:      string
  telefono?:  string
  nombre?:    string
  productsCount?: number
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = (user.publicMetadata ?? {}) as Meta

  const nombre =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.emailAddresses[0]?.emailAddress?.split('@')[0] ||
    'Vendedor'

  return NextResponse.json({
    nombre,
    telefono: meta.telefono ?? user.phoneNumbers[0]?.phoneNumber ?? null,
    plan:     meta.plan ?? 'free',
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { telefono } = await req.json() as { telefono: string }

  if (!telefono) return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 })

  const client = await clerkClient()
  const user   = await client.users.getUser(userId)
  const meta   = (user.publicMetadata ?? {}) as Meta

  await client.users.updateUser(userId, {
    publicMetadata: { ...meta, telefono },
  })

  return NextResponse.json({ ok: true })
}
