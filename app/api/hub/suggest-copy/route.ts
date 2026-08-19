import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function validateSecret(req: Request): boolean {
  const secret = req.headers.get('x-componenta-secret')
  return secret === process.env.COMPONENTA_WEBHOOK_SECRET
}

export async function POST(req: NextRequest) {
  if (!validateSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { nombre, marca, modelo, precio, descripcion } = body

  if (!nombre) return NextResponse.json({ error: 'Falta el nombre del producto' }, { status: 400 })

  const productInfo = [
    `Producto: ${nombre}`,
    marca && `Marca: ${marca}`,
    modelo && `Modelo: ${modelo}`,
    precio && `Precio: $${precio} CLP`,
    descripcion && `Descripción: ${descripcion}`,
  ].filter(Boolean).join('\n')

  const prompt = `Eres un experto en marketing de contenidos y ventas en redes sociales. Trabajas para Componenta, un marketplace de piezas y productos usados en Chile.

Tu tarea es crear copy persuasivo para un video corto (TikTok/Reels/YouTube Shorts) sobre el siguiente producto:

${productInfo}

Responde ÚNICAMENTE con un JSON válido, sin markdown ni explicaciones:
{
  "hook": "primera frase del video que engancha en 3 segundos, directa y con emoción (max 15 palabras)",
  "problema": "el problema que este producto resuelve para el comprador (1 oración clara, en español)",
  "beneficio": "el beneficio principal de comprar este producto ahora (1 oración que crea urgencia)",
  "cta": "llamada a la acción al final del video (max 10 palabras, ejemplo: '¡Escríbenos para apartar el tuyo!')",
  "hashtags": ["repuesto", "chile", "componenta", "oferta", "otroHashtagRelevante"],
  "script": "guión completo del video de 30 segundos: hook + problema + beneficio + cta, separados por saltos de línea"
}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON')
      return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch (e) {
      console.error('[suggest-copy]', e)
      return NextResponse.json({ error: 'Error generando copy' }, { status: 500 })
    }
  }
}
