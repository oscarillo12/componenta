'use client'

import { useState, useEffect } from 'react'
import SellerLayout from '@/components/SellerLayout'
import { Phone, Package, CheckCircle2, Truck, Clock, Tag, Eye, Loader2, Hash, X, ChevronRight } from 'lucide-react'

const ESTADO_CFG: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente pago',   bg: '#fef3c7', color: '#92400e', icon: Clock },
  pagado:     { label: 'Pago confirmado',  bg: '#dbeafe', color: '#1d4ed8', icon: CheckCircle2 },
  confirmado: { label: 'Confirmado',       bg: '#eef3fc', color: '#2f5fdb', icon: CheckCircle2 },
  despachado: { label: 'En camino',        bg: '#f3f0ff', color: '#6d28d9', icon: Truck },
  entregado:  { label: 'Entregado',        bg: '#eefbf2', color: '#15803d', icon: CheckCircle2 },
  cancelado:  { label: 'Cancelado',        bg: '#fee2e2', color: '#b91c1c', icon: X },
}

const NEXT_STATES: Record<string, { value: string; label: string; danger?: boolean }[]> = {
  pendiente:  [
    { value: 'confirmado', label: 'Confirmar pago y pedido' },
    { value: 'cancelado',  label: 'Cancelar pedido', danger: true },
  ],
  pagado:     [
    { value: 'confirmado', label: 'Confirmar pedido' },
    { value: 'cancelado',  label: 'Cancelar', danger: true },
  ],
  confirmado: [
    { value: 'despachado', label: 'Marcar como despachado' },
    { value: 'cancelado',  label: 'Cancelar', danger: true },
  ],
  despachado: [
    { value: 'entregado',  label: 'Marcar como entregado' },
  ],
}

const ESTADO_TIMELINE = ['pendiente', 'confirmado', 'despachado', 'entregado']

type Order = {
  id: string; pieza: string; precio: number; envio_costo: number
  buyer_name: string; buyer_phone?: string; buyer_address?: string; buyer_email: string
  seller_id: string; estado: string; payment_status: string
  tracking_code?: string; imagen_url?: string; created_at: string
}

type SupabaseProduct = {
  id: string; pieza: string; marca: string | null; modelo: string | null
  precio: number; disponible: boolean; vistas: number; imagen_url: string | null; created_at: string
}

function StatusTimeline({ estado }: { estado: string }) {
  const steps = ['pendiente', 'confirmado', 'despachado', 'entregado']
  const currentIdx = estado === 'cancelado' ? -1 : steps.indexOf(estado)
  if (estado === 'cancelado') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '3px 10px', borderRadius: 20 }}>Pedido cancelado</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '8px 0' }}>
      {steps.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        const cfg = ESTADO_CFG[step]
        const Icon = cfg.icon
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? (active ? '#2f5fdb' : '#eef3fc') : '#f5f5f4', border: `2px solid ${done ? '#2f5fdb' : '#e5e7eb'}` }}>
                <Icon size={12} color={done ? (active ? '#fff' : '#2f5fdb') : '#9aa0aa'} />
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#2f5fdb' : done ? '#6b7280' : '#9aa0aa', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {cfg.label.split(' ')[0]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentIdx ? '#2f5fdb' : '#e5e7eb', margin: '0 2px', marginBottom: 16 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order, onUpdateEstado }: {
  order: Order
  onUpdateEstado: (id: string, estado: string, tracking?: string, nota?: string) => Promise<void>
}) {
  const cfg      = ESTADO_CFG[order.estado] ?? ESTADO_CFG.pendiente
  const Icon     = cfg.icon
  const total    = order.precio + order.envio_costo
  const comision = Math.round(total * 0.06)
  const nextOpts = NEXT_STATES[order.estado] ?? []
  const [updating,      setUpdating]      = useState(false)
  const [trackingInput, setTrackingInput] = useState(order.tracking_code ?? '')
  const [nota,          setNota]          = useState('')
  const [showTracking,  setShowTracking]  = useState(false)
  const [expanded,      setExpanded]      = useState(false)

  async function handleUpdate(estado: string) {
    setUpdating(true)
    await onUpdateEstado(order.id, estado, estado === 'despachado' ? trackingInput : undefined, nota || undefined)
    setUpdating(false)
    setShowTracking(false)
    setNota('')
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f5f4', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {order.imagen_url
            ? <img src={order.imagen_url} alt={order.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Package size={18} color="#9aa0aa" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#16181d', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.pieza}</p>
          <p style={{ fontSize: 11, color: '#9aa0aa', margin: 0 }}>{order.buyer_name} · #{order.id.slice(0,8).toUpperCase()}</p>
          <p style={{ fontSize: 11, color: '#9aa0aa', margin: '2px 0 0' }}>{new Date(order.created_at).toLocaleDateString('es-CL')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
            <Icon size={11} />{cfg.label}
          </span>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#16181d', margin: 0 }}>${total.toLocaleString('es-CL')}</p>
          <ChevronRight size={14} color="#9aa0aa" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
        </div>
      </div>

      {/* Expandido */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f1f2f4', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Timeline */}
          <StatusTimeline estado={order.estado} />

          {/* Datos comprador */}
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Comprador</p>
            <p style={{ fontSize: 12, color: '#16181d', margin: 0 }}>{order.buyer_name}</p>
            {order.buyer_email && <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{order.buyer_email}</p>}
            {order.buyer_address && <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{order.buyer_address}</p>}
            {order.tracking_code && <p style={{ fontSize: 11, color: '#2f5fdb', margin: '2px 0 0', fontWeight: 600 }}>Tracking: {order.tracking_code}</p>}
          </div>

          {/* Resumen financiero */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#6b7280', background: '#f5f5f4', padding: '4px 10px', borderRadius: 20 }}>Pieza ${order.precio.toLocaleString('es-CL')}</span>
            <span style={{ fontSize: 11, color: '#6b7280', background: '#f5f5f4', padding: '4px 10px', borderRadius: 20 }}>Envío ${order.envio_costo.toLocaleString('es-CL')}</span>
            <span style={{ fontSize: 11, color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 20 }}>Comisión 6% -${comision.toLocaleString('es-CL')}</span>
            <span style={{ fontSize: 11, color: '#15803d', background: '#eefbf2', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>Neto ${(total - comision).toLocaleString('es-CL')}</span>
          </div>

          {/* Acciones */}
          {(nextOpts.length > 0 || order.buyer_phone) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {order.buyer_phone && (
                  <a href={`https://wa.me/${order.buyer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eefbf2', color: '#15803d', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #bbf7d0' }}>
                    <Phone size={12} /> WhatsApp
                  </a>
                )}
                {nextOpts.map(opt => (
                  <button key={opt.value}
                    onClick={() => opt.value === 'despachado' ? setShowTracking(t => !t) : handleUpdate(opt.value)}
                    disabled={updating}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: updating ? 'default' : 'pointer', border: 'none', background: opt.danger ? '#fee2e2' : '#2f5fdb', color: opt.danger ? '#b91c1c' : '#fff' }}>
                    {updating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : opt.label}
                  </button>
                ))}
              </div>

              {/* Nota opcional (para cualquier transición excepto despacho) */}
              {nextOpts.length > 0 && order.estado !== 'despachado' && (
                <input
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Nota para el comprador (opcional)"
                  style={{ fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '7px 10px', color: '#16181d', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />
              )}

              {/* Tracking para despacho */}
              {showTracking && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '7px 10px' }}>
                    <Hash size={13} color="#9aa0aa" />
                    <input
                      value={trackingInput}
                      onChange={e => setTrackingInput(e.target.value)}
                      placeholder="Código de seguimiento (opcional)"
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, color: '#16181d' }}
                    />
                  </div>
                  <input
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder="Nota (opcional)"
                    style={{ width: 160, fontSize: 12, border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '7px 10px', color: '#16181d', outline: 'none' }}
                  />
                  <button onClick={() => handleUpdate('despachado')} disabled={updating}
                    style={{ padding: '7px 16px', background: '#6d28d9', color: '#fff', borderRadius: 9, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {updating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirmar despacho'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActiveListingCard({ product }: { product: SupabaseProduct }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f5f5f4', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.imagen_url
          ? <img src={product.imagen_url} alt={product.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Package size={22} color="#9aa0aa" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#16181d', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.pieza}</p>
        <p style={{ fontSize: 11, color: '#9aa0aa', margin: 0 }}>{[product.marca, product.modelo].filter(Boolean).join(' · ')}</p>
        <p style={{ fontSize: 11, color: '#9aa0aa', margin: '2px 0 0' }}>Publicado {new Date(product.created_at).toLocaleDateString('es-CL')}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 900, color: '#16181d', margin: 0 }}>${product.precio.toLocaleString('es-CL')}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9aa0aa' }}><Eye size={11} />{product.vistas} vistas</div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#eef3fc', color: '#2f5fdb', display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={9} /> En venta</span>
      </div>
    </div>
  )
}

type TabId = 'publicadas' | 'todos' | string

const TABS: { id: TabId; label: string }[] = [
  { id: 'publicadas', label: 'Publicadas' },
  { id: 'todos',      label: 'Todos' },
  { id: 'pendiente',  label: 'Pendientes' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'despachado', label: 'En camino' },
  { id: 'entregado',  label: 'Entregados' },
]

export default function PedidosPage() {
  const [tab,      setTab]      = useState<TabId>('publicadas')
  const [orders,   setOrders]   = useState<Order[]>([])
  const [listings, setListings] = useState<SupabaseProduct[]>([])
  const [loading,  setLoading]  = useState(true)

  function loadOrders() {
    fetch('/api/orders?rol=seller')
      .then(r => r.json())
      .then(d => setOrders(d.orders ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/mis-piezas').then(r => r.ok ? r.json() : { products: [] }).then(d => setListings(d.products ?? [])),
      fetch('/api/orders?rol=seller').then(r => r.json()).then(d => setOrders(d.orders ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  async function handleUpdateEstado(orderId: string, estado: string, tracking?: string, nota?: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, tracking_code: tracking, mensaje: nota }),
    })
    loadOrders()
  }

  const activeListings = listings.filter(l => l.disponible)
  const pendingCount   = orders.filter(o => o.estado === 'pendiente' || o.estado === 'pagado').length
  const filteredOrders = tab === 'todos' ? orders : orders.filter(o => o.estado === tab)

  return (
    <SellerLayout section="pedidos">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Piezas y Pedidos</h1>
        <p style={{ fontSize: 13, color: '#9aa0aa', margin: 0 }}>
          {activeListings.length} pieza{activeListings.length !== 1 ? 's' : ''} en venta
          {pendingCount > 0 && ` · ${pendingCount} pedido${pendingCount !== 1 ? 's' : ''} por gestionar`}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f5f5f4', padding: 4, borderRadius: 12, width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>
        {TABS.map(t => {
          const count = t.id === 'publicadas'
            ? activeListings.length
            : t.id === 'todos'
              ? orders.length
              : orders.filter(o => o.estado === t.id).length
          const isActive = tab === t.id
          const isAlert  = (t.id === 'pendiente') && count > 0
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: isActive ? 700 : 500, border: 'none', cursor: 'pointer', background: isActive ? '#fff' : 'transparent', color: isActive ? '#16181d' : '#6b7280', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap' }}>
              {t.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: isAlert ? '#fef3c7' : isActive ? '#eef3fc' : '#e5e7eb', color: isAlert ? '#92400e' : isActive ? '#2f5fdb' : '#9aa0aa' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={28} color="#9aa0aa" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
        </div>
      ) : tab === 'publicadas' ? (
        activeListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Package size={32} color="#9aa0aa" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#9aa0aa', margin: '0 0 16px' }}>No tienes piezas publicadas aún</p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#2f5fdb', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ Publicar pieza</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
            {activeListings.map(l => <ActiveListingCard key={l.id} product={l} />)}
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Package size={32} color="#9aa0aa" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#9aa0aa', margin: 0 }}>
              {orders.length === 0
                ? 'Los pedidos aparecerán aquí cuando los compradores paguen tus piezas'
                : 'No hay pedidos en esta categoría'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateEstado={handleUpdateEstado} />
            ))}
          </div>
        )
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </SellerLayout>
  )
}
