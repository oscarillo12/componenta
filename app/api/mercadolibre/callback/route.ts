import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ML_APP_ID       = process.env.ML_APP_ID
const ML_SECRET_KEY   = process.env.ML_SECRET_KEY
const ML_REDIRECT_URI = process.env.ML_REDIRECT_URI

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', BASE))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/inventario?ml_error=cancelled', BASE))
  }

  if (!ML_APP_ID || !ML_SECRET_KEY || !ML_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/inventario?ml_error=config', BASE))
  }

  // Intercambiar código por tokens
  const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     ML_APP_ID,
      client_secret: ML_SECRET_KEY,
      code,
      redirect_uri:  ML_REDIRECT_URI,
    }),
  })

  if (!tokenRes.ok) {
    console.error('ML token exchange failed', await tokenRes.text())
    return NextResponse.redirect(new URL('/inventario?ml_error=token', BASE))
  }

  const tokenData = await tokenRes.json()

  await supabaseAdmin.from('ml_tokens').upsert(
    {
      user_id:       userId,
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at:    new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      ml_user_id:    String(tokenData.user_id ?? ''),
    },
    { onConflict: 'user_id' }
  )

  return NextResponse.redirect(new URL('/inventario?ml_connected=1', BASE))
}
