import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.ML_APP_ID
  const redirectUri = process.env.ML_REDIRECT_URI

  const mlAuthUrl = appId && redirectUri
    ? `https://auth.mercadolibre.cl/authorization?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`
    : null

  return NextResponse.json({
    ML_APP_ID: appId ? `${appId.slice(0, 4)}...${appId.slice(-4)} (${appId.length} chars)` : 'NO CONFIGURADO',
    ML_REDIRECT_URI: redirectUri ?? 'NO CONFIGURADO',
    ML_SECRET_KEY_SET: !!process.env.ML_SECRET_KEY,
    auth_url_preview: mlAuthUrl,
  })
}
