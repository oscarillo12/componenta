/**
 * Webhook de WhatsApp para Componenta.
 * Sin dependencia de IA — lógica de keywords + búsqueda directa en Supabase.
 *
 * Flujos:
 *   - Vendedor: "vendí el alternador" / "saca la pieza 2" / "vendí ID abc123"
 *     → identifica la pieza por número, nombre o ID, la marca como no disponible
 *   - Comprador: cualquier consulta
 *     → busca en Supabase y responde con las opciones encontradas
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// ── Helpers de respuesta ──────────────────────────────────────────────────────

function twimlResponse(body: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message><Body>${body}</Body></Message></Response>`
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

async function sendTwilioMsg(to: string, body: string) {
  const sid   = process.env.TWILIO_ACCOUNT_SID!
  const token = process.env.TWILIO_AUTH_TOKEN!
  const from  = process.env.TWILIO_WHATSAPP_FROM!

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  })
}

// ── Utilidades de texto ───────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
}

const SELL_KEYWORDS = [
  'vendi', 'vendio', 'vendida', 'vendido', 'vendo',
  'saque', 'saca', 'sacar', 'saco',
  'ya no esta', 'no disponible', 'marcar vendido', 'marcar como vendido',
  'quitar', 'eliminar del catalogo', 'eliminar del catálogo',
]

function hasSellIntent(text: string): boolean {
  const norm = normalize(text)
  return SELL_KEYWORDS.some(kw => norm.includes(kw))
}

function findProductIndex(
  text: string,
  products: Array<{ id: string; pieza: string }>
): number {
  const norm = normalize(text)

  // 1. Número explícito ("pieza 2", "el 3", "número 1")
  const numMatch = text.match(/\b(\d+)\b/)
  if (numMatch) {
    const n = parseInt(numMatch[1], 10)
    if (n >= 1 && n <= products.length) return n - 1
  }

  // 2. Short ID (primeros 8 chars del UUID)
  const idIdx = products.findIndex(p =>
    norm.includes(p.id.slice(0, 8).toLowerCase())
  )
  if (idIdx !== -1) return idIdx

  // 3. Mejor match por palabras del nombre de la pieza
  const words = norm.split(/\s+/).filter(w => w.length > 3)
  let bestIdx = -1
  let bestScore = 0
  for (let i = 0; i < products.length; i++) {
    const pNorm = normalize(products[i].pieza)
    const score = words.filter(w => pNorm.includes(w)).length
    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }
  if (bestScore > 0) return bestIdx

  return -1
}

// ── Búsqueda de productos para comprador ─────────────────────────────────────

type ProductResult = {
  pieza: string
  precio: number
  seller_nombre: string | null
  seller_telefono: string | null
}

async function searchProducts(query: string): Promise<ProductResult[]> {
  const words = normalize(query).split(/\s+/).filter(w => w.length > 3)
  if (words.length === 0) return []

  // Intento 1: todas las palabras juntas
  const { data: multi } = await supabaseAdmin
    .from('products')
    .select('pieza, precio, seller_nombre, seller_telefono')
    .eq('disponible', true)
    .ilike('pieza', `%${words.join(' ')}%`)
    .limit(5)

  if (multi && multi.length > 0) return multi as ProductResult[]

  // Intento 2: primera palabra significativa
  const { data: single } = await supabaseAdmin
    .from('products')
    .select('pieza, precio, seller_nombre, seller_telefono')
    .eq('disponible', true)
    .ilike('pieza', `%${words[0]}%`)
    .limit(5)

  return (single ?? []) as ProductResult[]
}

function buildBuyerReply(results: ProductResult[], query: string): string {
  if (results.length === 0) {
    return (
      `No encontré "${query}" disponible en este momento.\n\n` +
      `🔗 Ve el catálogo completo en:\ncomponenta.vercel.app/marketplace`
    )
  }

  const lines = results.slice(0, 4).map(r => {
    const precio = r.precio.toLocaleString('es-CL')
    const nombre = r.seller_nombre ? ` · ${r.seller_nombre}` : ''
    const tel    = r.seller_telefono ? `\n  📞 ${r.seller_telefono}` : ''
    return `• ${r.pieza} — $${precio}${nombre}${tel}`
  })

  return (
    `Encontré esto en Componenta:\n\n` +
    lines.join('\n\n') +
    `\n\n🔗 Ver más: componenta.vercel.app/marketplace`
  )
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const form    = await req.formData()
  const fromRaw = (form.get('From') as string | null) ?? ''
  const body    = ((form.get('Body') as string | null) ?? '').trim()
  const fromNum = fromRaw.replace('whatsapp:', '')

  if (!body) {
    return twimlResponse(
      'Hola 👋 Soy el asistente de Componenta.\n\n' +
      '• Si eres *comprador*, escríbeme qué pieza buscas.\n' +
      '• Si eres *vendedor*, escribe "vendí [nombre de la pieza]" para sacarla del catálogo.\n\n' +
      '🔗 componenta.vercel.app'
    )
  }

  try {
    // ── 1. ¿Es vendedor? ───────────────────────────────────────────────────
    const { data: sellerProducts } = await supabaseAdmin
      .from('products')
      .select('id, pieza, disponible, precio')
      .eq('seller_telefono', fromNum)
      .eq('disponible', true)
      .order('created_at', { ascending: false })

    const isSeller = (sellerProducts?.length ?? 0) > 0

    if (isSeller && sellerProducts) {
      // ¿Tiene intención de marcar como vendido?
      if (hasSellIntent(body)) {
        const idx = findProductIndex(body, sellerProducts)

        if (idx === -1) {
          // No pudo identificar cuál pieza — muestra la lista
          const lista = sellerProducts
            .map((p, i) => `${i + 1}. ${p.pieza}`)
            .join('\n')
          return twimlResponse(
            `¿Cuál pieza vendiste? Responde con el número:\n\n${lista}`
          )
        }

        const pieza = sellerProducts[idx]
        await supabaseAdmin
          .from('products')
          .update({ disponible: false })
          .eq('id', pieza.id)

        return twimlResponse(
          `✅ Listo. *${pieza.pieza}* marcada como vendida y retirada del catálogo.\n\n` +
          `Si vendiste otra pieza, escríbeme de nuevo.`
        )
      }

      // Vendedor sin intención de vender — respuesta de ayuda
      const lista = sellerProducts
        .map((p, i) => `${i + 1}. ${p.pieza} — $${p.precio.toLocaleString('es-CL')}`)
        .join('\n')
      return twimlResponse(
        `Hola 👋 Tienes ${sellerProducts.length} pieza(s) disponible(s):\n\n${lista}\n\n` +
        `Para marcar una como vendida escribe: *"vendí el [nombre]"* o *"vendí la 1"*.`
      )
    }

    // ── 2. Es comprador — buscar piezas ───────────────────────────────────
    const results = await searchProducts(body)
    return twimlResponse(buildBuyerReply(results, body))

  } catch (err) {
    console.error('[whatsapp webhook]', err)
    return twimlResponse(
      'Hubo un error. Intenta de nuevo o visita componenta.vercel.app'
    )
  }
}

export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook activo — Componenta' })
}
