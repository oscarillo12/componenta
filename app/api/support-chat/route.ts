import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

type Message = { role: string; content: string }

export async function POST(req: NextRequest) {
  const { messages }: { messages: Message[] } = await req.json()
  if (!messages?.length) return NextResponse.json({ error: 'Sin mensajes' }, { status: 400 })

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM })

  // Convertir historial: Anthropic usa 'assistant', Gemini usa 'model'
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMsg = messages[messages.length - 1].content

  const chat = model.startChat({ history })
  const streamResult = await chat.sendMessageStream(lastMsg)

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          controller.enqueue(encoder.encode(chunk.text()))
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
