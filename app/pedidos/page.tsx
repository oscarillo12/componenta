'use client'

import { useState, useEffect } from 'react'
import SellerLayout from '@/components/SellerLayout'
import { Phone, Package, CheckCircle2, Truck, Clock, Tag, Eye, Loader2, ChevronDown, Hash } from 'lucide-react'

const ESTADO_CFG: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente pago', bg: '#fef3c7', color: '#92400e', icon: Clock },
  pagado:     { label: 'Pago confirmado', bg: '#dbeafe', color: '#1d4ed8', icon: CheckCircle2 },
  confirmado: { label: 'Confirmado',     bg: '#dbeafe', color: '#A5D6FF', icon: CheckCircle2 },
  despachado: { label: 'En camino',      bg: '#ede9fe', color: '#7c3aed', icon: Truck },
  entregado:  { label: 'Entregado',      bg: '#dbeafe', color: '#A5D6FF', icon: CheckCircle2 },
  cancelado:  { label: 'Cancelado',      bg: '#fee2e2', color: '#b91c1c', icon: Package },
}

const NEXT_STATES: Record<string, { value: string; label: string }[]> = {
  pagado:     [{ value: 'confirmado', label: 'Confirmar pedido' }, { value: 'cancelado', label: 'Cancelar' }],
  confirmado: [{ value: 'despachado', label: 'Marcar como despachado' }, { value: 'cancelado', label: 'Cancelar' }],
  despachado: [{ value: 'entregado', label: 'Marcar como entregado' }],
}

type SupabaseProduct = {
  id: string; pieza: string; marca: string | null; modelo: string | null
  precio: number; disponible: boolean; vistas: number; imagen_url: string | null; created_at: string
}

type Order = {
  id: string; pieza: string; precio: number; envio_costo: number
  buyer_name: string; buyer_phone?: string; buyer_address?: string; buyer_email: string
  seller_id: string; estado: string; payment_status: string
  tracking_code?: string; imagen_url?: string; created_at: string
}

function ActiveListingCard({ product }: { product: SupabaseProduct }) {
  return (
    <div className="bg-[#161B22] rounded-2xl border border-white/10 p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {product.imagen_url
          ? <img src={product.imagen_url} alt={product.pieza} className="w-full h-full object-cover" />
          : <Package size={24} className="text-slate-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{product.pieza}</p>
        <p className="text-xs text-slate-500 mt-0.5">{[product.marca, product.modelo].filter(Boolean).join(' · ')}</p>
        <p className="text-xs text-slate-600 mt-0.5">Publicado {new Date(product.created_at).toLocaleDateString('es-CL')}</p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-base font-bold text-slate-100">${product.precio.toLocaleString('es-CL')}</p>
        <div className="flex items-center gap-1 text-xs text-slate-500"><Eye size={11} /><span>{product.vistas} vistas</span></div>
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200"><Tag size={10} /> En venta</span>
      </div>
    </div>
  )
}

function OrderCard({ order, onUpdateEstado }: { order: Order; onUpdateEstado: (id: string, estado: string, tracking?: string) => Promise<void> }) {
  const cfg     = ESTADO_CFG[order.estado] ?? ESTADO_CFG.pendiente
  const Icon    = cfg.icon
  const total   = order.precio + order.envio_costo
  const comision = Math.round(total * 0.06)
  const nextOpts = NEXT_STATES[order.estado] ?? []
  const [updating, setUpdating] = useState(false)
  const [trackingInput, setTrackingInput] = useState(order.tracking_code ?? '')
  const [showTracking, setShowTracking] = useState(false)

  async function handleUpdateEstado(estado: string) {
    setUpdating(true)
    await onUpdateEstado(order.id, estado, estado === 'despachado' ? trackingInput : undefined)
    setUpdating(false)
    setShowTracking(false)
  }

  return (
    <div className="bg-[#161B22] rounded-2xl border border-white/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {order.imagen_url
              ? <img src={order.imagen_url} alt={order.pieza} className="w-full h-full object-cover" />
              : <Package size={18} className="text-slate-500" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{order.pieza}</p>
            <p className="text-xs text-slate-500 mt-0.5">{order.buyer_name} · {order.buyer_address ?? 'Sin dirección'}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              #{order.id.slice(0,8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span style={{ background: cfg.bg, color: cfg.color }} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full">
            <Icon size={11} />{cfg.label}
          </span>
          <p className="text-sm font-bold text-slate-100">${total.toLocaleString('es-CL')}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Pieza: ${order.precio.toLocaleString('es-CL')}</span>
            <span>Envío: ${order.envio_costo.toLocaleString('es-CL')}</span>
            <span className="text-slate-600">Comisión 6%: -${comision.toLocaleString('es-CL')}</span>
            <span className="text-blue-700 font-medium">Neto: ${(total - comision).toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center gap-2">
            {order.buyer_phone && (
              <a href={`https://wa.me/${order.buyer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                <Phone size={11} /> Contactar
              </a>
            )}
            {nextOpts.map(opt => (
              <button key={opt.value}
                onClick={() => opt.value === 'despachado' ? setShowTracking(t => !t) : handleUpdateEstado(opt.value)}
                disabled={updating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  opt.value === 'cancelado'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}>
                {updating ? <Loader2 size={11} className="animate-spin" /> : opt.label}
                {opt.value === 'despachado' && <ChevronDown size={11} />}
              </button>
            ))}
          </div>
        </div>

        {showTracking && (
          <div className="mt-3 flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#21262D]/50 rounded-xl border border-white/10">
              <Hash size={14} className="text-slate-500 flex-shrink-0" />
              <input
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Código de seguimiento (opcional)"
                className="flex-1 bg-transparent text-sm outline-none text-slate-300 placeholder-gray-300"
              />
            </div>
            <button onClick={() => handleUpdateEstado('despachado')} disabled={updating}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors">
              {updating ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar despacho'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type TabId = 'publicadas' | 'todos' | string

const tabs: { id: TabId; label: string }[] = [
  { id: 'publicadas', label: 'Publicadas' },
  { id: 'todos',      label: 'Todos' },
  { id: 'pagado',     label: 'Nuevos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'despachado', label: 'En camino' },
  { id: 'entregado',  label: 'Entregados' },
]

export default function PedidosPage() {
  const [tab, setTab]           = useState<TabId>('publicadas')
  const [orders, setOrders]     = useState<Order[]>([])
  const [listings, setListings] = useState<SupabaseProduct[]>([])
  const [loading, setLoading]   = useState(true)

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

  async function handleUpdateEstado(orderId: string, estado: string, tracking?: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, tracking_code: tracking }),
    })
    loadOrders()
  }

  const activeListings  = listings.filter(l => l.disponible)
  const pendingCount    = orders.filter(o => o.estado === 'pagado').length
  const filteredOrders  = tab === 'todos' ? orders : orders.filter(o => o.estado === tab)

  return (
    <SellerLayout section="pedidos">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-100">Piezas y Pedidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {activeListings.length} pieza{activeListings.length !== 1 ? 's' : ''} en venta ·{' '}
          {pendingCount} pedido{pendingCount !== 1 ? 's' : ''} nuevos
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-white/10 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => {
          const count = t.id === 'publicadas'
            ? activeListings.length
            : t.id === 'todos'
              ? orders.length
              : orders.filter(o => o.estado === t.id).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-[#161B22] text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-300'
              }`}>
              {t.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-slate-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={28} className="mx-auto text-slate-600 animate-spin" />
        </div>
      ) : tab === 'publicadas' ? (
        activeListings.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500">No tienes piezas publicadas aún</p>
            <a href="/" className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold">+ Publicar pieza</a>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {activeListings.map(l => <ActiveListingCard key={l.id} product={l} />)}
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500">
              {orders.length === 0
                ? 'Los pedidos aparecerán aquí cuando los compradores paguen tus piezas'
                : 'No hay pedidos en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateEstado={handleUpdateEstado} />
            ))}
          </div>
        )
      )}
    </SellerLayout>
  )
}
