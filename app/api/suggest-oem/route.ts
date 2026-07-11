import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// Sugiere un código OEM a partir de los datos de texto ya cargados en el
// formulario de edición (sin foto) — para cuando el vendedor no lo tiene a mano.
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { pieza, marca, modelo, anios } = await req.json()
  if (!pieza) return NextResponse.json({ error: 'Falta el nombre de la pieza' }, { status: 400 })

  const vehiculo = [marca, modelo, anios].filter(Boolean).join(' ')

  const prompt = `Eres un experto en catálogos OEM de repuestos automotrices. Trabajas para Componenta, un marketplace chileno de piezas usadas.

Pieza: "${pieza}"${vehiculo ? `\nVehículo: ${vehiculo}` : ''}

Responde ÚNICAMENTE con un JSON válido, sin markdown ni explicaciones:
{"oem": "código OEM más probable del fabricante para esta pieza y vehículo, formato tal cual el fabricante (ej: 27060-21050, ZJ3813640). null si genuinamente no puedes estimarlo con confianza razonable.", "confianza": 0-100}`

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ oem: null, confianza: 0 })
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ oem: parsed.oem ?? null, confianza: parsed.confianza ?? 0 })
  } catch (err) {
    console.error('Error en suggest-oem:', err)
    return NextResponse.json({ error: 'No se pudo sugerir un código. Intenta de nuevo.' }, { status: 500 })
  }
}
