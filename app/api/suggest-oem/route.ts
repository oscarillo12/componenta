import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { pieza, marca, modelo, anios } = await req.json()
  if (!pieza) return NextResponse.json({ error: 'Falta el nombre de la pieza' }, { status: 400 })

  const vehiculo = [marca, modelo, anios].filter(Boolean).join(' ')

  const prompt = `Eres un experto en catálogos OEM de repuestos automotrices para Componenta, marketplace chileno de piezas usadas.

Pieza: "${pieza}"${vehiculo ? `\nVehículo: ${vehiculo}` : ''}

Responde ÚNICAMENTE con JSON puro (sin markdown, sin explicaciones, sin bloques de código):
{"oem":"27060-21050","confianza":85}

Donde:
- "oem": el código OEM más probable (formato exacto del fabricante). Usa null si no puedes estimarlo con confianza razonable.
- "confianza": número entero del 0 al 100 indicando tu nivel de certeza.`

  const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash']

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)

      const candidate = result.response.candidates?.[0]
      const text = (candidate?.content?.parts?.[0]?.text ?? result.response.text()).trim()

      const jsonMatch = text.match(/\{[\s\S]*?\}/)
      if (!jsonMatch) {
        console.warn(`suggest-oem [${modelName}]: no JSON found in response:`, text.slice(0, 200))
        return NextResponse.json({ oem: null, confianza: 0 })
      }

      let parsed: { oem?: string | null; confianza?: number }
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        console.warn(`suggest-oem [${modelName}]: JSON parse failed:`, jsonMatch[0])
        return NextResponse.json({ oem: null, confianza: 0 })
      }

      return NextResponse.json({ oem: parsed.oem ?? null, confianza: parsed.confianza ?? 0 })
    } catch (err) {
      console.error(`suggest-oem [${modelName}] error:`, err instanceof Error ? err.message : err)
      if (modelName === MODELS[MODELS.length - 1]) {
        return NextResponse.json({ error: 'No se pudo sugerir un código. Intenta de nuevo.' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ oem: null, confianza: 0 })
}
