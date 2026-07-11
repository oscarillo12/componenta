'use client'

import Link from 'next/link'
import {
  TrendingUp, Package, Eye, Tag, ShoppingBag,
  ArrowRight, Zap, Plus, BarChart3, AlertCircle,
  MessageCircle, MapPin, Phone
} from 'lucide-react'

type TopPieza = {
  id: string; pieza: string; precio: number; vistas: number
  disponible: boolean; imagen_url: string | null; estado: string
}

type RendimientoPieza = {
  id: string; pieza: string; vistas: number; consultas: number
  disponible: boolean; precio: number
}

interface Props {
  totalPublicadas:  number
  totalDisponibles: number
  totalVendidas:    number
  totalVistas:      number
  ingresosMes:      number
  topPiezas:        TopPieza[]
  recentItems:      TopPieza[]
  isDemo:           boolean
  plan:             string
  hasPhone:         boolean
  rendimiento:      RendimientoPieza[]
  topRegiones:      { region: string; count: number }[]
  dailyViews:       { day: string; count: number }[]
}

function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; trend?: string
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>{sub}</p>}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={11} color="#1d4ed8" />
          <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>{trend}</span>
        </div>
      )}
    </div>
  )
}

const ESTADO_DOT: Record<string, string> = {
  excelente: '#15803d', bueno: '#1d4ed8', 'con-detalles': '#b45309', 'para-reparar': '#b91c1c',
}

export default function DashboardClient({
  totalPublicadas, totalDisponibles, totalVendidas,
  totalVistas, ingresosMes, topPiezas, recentItems, isDemo, plan, hasPhone,
  rendimiento, topRegiones, dailyViews,
}: Props) {
  const isPro = plan === 'pro'
  const tasaVenta = totalPublicadas > 0 ? Math.round((totalVendidas / totalPublicadas) * 100) : 0
  const maxVistas = Math.max(...rendimiento.map(r => r.vistas), 1)
  const maxRegion = Math.max(...topRegiones.map(r => r.count), 1)
  const maxDay    = Math.max(...dailyViews.map(d => d.count), 1)

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: '#1d4ed8', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
          <Plus size={15} /> Nueva pieza
        </Link>
      </div>

      {!hasPhone && (
        <div style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '1.5px solid #fdba74', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(234,88,12,0.1)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={16} color="#ea580c" />
          </div>
          <p style={{ fontSize: 13, color: '#9a3412', margin: 0, fontWeight: 500, flex: 1 }}>
            <strong>Falta tu número de WhatsApp.</strong> Sin él, los compradores no pueden contactarte y el bot no funciona.
          </p>
          <Link href="/mi-tienda" style={{ fontSize: 13, color: '#fff', background: '#ea580c', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 10, boxShadow: '0 2px 6px rgba(234,88,12,0.35)' }}>
            Agregar →
          </Link>
        </div>
      )}

      {isDemo && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color="#d97706" />
          <p style={{ fontSize: 13, color: '#92400e', margin: 0, fontWeight: 500 }}>
            Aún no tienes piezas publicadas. <Link href="/" style={{ color: '#d97706', fontWeight: 700 }}>Publica tu primera pieza →</Link>
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Piezas en venta"   value={String(totalDisponibles)}  sub={`${totalPublicadas} publicadas en total`}    icon={Package}    color="#1d4ed8" />
        <StatCard label="Total vendidas"     value={String(totalVendidas)}     sub={`${tasaVenta}% tasa de venta`}               icon={ShoppingBag} color="#7c3aed" trend={totalVendidas > 0 ? 'Histórico' : undefined} />
        <StatCard label="Vistas totales"     value={totalVistas.toLocaleString('es-CL')} sub="Acumulado todo el tiempo"          icon={Eye}         color="#0891b2" />
        <StatCard label="Ingresos estimados" value={ingresosMes > 0 ? `$${Math.round(ingresosMes / 1000)}K` : '$0'} sub="De piezas vendidas (CLP)" icon={TrendingUp} color="#15803d" />
      </div>

      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Rendimiento por pieza */}
          {rendimiento.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={15} color="#9ca3af" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Rendimiento por pieza</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>Pieza</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>Vistas</th>
                      <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>Consultas</th>
                      <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimiento.map((r, i) => {
                      const conv = r.vistas > 0 ? Math.round((r.consultas / r.vistas) * 100) : 0
                      return (
                        <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '12px 20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{r.pieza}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 4, maxWidth: 120 }}>
                                  <div style={{ height: '100%', width: `${(r.vistas / maxVistas) * 100}%`, background: '#1d4ed8', borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: 10, color: r.disponible ? '#15803d' : '#9ca3af', fontWeight: 600 }}>
                                  {r.disponible ? 'En venta' : 'Vendida'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{r.vistas}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                              <MessageCircle size={11} color={r.consultas > 0 ? '#0891b2' : '#d1d5db'} />
                              <span style={{ fontWeight: 600, color: r.consultas > 0 ? '#0891b2' : '#9ca3af' }}>{r.consultas}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: conv >= 10 ? '#15803d' : conv > 0 ? '#b45309' : '#9ca3af', background: conv >= 10 ? '#eefbf2' : conv > 0 ? '#fffbeb' : '#f9fafb', padding: '2px 8px', borderRadius: 20 }}>
                              {conv}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventario reciente */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={15} color="#9ca3af" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Últimas publicaciones</span>
              </div>
              <Link href="/inventario" style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver todo <ArrowRight size={11} />
              </Link>
            </div>
            {recentItems.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Package size={32} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Sin piezas aún</p>
              </div>
            ) : (
              <div>
                {recentItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < recentItems.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imagen_url ? <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#9ca3af" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: ESTADO_DOT[item.estado] ?? '#9ca3af', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.disponible ? 'En venta' : 'Vendida'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>${item.precio.toLocaleString('es-CL')}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        <Eye size={10} color="#d1d5db" />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.vistas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Vistas por región */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin size={14} color="#0891b2" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Visitas por región</span>
              <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto' }}>30 días</span>
            </div>
            {topRegiones.length === 0 ? (
              <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  Los datos de región aparecerán aquí cuando los compradores visiten tus piezas.
                </p>
              </div>
            ) : (
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topRegiones.map(r => (
                  <div key={r.region}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{r.region}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0891b2' }}>{r.count}</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${(r.count / maxRegion) * 100}%`, background: 'linear-gradient(90deg,#0891b2,#38bdf8)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vistas últimos 7 días */}
          {dailyViews.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Eye size={14} color="#7c3aed" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Vistas esta semana</span>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
                  {dailyViews.map(d => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', background: '#ede9fe', borderRadius: '4px 4px 0 0', height: `${Math.max(8, (d.count / maxDay) * 52)}px`, position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#7c3aed', fontWeight: 700, whiteSpace: 'nowrap' }}>{d.count}</div>
                      </div>
                      <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center' }}>{d.day.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top por vistas */}
          {topPiezas.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Eye size={14} color="#7c3aed" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Más vistas</span>
              </div>
              {topPiezas.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: i < topPiezas.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d1d5db', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 12, color: '#374151', flex: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <Eye size={10} color="#7c3aed" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{item.vistas}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plan actual */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>Plan actual</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: isPro ? '#1d4ed8' : '#111827', margin: '0 0 4px' }}>
              {isPro ? '⚡ Plan Pro' : 'Plan Gratuito'}
            </p>
            {!isPro && (
              <>
                <div style={{ margin: '10px 0', background: '#f3f4f6', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (totalPublicadas / 5) * 100)}%`, background: totalPublicadas >= 5 ? '#b91c1c' : '#1d4ed8', borderRadius: 8, transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 14px' }}>{totalPublicadas}/5 piezas usadas</p>
                <Link href="/planes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 9, borderRadius: 10, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                  <Zap size={12} /> Subir a Plan Pro
                </Link>
              </>
            )}
            {isPro && <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Piezas ilimitadas · WhatsApp IA</p>}
          </div>
        </div>
      </div>
    </>
  )
}
