import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM = `Eres el asistente de soporte oficial de Componenta, una plataforma chilena de compra y venta de repuestos usados para autos.

Conoces en detalle cómo funciona la plataforma:
- PUBLICAR UNA PIEZA: el vendedor saca una foto → la IA (Gemini) identifica la pieza automáticamente → se completan marca, modelo, compatibilidad y OEM → se publica en el marketplace en menos de 30 segundos.
- MARKETPLACE: los compradores buscan por pieza, categoría o vehículo (marca/modelo/año). Pueden filtrar por estado (excelente, buen estado, con detalles, para reparar).
- CONTACTO: desde cada pieza el comprador puede contactar al vendedor por WhatsApp o chat directo en la plataforma.
- INVENTARIO: los vendedores gestionan sus piezas publicadas, pueden activar/desactivar disponibilidad.
- PEDIDOS: seguimiento de compras y ventas.
- PLANES: existen distintos planes de suscripción para vendedores.
- MI TIENDA: cada vendedor tiene una página pública con su catálogo.

Responde siempre en español chileno, de forma concisa, amigable y útil. Si no puedes resolver algo, indica que el equipo de Componenta puede ayudar por WhatsApp o email. No inventes precios ni datos que no conozcas.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
  }

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM,
    messages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
