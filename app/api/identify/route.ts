import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { PartData } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite']

function buildPrompt(vehicleHint?: { marca: string; modelo: string; anio: string }) {
  const contextLine = vehicleHint
    ? `\nCONTEXTO CRÍTICO: Esta pieza pertenece a un ${vehicleHint.marca} ${vehicleHint.modelo} año ${vehicleHint.anio}. Usa este dato para identificar con mayor certeza piezas genéricas (ej: cuerpo de aceleración, bomba de agua, sensor de oxígeno) que de otro modo serían difíciles de identificar por imagen sola.\n`
    : ''

  return `Eres un experto en repuestos automotrices con acceso a catálogos OEM de todas las marcas. Trabajas para Componenta, un marketplace chileno de piezas usadas.
${contextLine}
Analiza esta imagen de una pieza usada de automóvil. Responde ÚNICAMENTE con un JSON válido, sin markdown ni explicaciones:

{
  "pieza": "nombre específico en español — incluye el tipo exacto y subcategoría cuando aplique (ej: 'Motor Completo 1.6 VVT-i', 'Caja de Cambios Manual 5ta', 'Bomba de Agua Original', 'Alternador 90A', 'Culata Motor 1.5'). Para motores y cajas siempre agrega la cilindrada o tipo si es visible o inferible del vehículo. NUNCA uses solo 'Motor Completo' o 'Caja de Cambios' sin más detalle.",
  "marca": "${vehicleHint?.marca ?? 'fabricante del vehículo al que pertenece'}",
  "oem": "CÓDIGO OEM del fabricante para esta pieza${vehicleHint ? ` en el ${vehicleHint.marca} ${vehicleHint.modelo} ${vehicleHint.anio}` : ''}. Usa tu conocimiento de catálogos OEM — si reconoces la pieza y el vehículo, proporciona el código aunque no sea visible en la foto. Formato sin guiones extra, ej: ZJ3813640, 27060-21050, 25182341. null solo si genuinamente desconoces el código.",
  "compatibilidad": [
    {"marca": "${vehicleHint?.marca ?? 'Chevrolet'}", "modelo": "${vehicleHint?.modelo ?? 'Spark'}", "anios": "${vehicleHint ? `${vehicleHint.anio}-${vehicleHint.anio}` : '2010-2014'}"}
  ],
  "confianza": 94
}

Reglas:
- confianza: 0-100 según certeza de identificación
- ${vehicleHint ? `El vehículo es ${vehicleHint.marca} ${vehicleHint.modelo} ${vehicleHint.anio}. Incluye en compatibilidad el rango de años exacto para ese modelo y otros compatibles conocidos` : 'Lista todos los vehículos compatibles que conozcas'}
- Para el OEM: si sabes qué pieza es y para qué vehículo, PROPORCIONA el código OEM aunque no esté visible. Es mejor un código conocido que null
- anios siempre en formato "YYYY-YYYY" o "YYYY"
- pieza y modelo siempre en español`
}

async function tryModel(
  modelName: string,
  base64: string,
  mimeType: string,
  vehicleHint?: { marca: string; modelo: string; anio: string },
): Promise<PartData> {
  const model = genAI.getGenerativeModel({ model: modelName })
  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64 } },
    buildPrompt(vehicleHint),
  ])
  const text = result.response.text()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Respuesta de IA no válida')
  return JSON.parse(jsonMatch[0]) as PartData
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'

    const vehicleMarca  = formData.get('vehicleMarca')  as string | null
    const vehicleModelo = formData.get('vehicleModelo') as string | null
    const vehicleAnio   = formData.get('vehicleAnio')   as string | null
    const vehicleHint = vehicleMarca && vehicleModelo && vehicleAnio
      ? { marca: vehicleMarca, modelo: vehicleModelo, anio: vehicleAnio }
      : undefined

    if (vehicleHint) {
      console.log(`[identify] Contexto vehículo: ${vehicleHint.marca} ${vehicleHint.modelo} ${vehicleHint.anio}`)
    }

    let lastError: Error | null = null

    for (const modelName of MODELS) {
      try {
        console.log(`[identify] Intentando con ${modelName}…`)
        const partData = await tryModel(modelName, base64, mimeType, vehicleHint)
        console.log(`[identify] Éxito con ${modelName}`)
        return NextResponse.json(partData)
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string }
        console.warn(`[identify] ${modelName} falló: ${e?.status ?? ''} ${e?.message ?? ''}`)
        // Solo continuar al siguiente modelo si es 503 (sobrecarga) o 429 (rate limit)
        if (e?.status === 503 || e?.status === 429 || String(e?.message).includes('503') || String(e?.message).includes('overload')) {
          lastError = err instanceof Error ? err : new Error(String(err))
          continue
        }
        // Otros errores: falla directamente
        throw err
      }
    }

    // Todos los modelos fallaron con sobrecarga
    console.error('[identify] Todos los modelos fallaron:', lastError)
    return NextResponse.json(
      { error: 'El servicio de IA está con alta demanda. Espera unos segundos y vuelve a intentar.' },
      { status: 503 }
    )
  } catch (err) {
    console.error('Error en identify:', err)
    return NextResponse.json(
      { error: 'Error al identificar la pieza. Intenta con otra foto.' },
      { status: 500 }
    )
  }
}
