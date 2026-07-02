'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, CheckCircle, Truck, Clock, XCircle, MapPin, Phone, User as UserIcon, Hash, Loader2 } from 'lucide-react'

const ESTADOS = ['pendiente', 'pagado', 'confirmado', 'despachado', 'entregado']

const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; msg: string }> = {
  pendiente:  { label: 'Pendiente pago',   color: '#92400e', bg: '#fef3c7', icon: Clock,         msg: 'Esperando confirmación de pago.' },
  pagado:     { label: 'Pago confirmado',  color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle,   msg: 'El vendedor recibirá tu pedido pronto.' },
  confirmado: { label: 'Confirmado',       color: '#059669', bg: '#d1fae5', icon: CheckCircle,   msg: 'Tu pedido está siendo preparado.' },
  despachado: { label: 'En camino',        color: '#7c3aed', bg: '#ede9fe', icon: Truck,         msg: 'Tu pedido está en camino.' },
  entregado:  { label: 'Entregado',        color: '#059669', bg: '#d1fae5', icon: CheckCircle,   msg: '¡Tu pedido fue entregado!' },
  cancelado:  { label: 'Cancelado',        color: '#b91c1c', bg: '#fee2e2', icon: XCircle,       msg: 'El pedido fue cancelado.' },
  pagado_demo:{ label: 'Pago (demo)',      color: '#1d4ed8', bg: '#dbeafe', icon: CheckCircle,   msg: 'Pago simulado.' },
  fallido:    { label: 'Pago rechazado',   color: '#b91c1c', bg: '#fee2e2', icon: XCircle,       msg: 'El pago fue rechazado.' },
}

type OrderEvent = { id: string; estado: string; mensaje: string; created_at: string }
type Order = {
  id: string; pieza: string; precio: number; envio_costo: number
  buyer_id: string; buyer_name: string; buyer_phone?: string; buyer_address?: string
  seller_id: string; estado: string; payment_status: string
  tracking_code?: string; imagen_url?: string; created_at: string
  order_events: OrderEvent[]
}

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  function loadOrder() {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => { if (d.order) setOrder(d.order) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
    // Polling cada 15 segundos para actualizar estado (RLS impide realtime desde browser)
    const interval = setInterval(loadOrder, 15000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={28} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui,sans-serif' }}>
        <p style={{ color: '#B1BAC4' }}>Pedido no encontrado</p>
        <Link href="/mis-pedidos" style={{ color: '#79C0FF', fontWeight: 700, textDecoration: 'none' }}>← Mis pedidos</Link>
      </div>
    )
  }

  const cfg   = ESTADO_CFG[order.estado] ?? ESTADO_CFG.pendiente
  const Icon  = cfg.icon
  const total = order.precio + order.envio_costo
  const events = [...(order.order_events ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Índice del progreso (solo estados positivos)
  const progressIdx = ESTADOS.indexOf(order.estado)

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/mis-pedidos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: '#21262D', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="#CDD9E5" />
        </Link>
        <div>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', margin: 0 }}>Seguimiento de pedido</p>
          <p style={{ fontSize: 11, color: '#B1BAC4', margin: 0 }}>#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Estado actual */}
        <div style={{ background: cfg.bg, borderRadius: 16, padding: 20, border: `1.5px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={24} color={cfg.color} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, color: cfg.color, margin: 0 }}>{cfg.label}</p>
            <p style={{ fontSize: 13, color: cfg.color + 'cc', margin: '3px 0 0' }}>{cfg.msg}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        {progressIdx >= 0 && (
          <div style={{ background: '#161B22', borderRadius: 16, padding: 20, border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', margin: '0 0 16px' }}>Progreso del pedido</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '10%', right: '10%', height: 3, background: '#e5e7eb', borderRadius: 4, zIndex: 0 }}>
                <div style={{ height: '100%', borderRadius: 4, background: '#388BFD', width: `${Math.min(100, progressIdx * 25)}%`, transition: 'width 0.5s ease' }} />
              </div>
              {ESTADOS.map((est, i) => {
                const done = i <= progressIdx
                const ecfg = ESTADO_CFG[est]
                const EIcon = ecfg?.icon ?? CheckCircle
                return (
                  <div key={est} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? '#1A56DB' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                      <EIcon size={13} color={done ? '#fff' : '#9ca3af'} />
                    </div>
                    <p style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#1A56DB' : '#9ca3af', margin: 0, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      {ecfg?.label?.split(' ')[0] ?? est}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tracking code */}
        {order.tracking_code && (
          <div style={{ background: 'rgba(56,139,253,0.15)', borderRadius: 16, padding: '14px 20px', border: '1.5px solid rgba(56,139,253,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Hash size={16} color="#79C0FF" />
            <div>
              <p style={{ fontSize: 11, color: '#A5D6FF', fontWeight: 600, margin: 0 }}>Código de seguimiento</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#E6EDF3', margin: '2px 0 0' }}>{order.tracking_code}</p>
            </div>
          </div>
        )}

        {/* Pieza */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#21262D', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {order.imagen_url
              ? <img src={order.imagen_url} alt={order.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package size={24} color="#3b5280" />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#E6EDF3', margin: 0 }}>{order.pieza}</p>
            <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13, color: '#B1BAC4' }}>
              <span>Pieza: <b style={{ color: '#E6EDF3' }}>${order.precio.toLocaleString('es-CL')}</b></span>
              {order.envio_costo > 0 && <span>Envío: <b style={{ color: '#E6EDF3' }}>${order.envio_costo.toLocaleString('es-CL')}</b></span>}
            </div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#E6EDF3', margin: '6px 0 0' }}>Total: ${total.toLocaleString('es-CL')}</p>
          </div>
        </div>

        {/* Datos entrega */}
        {(order.buyer_name || order.buyer_address) && (
          <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', margin: '0 0 12px' }}>Datos de entrega</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.buyer_name && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <UserIcon size={15} color="#6E7681" />
                  <span style={{ fontSize: 14, color: '#E6EDF3' }}>{order.buyer_name}</span>
                </div>
              )}
              {order.buyer_phone && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Phone size={15} color="#6E7681" />
                  <span style={{ fontSize: 14, color: '#E6EDF3' }}>{order.buyer_phone}</span>
                </div>
              )}
              {order.buyer_address && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MapPin size={15} color="#6E7681" />
                  <span style={{ fontSize: 14, color: '#E6EDF3' }}>{order.buyer_address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline de eventos */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', margin: '0 0 16px' }}>Historial de actualizaciones</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {events.map((ev, i) => {
              const ecfg = ESTADO_CFG[ev.estado]
              const EIcon = ecfg?.icon ?? CheckCircle
              const isLast = i === events.length - 1
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: isLast ? '#1A56DB' : '#f3f4f6', border: `2px solid ${isLast ? '#1A56DB' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <EIcon size={13} color={isLast ? '#fff' : '#9ca3af'} />
                    </div>
                    {!isLast && <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 16, margin: '2px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 16, paddingTop: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>
                      {ecfg?.label ?? ev.estado}
                    </p>
                    <p style={{ fontSize: 12, color: '#B1BAC4', margin: '2px 0 0' }}>{ev.mensaje}</p>
                    <p style={{ fontSize: 11, color: '#B1BAC4', margin: '3px 0 0' }}>
                      {new Date(ev.created_at).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
