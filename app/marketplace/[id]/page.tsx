'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Star, MapPin, Clock, CheckCircle,
  AlertTriangle, HelpCircle, Share2, Heart, Shield,
  Truck, Car, Package, MessageCircle, ChevronRight, Eye, Zap
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza, InventoryItem } from '@/lib/types'

const ESTADO: Record<EstadoPieza, { label: string; color: string; bg: string; border: string }> = {
  excelente:      { label: 'Excelente',    color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fff5f5', border: '#fca5a5' },
}

const ZONA_EMOJI: Record<string, string> = {
  motor:'⚙️', electrico:'⚡', frenos:'🛑', 'suspension-d':'🔩',
  transmision:'🔧', interior:'🪑', escape:'💨', carroceria:'🚘',
}

type RichItem = InventoryItem & {
  imagen_url?: string | null; descripcion?: string | null; envio?: string | null
  seller_nombre?: string | null; seller_telefono?: string | null; seller_id?: string | null
  isReal?: boolean
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const mockItem = mockInventory.find(i => i.id === id)
  const [item, setItem]   = useState<RichItem | null>(mockItem ?? null)
  const [loading, setLoading] = useState(!mockItem)
  const [saved, setSaved]     = useState(false)
  const [vMake, setVMake]     = useState('')
  const [vModel, setVModel]   = useState('')
  const [vYear, setVYear]     = useState('')
  const cart = useCart()

  useEffect(() => {
    if (!mockItem) {
      fetch(`/api/products/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.product) return
          const raw = d.product
          const fitment = (raw.fitment ?? []).flatMap((f: Record<string, unknown>) => {
            const make  = ((f.make as string) || (f.marca as string) || '').trim()
            const model = ((f.model as string) || (f.modelo as string) || '').trim()
            if (!make || !model) return []
            let yf = (f.yearFrom as number) || 0
            let yt = (f.yearTo as number) || 0
            if ((!yf || !yt) && f.anios) {
              const a = (f.anios as string).replace('–', '-').replace(/\s/g, '')
              const r2 = a.match(/^(\d{4})-(\d{4})$/); const g = a.match(/^(\d{4})$/)
              yf = r2 ? parseInt(r2[1]) : g ? parseInt(g[1]) : 0
              yt = r2 ? parseInt(r2[2]) : yf
            }
            if (!yf || !yt) return []
            return [{ make, model, yearFrom: yf, yearTo: yt }]
          })
          setItem({ ...raw, fitment, isReal: true })
        })
        .finally(() => setLoading(false))
    }
  }, [id, mockItem])

  const makes  = getAllMakes()
  const models = vMake ? getModels(vMake) : []
  const years  = vMake && vModel ? getYears(vMake, vModel) : []
  const vSel   = vMake && vModel && vYear
  const yNum   = vSel ? parseInt(vYear) : 0
  const compat = vSel && item ? checkCompatibility(item.fitment, vMake, vModel, yNum) : null

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e5e7eb', borderTopColor:'#1d4ed8', borderRadius:'50%', margin:'0 auto 12px', animation:'spin 1s linear infinite' }} />
        <p style={{ color:'#9ca3af', fontSize:14 }}>Cargando…</p>
      </div>
    </div>
  )

  if (!item) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'#f8f9fa' }}>
      <Package size={48} color="#d1d5db" />
      <p style={{ color:'#6b7280', fontSize:16, fontWeight:600 }}>Producto no encontrado</p>
      <Link href="/marketplace" style={{ color:'#1d4ed8', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
        <ArrowLeft size={15} /> Volver al marketplace
      </Link>
    </div>
  )

  const isReal     = item.isReal ?? false
  const mockSeller = item.vendedorSlug ? mockDesarmaduras.find(d=>d.slug===item.vendedorSlug)??mockDesarmaduras[0] : mockDesarmaduras[0]
  const sNombre    = isReal ? (item.seller_nombre ?? 'Vendedor Componenta') : mockSeller.nombre
  const sTel       = isReal ? (item.seller_telefono ?? '56912345678') : mockSeller.telefono
  const est        = ESTADO[item.estado]
  const waText     = encodeURIComponent(`Hola, vi "${item.pieza}" (${item.marca} ${item.modelo}) en Componenta a $${item.precio.toLocaleString('es-CL')}. ¿Está disponible?`)
  const waLink     = `https://wa.me/${sTel.replace(/\D/g,'')}?text=${waText}`
  const similares  = mockInventory.filter(i=>i.id!==id&&i.disponible&&(i.zona===item.zona||i.vendedorSlug===item.vendedorSlug)).slice(0,6)

  const SEL: React.CSSProperties = { padding:'10px 13px', borderRadius:9, border:'1.5px solid #e5e7eb', fontSize:13, outline:'none', background:'#fff', color:'#111827', width:'100%', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:"'Inter',system-ui,sans-serif", paddingBottom:100 }}>

      {/* NAV */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 20px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <Link href="/marketplace" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', color:'#374151', fontSize:13, fontWeight:600 }}>
          <ArrowLeft size={16} color="#1d4ed8" /> Marketplace
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <button onPointerDown={()=>setSaved(v=>!v)}
            style={{ background:saved?'#fff5f5':'#fff', border:`1.5px solid ${saved?'#fca5a5':'#e5e7eb'}`, borderRadius:9, padding:'7px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:saved?'#b91c1c':'#374151' }}>
            <Heart size={14} fill={saved?'#ef4444':'none'} color={saved?'#ef4444':'#9ca3af'} />
            {saved ? 'Guardado' : 'Guardar'}
          </button>
          <button onPointerDown={()=>{if(navigator.share)navigator.share({title:item.pieza,url:window.location.href})}}
            style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:9, padding:'7px 11px', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <Share2 size={14} color="#6b7280" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'24px 16px' }}>

        {/* BREADCRUMB */}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#9ca3af', marginBottom:20 }}>
          <Link href="/marketplace" style={{ color:'#1d4ed8', textDecoration:'none', fontWeight:500 }}>Marketplace</Link>
          <ChevronRight size={12} />
          <span style={{ color:'#374151' }}>{item.pieza}</span>
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }} className="product-layout">

          {/* COL IZQUIERDA */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* IMAGEN */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden' }}>
              <div style={{ paddingTop:'65%', position:'relative', background:'#f3f4f6' }}>
                {item.imagen_url
                  ? <img src={item.imagen_url} alt={item.pieza} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:8 }} />
                  : <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <span style={{ fontSize:72, opacity:.18 }}>{ZONA_EMOJI[item.zona]??'🔧'}</span>
                      <span style={{ fontSize:12, color:'#9ca3af', fontWeight:500 }}>Sin fotografía</span>
                    </div>}
              </div>

              {/* chips */}
              <div style={{ padding:'14px 16px', display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, background:est.bg, border:`1px solid ${est.border}`, borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:700, color:est.color }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:est.color, display:'inline-block' }} />
                  {est.label}
                </span>
                {item.oem &&
                  <span style={{ display:'flex', alignItems:'center', gap:5, background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:700, color:'#0369a1' }}>
                    OEM · {item.oem}
                  </span>}
                <span style={{ display:'flex', alignItems:'center', gap:5, background:'#f0fdf4', border:'1px solid #86efac', borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:700, color:'#15803d' }}>
                  <Shield size={11} /> Verificado
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:5, background:'#f8f9fa', border:'1px solid #e5e7eb', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#6b7280' }}>
                  <Eye size={11} /> {item.vistas} vistas
                </span>
              </div>
            </div>

            {/* DESCRIPCIÓN / DETALLES */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'20px' }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:'#111827', margin:'0 0 16px' }}>Detalles de la pieza</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Pieza',    value:item.pieza },
                  { label:'Marca auto', value:item.marca },
                  { label:'Modelo',   value:item.modelo },
                  { label:'Años',     value:item.anios },
                  { label:'Estado',   value:est.label },
                  { label:'OEM',      value:item.oem||'—' },
                ].map(({label,value})=>(
                  <div key={label} style={{ padding:'10px 12px', background:'#f8f9fa', borderRadius:10 }}>
                    <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 3px' }}>{label}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:0 }}>{value||'—'}</p>
                  </div>
                ))}
              </div>

              {/* compatibilidad declarada */}
              {item.fitment.length > 0 && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #f3f4f6' }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#374151', margin:'0 0 10px' }}>Compatibilidad declarada</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {item.fitment.map((f,i)=>(
                      <span key={i} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:600, color:'#1d4ed8' }}>
                        {f.make} {f.model} {f.yearFrom}–{f.yearTo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VERIFICAR COMPATIBILIDAD */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:38, height:38, background:'#eff6ff', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Car size={18} color="#1d4ed8" />
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:14, color:'#111827', margin:0 }}>¿Sirve para mi auto?</p>
                  <p style={{ fontSize:12, color:'#9ca3af', margin:'2px 0 0' }}>Verifica compatibilidad antes de consultar</p>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <select value={vMake} onChange={e=>{setVMake(e.target.value);setVModel('');setVYear('')}} style={SEL}>
                  <option value="">Selecciona marca</option>
                  {makes.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vModel} onChange={e=>{setVModel(e.target.value);setVYear('')}} disabled={!vMake} style={{...SEL, opacity:vMake?1:.5}}>
                  <option value="">Selecciona modelo</option>
                  {models.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vYear} onChange={e=>setVYear(e.target.value)} disabled={!vModel} style={{...SEL, opacity:vModel?1:.5}}>
                  <option value="">Selecciona año</option>
                  {years.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {compat && (
                <div style={{ marginTop:12, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:12,
                  background:compat==='compatible'?'#f0fdf4':compat==='incompatible'?'#fff5f5':'#f8f9fa',
                  border:`1.5px solid ${compat==='compatible'?'#86efac':compat==='incompatible'?'#fca5a5':'#e5e7eb'}` }}>
                  {compat==='compatible'   && <CheckCircle size={22} color="#15803d" fill="#15803d" />}
                  {compat==='incompatible' && <AlertTriangle size={22} color="#b91c1c" />}
                  {compat==='unknown'      && <HelpCircle size={22} color="#6b7280" />}
                  <div>
                    <p style={{ fontWeight:800, fontSize:14, margin:'0 0 3px',
                      color:compat==='compatible'?'#15803d':compat==='incompatible'?'#b91c1c':'#374151' }}>
                      {compat==='compatible'?'✓ Compatible con tu vehículo':compat==='incompatible'?'No compatible':'Sin datos suficientes'}
                    </p>
                    <p style={{ fontSize:12, margin:0, color:compat==='compatible'?'#15803d':compat==='incompatible'?'#b91c1c':'#6b7280' }}>
                      {compat==='compatible'?`${vMake} ${vModel} ${vYear} — debería funcionar`:compat==='incompatible'?'Consulta al vendedor para confirmar':'Confirma directamente con el vendedor'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COL DERECHA */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:68 }}>

            {/* PRECIO Y CTA */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
              {/* marca / modelo */}
              <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 6px' }}>
                {item.marca} {item.modelo} · {item.anios}
              </p>
              {/* nombre */}
              <h1 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:'0 0 14px', lineHeight:1.25, letterSpacing:-.3 }}>{item.pieza}</h1>

              {/* precio */}
              <div style={{ padding:'14px 16px', background:'#f8f9fa', borderRadius:12, marginBottom:16 }}>
                <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 4px', fontWeight:600 }}>Precio</p>
                <p style={{ fontSize:34, fontWeight:900, color:'#111827', margin:0, letterSpacing:-1.5, lineHeight:1 }}>
                  ${item.precio.toLocaleString('es-CL')}
                  <span style={{ fontSize:14, fontWeight:500, color:'#9ca3af', letterSpacing:0, marginLeft:4 }}>CLP</span>
                </p>
              </div>

              {/* estado badge */}
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:est.bg, border:`1px solid ${est.border}`, borderRadius:10, marginBottom:18 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:est.color, flexShrink:0, display:'inline-block' }} />
                <span style={{ fontSize:13, fontWeight:700, color:est.color }}>Estado: {est.label}</span>
              </div>

              {/* CTAs */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:12, background:'#16a34a', color:'#fff', fontWeight:800, fontSize:15, textDecoration:'none', boxShadow:'0 4px 12px rgba(22,163,74,.3)' }}>
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
                <a href={`tel:${sTel}`}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:12, background:'#fff', border:'1.5px solid #e5e7eb', color:'#374151', fontWeight:700, fontSize:14, textDecoration:'none' }}>
                  <Phone size={16} color="#6b7280" /> Llamar al vendedor
                </a>
                {isReal && (
                  <div style={{ display:'flex', gap:8 }}>
                    <Link href={`/checkout/${id}`}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', borderRadius:11, background:'#1d4ed8', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                      Comprar · ${item.precio.toLocaleString('es-CL')}
                    </Link>
                    <button onClick={()=>cart.has(id)?cart.remove(id):cart.add({id, pieza:item.pieza, precio:item.precio, imagen_url:item.imagen_url, seller_id:item.seller_id??undefined})}
                      title={cart.has(id)?'Quitar del carrito':'Agregar al carrito'}
                      style={{ padding:'11px 14px', borderRadius:11, border:`1.5px solid ${cart.has(id)?'#1d4ed8':'#e5e7eb'}`, background:cart.has(id)?'#eff6ff':'#fff', cursor:'pointer', display:'flex', alignItems:'center', color:cart.has(id)?'#1d4ed8':'#6b7280', fontSize:12, fontWeight:600, gap:5 }}>
                      🛒 {cart.has(id)?'En carrito':'Agregar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* VENDEDOR */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'18px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 14px' }}>Vendedor</p>
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:isReal?'linear-gradient(135deg,#1d4ed8,#3b82f6)':`linear-gradient(135deg,${mockSeller.color}dd,${mockSeller.color})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontWeight:900, fontSize:18, color:'#fff' }}>{sNombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{ flex:1 }}>
                  {isReal
                    ? <p style={{ fontWeight:800, fontSize:15, color:'#111827', margin:'0 0 3px' }}>{sNombre}</p>
                    : <Link href={`/d/${mockSeller.slug}`} style={{ fontWeight:800, fontSize:15, color:'#111827', textDecoration:'none' }}>{sNombre}</Link>}
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:12, color:s<=Math.round(mockSeller.rating)?'#facc15':'#e5e7eb' }}>★</span>)}
                    <span style={{ fontSize:12, fontWeight:600, color:'#374151', marginLeft:4 }}>{mockSeller.rating}</span>
                    <span style={{ fontSize:11, color:'#9ca3af' }}>({mockSeller.reviewCount})</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {mockSeller.direccion && (
                  <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#6b7280' }}>
                    <MapPin size={12} color="#9ca3af" /> {mockSeller.direccion}
                  </div>
                )}
                {mockSeller.horario && (
                  <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#6b7280' }}>
                    <Clock size={12} color="#9ca3af" /> {mockSeller.horario}
                  </div>
                )}
              </div>
              {!isReal && (
                <Link href={`/d/${mockSeller.slug}`}
                  style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:9, background:'#f8f9fa', border:'1px solid #e5e7eb', color:'#374151', fontSize:12, fontWeight:600, textDecoration:'none' }}>
                  Ver tienda completa <ChevronRight size={13} />
                </Link>
              )}
            </div>

            {/* GARANTÍAS */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', padding:'16px' }}>
              {[
                { icon:Truck,   color:'#1d4ed8', title:'Envío a todo Chile',     sub:'Coordina con el vendedor' },
                { icon:Shield,  color:'#15803d', title:'Vendedor verificado',    sub:'Revisado por Componenta' },
                { icon:Zap,     color:'#7c3aed', title:'Respuesta rápida',       sub:'WhatsApp directo' },
              ].map(({icon:Icon,color,title,sub})=>(
                <div key={title} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #f9fafb' }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:'#111827', margin:0 }}>{title}</p>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* MAPA */}
            {mockSeller.direccion && (
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden' }}>
                <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <MapPin size={15} color="#d97706" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#111827', margin:'0 0 1px' }}>Ubicación del vendedor</p>
                    <p style={{ fontSize:11, color:'#6b7280', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mockSeller.direccion}</p>
                  </div>
                </div>
                <div style={{ position:'relative', height:180 }}>
                  <iframe
                    title="Mapa vendedor"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mockSeller.direccion)}&output=embed&z=15`}
                    style={{ width:'100%', height:'100%', border:'none', display:'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {/* Overlay link para abrir en Google Maps */}
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(mockSeller.direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ position:'absolute', bottom:8, right:8, display:'flex', alignItems:'center', gap:5, padding:'6px 10px', borderRadius:8, background:'#fff', border:'1px solid #e5e7eb', fontSize:11, fontWeight:600, color:'#374151', textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,.12)' }}>
                    <MapPin size={11} color="#1d4ed8" /> Ver en Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIMILARES */}
        {similares.length > 0 && (
          <div style={{ marginTop:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#111827', margin:0, letterSpacing:-.3 }}>Repuestos similares</h2>
              <Link href="/marketplace" style={{ fontSize:13, color:'#1d4ed8', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                Ver todo <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
              {similares.map(sim=>{
                const simSeller = mockDesarmaduras.find(d=>d.slug===sim.vendedorSlug)
                return (
                  <Link key={sim.id} href={`/marketplace/${sim.id}`} style={{ textDecoration:'none' }}>
                    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden', transition:'all .15s' }}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='0 4px 16px rgba(0,0,0,.08)';el.style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='';el.style.transform=''}}>
                      <div style={{ height:100, background:simSeller?`linear-gradient(135deg,${simSeller.color}25,${simSeller.color}45)`:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:36, opacity:.6 }}>{ZONA_EMOJI[sim.zona]??'🔧'}</span>
                      </div>
                      <div style={{ padding:'10px 11px' }}>
                        <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:'0 0 5px', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>{sim.pieza}</p>
                        <p style={{ fontSize:15, fontWeight:900, color:'#111827', margin:0, letterSpacing:-.5 }}>${sim.precio.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR MÓVIL */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'#fff', borderTop:'1px solid #e5e7eb', padding:'12px 16px', display:'flex', gap:10, alignItems:'center', boxShadow:'0 -4px 20px rgba(0,0,0,.08)' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:11, color:'#9ca3af', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.pieza}</p>
          <p style={{ fontSize:20, fontWeight:900, color:'#111827', margin:0, letterSpacing:-.5 }}>${item.precio.toLocaleString('es-CL')}</p>
        </div>
        <a href={`tel:${sTel}`}
          style={{ padding:'13px 14px', borderRadius:12, border:'1.5px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}>
          <Phone size={18} color="#6b7280" />
        </a>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, maxWidth:180, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:'#16a34a', color:'#fff', fontWeight:800, fontSize:14, textDecoration:'none', boxShadow:'0 4px 12px rgba(22,163,74,.3)' }}>
          <MessageCircle size={18} /> Consultar
        </a>
      </div>

      <style>{`
        @media(max-width:680px){
          .product-layout{grid-template-columns:1fr!important;}
        }
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
