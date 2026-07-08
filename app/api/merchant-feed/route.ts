import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const BASE = 'https://componenta.vercel.app'

export async function GET() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, descripcion, precio, imagen_url, marca, modelo, anios, oem, estado, disponible, user_id')
    .eq('disponible', true)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (!products?.length) {
    return new NextResponse(emptyFeed(), { headers: xmlHeaders() })
  }

  const items = products.map(p => {
    const title = [p.pieza, p.marca, p.modelo, p.anios].filter(Boolean).join(' — ')
    const desc  = p.descripcion || `${p.pieza} en buen estado. Disponible en Componenta.`
    const price = `${p.precio} CLP`
    const cond  = p.estado === 'nuevo' ? 'new' : 'used'
    const brand = p.marca ?? 'Universal'
    const img   = p.imagen_url ?? `${BASE}/placeholder-part.jpg`

    return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${BASE}/marketplace/${p.id}</g:link>
      <g:image_link>${img}</g:image_link>
      <g:condition>${cond}</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${brand}</g:brand>
      <g:product_type>Repuestos automotrices</g:product_type>
      ${p.oem ? `<g:mpn>${p.oem}</g:mpn>` : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Componenta — Marketplace de repuestos</title>
    <link>${BASE}/marketplace</link>
    <description>Repuestos automotrices usados en Chile</description>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, { headers: xmlHeaders() })
}

function emptyFeed() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Componenta</title>
    <link>${BASE}/marketplace</link>
    <description>Repuestos automotrices usados en Chile</description>
  </channel>
</rss>`
}

function xmlHeaders() {
  return {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, s-maxage=3600',
  }
}
