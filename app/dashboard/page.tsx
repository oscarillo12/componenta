import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import SellerLayout from '@/components/SellerLayout'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const plan = (user?.publicMetadata?.plan as string) ?? 'gratuito'
  const hasPhone = !!(
    user?.phoneNumbers?.[0]?.phoneNumber ??
    (user?.publicMetadata?.telefono as string | null)
  )

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id,pieza,precio,disponible,vistas,estado,imagen_url,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const items      = products ?? []
  const disponibles = items.filter(p => p.disponible)
  const vendidas    = items.filter(p => !p.disponible)
  const totalVistas = items.reduce((s, p) => s + (p.vistas ?? 0), 0)
  const ingresosMes = vendidas.reduce((s, p) => s + (p.precio ?? 0), 0)
  const topPiezas   = [...items].sort((a, b) => (b.vistas ?? 0) - (a.vistas ?? 0)).slice(0, 5)
  const productIds  = items.map(p => p.id)

  // Consultas (chat) por pieza
  const roomIds = productIds.map(id => `pieza-${id}`)
  const { data: chatMsgs } = productIds.length
    ? await supabaseAdmin.from('chat_messages').select('room_id').in('room_id', roomIds)
    : { data: [] }

  const chatCount: Record<string, number> = {}
  for (const m of (chatMsgs ?? [])) {
    chatCount[m.room_id] = (chatCount[m.room_id] ?? 0) + 1
  }

  // Analytics de visitas (product_views — graceful fail si tabla no existe)
  let topRegiones: { region: string; count: number }[] = []
  let dailyViews: { day: string; count: number }[] = []

  if (productIds.length) {
    try {
      const now = new Date()
      const thirtyAgo = new Date(now.getTime() - 30 * 86400_000).toISOString()
      const sevenAgo  = new Date(now.getTime() -  7 * 86400_000).toISOString()

      const [{ data: regionRows }, { data: dayRows }] = await Promise.all([
        supabaseAdmin.from('product_views').select('region').in('product_id', productIds).gte('viewed_at', thirtyAgo),
        supabaseAdmin.from('product_views').select('viewed_at').in('product_id', productIds).gte('viewed_at', sevenAgo),
      ])

      // Agrupar por región
      const regionMap: Record<string, number> = {}
      for (const r of (regionRows ?? [])) {
        const key = r.region ?? 'Desconocida'
        regionMap[key] = (regionMap[key] ?? 0) + 1
      }
      topRegiones = Object.entries(regionMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([region, count]) => ({ region, count }))

      // Agrupar por día (últimos 7 días)
      const dayMap: Record<string, number> = {}
      for (const r of (dayRows ?? [])) {
        const day = new Date(r.viewed_at).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })
        dayMap[day] = (dayMap[day] ?? 0) + 1
      }
      dailyViews = Object.entries(dayMap).map(([day, count]) => ({ day, count }))
    } catch { /* tabla no existe aún */ }
  }

  // Rendimiento por pieza: vistas + consultas
  const rendimiento = items.map(p => ({
    id:        p.id,
    pieza:     p.pieza,
    vistas:    p.vistas ?? 0,
    consultas: chatCount[`pieza-${p.id}`] ?? 0,
    disponible: p.disponible,
    precio:    p.precio,
  })).sort((a, b) => b.vistas - a.vistas).slice(0, 8)

  return (
    <SellerLayout section="dashboard">
      <DashboardClient
        totalPublicadas={items.length}
        totalDisponibles={disponibles.length}
        totalVendidas={vendidas.length}
        totalVistas={totalVistas}
        ingresosMes={ingresosMes}
        topPiezas={topPiezas}
        recentItems={items.slice(0, 6)}
        isDemo={items.length === 0}
        plan={plan}
        hasPhone={hasPhone}
        rendimiento={rendimiento}
        topRegiones={topRegiones}
        dailyViews={dailyViews}
      />
    </SellerLayout>
  )
}
