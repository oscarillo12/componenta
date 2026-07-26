import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, marca, modelo, anios, precio, imagen_url, estado, vistas, canales, ml_item_id, ml_permalink, fb_item_id, fb_permalink, created_at, disponible, descripcion')
    .eq('user_id', userId)
    .eq('disponible', true)
    .order('created_at', { ascending: false })
    .limit(200)

  const all = products ?? []
  const totalViews  = all.reduce((s, p) => s + (p.vistas ?? 0), 0)
  const withImage   = all.filter(p => p.imagen_url)
  const mlItems     = all.filter(p => p.ml_item_id)
  const fbItems     = all.filter(p => p.fb_item_id)
  const latestAll   = all[0] ?? null
  const latestImg   = withImage[0] ?? latestAll

  // Fetch ML item statuses from their public API (no auth required for basic fields)
  let mlStatuses: Record<string, { status: string; sold_quantity: number; permalink: string; visits: number }> = {}
  if (mlItems.length > 0) {
    try {
      const ids = mlItems.slice(0, 20).map(p => p.ml_item_id).join(',')
      const r = await fetch(`https://api.mercadolibre.com/items?ids=${ids}&attributes=id,status,sold_quantity,permalink,visits`, {
        next: { revalidate: 300 },
      })
      if (r.ok) {
        const list: Array<{ code: number; body: { id: string; status: string; sold_quantity: number; permalink: string; visits: number } }> = await r.json()
        for (const entry of list) {
          if (entry.code === 200) mlStatuses[entry.body.id] = entry.body
        }
      }
    } catch { /* silent — show cached data */ }
  }

  const mlEnriched = mlItems.slice(0, 5).map(p => ({
    id:           p.id,
    pieza:        p.pieza,
    marca:        p.marca,
    precio:       p.precio,
    imagen_url:   p.imagen_url,
    ml_item_id:   p.ml_item_id,
    ml_permalink: p.ml_permalink ?? mlStatuses[p.ml_item_id!]?.permalink,
    ml_status:    mlStatuses[p.ml_item_id!]?.status ?? 'unknown',
    ml_sold:      mlStatuses[p.ml_item_id!]?.sold_quantity ?? 0,
    ml_visits:    mlStatuses[p.ml_item_id!]?.visits ?? 0,
  }))

  const activeMlCount  = Object.values(mlStatuses).filter(s => s.status === 'active').length
  const totalMlViews   = Object.values(mlStatuses).reduce((s, v) => s + (v.visits ?? 0), 0)
  const totalMlSold    = Object.values(mlStatuses).reduce((s, v) => s + (v.sold_quantity ?? 0), 0)
  const mlConversion   = totalMlViews > 0 ? +((totalMlSold / totalMlViews) * 100).toFixed(1) : 0

  return NextResponse.json({
    totalViews,
    totalProducts:   all.length,
    activeChannels:  [
      all.length > 0,
      mlItems.length > 0,
      withImage.length > 0,
      fbItems.length > 0,
    ].filter(Boolean).length,

    channels: {
      componenta: {
        active:        all.length > 0,
        count:         all.length,
        views:         totalViews,
        latestProduct: latestAll,
      },
      mercadolibre: {
        active:         mlItems.length > 0,
        count:          mlItems.length,
        activeCount:    activeMlCount,
        views:          totalMlViews,
        sold:           totalMlSold,
        conversion:     mlConversion,
        items:          mlEnriched,
        latestProduct:  mlItems[0] ?? null,
      },
      google: {
        active:        withImage.length > 0,
        count:         withImage.length,
        latestProduct: latestImg,
      },
      facebook: {
        active:        fbItems.length > 0,
        count:         fbItems.length,
        items:         fbItems.slice(0, 10).map(p => ({
          id:           p.id,
          pieza:        p.pieza,
          marca:        p.marca,
          precio:       p.precio,
          imagen_url:   p.imagen_url,
          fb_item_id:   p.fb_item_id,
          fb_permalink: p.fb_permalink,
        })),
        latestProduct: fbItems[0] ?? null,
      },
    },
  })
}
