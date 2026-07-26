import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { APP_URL } from '@/lib/config'

const BASE = APP_URL

export async function GET(req: Request) {
  const accept = req.headers.get('accept') ?? ''
  const wantsBrowser = accept.includes('text/html')

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, descripcion, precio, imagen_url, marca, modelo, anios, oem, estado, disponible, user_id')
    .eq('disponible', true)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (wantsBrowser) {
    const count = products?.length ?? 0
    const feedUrl = `${BASE}/api/merchant-feed`
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Feed Google Shopping — Componenta</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f7f7f5;color:#16181d;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:20px;border:1px solid #e5e7eb;padding:36px 40px;max-width:520px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.06)}
    .icon{width:52px;height:52px;border-radius:14px;background:#eef3fc;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px}
    h1{font-size:20px;font-weight:900;color:#16181d;margin-bottom:6px}
    .sub{font-size:13.5px;color:#6b7280;margin-bottom:28px;line-height:1.5}
    .stat{display:flex;align-items:center;gap:10px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:12px}
    .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0}
    .stat-label{font-size:12px;color:#9ca3af}
    .stat-val{font-size:14px;font-weight:700;color:#16181d}
    .url-box{background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-family:monospace;font-size:12px;color:#374151;word-break:break-all;margin-bottom:20px}
    .btn{display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:10px;border:none;background:#2f5fdb;color:#fff;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none}
    .btn-sec{background:#fff;border:1.5px solid #e5e7eb;color:#374151}
    .btns{display:flex;gap:10px;flex-wrap:wrap}
    .note{margin-top:24px;padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;font-size:12px;color:#166534;line-height:1.5}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛍️</div>
    <h1>Feed de productos activo</h1>
    <p class="sub">Este feed RSS se actualiza automáticamente y está listo para conectar en Google Merchant Center y Meta Commerce Manager.</p>

    <div class="stat">
      <span class="dot"></span>
      <div>
        <p class="stat-label">Productos en el feed</p>
        <p class="stat-val">${count} repuestos disponibles</p>
      </div>
    </div>
    <div class="stat">
      <span class="dot"></span>
      <div>
        <p class="stat-label">Formato</p>
        <p class="stat-val">RSS 2.0 · Google Base namespace · CLP</p>
      </div>
    </div>

    <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;margin:20px 0 8px">URL del feed</p>
    <div class="url-box">${feedUrl}</div>

    <div class="btns">
      <a href="${feedUrl}" class="btn btn-sec" download="merchant-feed.xml">⬇ Descargar XML</a>
      <a href="https://merchants.google.com" target="_blank" rel="noopener" class="btn">Abrir Google Merchant →</a>
    </div>

    <p class="note">
      <strong>¿Cómo conectarlo?</strong> Copia la URL del feed y pégala en Google Merchant Center → Productos → Fuentes de datos → Agregar fuente → Feed programado (URL).
      En Meta: Commerce Manager → Catálogos → Fuentes de datos → Fuente programada.
    </p>
  </div>
</body>
</html>`
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

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
      <g:link>${BASE}/p/${p.id}</g:link>
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
