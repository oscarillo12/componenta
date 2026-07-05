'use client'

import Link from 'next/link'
import {
  TrendingUp, Package, Eye, Tag, ShoppingBag,
  ArrowRight, Zap, Plus, BarChart3, AlertCircle
} from 'lucide-react'

type TopPieza = {
  id: string
  pieza: string
  precio: number
  vistas: number
  disponible: boolean
  imagen_url: string | null
  estado: string
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
}

function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color: string; trend?: string
}) {
  return (
    <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: '#E6EDF3', margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#B1BAC4', margin: '0 0 8px' }}>{sub}</p>}
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={11} color="#79C0FF" />
          <span style={{ fontSize: 11, color: '#79C0FF', fontWeight: 600 }}>{trend}</span>
        </div>
      )}
    </div>
  )
}

const ESTADO_DOT: Record<string, string> = {
  excelente:      '#1A56DB',
  bueno:          '#1F6FEB',
  'con-detalles': '#d97706',
  'para-reparar': '#dc2626',
}

export default function DashboardClient({
  totalPublicadas, totalDisponibles, totalVendidas,
  totalVistas, ingresosMes, topPiezas, recentItems, isDemo,
}: Props) {
  const tasaVenta = totalPublicadas > 0 ? Math.round((totalVendidas / totalPublicadas) * 100) : 0

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#E6EDF3', margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0 }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: '#388BFD', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
          <Plus size={15} /> Nueva pieza
        </Link>
      </div>

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
        <StatCard label="Piezas en venta" value={String(totalDisponibles)} sub={`${totalPublicadas} publicadas en total`} icon={Package} color="#1F6FEB" />
        <StatCard label="Total vendidas" value={String(totalVendidas)} sub={`${tasaVenta}% tasa de venta`} icon={ShoppingBag} color="#79C0FF" trend={totalVendidas > 0 ? 'Histórico' : undefined} />
        <StatCard label="Vistas totales" value={totalVistas.toLocaleString('es-CL')} sub="Acumulado todo el tiempo" icon={Eye} color="#7c3aed" />
        <StatCard
          label="Ingresos estimados"
          value={ingresosMes > 0 ? `$${Math.round(ingresosMes / 1000)}K` : '$0'}
          sub="De piezas vendidas (CLP)"
          icon={TrendingUp}
          color="#79C0FF"
        />
      </div>

      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Columna principal: piezas recientes */}
        <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={15} color="#8B949E" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3' }}>Inventario reciente</span>
            </div>
            <Link href="/inventario" style={{ fontSize: 12, color: '#79C0FF', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver todo <ArrowRight size={11} />
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Package size={32} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0 }}>Sin piezas aún</p>
            </div>
          ) : (
            <div>
              {recentItems.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < recentItems.length - 1 ? '1px solid #f9fafb' : 'none',
                }}>
                  {/* Miniatura */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#21262D', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imagen_url
                      ? <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={18} color="#3b5280" />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: ESTADO_DOT[item.estado] ?? '#9ca3af', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: '#B1BAC4' }}>
                        {item.disponible ? 'En venta' : 'Vendida'}
                      </span>
                    </div>
                  </div>

                  {/* Precio + vistas */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 2px' }}>
                      ${item.precio.toLocaleString('es-CL')}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                      <Eye size={10} color="#6E7681" />
                      <span style={{ fontSize: 11, color: '#B1BAC4' }}>{item.vistas}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Top piezas por vistas */}
          {topPiezas.length > 0 && (
            <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Eye size={14} color="#7c3aed" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3' }}>Más vistas</span>
                </div>
              </div>
              {topPiezas.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: i < topPiezas.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b5280', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 12, color: '#E6EDF3', flex: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <Eye size={10} color="#7c3aed" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{item.vistas}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA WhatsApp Agente */}
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 20, padding: '20px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(22,163,74,0.15)', filter: 'blur(30px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={14} color="#79C0FF" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#79C0FF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Próximamente</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.4 }}>Agente WhatsApp IA</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.5 }}>
                Vende presencialmente y dile al agente por WhatsApp qué pieza vendiste. Se actualiza solo.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Ejemplo de uso:</p>
                <p style={{ fontSize: 12, color: '#79C0FF', margin: 0, fontStyle: 'italic' }}>"Vendí el amortiguador del Corolla"</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>→ Pieza marcada como vendida automáticamente</p>
              </div>
              <Link href="/planes" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.4)', color: '#79C0FF', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                <Tag size={12} /> Disponible en Plan Pro
              </Link>
            </div>
          </div>

          {/* Plan actual */}
          <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>Plan actual</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#E6EDF3', margin: '0 0 4px' }}>Plan Gratuito</p>
            <div style={{ margin: '10px 0', background: '#21262D', borderRadius: 8, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (totalPublicadas / 5) * 100)}%`, background: totalPublicadas >= 5 ? '#dc2626' : '#1A56DB', borderRadius: 8, transition: 'width 0.5s' }} />
            </div>
            <p style={{ fontSize: 12, color: '#B1BAC4', margin: '0 0 14px' }}>
              {totalPublicadas}/5 piezas usadas
            </p>
            <Link href="/planes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 10, background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
              <Zap size={12} /> Subir a Plan Pro
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
