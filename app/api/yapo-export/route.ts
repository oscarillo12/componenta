import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { APP_URL } from '@/lib/config'

const ESTADO: Record<string, string> = {
  excelente: 'Excelente',
  bueno: 'Buen estado',
  'con-detalles': 'Con detalles',
  'para-reparar': 'Para reparar',
  nuevo: 'Nuevo',
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, descripcion, precio, imagen_url, marca, modelo, anios, estado')
    .eq('user_id', userId)
    .eq('disponible', true)
    .order('created_at', { ascending: false })
    .limit(500)

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`

  const headers = ['Titulo', 'Precio', 'Descripcion', 'Categoria', 'Estado', 'Imagen', 'Link'].join(',')

  const rows = (products ?? []).map(p => {
    const titulo = [p.pieza, p.marca && p.modelo ? `${p.marca} ${p.modelo}` : (p.marca || p.modelo), p.anios].filter(Boolean).join(' - ')
    const desc   = p.descripcion || `${p.pieza} en ${ESTADO[p.estado] ?? 'buen estado'}. Disponible para retiro o envío. Consultar.`
    return [
      esc(titulo.slice(0, 70)),
      p.precio,
      esc(desc.slice(0, 500)),
      esc('Repuestos y accesorios para automóviles'),
      esc(ESTADO[p.estado] ?? 'Usado'),
      p.imagen_url ?? '',
      `${APP_URL}/marketplace/${p.id}`,
    ].join(',')
  })

  const csv = [headers, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mis-piezas-yapo.csv"',
    },
  })
}
