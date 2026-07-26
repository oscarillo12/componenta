import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Decodifica el WMI (primeros 3 caracteres del VIN) para identificar fabricante
// Incluye códigos comunes en el mercado chileno/latinoamericano
const WMI_MAP: Record<string, string> = {
  // Japón
  JTD: 'Toyota', JT2: 'Toyota', JT3: 'Toyota', JT6: 'Toyota', JTJ: 'Toyota', JTN: 'Toyota',
  JF1: 'Subaru', JF2: 'Subaru',
  JHM: 'Honda', JH4: 'Honda',
  JN1: 'Nissan', JN8: 'Nissan', JNA: 'Nissan',
  JM1: 'Mazda', JM3: 'Mazda',
  JA3: 'Mitsubishi', JA4: 'Mitsubishi', JA7: 'Mitsubishi',
  JS1: 'Suzuki', JS2: 'Suzuki', JS3: 'Suzuki',
  JDL: 'Lexus', JTH: 'Lexus',
  // Corea del Sur
  KMH: 'Hyundai', KMF: 'Hyundai',
  KNA: 'Kia', KND: 'Kia', KNE: 'Kia',
  KPT: 'SsangYong',
  KLA: 'Chevrolet (Corea)',
  // Brasil / Sudamérica
  '9BW': 'Volkswagen (Brasil)', '8AF': 'Volkswagen (Argentina)',
  '9BF': 'Ford (Brasil)',
  '9B3': 'Fiat (Brasil)', '8AP': 'Fiat (Argentina)',
  '9BG': 'GM (Brasil)',
  // Europa
  WBA: 'BMW', WBS: 'BMW', WBX: 'BMW',
  WDB: 'Mercedes-Benz', WDC: 'Mercedes-Benz', WDD: 'Mercedes-Benz',
  WVW: 'Volkswagen', WV1: 'Volkswagen', WV2: 'Volkswagen', AAV: 'Volkswagen',
  WAU: 'Audi', TRU: 'Audi',
  WP0: 'Porsche', WP1: 'Porsche',
  YV1: 'Volvo', YV4: 'Volvo',
  // USA
  '1HG': 'Honda', '2HG': 'Honda', '5FN': 'Honda',
  '1FA': 'Ford', '1FB': 'Ford', '1FT': 'Ford', '2FM': 'Ford',
  '1GC': 'Chevrolet', '1G1': 'Chevrolet', '2G1': 'Chevrolet', '3G1': 'Chevrolet',
  '1C3': 'Chrysler', '1C4': 'Chrysler', '2C3': 'Chrysler',
  '1N4': 'Nissan', '1N6': 'Nissan', '5N1': 'Nissan',
  '4T1': 'Toyota', '4T3': 'Toyota', '5TB': 'Toyota', 'JTE': 'Toyota',
  // China (mercado en crecimiento en Chile)
  LFV: 'Volkswagen (China)', LSG: 'GM (China)',
  LHG: 'Honda (China)',
  LNB: 'Nissan (China)',
}

function decodeMarca(vin: string): string | null {
  return WMI_MAP[vin.slice(0, 3).toUpperCase()] ?? null
}

export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get('vin')?.trim().toUpperCase()

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'VIN inválido — debe tener exactamente 17 caracteres' }, { status: 400 })
  }

  // ── 1. Intentar NHTSA (base de datos oficial USA + algunos internacionales) ──
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
      { next: { revalidate: 86400 } }
    )

    if (res.ok) {
      const data = await res.json()
      const r    = data.Results?.[0]

      if (r?.Make && r.Make !== '') {
        return NextResponse.json({
          marca:  r.Make,
          modelo: r.Model || null,
          anio:   r.ModelYear || null,
          motor:  r.DisplacementL && r.DisplacementL !== ''
            ? `${r.DisplacementL}L ${r.EngineCylinders}cil`
            : undefined,
          tipo:   r.BodyClass ?? undefined,
          fuente: 'nhtsa',
        })
      }
    }
  } catch {
    // NHTSA falló — continuar con fallback
  }

  // ── 2. Fallback: decodificación local del WMI ──────────────────────
  const marcaLocal = decodeMarca(vin)
  const anioChar   = vin[9].toUpperCase()
  const ANIO_MAP: Record<string, number> = {
    A:2010,B:2011,C:2012,D:2013,E:2014,F:2015,G:2016,H:2017,J:2018,K:2019,
    L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,
    '1':2001,'2':2002,'3':2003,'4':2004,'5':2005,'6':2006,'7':2007,'8':2008,'9':2009,
  }
  const anioLocal = ANIO_MAP[anioChar] ?? null

  // ── 3. Fallback AI: Gemini decodifica el VIN ─────────────────────
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(
      `Eres un experto en decodificación de VINs automotrices, énfasis en mercado chileno/latinoamericano.
Decodifica este VIN: ${vin}. WMI prefix: ${vin.slice(0,3)}. Fabricante conocido: ${marcaLocal ?? 'desconocido'}. Año estimado: ${anioLocal ?? 'desconocido'}.
Responde SOLO con JSON válido, sin explicaciones:
{"marca":"string","modelo":"string o null","anio":"string o null","motor":"string o null","tipo":"string o null","confianza":0}`
    )
    const txt = result.response.text()
    const match = txt.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return NextResponse.json({ ...parsed, fuente: 'ai' })
    }
  } catch {
    // AI falló — devolver lo que tenemos
  }

  // ── 4. Último recurso: solo WMI ───────────────────────────────────
  if (marcaLocal || anioLocal) {
    return NextResponse.json({
      marca:  marcaLocal ?? 'Desconocida',
      modelo: null,
      anio:   anioLocal?.toString() ?? null,
      fuente: 'wmi_local',
      nota:   'Modelo no identificado. Verifica el vehículo manualmente.',
    })
  }

  return NextResponse.json({
    error: 'VIN no encontrado en ninguna base de datos. Ingresa el vehículo manualmente.',
  }, { status: 404 })
}
