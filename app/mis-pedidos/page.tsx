'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Package, Loader2, ChevronRight, CheckCircle, Truck, Clock, XCircle, ShoppingBag } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente pago', color: '#92400e', bg: '#fef3c7', icon: Clock },
  pagado:     { label: 'Pago confirmado', color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle },
  confirmado: { label: 'Confirmado',      color: '#059669', bg: '#d1fae5', icon: CheckCircle },
  despachado: { label: 'En camino',       color: '#7c3aed', bg: '#ede9fe', icon: Truck },
  entregado:  { label: 'Entregado',       color: '#059669', bg: '#d1fae5', icon: CheckCircle },
  cancelado:  { label: 'Cancelado',       color: '#b91c1c', bg: '#fee2e2', icon: XCircle },
}

type Order = {
  id: string
  pieza: string
  precio: number
  envio_costo: number
  estado: string
  payment_status: string
  created_at: string
  imagen_url?: string | null
}

export default function MisPedidosPage() {
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) return
    fetch('/api/orders?rol=buyer')
      .then(r => r.json())
      .then(d => setOrders(d.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, isLoaded])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 64 }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(1,4,9,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Mis Pedidos</p>
            <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>Historial y seguimiento de compras</p>
          </div>
        </header>

        <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 24px 60px' }}>
          {!isLoaded || loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Loader2 size={28} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : !user ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ color: '#B1BAC4', marginBottom: 16 }}>Inicia sesión para ver tus pedidos</p>
              <Link href="/sign-in" style={{ padding: '12px 24px', background: '#388BFD', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={28} color="#79C0FF" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>Aún no tienes pedidos</p>
              <p style={{ fontSize: 13, color: '#B1BAC4', margin: '0 0 24px' }}>Explora el marketplace y encuentra las piezas que necesitas</p>
              <Link href="/marketplace" style={{ padding: '12px 24px', background: '#388BFD', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Ver marketplace</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(order => {
                const cfg = ESTADO_CFG[order.estado] ?? ESTADO_CFG.pendiente
                const Icon = cfg.icon
                return (
                  <Link key={order.id} href={`/mis-pedidos/${order.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20, display: 'flex', gap: 14, alignItems: 'center', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#21262D', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {order.imagen_url
                          ? <img src={order.imagen_url} alt={order.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={22} color="#3b5280" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.pieza}</p>
                        <p style={{ fontSize: 12, color: '#B1BAC4', margin: '3px 0 6px' }}>
                          {new Date(order.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <p style={{ fontWeight: 900, fontSize: 16, color: '#E6EDF3', margin: '0 0 4px' }}>
                          ${(order.precio + order.envio_costo).toLocaleString('es-CL')}
                        </p>
                        <ChevronRight size={16} color="#6E7681" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
