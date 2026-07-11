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
    .select('id,pieza,precio,disponible,vistas,estado,imagen_url,created_at,marca')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  let mlConnected = false
  try {
    const { data: mlToken } = await supabaseAdmin
      .from('ml_tokens').select('expires_at').eq('user_id', userId).single()
    mlConnected = !!mlToken
  } catch { mlConnected = false }

  const items       = products ?? []
  const disponibles = items.filter(p => p.disponible)
  const vendidas    = items.filter(p => !p.disponible)
  const totalVistas = items.reduce((s, p) => s + (p.vistas ?? 0), 0)
  const topPiezas   = [...items].sort((a, b) => (b.vistas ?? 0) - (a.vistas ?? 0)).slice(0, 5)
  const productIds  = items.map(p => p.id)

  // Consultas chat
  const roomIds = productIds.map(id => `pieza-${id}`)
  const { data: chatMsgs } = productIds.length
    ? await supabaseAdmin.from('chat_messages').select('room_id').in('room_id', roomIds)
    : { data: [] }
  const chatCount: Record<string, number> = {}
  for (const m of (chatMsgs ?? [])) {
    chatCount[m.room_id] = (chatCount[m.room_id] ?? 0) + 1
  }
  const consultasChat = Object.values(chatCount).reduce((s, n) => s + n, 0)

  // Ventas por marca (de piezas vendidas)
  const marcaMap: Record<string, number> = {}
  for (const p of vendidas) {
    const m = (p.marca as string | null) || 'Otras'
    marcaMap[m] = (marcaMap[m] ?? 0) + 1
  }
  const ventasPorMarca = Object.entries(marcaMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([marca, count]) => ({ marca, count }))

  // Ingresos por mes + comparativa mes anterior (desde orders)
  const now = new Date()
  const thisMonthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const sixMonthsAgo    = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  let ingresosPorMes:    { mes: string; total: number }[] = []
  let ingresosEsteMes    = 0
  let ingresosMesAnterior = 0
  let vendidasEsteMes    = 0
  let vendidasMesAnterior = 0

  try {
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('precio, created_at, estado')
      .eq('seller_id', userId)
      .gte('created_at', sixMonthsAgo)

    if (orders && orders.length > 0) {
      // Agrupar por mes
      const mesMap: Record<string, number> = {}
      for (const o of orders) {
        const mes = new Date(o.created_at).toLocaleDateString('es-CL', { month: 'short' })
        mesMap[mes] = (mesMap[mes] ?? 0) + (o.precio ?? 0)
      }
      ingresosPorMes = Object.entries(mesMap).map(([mes, total]) => ({ mes, total }))

      ingresosEsteMes     = orders.filter(o => o.created_at >= thisMonthStart).reduce((s, o) => s + (o.precio ?? 0), 0)
      ingresosMesAnterior = orders.filter(o => o.created_at >= lastMonthStart && o.created_at < thisMonthStart).reduce((s, o) => s + (o.precio ?? 0), 0)
      vendidasEsteMes     = orders.filter(o => o.created_at >= thisMonthStart).length
      vendidasMesAnterior = orders.filter(o => o.created_at >= lastMonthStart && o.created_at < thisMonthStart).length
    }
  } catch { /* tabla puede no existir aún */ }

  // Analytics de visitas
  let topRegiones: { region: string; count: number }[] = []
  let dailyViews:  { day: string; count: number }[]    = []
  let vistasEsteMes    = 0
  let vistasMesAnterior = 0

  if (productIds.length) {
    try {
      const thirtyAgo = new Date(now.getTime() - 30 * 86400_000).toISOString()
      const sevenAgo  = new Date(now.getTime() -  7 * 86400_000).toISOString()

      const [{ data: regionRows }, { data: dayRows }, { data: thisMoViews }, { data: lastMoViews }] = await Promise.all([
        supabaseAdmin.from('product_views').select('region').in('product_id', productIds).gte('viewed_at', thirtyAgo),
        supabaseAdmin.from('product_views').select('viewed_at').in('product_id', productIds).gte('viewed_at', sevenAgo),
        supabaseAdmin.from('product_views').select('id').in('product_id', productIds).gte('viewed_at', thisMonthStart),
        supabaseAdmin.from('product_views').select('id').in('product_id', productIds).gte('viewed_at', lastMonthStart).lt('viewed_at', thisMonthStart),
      ])

      const regionMap: Record<string, number> = {}
      for (const r of (regionRows ?? [])) {
        const key = r.region ?? 'Desconocida'
        regionMap[key] = (regionMap[key] ?? 0) + 1
      }
      topRegiones = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([region, count]) => ({ region, count }))

      const dayMap: Record<string, number> = {}
      for (const r of (dayRows ?? [])) {
        const day = new Date(r.viewed_at).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })
        dayMap[day] = (dayMap[day] ?? 0) + 1
      }
      dailyViews = Object.entries(dayMap).map(([day, count]) => ({ day, count }))

      vistasEsteMes    = thisMoViews?.length ?? 0
      vistasMesAnterior = lastMoViews?.length ?? 0
    } catch { /* tabla no existe aún */ }
  }

  // Métricas derivadas
  const ingresosMes     = vendidas.reduce((s, p) => s + (p.precio ?? 0), 0)
  const ticketPromedio  = vendidas.length > 0 ? Math.round(ingresosMes / vendidas.length) : 0
  const consultaVentaRate = consultasChat > 0 ? Math.round((vendidas.length / consultasChat) * 100) : 0

  const rendimiento = items.map(p => ({
    id: p.id, pieza: p.pieza, vistas: p.vistas ?? 0,
    consultas: chatCount[`pieza-${p.id}`] ?? 0,
    disponible: p.disponible, precio: p.precio,
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
        consultasChat={consultasChat}
        mlConnected={mlConnected}
        ventasPorMarca={ventasPorMarca}
        ingresosPorMes={ingresosPorMes}
        ticketPromedio={ticketPromedio}
        consultaVentaRate={consultaVentaRate}
        vistasEsteMes={vistasEsteMes}
        vistasMesAnterior={vistasMesAnterior}
        vendidasEsteMes={vendidasEsteMes}
        vendidasMesAnterior={vendidasMesAnterior}
        ingresosEsteMes={ingresosEsteMes}
        ingresosMesAnterior={ingresosMesAnterior}
      />
    </SellerLayout>
  )
}
