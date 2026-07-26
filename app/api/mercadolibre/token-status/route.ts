import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ML_APP_ID     = process.env.ML_APP_ID
const ML_SECRET_KEY = process.env.ML_SECRET_KEY

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'no_session' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('ml_tokens')
    .select('access_token, refresh_token, expires_at, ml_user_id, updated_at')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return NextResponse.json({ estado: 'sin_token', userId })
  }

  const now        = new Date()
  const expiresAt  = new Date(data.expires_at)
  const expirado   = expiresAt <= now
  const minutosRest = Math.round((expiresAt.getTime() - now.getTime()) / 60000)

  // Intentar usar el access_token actual contra ML API
  let tokenValido = false
  let mlError: string | null = null
  try {
    const testRes = await fetch('https://api.mercadolibre.com/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    tokenValido = testRes.ok
    if (!testRes.ok) {
      const body = await testRes.json().catch(() => ({}))
      mlError = body.message ?? `HTTP ${testRes.status}`
    }
  } catch (e) {
    mlError = e instanceof Error ? e.message : 'fetch error'
  }

  // Si el access_token expiró, intentar refresh
  let refreshResult: string | null = null
  if (expirado && data.refresh_token && ML_APP_ID && ML_SECRET_KEY) {
    const refreshRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     ML_APP_ID,
        client_secret: ML_SECRET_KEY,
        refresh_token: data.refresh_token,
      }),
    })
    if (refreshRes.ok) {
      refreshResult = 'refresh_exitoso'
    } else {
      const body = await refreshRes.json().catch(() => ({}))
      refreshResult = `refresh_fallido: ${body.message ?? body.error ?? refreshRes.status}`
    }
  } else if (!data.refresh_token) {
    refreshResult = 'sin_refresh_token'
  }

  return NextResponse.json({
    userId,
    ml_user_id:       data.ml_user_id,
    token_guardado:   !!data.access_token,
    refresh_guardado: !!data.refresh_token,
    expires_at:       data.expires_at,
    updated_at:       data.updated_at,
    expirado,
    minutos_restantes: minutosRest,
    access_token_valido: tokenValido,
    ml_error:         mlError,
    refresh_resultado: refreshResult,
    env_app_id:       ML_APP_ID ? `${ML_APP_ID.slice(0,4)}...${ML_APP_ID.slice(-4)}` : 'NO_SET',
  })
}
