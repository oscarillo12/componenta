import { NextResponse } from 'next/server'

const ML_APP_ID     = process.env.ML_APP_ID
const ML_SECRET_KEY = process.env.ML_SECRET_KEY

let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string | null> {
  if (!ML_APP_ID || !ML_SECRET_KEY) return null
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  try {
    const res = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     ML_APP_ID,
        client_secret: ML_SECRET_KEY,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return cachedToken
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ items: [], configured: !!ML_APP_ID })

  const token = await getAccessToken()

  if (!token) {
    return NextResponse.json({ items: [], configured: false })
  }

  try {
    const url = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=8&category=MLC1747`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return NextResponse.json({ items: [], configured: true })

    const data = await res.json()
    const items = (data.results ?? []).map((r: Record<string, unknown>) => ({
      id:        r.id as string,
      title:     r.title as string,
      price:     r.price as number,
      currency:  r.currency_id as string,
      thumbnail: ((r.thumbnail as string) ?? '').replace('http://', 'https://').replace(/\bI\b/, 'O'),
      permalink: r.permalink as string,
      condition: r.condition as string,
      seller:    (r.seller as Record<string, unknown>)?.nickname as string ?? 'Vendedor',
    }))

    return NextResponse.json({ items, configured: true })
  } catch {
    return NextResponse.json({ items: [], configured: true })
  }
}
