'use client'

import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Package, Eye, ShoppingBag,
  ArrowRight, Zap, Plus, BarChart3, AlertCircle,
  MessageCircle, MapPin, Phone, Bot, Store, Target,
  Tag, Clock, Camera, AlertTriangle, Wallet, Activity,
  Star, Layers, ChevronRight,
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
  totalPublicadas:          number
  totalDisponibles:         number
  totalVendidas:            number
  totalVistas:              number
  ingresosMes:              number
  topPiezas:                TopPieza[]
  recentItems:              TopPieza[]
  isDemo:                   boolean
  plan:                     string
  hasPhone:                 boolean
  rendimiento:              RendimientoPieza[]
  topRegiones:              { region: string; count: number }[]
  dailyViews:               { day: string; count: number }[]
  consultasChat:            number
  mlConnected:              boolean
  ventasPorMarca:           { marca: string; count: number }[]
  ingresosPorMes:           { mes: string; total: number }[]
  ticketPromedio:           number
  consultaVentaRate:        number
  vistasEsteMes:            number
  vistasMesAnterior:        number
  vendidasEsteMes:          number
  vendidasMesAnterior:      number
  ingresosEsteMes:          number
  ingresosMesAnterior:      number
  valorInventario:          number
  precioPromedio:           number
  piezasSinFoto:            number
  piezasAging:              { id: string; pieza: string; dias: number; precio: number; vistas: number }[]
  piezasOportunidad:        { id: string; pieza: string; vistas: number; precio: number }[]
  topModelos:               { modelo: string; count: number }[]
  horasPico:                { hora: number; count: number }[]
  distribucionEstado:       { estado: string; count: number; raw: string }[]
  diasDesdeUltimaPublicacion: number | null
}

// ── Helpers ──
function Trend({ current, prev }: { current: number; prev: number }) {
  if (prev === 0 && current === 0) return null
  const diff = current - prev
  const pct  = prev > 0 ? Math.round((diff / prev) * 100) : (diff > 0 ? 100 : 0)
  const up   = diff >= 0
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:2, fontSize:10, fontWeight:700,
      color: up ? '#15803d' : '#b91c1c', background: up ? '#eefbf2' : '#fef2f2',
      padding:'2px 7px', borderRadius:20, whiteSpace:'nowrap' }}>
      {up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
      {up ? '+' : ''}{pct}% vs mes ant.
    </span>
  )
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label:string; value:string; sub?:string; icon:React.ElementType; color:string; trend?: React.ReactNode
}) {
  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb',
      borderLeft:`4px solid ${color}`, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
        <Icon size={11} color={color}/>
        <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.9 }}>{label}</span>
      </div>
      <p style={{ fontSize:30, fontWeight:900, color:'#111827', margin:'0 0 5px', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{value}</p>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        {sub && <span style={{ fontSize:11, color:'#9ca3af' }}>{sub}</span>}
        {trend}
      </div>
    </div>
  )
}

function MiniKpi({ label, value, sub, icon: Icon, color }: {
  label:string; value:string; sub?:string; icon:React.ElementType; color:string
}) {
  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', padding:'13px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
        <div style={{ width:26, height:26, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={12} color={color}/>
        </div>
        <span style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8 }}>{label}</span>
      </div>
      <p style={{ fontSize:22, fontWeight:900, color:'#111827', margin:'0 0 2px', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{value}</p>
      {sub && <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{sub}</p>}
    </div>
  )
}

const ESTADO_DOT: Record<string, string> = {
  excelente:'#15803d', bueno:'#1d4ed8', 'con-detalles':'#b45309', 'para-reparar':'#b91c1c',
}
const ESTADO_COLOR: Record<string, string> = {
  Excelente:'#15803d', Bueno:'#1d4ed8', 'Con detalles':'#b45309', 'Para reparar':'#b91c1c',
}
const MARCA_COLORS = ['#1d4ed8','#7c3aed','#0891b2','#9ca3af']

export default function DashboardClient({
  totalPublicadas, totalDisponibles, totalVendidas,
  totalVistas, ingresosMes, topPiezas, recentItems, isDemo, plan, hasPhone,
  rendimiento, topRegiones, dailyViews, consultasChat, mlConnected,
  ventasPorMarca, ingresosPorMes, ticketPromedio, consultaVentaRate,
  vistasEsteMes, vistasMesAnterior, vendidasEsteMes, vendidasMesAnterior,
  ingresosEsteMes, ingresosMesAnterior,
  valorInventario, precioPromedio, piezasSinFoto, piezasAging,
  piezasOportunidad, topModelos, horasPico, distribucionEstado,
  diasDesdeUltimaPublicacion,
}: Props) {
  const isPro       = plan === 'pro'
  const tasaConv    = totalVistas > 0 ? ((totalVendidas / totalVistas) * 100).toFixed(2) : '0.00'
  const maxVistas   = Math.max(...rendimiento.map(r => r.vistas), 1)
  const maxRegion   = Math.max(...topRegiones.map(r => r.count), 1)
  const maxDay      = Math.max(...dailyViews.map(d => d.count), 1)
  const maxMes      = Math.max(...ingresosPorMes.map(m => m.total), 1)
  const totalMarca  = ventasPorMarca.reduce((s, m) => s + m.count, 0) || 1
  const maxModelos  = Math.max(...topModelos.map(m => m.count), 1)
  const maxHora     = Math.max(...horasPico.map(h => h.count), 1)
  const totalEstado = distribucionEstado.reduce((s, e) => s + e.count, 0) || 1
  const totalWeekViews = dailyViews.reduce((s, d) => s + d.count, 0)

  const funnelMax    = Math.max(totalVistas, 1)
  const wConsultas   = Math.max(4, Math.round((consultasChat / funnelMax) * 100))
  const wVentas      = Math.max(2, Math.round((totalVendidas  / funnelMax) * 100))

  const alertas = [
    piezasSinFoto > 0 && {
      icon: Camera, color:'#b45309', bg:'#fffbeb', border:'#fde68a',
      title: `${piezasSinFoto} pieza${piezasSinFoto > 1 ? 's' : ''} sin foto`,
      text: 'Las piezas con foto reciben 3× más vistas. Agrégalas ahora.',
      href: '/',
    },
    piezasOportunidad.length > 0 && {
      icon: Eye, color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe',
      title: `${piezasOportunidad.length} pieza${piezasOportunidad.length > 1 ? 's' : ''} con vistas pero sin consultas`,
      text: 'Están viendo pero no preguntan — posible precio alto o descripción débil.',
      href: null,
    },
    piezasAging.length > 0 && {
      icon: Clock, color:'#b91c1c', bg:'#fef2f2', border:'#fecaca',
      title: `${piezasAging.length} pieza${piezasAging.length > 1 ? 's' : ''} llevan +30 días sin vender`,
      text: 'Considera bajar el precio un 10–15% o renovar las fotos.',
      href: null,
    },
  ].filter(Boolean) as { icon:React.ElementType; color:string; bg:string; border:string; title:string; text:string; href:string|null }[]

  return (
    <>
      <style>{`
        @keyframes pulse-live {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.6); }
        }
        @media (max-width:900px) {
          .dash-main   { grid-template-columns:1fr !important; }
          .dash-kpi1   { grid-template-columns:repeat(2,1fr) !important; }
          .dash-kpi2   { grid-template-columns:repeat(2,1fr) !important; }
          .dash-chart2 { grid-template-columns:1fr !important; }
        }
        @media (max-width:540px) {
          .dash-kpi1 { grid-template-columns:1fr !important; }
          .dash-kpi2 { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:'#111827', margin:'0 0 3px' }}>Dashboard</h1>
          <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>
            {new Date().toLocaleDateString('es-CL',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:11, background:'#1d4ed8', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:13, boxShadow:'0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={13}/> Nueva pieza
        </Link>
      </div>

      {/* ── Alertas sistema ── */}
      {!hasPhone && (
        <div style={{ background:'#fff7ed', border:'1.5px solid #fdba74', borderRadius:14, padding:'12px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:10 }}>
          <Phone size={14} color="#ea580c"/>
          <p style={{ fontSize:13, color:'#9a3412', margin:0, fontWeight:500, flex:1 }}>
            <strong>Falta tu número de WhatsApp.</strong> Sin él los compradores no pueden contactarte.
          </p>
          <Link href="/mi-tienda" style={{ fontSize:12, color:'#fff', background:'#ea580c', fontWeight:700, textDecoration:'none', padding:'6px 12px', borderRadius:9 }}>
            Agregar →
          </Link>
        </div>
      )}
      {isDemo && (
        <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={14} color="#d97706"/>
          <p style={{ fontSize:13, color:'#92400e', margin:0, fontWeight:500 }}>
            Aún no tienes piezas publicadas. <Link href="/" style={{ color:'#d97706', fontWeight:700 }}>Publica tu primera pieza →</Link>
          </p>
        </div>
      )}

      {/* ── KPI Row 1 ── */}
      <div className="dash-kpi1" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:10 }}>
        <KpiCard label="Piezas en venta" value={String(totalDisponibles)} sub={`${totalPublicadas} publicadas`} icon={Package} color="#1d4ed8"
          trend={<Trend current={totalDisponibles} prev={totalDisponibles}/>}/>
        <KpiCard label="Vendidas" value={String(totalVendidas)} sub="Histórico" icon={ShoppingBag} color="#7c3aed"
          trend={<Trend current={vendidasEsteMes} prev={vendidasMesAnterior}/>}/>
        <KpiCard label="Vistas totales" value={totalVistas.toLocaleString('es-CL')} sub="Acumulado" icon={Eye} color="#0891b2"
          trend={<Trend current={vistasEsteMes} prev={vistasMesAnterior}/>}/>
        <KpiCard label="Ingresos del mes" value={ingresosMes>0?`$${Math.round(ingresosMes/1000)}K`:'$0'} sub="CLP neto" icon={TrendingUp} color="#15803d"
          trend={<Trend current={ingresosEsteMes} prev={ingresosMesAnterior}/>}/>
      </div>

      {/* ── KPI Row 2 — métricas derivadas ── */}
      <div className="dash-kpi2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        <MiniKpi label="Tasa conversión"  value={`${tasaConv}%`}           sub="Vistas que compran"    icon={Target}       color="#1d4ed8"/>
        <MiniKpi label="Consulta → Venta" value={`${consultaVentaRate}%`}  sub="Eficiencia cierre"    icon={MessageCircle} color="#7c3aed"/>
        <MiniKpi label="Ticket promedio"
          value={ticketPromedio>0 ? `$${ticketPromedio.toLocaleString('es-CL')}` : '$0'}
          sub="Por venta (CLP)" icon={Tag} color="#0891b2"/>
        <MiniKpi label="Valor en vitrina"
          value={valorInventario>0 ? `$${Math.round(valorInventario/1000000)}M` : '$0'}
          sub={`Prom. $${precioPromedio.toLocaleString('es-CL')} c/u`} icon={Wallet} color="#15803d"/>
      </div>

      {/* ── Alertas de acción ── */}
      {alertas.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${alertas.length},1fr)`, gap:10, marginBottom:16 }}>
          {alertas.map((a, i) => (
            <div key={i} style={{ background:a.bg, border:`1.5px solid ${a.border}`, borderRadius:14, padding:'12px 15px', display:'flex', alignItems:'flex-start', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:`${a.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <a.icon size={14} color={a.color}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:800, color:a.color, margin:'0 0 2px' }}>{a.title}</p>
                <p style={{ fontSize:11, color:'#6b7280', margin:0, lineHeight:1.4 }}>{a.text}</p>
              </div>
              {a.href && (
                <Link href={a.href} style={{ fontSize:10, fontWeight:700, color:a.color, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0, alignSelf:'center' }}>
                  Ir →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Grid principal ── */}
      <div className="dash-main" style={{ display:'grid', gridTemplateColumns:'1fr 272px', gap:16, alignItems:'start' }}>

        {/* ═══ Columna principal ═══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Ingresos por mes */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'14px 20px 0', display:'flex', alignItems:'center', gap:8 }}>
              <TrendingUp size={13} color="#15803d"/>
              <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>Ingresos por mes</span>
              <span style={{ fontSize:10, color:'#9ca3af', marginLeft:'auto' }}>Últimos 6 meses</span>
            </div>
            <div style={{ padding:'10px 20px 16px' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:110 }}>
                {ingresosPorMes.map(m => {
                  const hasData = maxMes > 0
                  const pct = hasData ? Math.max(4, (m.total / maxMes) * 90) : 4
                  return (
                    <div key={m.mes} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                      <span style={{ fontSize:9, fontWeight:700, color:'#15803d', height:12 }}>
                        {m.total>0 ? `$${Math.round(m.total/1000)}K` : ''}
                      </span>
                      <div style={{ width:'100%', maxWidth:40, borderRadius:'5px 5px 0 0', height:`${pct}px`,
                        background: m.total>0 ? 'linear-gradient(180deg,#15803d 0%,#4ade80 100%)' : '#f3f4f6' }}/>
                      <span style={{ fontSize:9, color:'#9ca3af', textAlign:'center' }}>{m.mes}</span>
                    </div>
                  )
                })}
              </div>
              {maxMes===0 && <p style={{ fontSize:10, color:'#d1d5db', textAlign:'center', margin:'4px 0 0' }}>Las barras se llenarán cuando registres ingresos</p>}
            </div>
          </div>

          {/* 2-col: Ventas por marca + Funnel */}
          <div className="dash-chart2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

            {/* Ventas por marca */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'13px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:7 }}>
                <Tag size={13} color="#7c3aed"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Ventas por marca</span>
              </div>
              <div style={{ padding:'14px 18px' }}>
                {ventasPorMarca.length===0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                    {[60,38,20].map((pct,i)=>(
                      <div key={i}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:11, color:'#e5e7eb', fontWeight:600 }}>—</span>
                          <span style={{ fontSize:11, fontWeight:800, color:'#e5e7eb' }}>—%</span>
                        </div>
                        <div style={{ height:7, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:'#e5e7eb', borderRadius:4 }}/>
                        </div>
                      </div>
                    ))}
                    <p style={{ fontSize:10, color:'#d1d5db', margin:'2px 0 0', textAlign:'center' }}>Aparecerá cuando registres ventas</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {ventasPorMarca.map((m,i)=>{
                      const pct=Math.round((m.count/totalMarca)*100)
                      return (
                        <div key={m.marca}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                            <span style={{ fontSize:12, color:'#374151', fontWeight:600 }}>{m.marca}</span>
                            <span style={{ fontSize:12, fontWeight:800, color:MARCA_COLORS[i]??'#9ca3af', fontVariantNumeric:'tabular-nums' }}>{pct}%</span>
                          </div>
                          <div style={{ height:7, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${MARCA_COLORS[i]??'#9ca3af'},${MARCA_COLORS[i]??'#9ca3af'}88)`, borderRadius:4 }}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Funnel */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'13px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:7 }}>
                <Target size={13} color="#0891b2"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Vistas → Ventas</span>
              </div>
              <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:11 }}>
                {[
                  { label:'Vistas',    value:totalVistas,   pct:100,       color:'#1d4ed8', conv:null },
                  { label:'Consultas', value:consultasChat, pct:wConsultas, color:'#7c3aed',
                    conv: totalVistas>0 ? `${((consultasChat/totalVistas)*100).toFixed(1)}% conv.` : null },
                  { label:'Ventas',    value:totalVendidas, pct:wVentas,   color:'#15803d',
                    conv: consultasChat>0 ? `${((totalVendidas/consultasChat)*100).toFixed(1)}% conv.` : null },
                ].map(step=>{
                  const empty=totalVistas===0
                  return (
                    <div key={step.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:empty?'#d1d5db':'#6b7280' }}>{step.label}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          {step.conv && <span style={{ fontSize:10, color:'#9ca3af' }}>{step.conv}</span>}
                          <span style={{ fontSize:14, fontWeight:800, color:empty?'#d1d5db':'#111827', fontVariantNumeric:'tabular-nums' }}>
                            {empty ? '—' : step.value.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <div style={{ height:9, background:'#f3f4f6', borderRadius:5, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${step.pct}%`, background:empty?'#e5e7eb':step.color, borderRadius:5 }}/>
                      </div>
                    </div>
                  )
                })}
                {totalVistas===0 && <p style={{ fontSize:10, color:'#d1d5db', textAlign:'center', margin:'2px 0 0' }}>Se llenará cuando recibas visitas</p>}
              </div>
            </div>
          </div>

          {/* Ventas por canal */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'13px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:7 }}>
              <BarChart3 size={13} color="#6b7280"/>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Ventas por canal</span>
            </div>
            <div style={{ padding:'13px 20px', display:'flex', flexDirection:'column', gap:11 }}>
              {[
                { label:'Componenta.cl', count:consultasChat, icon:Store,       color:'#1d4ed8', bg:'#eff6ff', href:null },
                { label:'MercadoLibre',  count:null,          icon:ShoppingBag, color:'#b45309', bg:'#fffbeb', href:mlConnected?null:'/api/mercadolibre/connect' },
                { label:'WhatsApp Bot',  count:null,          icon:Bot,         color:'#15803d', bg:'#f0fdf4', href:null },
              ].map(ch=>(
                <div key={ch.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:ch.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ch.icon size={14} color={ch.color}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#374151', flex:1 }}>{ch.label}</span>
                  {ch.count!==null && <span style={{ fontSize:14, fontWeight:800, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{ch.count} consultas</span>}
                  {ch.count===null && ch.href && <a href={ch.href} style={{ fontSize:11, fontWeight:700, color:'#fff', background:'#374151', padding:'4px 10px', borderRadius:20, textDecoration:'none' }}>Conectar →</a>}
                  {ch.count===null && !ch.href && <span style={{ fontSize:11, fontWeight:600, color:'#9ca3af' }}>—</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Inventario en movimiento lento ── */}
          {piezasAging.length > 0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #fecaca', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'13px 20px', borderBottom:'1px solid #fef2f2', display:'flex', alignItems:'center', gap:8, background:'#fef2f2' }}>
                <Clock size={13} color="#b91c1c"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#b91c1c' }}>Inventario en movimiento lento</span>
                <span style={{ fontSize:10, color:'#f87171', marginLeft:'auto' }}>+30 días en vitrina</span>
              </div>
              <div>
                {piezasAging.map((p, i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom: i < piezasAging.length-1 ? '1px solid #fef2f2' : 'none' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Package size={14} color="#f87171"/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.pieza}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:11, color:'#b91c1c', fontWeight:700 }}>{p.dias} días sin vender</span>
                        <span style={{ fontSize:11, color:'#9ca3af' }}>·</span>
                        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                          <Eye size={9} color="#9ca3af"/>
                          <span style={{ fontSize:11, color:'#9ca3af' }}>{p.vistas} vistas</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 3px', fontVariantNumeric:'tabular-nums' }}>${p.precio.toLocaleString('es-CL')}</p>
                      <Link href={`/?edit=${p.id}`} style={{ fontSize:10, fontWeight:700, color:'#b91c1c', textDecoration:'none', background:'#fef2f2', border:'1px solid #fecaca', padding:'2px 8px', borderRadius:8 }}>
                        Editar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'11px 20px', background:'#fef2f2', borderTop:'1px solid #fecaca' }}>
                <p style={{ fontSize:11, color:'#b91c1c', margin:0 }}>
                  💡 <strong>Sugerencia:</strong> Bajar el precio un 10–15% o agregar nuevas fotos puede reactivar el interés de compradores.
                </p>
              </div>
            </div>
          )}

          {/* ── Oportunidades de conversión ── */}
          {piezasOportunidad.length > 0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #bfdbfe', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'13px 20px', borderBottom:'1px solid #eff6ff', display:'flex', alignItems:'center', gap:8, background:'#eff6ff' }}>
                <AlertTriangle size={13} color="#1d4ed8"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#1d4ed8' }}>Oportunidades de conversión</span>
                <span style={{ fontSize:10, color:'#60a5fa', marginLeft:'auto' }}>Tienen vistas, sin consultas</span>
              </div>
              <div>
                {piezasOportunidad.map((p, i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom: i < piezasOportunidad.length-1 ? '1px solid #eff6ff' : 'none' }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Eye size={14} color="#1d4ed8"/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.pieza}</p>
                      <span style={{ fontSize:11, color:'#1d4ed8', fontWeight:700 }}>{p.vistas} vistas · 0 consultas</span>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:12, fontWeight:700, color:'#111827', margin:'0 0 3px' }}>${p.precio.toLocaleString('es-CL')}</p>
                      <Link href={`/?edit=${p.id}`} style={{ fontSize:10, fontWeight:700, color:'#1d4ed8', textDecoration:'none', background:'#eff6ff', border:'1px solid #bfdbfe', padding:'2px 8px', borderRadius:8 }}>
                        Mejorar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'11px 20px', background:'#eff6ff', borderTop:'1px solid #bfdbfe' }}>
                <p style={{ fontSize:11, color:'#1d4ed8', margin:0 }}>
                  💡 <strong>Sugerencia:</strong> Verifica que el precio sea competitivo y que la descripción tenga compatibilidad de modelos clara.
                </p>
              </div>
            </div>
          )}

          {/* Rendimiento por pieza */}
          {rendimiento.length>0 ? (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'13px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:7 }}>
                <Activity size={13} color="#6b7280"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Rendimiento por pieza</span>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:'#f9fafb' }}>
                      <th style={{ padding:'8px 20px', textAlign:'left',  fontWeight:700, color:'#6b7280', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Pieza</th>
                      <th style={{ padding:'8px 12px', textAlign:'right', fontWeight:700, color:'#6b7280', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Vistas</th>
                      <th style={{ padding:'8px 12px', textAlign:'right', fontWeight:700, color:'#6b7280', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Consultas</th>
                      <th style={{ padding:'8px 20px', textAlign:'right', fontWeight:700, color:'#6b7280', fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimiento.map((r,i)=>{
                      const conv=r.vistas>0 ? Math.round((r.consultas/r.vistas)*100) : 0
                      return (
                        <tr key={r.id} style={{ borderTop:i>0?'1px solid #f9fafb':'none' }}>
                          <td style={{ padding:'10px 20px' }}>
                            <p style={{ fontWeight:600, color:'#111827', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>{r.pieza}</p>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <div style={{ flex:1, height:5, background:'#f3f4f6', borderRadius:3, maxWidth:110, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${(r.vistas/maxVistas)*100}%`, background:'linear-gradient(90deg,#1d4ed8,#60a5fa)', borderRadius:3 }}/>
                              </div>
                              <span style={{ fontSize:10, color:r.disponible?'#15803d':'#9ca3af', fontWeight:700 }}>
                                {r.disponible?'En venta':'Vendida'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:800, color:'#111827', fontVariantNumeric:'tabular-nums' }}>{r.vistas}</td>
                          <td style={{ padding:'10px 12px', textAlign:'right' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
                              <MessageCircle size={10} color={r.consultas>0?'#0891b2':'#d1d5db'}/>
                              <span style={{ fontWeight:700, color:r.consultas>0?'#0891b2':'#9ca3af', fontVariantNumeric:'tabular-nums' }}>{r.consultas}</span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 20px', textAlign:'right' }}>
                            <span style={{ fontSize:11, fontWeight:700,
                              color:conv>=10?'#15803d':conv>0?'#b45309':'#9ca3af',
                              background:conv>=10?'#eefbf2':conv>0?'#fffbeb':'#f9fafb',
                              padding:'2px 8px', borderRadius:20 }}>
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
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 14px' }}>Para ver tus métricas:</p>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {[
                  { done:false,     text:'Publica al menos una pieza' },
                  { done:hasPhone,  text:'Agrega tu número de WhatsApp en Mi Tienda' },
                  { done:false,     text:'Espera que compradores visiten tus piezas' },
                ].map((step,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:step.done?'#eefbf2':'#f3f4f6', border:`2px solid ${step.done?'#15803d':'#e5e7eb'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {step.done && <span style={{ fontSize:10, color:'#15803d', fontWeight:900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize:13, color:step.done?'#15803d':'#6b7280' }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimas publicaciones */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'13px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Package size={13} color="#6b7280"/>
                <span style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Últimas publicaciones</span>
              </div>
              <Link href="/inventario" style={{ fontSize:12, color:'#1d4ed8', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                Ver todo <ArrowRight size={11}/>
              </Link>
            </div>
            {recentItems.length===0 ? (
              <div style={{ padding:'36px 20px', textAlign:'center' }}>
                <Package size={24} color="#e5e7eb" style={{ margin:'0 auto 10px', display:'block' }}/>
                <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 14px' }}>Aún no tienes piezas publicadas</p>
                <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 16px', background:'#1d4ed8', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                  <Plus size={12}/> Publicar primera pieza
                </Link>
              </div>
            ) : (
              <div>
                {recentItems.map((item,i)=>(
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:i<recentItems.length-1?'1px solid #f9fafb':'none' }}>
                    <div style={{ width:40, height:40, borderRadius:9, background:'#f3f4f6', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {item.imagen_url ? <img src={item.imagen_url} alt={item.pieza} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Package size={16} color="#9ca3af"/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.pieza}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                        <div style={{ width:5, height:5, borderRadius:'50%', background:ESTADO_DOT[item.estado]??'#9ca3af', flexShrink:0 }}/>
                        <span style={{ fontSize:11, color:'#9ca3af' }}>{item.disponible?'En venta':'Vendida'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 2px', fontVariantNumeric:'tabular-nums' }}>${item.precio.toLocaleString('es-CL')}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
                        <Eye size={9} color="#d1d5db"/>
                        <span style={{ fontSize:11, color:'#9ca3af' }}>{item.vistas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Sidebar ═══ */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* WhatsApp bot hero */}
          <div style={{ background:'linear-gradient(155deg,#dcfce7 0%,#ecfdf5 60%,#f0fdf9 100%)', borderRadius:16, border:'1.5px solid #86efac', overflow:'hidden' }}>
            <div style={{ padding:'13px 15px 9px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'#25d366', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(37,211,102,0.4)', flexShrink:0 }}>
                  <Bot size={15} color="#fff"/>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:800, color:'#14532d', margin:0 }}>Bot de WhatsApp</p>
                  <p style={{ fontSize:10, color:'#16a34a', margin:0 }}>Atiende compradores 24/7</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'#16a34a', borderRadius:20, padding:'3px 8px' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#86efac', display:'inline-block', animation:'pulse-live 1.8s ease-in-out infinite' }}/>
                <span style={{ fontSize:9, fontWeight:800, color:'#fff', letterSpacing:0.3 }}>EN VIVO</span>
              </div>
            </div>
            <div style={{ padding:'0 15px 11px' }}>
              <a href="https://wa.me/14155238886" target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#25d366', color:'#fff', padding:'9px', borderRadius:10, fontSize:12, fontWeight:800, textDecoration:'none', boxShadow:'0 2px 8px rgba(37,211,102,0.35)' }}>
                <Bot size={12}/> +1 415 523 8886
              </a>
            </div>
            <div style={{ margin:'0 15px 13px', background:'rgba(255,255,255,0.65)', borderRadius:9, padding:'9px 11px', border:'1px solid #bbf7d0' }}>
              <p style={{ fontSize:9, fontWeight:800, color:'#15803d', textTransform:'uppercase', letterSpacing:0.6, margin:'0 0 5px' }}>Comandos como vendedor</p>
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {[
                  ['"vendí el alternador"','saca del catálogo'],
                  ['"vendí la 2"','saca por número'],
                  ['cualquier mensaje','ver inventario'],
                ].map(([cmd,desc])=>(
                  <div key={cmd} style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'#14532d', fontFamily:'monospace', flexShrink:0 }}>{cmd}</span>
                    <span style={{ fontSize:9, color:'#4b5563' }}>— {desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {!hasPhone && (
              <div style={{ margin:'0 15px 13px' }}>
                <Link href="/mi-tienda" style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#b45309', fontWeight:700, textDecoration:'none', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:8, padding:'7px 10px' }}>
                  <Phone size={11}/> Agrega tu número para activar →
                </Link>
              </div>
            )}
          </div>

          {/* Más vistas */}
          {topPiezas.length>0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:6 }}>
                <Star size={12} color="#7c3aed"/>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Más vistas</span>
              </div>
              {topPiezas.slice(0,3).map((item,i)=>(
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 15px', borderBottom:i<2?'1px solid #f9fafb':'none' }}>
                  <span style={{ fontSize:10, fontWeight:800, color:'#d1d5db', width:12, textAlign:'center', flexShrink:0 }}>{i+1}</span>
                  <p style={{ fontSize:11, color:'#374151', flex:1, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.pieza}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
                    <Eye size={9} color="#7c3aed"/>
                    <span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', fontVariantNumeric:'tabular-nums' }}>{item.vistas}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estado del catálogo */}
          {distribucionEstado.length>0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:6 }}>
                <Layers size={12} color="#6b7280"/>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Estado del catálogo</span>
              </div>
              {/* Stacked bar */}
              <div style={{ padding:'12px 15px' }}>
                <div style={{ display:'flex', height:8, borderRadius:99, overflow:'hidden', marginBottom:10 }}>
                  {distribucionEstado.map(e=>{
                    const pct=Math.round((e.count/totalEstado)*100)
                    const c=ESTADO_COLOR[e.estado]??'#9ca3af'
                    return <div key={e.estado} style={{ width:`${pct}%`, background:c, minWidth:pct>0?2:0 }}/>
                  })}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {distribucionEstado.map(e=>{
                    const pct=Math.round((e.count/totalEstado)*100)
                    const c=ESTADO_COLOR[e.estado]??'#9ca3af'
                    return (
                      <div key={e.estado} style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }}/>
                        <span style={{ fontSize:11, color:'#374151', flex:1 }}>{e.estado}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:'#111827' }}>{e.count}</span>
                        <span style={{ fontSize:10, color:'#9ca3af', width:26, textAlign:'right' }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Top modelos */}
          {topModelos.length>0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:6 }}>
                <Tag size={12} color="#0891b2"/>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Top modelos</span>
              </div>
              <div style={{ padding:'11px 15px', display:'flex', flexDirection:'column', gap:8 }}>
                {topModelos.map(m=>(
                  <div key={m.modelo}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:11, color:'#374151', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, paddingRight:8 }}>{m.modelo}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:'#0891b2', fontVariantNumeric:'tabular-nums', flexShrink:0 }}>{m.count}</span>
                    </div>
                    <div style={{ height:4, background:'#f3f4f6', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(m.count/maxModelos)*100}%`, background:'linear-gradient(90deg,#0891b2,#38bdf8)', borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hora de mayor actividad */}
          {horasPico.some(h=>h.count>0) && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:6 }}>
                <Clock size={12} color="#b45309"/>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Hora de mayor actividad</span>
              </div>
              <div style={{ padding:'12px 15px' }}>
                <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:55 }}>
                  {horasPico.map(h=>{
                    const pct=Math.max(3,(h.count/maxHora)*48)
                    const isTop=h.count===maxHora && h.count>0
                    return (
                      <div key={h.hora} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, height:'100%', justifyContent:'flex-end' }}>
                        <div style={{ width:'100%', borderRadius:'3px 3px 0 0', height:`${pct}px`, background:isTop?'#b45309':h.count>0?'#fde68a':'#f3f4f6' }}/>
                        <span style={{ fontSize:7, color:isTop?'#b45309':'#d1d5db', fontWeight:isTop?800:400 }}>
                          {h.hora % 2 === 0 ? `${h.hora}h` : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {maxHora>0 && (
                  <p style={{ fontSize:10, color:'#9ca3af', margin:'6px 0 0', textAlign:'center' }}>
                    Pico a las <strong style={{ color:'#b45309' }}>
                      {horasPico.find(h=>h.count===maxHora)?.hora}h
                    </strong> — responde rápido en ese horario
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Vistas esta semana */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Eye size={12} color="#7c3aed"/>
                <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Vistas esta semana</span>
              </div>
              {totalWeekViews>0 && (
                <span style={{ fontSize:10, fontWeight:700, color:'#7c3aed', background:'#f5f3ff', padding:'2px 7px', borderRadius:20 }}>
                  {totalWeekViews.toLocaleString('es-CL')}
                </span>
              )}
            </div>
            <div style={{ padding:'12px 15px' }}>
              {dailyViews.length===0 ? (
                <p style={{ fontSize:11, color:'#9ca3af', margin:0, textAlign:'center', padding:'10px 0' }}>Aparecerá cuando publiques piezas.</p>
              ) : (
                <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:60 }}>
                  {dailyViews.map(d=>{
                    const pct=Math.max(8,(d.count/maxDay)*48)
                    return (
                      <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end' }}>
                        <span style={{ fontSize:8, fontWeight:700, color:'#7c3aed' }}>{d.count>0?d.count:''}</span>
                        <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${pct}px`, background:'linear-gradient(180deg,#7c3aed 0%,#c4b5fd 100%)' }}/>
                        <span style={{ fontSize:8, color:'#9ca3af' }}>{d.day.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Por región */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding:'12px 15px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:5 }}>
              <MapPin size={12} color="#0891b2"/>
              <span style={{ fontSize:12, fontWeight:700, color:'#111827' }}>Por región</span>
              <span style={{ fontSize:9, color:'#9ca3af', marginLeft:'auto' }}>30 días</span>
            </div>
            {topRegiones.length===0 ? (
              <div style={{ padding:'14px 15px', textAlign:'center' }}>
                <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>Aparecerá cuando compradores visiten tus piezas.</p>
              </div>
            ) : (
              <div style={{ padding:'11px 15px', display:'flex', flexDirection:'column', gap:8 }}>
                {topRegiones.map(r=>(
                  <div key={r.region}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:11, color:'#374151', fontWeight:500 }}>{r.region}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:'#0891b2', fontVariantNumeric:'tabular-nums' }}>{r.count}</span>
                    </div>
                    <div style={{ height:4, background:'#f3f4f6', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(r.count/maxRegion)*100}%`, background:'linear-gradient(90deg,#0891b2,#38bdf8)', borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actividad reciente del vendedor */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:15, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8, margin:'0 0 10px' }}>Resumen de actividad</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Total publicadas',   value:String(totalPublicadas),  color:'#1d4ed8' },
                { label:'Disponibles ahora',  value:String(totalDisponibles), color:'#15803d' },
                { label:'Vendidas histórico', value:String(totalVendidas),    color:'#7c3aed' },
                { label:'Consultas totales',  value:String(consultasChat),    color:'#0891b2' },
                diasDesdeUltimaPublicacion !== null
                  ? { label:'Días desde última pub.', value:`${diasDesdeUltimaPublicacion}d`, color: diasDesdeUltimaPublicacion>14?'#b91c1c':'#15803d' }
                  : null,
              ].filter(Boolean).map((row,i)=>{
                const r = row as { label:string; value:string; color:string }
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'#6b7280' }}>{r.label}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:r.color, fontVariantNumeric:'tabular-nums' }}>{r.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Plan */}
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:15, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize:9, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.8, margin:'0 0 7px' }}>Plan actual</p>
            <p style={{ fontSize:14, fontWeight:800, color:isPro?'#1d4ed8':'#111827', margin:'0 0 4px' }}>
              {isPro?'⚡ Plan Pro':'Plan Gratuito'}
            </p>
            {!isPro && (
              <>
                <div style={{ margin:'7px 0', background:'#f3f4f6', borderRadius:5, height:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100,(totalPublicadas/5)*100)}%`, background:totalPublicadas>=5?'#ef4444':'#1d4ed8', borderRadius:5, transition:'width 0.5s' }}/>
                </div>
                <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 10px' }}>{totalPublicadas}/5 piezas usadas</p>
                <Link href="/planes" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'8px', borderRadius:9, background:'#1d4ed8', color:'#fff', fontWeight:700, fontSize:11, textDecoration:'none' }}>
                  <Zap size={10}/> Subir a Plan Pro
                </Link>
              </>
            )}
            {isPro && <p style={{ fontSize:11, color:'#9ca3af', margin:'3px 0 0' }}>Piezas ilimitadas · Analytics completo</p>}
          </div>

        </div>
      </div>
    </>
  )
}
