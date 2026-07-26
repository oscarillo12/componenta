'use client'

import { useState, useEffect } from 'react'
import SellerLayout from '@/components/SellerLayout'
import { ExternalLink, Eye, Package, Zap, TrendingUp, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://componenta.vercel.app'

type Producto = {
  id: string; pieza: string; marca: string | null; modelo: string | null
  anios: string | null; precio: number; imagen_url: string | null
  estado: string; vistas: number; ml_item_id?: string | null
  ml_permalink?: string | null; ml_status?: string; ml_sold?: number
  descripcion?: string | null; fb_item_id?: string | null; fb_permalink?: string | null
}

type Stats = {
  totalViews: number; totalProducts: number; activeChannels: number
  channels: {
    componenta:   { active: boolean; count: number; views: number; items: Producto[]; latestProduct: Producto | null }
    mercadolibre: { active: boolean; count: number; activeCount: number; views: number; sold: number; conversion: number; items: Producto[]; latestProduct: Producto | null }
    google:       { active: boolean; count: number; items: Producto[]; latestProduct: Producto | null }
    facebook:     { active: boolean; count: number; items: Producto[]; latestProduct: Producto | null }
  }
}

// ── Utilidades ────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

type BadgeVariant = 'active' | 'feed' | 'inactive'

function StatusBadge({ variant, label }: { variant: BadgeVariant; label?: string }) {
  const styles: Record<BadgeVariant, { bg: string; border: string; color: string; dot: string; defaultLabel: string }> = {
    active:   { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', dot: '#22c55e', defaultLabel: 'Activo' },
    feed:     { bg: '#fffbeb', border: '#fde68a', color: '#92400e', dot: '#f59e0b', defaultLabel: 'Feed activo' },
    inactive: { bg: '#f9fafb', border: '#e5e7eb', color: '#9ca3af', dot: '#d1d5db', defaultLabel: 'Sin publicaciones' },
  }
  const s = styles[variant]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {label ?? s.defaultLabel}
    </span>
  )
}

function MetricBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', flex: 1 }}>
      <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 900, color: '#16181d', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  )
}

// ── Previsualizaciones por canal ──────────────────────────────────────────────

function ComponentaPreview({ p }: { p: Producto }) {
  const estadoLabel = { excelente: 'Excelente', bueno: 'Buen estado', 'con-detalles': 'Con detalles', 'para-reparar': 'Para reparar' }[p.estado] ?? p.estado
  return (
    <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#9aa0aa', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
        comp●nenta · previsualizacion
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #ececea', overflow: 'hidden', maxWidth: 200 }}>
        <div style={{ height: 120, background: p.imagen_url ? undefined : '#f1f2f4', position: 'relative', overflow: 'hidden' }}>
          {p.imagen_url
            ? <img src={p.imagen_url} alt={p.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 28 }}>📷</div>
          }
          <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
            {estadoLabel}
          </span>
        </div>
        <div style={{ padding: '10px 10px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: '0 0 2px', lineHeight: 1.3 }}>
            {[p.pieza, p.marca].filter(Boolean).join(' · ')}
          </p>
          {p.modelo && <p style={{ fontSize: 10, color: '#9aa0aa', margin: '0 0 6px' }}>{p.modelo}{p.anios ? ` · ${p.anios}` : ''}</p>}
          <p style={{ fontSize: 14, fontWeight: 900, color: '#16181d', margin: 0 }}>{fmtPrice(p.precio)}</p>
        </div>
      </div>
    </div>
  )
}

function MeLiPreview({ p }: { p: Producto }) {
  const statusLabel = p.ml_status === 'active' ? 'Activo' : p.ml_status === 'paused' ? 'Pausado' : p.ml_status === 'closed' ? 'Cerrado' : 'Publicado'
  const statusColor = p.ml_status === 'active' ? '#16a34a' : p.ml_status === 'paused' ? '#d97706' : '#b91c1c'
  return (
    <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#9aa0aa', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
        mercadolibre · previsualizacion
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #ececea', overflow: 'hidden', maxWidth: 220 }}>
        <div style={{ background: '#FFE600', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 900, fontSize: 11, color: '#2D3277' }}>MercadoLibre</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: statusColor, background: 'rgba(255,255,255,.7)', padding: '1px 6px', borderRadius: 4 }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 6, background: p.imagen_url ? undefined : '#f1f2f4', flexShrink: 0, overflow: 'hidden' }}>
            {p.imagen_url
              ? <img src={p.imagen_url} alt={p.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📷</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, color: '#374151', fontWeight: 600, margin: '0 0 2px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {[p.pieza, p.marca, p.modelo].filter(Boolean).join(' ')}
            </p>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#16181d', margin: '4px 0 2px' }}>{fmtPrice(p.precio)}</p>
            <p style={{ fontSize: 9, color: '#6b7280', margin: 0 }}>Usado · Envío disponible</p>
            {(p.ml_sold ?? 0) > 0 && <p style={{ fontSize: 9, color: '#16a34a', margin: '2px 0 0', fontWeight: 700 }}>{p.ml_sold} vendidos</p>}
          </div>
        </div>
        {p.ml_permalink && (
          <div style={{ borderTop: '1px solid #f1f2f4', padding: '7px 10px' }}>
            <a href={p.ml_permalink} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver publicación real <ExternalLink size={9} />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function GooglePreview({ p }: { p: Producto }) {
  const searchQ = encodeURIComponent([p.pieza, p.marca, p.modelo].filter(Boolean).join(' '))
  return (
    <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#9aa0aa', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
        google shopping · previsualizacion
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #ececea', overflow: 'hidden', maxWidth: 160 }}>
        <div style={{ height: 100, background: p.imagen_url ? undefined : '#f8f9fa', overflow: 'hidden' }}>
          {p.imagen_url
            ? <img src={p.imagen_url} alt={p.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📷</div>
          }
        </div>
        <div style={{ padding: '8px 8px 10px' }}>
          <p style={{ fontSize: 10, color: '#202124', fontWeight: 500, margin: '0 0 3px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {[p.pieza, p.marca].filter(Boolean).join(' ')}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#202124', margin: '4px 0 2px' }}>{fmtPrice(p.precio)}</p>
          <p style={{ fontSize: 9, color: '#70757a', margin: 0 }}>componenta.vercel.app</p>
        </div>
      </div>
      <a href={`https://www.google.com/search?tbm=shop&q=${searchQ}`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10, color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
        Buscar en Google Shopping <ExternalLink size={9} />
      </a>
    </div>
  )
}

function FacebookPreview({ p }: { p: Producto }) {
  return (
    <div style={{ background: '#f7f7f5', borderRadius: 12, padding: 10, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#9aa0aa', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
        facebook shopping · previsualizacion
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #ececea', overflow: 'hidden', maxWidth: 180 }}>
        <div style={{ background: '#1877F2', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontWeight: 900, fontSize: 12, color: '#fff' }}>f</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>Facebook Shopping</span>
        </div>
        <div style={{ height: 90, background: p.imagen_url ? undefined : '#f0f2f5', overflow: 'hidden' }}>
          {p.imagen_url
            ? <img src={p.imagen_url} alt={p.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📷</div>
          }
        </div>
        <div style={{ padding: '8px 8px 10px' }}>
          <p style={{ fontSize: 10, color: '#050505', fontWeight: 600, margin: '0 0 3px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {[p.pieza, p.marca].filter(Boolean).join(' — ')}
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#050505', margin: '4px 0 6px' }}>{fmtPrice(p.precio)}</p>
          <div style={{ background: '#1877F2', borderRadius: 4, padding: '4px 0', textAlign: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>Ver producto</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta de canal ──────────────────────────────────────────────────────────

function ChannelCard({
  logo, name, children, variant, badge,
}: {
  logo: React.ReactNode; name: string; children: React.ReactNode
  variant: BadgeVariant; badge?: React.ReactNode
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ececea', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f2f4' }}>
        {logo}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#16181d', margin: 0 }}>{name}</p>
        </div>
        <StatusBadge variant={variant} />
        {badge}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandComp, setExpandComp] = useState(false)
  const [expandML,   setExpandML]   = useState(false)
  const [expandFB,   setExpandFB]   = useState(false)
  const [expandGSC,  setExpandGSC]  = useState(false)

  const load = () => {
    setRefreshing(true)
    fetch('/api/marketing/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load() }, [])

  const ch = stats?.channels

  return (
    <SellerLayout section="marketing">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#16181d', margin: 0 }}>Marketing</h1>
            <p style={{ fontSize: 13, color: '#9aa0aa', margin: '3px 0 0' }}>Cómo se ven tus piezas en cada canal ahora mismo</p>
          </div>
          <button onPointerDown={load} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: '1.5px solid #ececea', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={13} color="#9aa0aa" style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#9aa0aa', gap: 10 }}>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Cargando métricas…
          </div>
        ) : !stats ? (
          <div style={{ padding: 24, color: '#b91c1c', background: '#fff5f5', borderRadius: 12 }}>Error cargando estadísticas</div>
        ) : (
          <>
            {/* ── Summary row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Eye size={14} color="#2f5fdb" />
                  <p style={{ fontSize: 11, color: '#9aa0aa', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '.5px' }}>Vistas totales</p>
                </div>
                <p style={{ fontSize: 26, fontWeight: 900, color: '#16181d', margin: 0 }}>{(stats.totalViews + ch!.mercadolibre.views).toLocaleString('es-CL')}</p>
                <p style={{ fontSize: 11, color: '#9aa0aa', margin: '3px 0 0' }}>todos los canales</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Package size={14} color="#2f5fdb" />
                  <p style={{ fontSize: 11, color: '#9aa0aa', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '.5px' }}>Publicaciones</p>
                </div>
                <p style={{ fontSize: 26, fontWeight: 900, color: '#16181d', margin: 0 }}>{stats.totalProducts}</p>
                <p style={{ fontSize: 11, color: '#9aa0aa', margin: '3px 0 0' }}>piezas activas</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Zap size={14} color="#2f5fdb" />
                  <p style={{ fontSize: 11, color: '#9aa0aa', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '.5px' }}>Canales activos</p>
                </div>
                <p style={{ fontSize: 26, fontWeight: 900, color: '#16181d', margin: 0 }}>{stats.activeChannels}</p>
                <p style={{ fontSize: 11, color: '#9aa0aa', margin: '3px 0 0' }}>Componenta · ML · GSC · FB</p>
              </div>
            </div>

            {/* ── Tabla visitas por canal ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', marginBottom: 20, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f2f4', display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={13} color="#2f5fdb" />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>Visitas y conversión por canal</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Canal', 'Vistas', 'Vendidos', 'Conversión'].map(h => (
                      <th key={h} style={{ padding: '8px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { canal: 'Componenta', color: '#2f5fdb', views: ch!.componenta.views, sold: '—', conv: '—', dot: 'active' as BadgeVariant },
                    { canal: 'MercadoLibre', color: '#FFE600', bg: '#2D3277', views: ch!.mercadolibre.views, sold: ch!.mercadolibre.sold, conv: `${ch!.mercadolibre.conversion}%`, dot: ch!.mercadolibre.active ? 'active' as BadgeVariant : 'inactive' as BadgeVariant },
                    { canal: 'Google Shopping', color: '#4285F4', views: '—', sold: '—', conv: '—', dot: ch!.google.active ? 'feed' as BadgeVariant : 'inactive' as BadgeVariant },
                    { canal: 'Facebook Marketplace', color: '#1877F2', views: '—', sold: '—', conv: '—', dot: ch!.facebook.active ? 'active' as BadgeVariant : 'inactive' as BadgeVariant },
                  ].map((row, i) => (
                    <tr key={row.canal} style={{ borderTop: i > 0 ? '1px solid #f1f2f4' : undefined }}>
                      <td style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.dot === 'active' ? '#22c55e' : row.dot === 'feed' ? '#f59e0b' : '#d1d5db', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: '#16181d' }}>{row.canal}</span>
                      </td>
                      <td style={{ padding: '10px 18px', color: '#374151', fontWeight: 600 }}>{typeof row.views === 'number' ? row.views.toLocaleString('es-CL') : row.views}</td>
                      <td style={{ padding: '10px 18px', color: '#374151', fontWeight: 600 }}>{row.sold}</td>
                      <td style={{ padding: '10px 18px' }}>
                        <span style={{ fontWeight: 700, color: typeof row.conv === 'string' && row.conv !== '—' && parseFloat(row.conv) > 0 ? '#16a34a' : '#9aa0aa' }}>{row.conv}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: '#d1d5db', padding: '8px 18px', margin: 0 }}>Google Shopping: métricas en Merchant Center · Facebook Marketplace: vistas y mensajes en la app de Facebook</p>
            </div>

            {/* ── Componenta ── */}
            <ChannelCard variant={ch!.componenta.active ? 'active' : 'inactive'}
              logo={<div style={{ width: 38, height: 38, borderRadius: 10, background: '#2f5fdb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontWeight: 900, fontSize: 14, color: '#fff' }}>C</span></div>}
              name="Componenta">
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <MetricBox label="Vistas" value={ch!.componenta.views.toLocaleString('es-CL')} sub="totales" />
                <MetricBox label="Piezas" value={ch!.componenta.count} sub="publicadas" />
              </div>
              {ch!.componenta.count === 0 ? (
                <p style={{ fontSize: 12, color: '#9aa0aa' }}>Aún no tienes piezas publicadas. <a href="/publicar" style={{ color: '#2f5fdb', fontWeight: 700 }}>Publicar ahora →</a></p>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                    {(expandComp ? ch!.componenta.items : ch!.componenta.items.slice(0, 4)).map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f1f2f4' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 5, background: item.imagen_url ? undefined : '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                          {item.imagen_url && <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.pieza}{item.marca ? ` · ${item.marca}` : ''}
                          </p>
                          <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0 }}>{fmtPrice(item.precio)} · <Eye size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.vistas ?? 0} vistas</p>
                        </div>
                        <a href={`/p/${item.id}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 10, color: '#2f5fdb', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                          Ver <ExternalLink size={9} />
                        </a>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {ch!.componenta.items.length > 4 && (
                      <button onClick={() => setExpandComp(v => !v)}
                        style={{ fontSize: 11, fontWeight: 700, color: '#2f5fdb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        {expandComp ? 'Ver menos ↑' : `Ver todas (${ch!.componenta.count}) ↓`}
                      </button>
                    )}
                    <a href="/" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#2f5fdb', textDecoration: 'none', marginLeft: 'auto' }}>
                      Ver marketplace <ExternalLink size={10} />
                    </a>
                  </div>
                </>
              )}
            </ChannelCard>

            {/* ── MercadoLibre ── */}
            <ChannelCard variant={ch!.mercadolibre.active ? 'active' : 'inactive'}
              logo={<div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFE600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontWeight: 900, fontSize: 10, color: '#2D3277' }}>ML</span></div>}
              name="MercadoLibre">
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <MetricBox label="Vistas ML" value={ch!.mercadolibre.views.toLocaleString('es-CL')} sub="en MercadoLibre" />
                    <MetricBox label="Vendidos" value={ch!.mercadolibre.sold} sub="unidades" />
                    <MetricBox label="Conversión" value={`${ch!.mercadolibre.conversion}%`} sub="visitas → venta" />
                  </div>

                  {/* Lista de items con link real */}
                  {ch!.mercadolibre.items.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 8px' }}>Tus publicaciones en ML</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(expandML ? ch!.mercadolibre.items : ch!.mercadolibre.items.slice(0, 4)).map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f1f2f4' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 5, background: item.imagen_url ? undefined : '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                              {item.imagen_url && <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.pieza}{item.marca ? ` · ${item.marca}` : ''}
                              </p>
                              <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0 }}>{fmtPrice(item.precio)}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {item.ml_status === 'active'
                                ? <CheckCircle size={12} color="#16a34a" />
                                : item.ml_status === 'paused'
                                  ? <Clock size={12} color="#d97706" />
                                  : <XCircle size={12} color="#b91c1c" />
                              }
                              {item.ml_permalink && (
                                <a href={item.ml_permalink} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 10, color: '#2f5fdb', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  Ver <ExternalLink size={9} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {ch!.mercadolibre.items.length > 4 && (
                        <button onClick={() => setExpandML(v => !v)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0', display: 'block' }}>
                          {expandML ? 'Ver menos ↑' : `Ver todas (${ch!.mercadolibre.count}) ↓`}
                        </button>
                      )}
                    </div>
                  )}

                  {ch!.mercadolibre.count === 0 && (
                    <p style={{ fontSize: 12, color: '#9aa0aa' }}>Publica piezas en ML desde el <a href="/inventario" style={{ color: '#2f5fdb', fontWeight: 700 }}>inventario</a>.</p>
                  )}
                </div>
                {ch!.mercadolibre.latestProduct && (
                  <MeLiPreview p={ch!.mercadolibre.latestProduct} />
                )}
              </div>
            </ChannelCard>

            {/* ── Google Shopping ── */}
            <ChannelCard variant={ch!.google.active ? 'feed' : 'inactive'}
              logo={<div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontWeight: 900, fontSize: 14 }}>G</span></div>}
              name="Google Shopping"
              badge={<StatusBadge variant="feed" label="Cuenta central" />}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <MetricBox label="En feed" value={ch!.google.count} sub="enviados" />
                    <MetricBox label="Vistas" value="—" sub="ver en GMC" />
                  </div>
                  {ch!.google.items.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {(expandGSC ? ch!.google.items : ch!.google.items.slice(0, 4)).map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f1f2f4' }}>
                            <div style={{ width: 26, height: 26, borderRadius: 5, overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                              {item.imagen_url && <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.pieza}{item.marca ? ` · ${item.marca}` : ''}
                              </p>
                              <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0 }}>{fmtPrice(item.precio)}</p>
                            </div>
                            <CheckCircle size={11} color="#16a34a" style={{ flexShrink: 0 }} />
                          </div>
                        ))}
                      </div>
                      {ch!.google.items.length > 4 && (
                        <button onClick={() => setExpandGSC(v => !v)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#4285F4', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0', display: 'block' }}>
                          {expandGSC ? 'Ver menos ↑' : `Ver todas (${ch!.google.count}) ↓`}
                        </button>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '10px 12px', borderRadius: 9, background: '#f0f4ff', border: '1px solid #c7d7fd', marginBottom: 10 }}>
                    <p style={{ fontSize: 11, color: '#1e3a8a', margin: '0 0 3px', fontWeight: 700 }}>Cuenta central de Componenta — no requiere conexión individual</p>
                    <p style={{ fontSize: 11, color: '#3b82f6', margin: 0, lineHeight: 1.5 }}>
                      Tus piezas se publican automáticamente en Google Shopping bajo la cuenta de la plataforma. Verifica el estado en Merchant Center.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="https://merchants.google.com" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#4285F4', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                      Ver en Merchant Center <ExternalLink size={10} />
                    </a>
                    {ch!.google.latestProduct && (
                      <a href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent([ch!.google.latestProduct.pieza, ch!.google.latestProduct.marca].filter(Boolean).join(' '))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                        Buscar en Google Shopping <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
                {ch!.google.latestProduct && (
                  <GooglePreview p={ch!.google.latestProduct} />
                )}
              </div>
            </ChannelCard>

            {/* ── Facebook Marketplace ── */}
            <ChannelCard variant={ch!.facebook.active ? 'active' : 'inactive'}
              logo={<div style={{ width: 38, height: 38, borderRadius: 10, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontWeight: 900, fontSize: 16, color: '#fff' }}>f</span></div>}
              name="Facebook Marketplace">
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <MetricBox label="Publicadas" value={ch!.facebook.count} sub="por el agente" />
                    <MetricBox label="Vistas" value="—" sub="ver en app FB" />
                    <MetricBox label="Mensajes" value="—" sub="ver en app FB" />
                  </div>

                  {ch!.facebook.items.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 8px' }}>Tus publicaciones en Marketplace</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(expandFB ? ch!.facebook.items : ch!.facebook.items.slice(0, 4)).map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f1f2f4' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 5, background: item.imagen_url ? undefined : '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                              {item.imagen_url && <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.pieza}{item.marca ? ` · ${item.marca}` : ''}
                              </p>
                              <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0 }}>{fmtPrice(item.precio)}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <CheckCircle size={12} color="#16a34a" />
                              {item.fb_permalink && (
                                <a href={item.fb_permalink} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 10, color: '#1877F2', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  Ver <ExternalLink size={9} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {ch!.facebook.items.length > 4 && (
                        <button onClick={() => setExpandFB(v => !v)}
                          style={{ fontSize: 11, fontWeight: 700, color: '#1877F2', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 0', display: 'block' }}>
                          {expandFB ? 'Ver menos ↑' : `Ver todas (${ch!.facebook.count}) ↓`}
                        </button>
                      )}
                    </div>
                  )}

                  {ch!.facebook.count === 0 && (
                    <p style={{ fontSize: 12, color: '#9aa0aa' }}>
                      Selecciona <strong>Facebook Marketplace</strong> al publicar una pieza y el agente la publicará automáticamente.{' '}
                      <a href="/publicar" style={{ color: '#1877F2', fontWeight: 700 }}>Publicar ahora →</a>
                    </p>
                  )}

                  <div style={{ padding: '9px 11px', borderRadius: 9, background: '#f0f4ff', border: '1px solid #c7d7fd', marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                      Las vistas y mensajes recibidos se ven directamente en la app de Facebook — no hay API pública para esas métricas.
                    </p>
                  </div>
                </div>
                {ch!.facebook.latestProduct && (
                  <FacebookPreview p={ch!.facebook.latestProduct} />
                )}
              </div>
            </ChannelCard>

            {/* ── Nota sobre agentes ── */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f9fafb', border: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#2f5fdb" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Agente de métricas activo</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.55 }}>
                  El agente sincroniza automáticamente el estado y ventas de tus publicaciones en MercadoLibre cada vez que abres esta página.
                  Las métricas de Google Shopping y Facebook se actualizan vía sus APIs cuando publicas una pieza nueva.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </SellerLayout>
  )
}
