'use client'

import Link from 'next/link'
import {
  TrendingUp, Package, Eye, ShoppingBag,
  ArrowRight, Zap, Plus, BarChart3, AlertCircle,
  MessageCircle, MapPin, Phone, Bot, Store
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
  consultasChat:    number
  mlConnected:      boolean
}

// KPI card — borde izquierdo de color, número hero, sin icon-box
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${color}`,
      padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={12} color={color} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.9 }}>{label}</span>
      </div>
      <p style={{ fontSize: 34, fontWeight: 900, color: '#111827', margin: '0 0 4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{sub}</p>}
    </div>
  )
}

const ESTADO_DOT: Record<string, string> = {
  excelente: '#15803d', bueno: '#1d4ed8', 'con-detalles': '#b45309', 'para-reparar': '#b91c1c',
}

export default function DashboardClient({
  totalPublicadas, totalDisponibles, totalVendidas,
  totalVistas, ingresosMes, topPiezas, recentItems, isDemo, plan, hasPhone,
  rendimiento, topRegiones, dailyViews, consultasChat, mlConnected,
}: Props) {
  const isPro = plan === 'pro'
  const tasaVenta = totalPublicadas > 0 ? Math.round((totalVendidas / totalPublicadas) * 100) : 0
  const maxVistas = Math.max(...rendimiento.map(r => r.vistas), 1)
  const maxRegion = Math.max(...topRegiones.map(r => r.count), 1)
  const maxDay    = Math.max(...dailyViews.map(d => d.count), 1)
  const totalWeekViews = dailyViews.reduce((s, d) => s + d.count, 0)

  return (
    <>
      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.6); }
        }
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 3px' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, background: '#1d4ed8', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={14} /> Nueva pieza
        </Link>
      </div>

      {/* ── Alertas ── */}
      {!hasPhone && (
        <div style={{ background: '#fff7ed', border: '1.5px solid #fdba74', borderRadius: 14, padding: '13px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Phone size={15} color="#ea580c" />
          </div>
          <p style={{ fontSize: 13, color: '#9a3412', margin: 0, fontWeight: 500, flex: 1 }}>
            <strong>Falta tu número de WhatsApp.</strong> Sin él los compradores no pueden contactarte.
          </p>
          <Link href="/mi-tienda" style={{ fontSize: 13, color: '#fff', background: '#ea580c', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 9 }}>
            Agregar →
          </Link>
        </div>
      )}

      {isDemo && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '13px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={15} color="#d97706" />
          <p style={{ fontSize: 13, color: '#92400e', margin: 0, fontWeight: 500 }}>
            Aún no tienes piezas publicadas. <Link href="/" style={{ color: '#d97706', fontWeight: 700 }}>Publica tu primera pieza →</Link>
          </p>
        </div>
      )}

      {/* ── KPIs — panel de instrumentos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 10, marginBottom: 22 }}>
        <StatCard label="En venta"       value={String(totalDisponibles)}                                          sub={`${totalPublicadas} publicadas en total`}  icon={Package}    color="#1d4ed8" />
        <StatCard label="Vendidas"        value={String(totalVendidas)}                                             sub={`${tasaVenta}% tasa de venta`}             icon={ShoppingBag} color="#7c3aed" />
        <StatCard label="Vistas totales"  value={totalVistas.toLocaleString('es-CL')}                              sub="Acumulado todo el tiempo"                  icon={Eye}         color="#0891b2" />
        <StatCard label="Ingresos"        value={ingresosMes > 0 ? `$${Math.round(ingresosMes/1000)}K` : '$0'}    sub="De piezas vendidas (CLP)"                  icon={TrendingUp}  color="#15803d" />
      </div>

      {/* ── Grid principal ── */}
      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, alignItems: 'start' }}>

        {/* ═══ Columna principal ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Rendimiento por pieza */}
          {rendimiento.length > 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={14} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Rendimiento por pieza</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '9px 20px', textAlign: 'left',  fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pieza</th>
                      <th style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vistas</th>
                      <th style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Consultas</th>
                      <th style={{ padding: '9px 20px', textAlign: 'right', fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimiento.map((r, i) => {
                      const conv = r.vistas > 0 ? Math.round((r.consultas / r.vistas) * 100) : 0
                      return (
                        <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f9fafb' : 'none' }}>
                          <td style={{ padding: '11px 20px' }}>
                            <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{r.pieza}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 4, maxWidth: 140, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(r.vistas / maxVistas) * 100}%`, background: 'linear-gradient(90deg,#1d4ed8,#60a5fa)', borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 10, color: r.disponible ? '#15803d' : '#9ca3af', fontWeight: 700 }}>
                                {r.disponible ? 'En venta' : 'Vendida'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{r.vistas}</td>
                          <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                              <MessageCircle size={11} color={r.consultas > 0 ? '#0891b2' : '#d1d5db'} />
                              <span style={{ fontWeight: 700, color: r.consultas > 0 ? '#0891b2' : '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>{r.consultas}</span>
                            </div>
                          </td>
                          <td style={{ padding: '11px 20px', textAlign: 'right' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: conv >= 10 ? '#15803d' : conv > 0 ? '#b45309' : '#9ca3af', background: conv >= 10 ? '#eefbf2' : conv > 0 ? '#fffbeb' : '#f9fafb', padding: '2px 9px', borderRadius: 20 }}>
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
          ) : (
            /* Empty state rendimiento */
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>Para ver tus métricas:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { done: false, text: 'Publica al menos una pieza' },
                  { done: hasPhone, text: 'Agrega tu número de WhatsApp en Mi Tienda' },
                  { done: false, text: 'Espera que compradores visiten tus piezas' },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: step.done ? '#eefbf2' : '#f3f4f6', border: `2px solid ${step.done ? '#15803d' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.done && <span style={{ fontSize: 11, color: '#15803d', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: step.done ? '#15803d' : '#6b7280' }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas publicaciones */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Package size={14} color="#6b7280" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Últimas publicaciones</span>
              </div>
              <Link href="/inventario" style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                Ver todo <ArrowRight size={11} />
              </Link>
            </div>
            {recentItems.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                <Package size={28} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 14px' }}>Aún no tienes piezas publicadas</p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#1d4ed8', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  <Plus size={13} /> Publicar primera pieza
                </Link>
              </div>
            ) : (
              <div>
                {recentItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 20px', borderBottom: i < recentItems.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imagen_url ? <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#9ca3af" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: ESTADO_DOT[item.estado] ?? '#9ca3af', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.disponible ? 'En venta' : 'Vendida'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>${item.precio.toLocaleString('es-CL')}</p>
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

        {/* ═══ Sidebar ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── WhatsApp Bot — HERO, arriba del todo ── */}
          <div style={{ background: 'linear-gradient(155deg,#dcfce7 0%,#ecfdf5 60%,#f0fdf9 100%)', borderRadius: 16, border: '1.5px solid #86efac', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,211,102,0.4)', flexShrink: 0 }}>
                  <Bot size={17} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#14532d', margin: 0 }}>Bot de WhatsApp</p>
                  <p style={{ fontSize: 10, color: '#16a34a', margin: 0 }}>Atiende compradores 24/7</p>
                </div>
              </div>
              {/* Punto pulsante — el riesgo estético */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#16a34a', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#86efac', display: 'inline-block', animation: 'pulse-live 1.8s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>EN VIVO</span>
              </div>
            </div>
            {/* Número del bot */}
            <div style={{ padding: '0 16px 12px' }}>
              <a
                href="https://wa.me/14155238886"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#25d366', color: '#fff', padding: '10px 14px', borderRadius: 11, fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}
              >
                <Bot size={14} /> +1 415 523 8886
              </a>
            </div>
            {/* Comandos */}
            <div style={{ margin: '0 16px 14px', background: 'rgba(255,255,255,0.65)', borderRadius: 10, padding: '10px 12px', border: '1px solid #bbf7d0', backdropFilter: 'blur(4px)' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 6px' }}>Comandos como vendedor</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  ['"vendí el alternador"', 'saca del catálogo'],
                  ['"vendí la 2"',          'saca por número'],
                  ['cualquier mensaje',      'ver tu inventario'],
                ].map(([cmd, desc]) => (
                  <div key={cmd} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#14532d', fontFamily: 'monospace', flexShrink: 0 }}>{cmd}</span>
                    <span style={{ fontSize: 10, color: '#4b5563' }}>— {desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA si falta número */}
            {!hasPhone && (
              <div style={{ margin: '0 16px 14px' }}>
                <Link href="/mi-tienda" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#b45309', fontWeight: 700, textDecoration: 'none', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 9, padding: '8px 12px' }}>
                  <Phone size={12} /> Agrega tu número para activar comandos →
                </Link>
              </div>
            )}
          </div>

          {/* ── Vistas esta semana ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={13} color="#7c3aed" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Vistas esta semana</span>
              </div>
              {totalWeekViews > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 20 }}>
                  {totalWeekViews.toLocaleString('es-CL')} total
                </span>
              )}
            </div>
            {dailyViews.length === 0 ? (
              <div style={{ padding: '18px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                  Los datos aparecerán cuando publiques piezas.
                </p>
              </div>
            ) : (
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
                  {dailyViews.map(d => {
                    const pct = Math.max(12, (d.count / maxDay) * 74)
                    return (
                      <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed' }}>{d.count > 0 ? d.count : ''}</span>
                        <div style={{ width: '100%', borderRadius: '5px 5px 0 0', height: `${pct}px`, background: 'linear-gradient(180deg,#7c3aed 0%,#c4b5fd 100%)' }} />
                        <span style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{d.day.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Visitas por región ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="#0891b2" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Visitas por región</span>
              <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto' }}>30 días</span>
            </div>
            {topRegiones.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                  Aparecerá aquí cuando compradores visiten tus piezas.
                </p>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {topRegiones.map(r => (
                  <div key={r.region}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{r.region}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#0891b2', fontVariantNumeric: 'tabular-nums' }}>{r.count}</span>
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(r.count / maxRegion) * 100}%`, background: 'linear-gradient(90deg,#0891b2,#38bdf8)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Canales ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={13} color="#16a34a" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Consultas por canal</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: Store,     color: '#1d4ed8', bg: '#eff6ff', label: 'Chat Componenta', count: consultasChat,  badge: null,                    href: null },
                { icon: Bot,       color: '#fff',    bg: '#25d366', label: 'WhatsApp (bot)',  count: null,           badge: hasPhone ? 'Activo' : null, href: hasPhone ? null : '/mi-tienda', badgeColor: '#15803d', badgeBg: '#eefbf2' },
                { icon: ShoppingBag, color: '#b45309', bg: '#fffbeb', label: 'MercadoLibre', count: null,           badge: mlConnected ? 'Conectado' : null, href: mlConnected ? null : '/api/mercadolibre/connect', badgeColor: '#b45309', badgeBg: '#fffbeb' },
              ].map(ch => (
                <div key={ch.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ch.icon size={13} color={ch.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1 }}>{ch.label}</span>
                  {ch.count !== null && (
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{ch.count}</span>
                  )}
                  {ch.badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: (ch as { badgeColor?: string }).badgeColor ?? '#374151', background: (ch as { badgeBg?: string }).badgeBg ?? '#f3f4f6', border: `1px solid ${(ch as { badgeColor?: string }).badgeColor ?? '#e5e7eb'}30`, padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {ch.badge}
                    </span>
                  )}
                  {!ch.badge && ch.count === null && ch.href && (
                    <a href={ch.href} style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#374151', padding: '3px 9px', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' }}>Conectar →</a>
                  )}
                  {!ch.badge && ch.count === null && !ch.href && (
                    <Link href="/mi-tienda" style={{ fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fffbeb', border: '1px solid #fcd34d', padding: '2px 7px', borderRadius: 20, textDecoration: 'none', whiteSpace: 'nowrap' }}>Config. →</Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Top piezas por vistas ── */}
          {topPiezas.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '13px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={13} color="#7c3aed" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Más vistas</span>
              </div>
              {topPiezas.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderBottom: i < topPiezas.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#d1d5db', width: 14, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 12, color: '#374151', flex: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <Eye size={10} color="#7c3aed" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', fontVariantNumeric: 'tabular-nums' }}>{item.vistas}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Plan actual ── */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 8px' }}>Plan actual</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: isPro ? '#1d4ed8' : '#111827', margin: '0 0 4px' }}>
              {isPro ? '⚡ Plan Pro' : 'Plan Gratuito'}
            </p>
            {!isPro && (
              <>
                <div style={{ margin: '8px 0', background: '#f3f4f6', borderRadius: 6, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (totalPublicadas / 5) * 100)}%`, background: totalPublicadas >= 5 ? '#ef4444' : '#1d4ed8', borderRadius: 6, transition: 'width 0.5s' }} />
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>{totalPublicadas}/5 piezas usadas</p>
                <Link href="/planes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', borderRadius: 10, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                  <Zap size={11} /> Subir a Plan Pro
                </Link>
              </>
            )}
            {isPro && <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Piezas ilimitadas · Analytics completo</p>}
          </div>

        </div>
      </div>
    </>
  )
}
