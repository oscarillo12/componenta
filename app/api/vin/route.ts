import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get('vin')?.trim().toUpperCase()

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'VIN inválido — debe tener exactamente 17 caracteres' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      throw new Error('Error al consultar NHTSA')
    }

    const data = await res.json()
    const r = data.Results?.[0]

    if (!r || !r.Make || r.Make === '') {
      return NextResponse.json({ error: 'VIN no encontrado en la base de datos internacional' }, { status: 404 })
    }

    return NextResponse.json({
      marca: r.Make,
      modelo: r.Model,
      anio: r.ModelYear,
      motor: r.DisplacementL && r.DisplacementL !== '' ? `${r.DisplacementL}L ${r.EngineCylinders}cil` : undefined,
      tipo: r.BodyClass ?? undefined,
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo consultar la base de datos de VIN. Ingresa el vehículo manualmente.' }, { status: 500 })
  }
}
