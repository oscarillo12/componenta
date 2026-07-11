import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ connected: false })

  const { data } = await supabaseAdmin
    .from('google_tokens')
    .select('merchant_id, expires_at')
    .eq('user_id', userId)
    .single()

  if (!data) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected:  true,
    merchantId: data.merchant_id,
    expiresAt:  data.expires_at,
  })
}
