import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const BASE          = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', BASE))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/inventario?gsc_error=cancelled', BASE))
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.redirect(new URL('/inventario?gsc_error=config', BASE))
  }

  // Intercambiar código por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const txt = await tokenRes.text()
    console.error('Google token exchange failed', txt)
    return NextResponse.redirect(new URL('/inventario?gsc_error=token', BASE))
  }

  const tokenData = await tokenRes.json()

  // Obtener el merchant_id automáticamente desde la API
  const authInfoRes = await fetch(
    'https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo',
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )

  if (!authInfoRes.ok) {
    return NextResponse.redirect(new URL('/inventario?gsc_error=merchant_info', BASE))
  }

  const authInfo = await authInfoRes.json()
  const firstAccount = authInfo.accountIdentifiers?.[0]
  const merchantId = firstAccount?.merchantId ?? firstAccount?.aggregatorId

  if (!merchantId) {
    return NextResponse.redirect(new URL('/inventario?gsc_error=no_merchant_account', BASE))
  }

  await supabaseAdmin.from('google_tokens').upsert(
    {
      user_id:       userId,
      merchant_id:   String(merchantId),
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at:    new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    },
    { onConflict: 'user_id' }
  )

  return NextResponse.redirect(new URL('/inventario?gsc_connected=1', BASE))
}
