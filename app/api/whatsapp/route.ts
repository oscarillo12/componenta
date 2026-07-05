/**
 * Webhook de WhatsApp para Componenta.
 *
 * Configuración requerida (agregar a netlify.toml y .env.local):
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   (número Twilio sandbox o producción)
 *
 * En el panel de Twilio → Messaging → WhatsApp → Sandbox (o producción):
 *   Webhook URL (POST): https://tu-sitio.netlify.app/api/whatsapp
 *
 * Flujos que maneja:
 *   - Vendedor: "vendí el alternador" / "saca la pieza X" / "vendí ID abc123"
 *     → busca la pieza, la marca como no disponible y confirma
 *   - Cliente: cualquier otra consulta
 *     → busca piezas disponibles y responde con opciones
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-server'

const anthropic = new Anthropic()

// Responde a Twilio con TwiML
function twimlResponse(body: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Message><Body>${body}</Body></Message></Response>`
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

// Envía mensaje adicional vía Twilio REST (para mensajes largos en partes)
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

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const fromRaw = (form.get('From') as string | null) ?? ''
  const body    = ((form.get('Body') as string | null) ?? '').trim()
  const fromNum = fromRaw.replace('whatsapp:', '')  // e.g. +56912345678

  if (!body) return twimlResponse('Hola 👋 Soy el asistente de Componenta. ¿En qué te ayudo?')

  try {
    // ── 1. ¿Es un vendedor de Componenta? ──────────────────────────────
    // Buscamos si hay alguna pieza con seller_telefono = fromNum
    const { data: sellerProducts } = await supabaseAdmin
      .from('products')
      .select('id, pieza, disponible, precio, user_id')
      .eq('seller_telefono', fromNum)
      .eq('disponible', true)
      .order('created_at', { ascending: false })

    const isSeller = (sellerProducts?.length ?? 0) > 0

    if (isSeller && sellerProducts) {
      // Usar Claude para entender el mensaje del vendedor
      const systemSeller = `Eres un asistente de gestión de inventario para ${fromNum}.
El vendedor tiene estas piezas disponibles en Componenta:
${sellerProducts.map((p, i) => `${i + 1}. ID:${p.id.slice(0,8)} — ${p.pieza} ($${p.precio.toLocaleString('es-CL')})`).join('\n')}

Responde SOLO con JSON:
{
  "accion": "vender" | "consultar" | "otro",
  "piezaIdx": 0-based index de la pieza (o -1 si no está claro),
  "respuesta": "texto para el vendedor en español chileno"
}

Si el mensaje dice "vendí", "saqué", "se vendió", "vendido", "ya no está" sobre alguna pieza, la acción es "vender".
Si dice el nombre de la pieza, el índice, o el ID, úsalo para identificar cuál.
Si no queda claro cuál pieza, la acción es "consultar" y pregunta cuál.`

      const aiRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: systemSeller,
        messages: [{ role: 'user', content: body }],
      })

      let parsed: { accion: string; piezaIdx: number; respuesta: string } | null = null
      try {
        const txt = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
        const match = txt.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
      } catch { /* ignore */ }

      if (parsed?.accion === 'vender' && parsed.piezaIdx >= 0 && parsed.piezaIdx < sellerProducts.length) {
        const pieza = sellerProducts[parsed.piezaIdx]
        await supabaseAdmin
          .from('products')
          .update({ disponible: false })
          .eq('id', pieza.id)

        return twimlResponse(
          `✅ Listo! "${pieza.pieza}" marcada como *vendida* y retirada del catálogo de Componenta.\n\nSi necesitas sacar otra pieza, escríbeme.`
        )
      }

      if (parsed?.accion === 'consultar' || (parsed?.accion === 'vender' && parsed.piezaIdx === -1)) {
        const lista = sellerProducts.map((p, i) => `${i + 1}. ${p.pieza}`).join('\n')
        return twimlResponse(
          `¿Cuál pieza vendiste? Tus piezas disponibles:\n\n${lista}\n\nEscribe el número o el nombre de la pieza.`
        )
      }

      return twimlResponse(parsed?.respuesta ?? '¿En qué te puedo ayudar con tu inventario?')
    }

    // ── 2. Es un comprador — responder como asistente de soporte ──────
    // Buscar piezas disponibles relacionadas con el mensaje
    const queryWords = body.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    let searchResults: { pieza: string; precio: number; seller_nombre: string | null; seller_telefono: string | null }[] = []

    if (queryWords.length > 0) {
      // Búsqueda simple por nombre de pieza
      const searchTerm = queryWords.slice(0, 3).join(' ')
      const { data } = await supabaseAdmin
        .from('products')
        .select('pieza, precio, seller_nombre, seller_telefono')
        .eq('disponible', true)
        .ilike('pieza', `%${searchTerm}%`)
        .limit(5)

      searchResults = data ?? []
    }

    // Usar Claude para responder al comprador
    const systemBuyer = `Eres el asistente de Componenta, marketplace chileno de repuestos usados.
Respondes consultas de compradores en español chileno, de forma breve y útil.

${searchResults.length > 0
    ? `Piezas disponibles relacionadas:\n${searchResults.map(r =>
        `• ${r.pieza} — $${r.precio.toLocaleString('es-CL')} (${r.seller_nombre ?? 'Vendedor Componenta'})`
      ).join('\n')}`
    : 'No encontré piezas disponibles para esa consulta en este momento.'
}

Si hay resultados, ofrece los datos de contacto del vendedor si los tienes.
Siempre sugiere visitar componenta.cl para ver el catálogo completo.
Mantén la respuesta en máximo 300 caracteres para WhatsApp.`

    const buyerRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemBuyer,
      messages: [{ role: 'user', content: body }],
    })

    const answer = buyerRes.content[0].type === 'text' ? buyerRes.content[0].text : 'Gracias por contactar a Componenta. Visita componenta.cl para ver nuestro catálogo.'

    return twimlResponse(answer)

  } catch (err) {
    console.error('[whatsapp webhook]', err)
    return twimlResponse('Hubo un error. Por favor intenta de nuevo o visita componenta.cl')
  }
}

// Verificación GET para Twilio (no requerido pero útil para debugging)
export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook activo — Componenta' })
}
