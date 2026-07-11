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
    const title = [p.pieza, p.marca, p.modelo, p.anios].filter(Boolean).join(' — ').slice(0, 150)
    const desc  = (p.descripcion || `${p.pieza} usado en buen estado, disponible en Componenta Chile.`).slice(0, 5000)
    // GMC requiere formato "AMOUNT CURRENCY" sin decimales para CLP (moneda sin centavos)
    const price = `${Math.round(p.precio)} CLP`
    // Mapeo completo de condiciones al vocabulario de Google
    const cond  = p.estado === 'nuevo' ? 'new' : 'used'
    const brand = (p.marca ?? 'Universal').slice(0, 70)
    const img   = p.imagen_url ?? `${BASE}/og-image.png`

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
      <g:product_type>Vehículos y repuestos > Repuestos y accesorios para automóviles</g:product_type>
      <g:google_product_category>916</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      ${p.oem ? `<g:mpn><![CDATA[${p.oem}]]></g:mpn>` : ''}
      <g:shipping>
        <g:country>CL</g:country>
        <g:service>Estándar</g:service>
        <g:price>0 CLP</g:price>
      </g:shipping>
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
