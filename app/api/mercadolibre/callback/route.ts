import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ML_APP_ID       = process.env.ML_APP_ID
const ML_SECRET_KEY   = process.env.ML_SECRET_KEY
const ML_REDIRECT_URI = process.env.ML_REDIRECT_URI
const BASE            = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', BASE))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    const url = new URL('/inventario', BASE)
    url.searchParams.set('ml_error', 'cancelled')
    url.searchParams.set('ml_detail', error ?? 'sin_codigo')
    return NextResponse.redirect(url)
  }

  if (!ML_APP_ID || !ML_SECRET_KEY || !ML_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/inventario?ml_error=config', BASE))
  }

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
    const errText = await tokenRes.text()
    console.error('[ML callback] token exchange failed:', errText)
    const url = new URL('/inventario', BASE)
    url.searchParams.set('ml_error', 'token')
    url.searchParams.set('ml_detail', errText.slice(0, 200))
    return NextResponse.redirect(url)
  }

  const tokenData = await tokenRes.json()
  console.log('[ML callback] token OK para user', userId, '— refresh_token:', !!tokenData.refresh_token)

  const { error: upsertError } = await supabaseAdmin.from('ml_tokens').upsert(
    {
      user_id:       userId,
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at:    new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      ml_user_id:    String(tokenData.user_id ?? ''),
    },
    { onConflict: 'user_id' }
  )

  if (upsertError) {
    console.error('[ML callback] upsert falló:', upsertError.message)
    return NextResponse.redirect(new URL('/inventario?ml_error=db', BASE))
  }

  return NextResponse.redirect(new URL('/inventario?ml_connected=1', BASE))
}
