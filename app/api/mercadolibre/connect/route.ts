import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ML_APP_ID       = process.env.ML_APP_ID
const ML_REDIRECT_URI = process.env.ML_REDIRECT_URI
const BASE            = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', BASE))

  if (!ML_APP_ID || !ML_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'ML_APP_ID o ML_REDIRECT_URI no configurados' },
      { status: 500 }
    )
  }

  const mlAuthUrl =
    `https://auth.mercadolibre.cl/authorization` +
    `?response_type=code` +
    `&client_id=${ML_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(ML_REDIRECT_URI)}`

  return NextResponse.redirect(mlAuthUrl)
}
