import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

function validateSecret(req: Request): boolean {
  const secret = req.headers.get('x-componenta-secret')
  return secret === process.env.COMPONENTA_WEBHOOK_SECRET
}

export async function GET(req: Request) {
  if (!validateSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = process.env.COMPONENTA_SYSTEM_USER_ID
  if (!userId) return NextResponse.json({ totalProducts: 0, totalViews: 0, activeChannels: 0 })

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, precio, imagen_url, vistas, ml_item_id, ml_permalink, fb_item_id, created_at')
    .eq('user_id', userId)
    .eq('disponible', true)
    .order('created_at', { ascending: false })
    .limit(200)

  const all = products ?? []
  const mlItems = all.filter(p => p.ml_item_id)
  const fbItems = all.filter(p => p.fb_item_id)
  const totalViews = all.reduce((s, p) => s + (p.vistas ?? 0), 0)

  let mlStatuses: Record<string, { status: string; sold_quantity: number; visits: number }> = {}
  if (mlItems.length > 0) {
    try {
      const ids = mlItems.slice(0, 20).map(p => p.ml_item_id).join(',')
      const r = await fetch(`https://api.mercadolibre.com/items?ids=${ids}&attributes=id,status,sold_quantity,visits`, { next: { revalidate: 300 } })
      if (r.ok) {
        const list: Array<{ code: number; body: { id: string; status: string; sold_quantity: number; visits: number } }> = await r.json()
        for (const entry of list) {
          if (entry.code === 200) mlStatuses[entry.body.id] = entry.body
        }
      }
    } catch { /* silent */ }
  }

  const activeMlCount = Object.values(mlStatuses).filter(s => s.status === 'active').length
  const totalMlSold = Object.values(mlStatuses).reduce((s, v) => s + (v.sold_quantity ?? 0), 0)
  const totalMlViews = Object.values(mlStatuses).reduce((s, v) => s + (v.visits ?? 0), 0)

  return NextResponse.json({
    totalProducts: all.length,
    totalViews,
    mlProducts: mlItems.length,
    mlActive: activeMlCount,
    mlSold: totalMlSold,
    mlViews: totalMlViews,
    fbProducts: fbItems.length,
    activeChannels: [all.length > 0, mlItems.length > 0, fbItems.length > 0].filter(Boolean).length,
  })
}
