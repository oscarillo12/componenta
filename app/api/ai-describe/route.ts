import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { nombre, especialidades, ciudad, tipo } = await req.json()

  const tipoLabel = tipo === 'taller' ? 'taller mecánico' : tipo === 'desarmaduria' ? 'desarmaduria' : 'taller'

  const prompt = `Escribe una descripción profesional y atractiva para un ${tipoLabel} chileno llamado "${nombre}" ubicado en ${ciudad || 'Chile'}.
${especialidades?.length ? `Se especializa en: ${especialidades.join(', ')}.` : ''}

La descripción debe:
- Ser en español chileno natural, cálido y confiable
- Tener entre 2 y 3 oraciones
- Destacar la confianza, experiencia y servicio al cliente
- No inventar datos específicos como años o cantidades exactas
- Sonar auténtica, no como marketing genérico

Responde SOLO con el texto de la descripción, sin comillas ni explicaciones.`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  return NextResponse.json({ descripcion: text })
}
