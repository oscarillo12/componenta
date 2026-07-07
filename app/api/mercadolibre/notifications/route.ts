import { NextResponse } from 'next/server'

// MercadoLibre envía notificaciones como POST cuando cambia el estado de una publicación, orden, etc.
// Por ahora solo registramos la notificación y respondemos 200 para que ML no reintente.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[ML Notification]', JSON.stringify(body))
  } catch {
    // body vacío o inválido — igual respondemos 200
  }
  return NextResponse.json({ received: true }, { status: 200 })
}

// ML a veces hace GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
