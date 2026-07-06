import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ items: [] })

  try {
    const url = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q + ' repuesto auto')}&limit=8`
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Componenta/1.0)',
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) return NextResponse.json({ items: [] })

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

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
