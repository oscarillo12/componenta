import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// PATCH /api/notifications — marcar todas como leídas
export async function PATCH(_req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  await supabaseAdmin
    .from('notifications')
    .update({ leida: true })
    .eq('user_id', userId)
    .eq('leida', false)

  return NextResponse.json({ ok: true })
}

// GET /api/notifications — obtener notificaciones del usuario
export async function GET(_req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ notifications: [] })

  const { data } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ notifications: data ?? [] })
}
