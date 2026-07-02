import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'Sin imagen' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      `Analiza esta imagen. Si ves un automóvil, identifícalo.
Responde ÚNICAMENTE con JSON válido sin markdown ni explicaciones:
{
  "marca": "marca del auto (ej: Chevrolet, Toyota, Hyundai, Suzuki, Kia)",
  "modelo": "modelo exacto (ej: Spark, Corolla, Accent)",
  "anio": "año o rango aproximado (ej: 2012 o 2010-2015)",
  "confianza": 85
}
Si no hay auto visible, responde con confianza 0 y marca/modelo vacíos.`,
    ])

    const text = result.response.text()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Respuesta inválida')

    return NextResponse.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('identify-car:', err)
    return NextResponse.json({ error: 'No se pudo identificar el vehículo' }, { status: 500 })
  }
}
