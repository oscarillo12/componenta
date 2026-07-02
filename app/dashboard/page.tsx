import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import SellerLayout from '@/components/SellerLayout'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // MÃ©tricas reales desde Supabase
  const [{ data: products }, { data: allProducts }] = await Promise.all([
    supabaseAdmin.from('products').select('id,pieza,precio,disponible,vistas,estado,imagen_url,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    supabaseAdmin.from('products').select('id,vistas').eq('user_id', userId),
  ])

  const items = products ?? []
  const disponibles = items.filter(p => p.disponible)
  const vendidas    = items.filter(p => !p.disponible)
  const totalVistas = (allProducts ?? []).reduce((s, p) => s + (p.vistas ?? 0), 0)
  const ingresosMes = vendidas.reduce((s, p) => s + (p.precio ?? 0), 0)

  // Top 5 por vistas
  const topPiezas = [...items].sort((a, b) => (b.vistas ?? 0) - (a.vistas ?? 0)).slice(0, 5)

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
      />
    </SellerLayout>
  )
}

