import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ connected: false })

  const { data } = await supabaseAdmin
    .from('ml_tokens')
    .select('ml_user_id')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({ connected: !!data, ml_user_id: data?.ml_user_id ?? null })
}
