import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', BASE))

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID o GOOGLE_REDIRECT_URI no configurados en variables de entorno' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/content',
    access_type:   'offline',
    prompt:        'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
