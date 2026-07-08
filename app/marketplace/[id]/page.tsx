'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Phone, MapPin, Clock, CheckCircle,
  AlertTriangle, HelpCircle, Share2, Heart, Shield,
  Truck, Car, Package, MessageCircle, ChevronRight, Eye, Zap
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza, InventoryItem } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

const ESTADO: Record<EstadoPieza, { label: string; color: string; bg: string; border: string }> = {
  excelente:      { label: 'Excelente',    color: '#1a7a42', bg: '#eefbf2', border: '#c8f0d6' },
  bueno:          { label: 'Buen estado',  color: '#2f5fdb', bg: '#eef3fc', border: '#d7e3f7' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fff5f5', border: '#fca5a5' },
}

const ZONA_EMOJI: Record<string, string> = {
  motor:'⚙️', electrico:'⚡', frenos:'🛑', 'suspension-d':'🔩',
  transmision:'🔧', interior:'🪑', escape:'💨', carroceria:'🚘',
}

// Reseñas: placeholder hasta que exista tabla `reviews` en Supabase.
// Si no hay reseñas reales, ocultar esta sección en vez de mostrar mock data.
const MOCK_REVIEWS = [
  { nombre: 'Rodrigo M.', iniciales: 'RM', estrellas: 5, comentario: 'Llegó tal cual la foto, calzó perfecto en mi auto. Buena comunicación por WhatsApp.' },
  { nombre: 'Camila T.',  iniciales: 'CT', estrellas: 5, comentario: 'Excelente atención, me ayudaron a confirmar compatibilidad antes de comprar.' },
  { nombre: 'Felipe A.',  iniciales: 'FA', estrellas: 4, comentario: 'Buen estado general, un poco de desgaste no mencionado pero funciona perfecto.' },
]

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
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f4' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #ececea', borderTopColor:'#2f5fdb', borderRadius:'50%', margin:'0 auto 12px', animation:'spin 1s linear infinite' }} />
        <p style={{ color:'#9aa0aa', fontSize:14 }}>Cargando…</p>
      </div>
    </div>
  )

  if (!item) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'#f5f5f4' }}>
      <Package size={48} color="#d1d5db" />
      <p style={{ color:'#6b7280', fontSize:16, fontWeight:600 }}>Producto no encontrado</p>
      <Link href="/marketplace" style={{ color:'#2f5fdb', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
        <ArrowLeft size={15} /> Volver al marketplace
      </Link>
    </div>
  )

  const isReal     = item.isReal ?? false
  const mockSeller = item.vendedorSlug ? mockDesarmaduras.find(d=>d.slug===item.vendedorSlug)??mockDesarmaduras[0] : mockDesarmaduras[0]
  const sNombre    = isReal ? (item.seller_nombre ?? 'Vendedor Componenta') : mockSeller.nombre
  const sTel       = isReal ? (item.seller_telefono ?? '56912345678') : mockSeller.telefono
  const sColor     = isReal ? '#2f5fdb' : mockSeller.color
  const sInitial   = (sNombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()) || 'V'
  const est        = ESTADO[item.estado]
  const waText     = encodeURIComponent(`Hola, vi "${item.pieza}" (${item.marca} ${item.modelo}) en Componenta a $${item.precio.toLocaleString('es-CL')}. ¿Está disponible?`)
  const waLink     = `https://wa.me/${sTel.replace(/\D/g,'')}?text=${waText}`
  const similares  = mockInventory.filter(i=>i.id!==id&&i.disponible&&(i.zona===item.zona||i.vendedorSlug===item.vendedorSlug)).slice(0,4)

  const SEL: React.CSSProperties = { padding:'10px 12px', borderRadius:9, border:'1.5px solid #ececea', fontSize:12.5, outline:'none', background:'#fafafa', color:'#16181d', width:'100%', boxSizing:'border-box', fontWeight:500 }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f4', fontFamily:"'Inter',system-ui,sans-serif", paddingBottom:100 }}>

      {/* NAV */}
      <div style={{ background:'#fff', borderBottom:'1px solid #ececea', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <Link href="/marketplace" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', color:'#374151', fontSize:13, fontWeight:600 }}>
          <ArrowLeft size={16} color="#2f5fdb" /> Marketplace
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          <button onPointerDown={()=>setSaved(v=>!v)}
            style={{ background:saved?'#fff5f5':'#fff', border:`1.5px solid ${saved?'#fca5a5':'#ececea'}`, borderRadius:9, padding:'7px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:saved?'#b91c1c':'#374151' }}>
            <Heart size={14} fill={saved?'#ef4444':'none'} color={saved?'#ef4444':'#9aa0aa'} />
            {saved ? 'Guardado' : 'Guardar'}
          </button>
          <button onPointerDown={()=>{if(navigator.share)navigator.share({title:item.pieza,url:window.location.href})}}
            style={{ background:'#fff', border:'1.5px solid #ececea', borderRadius:9, padding:'7px 11px', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <Share2 size={14} color="#6b7280" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1020, margin:'0 auto', padding:'22px 24px' }}>

        {/* BREADCRUMB */}
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'#9aa0aa', marginBottom:18 }}>
          <Link href="/marketplace" style={{ color:'#2f5fdb', textDecoration:'none', fontWeight:600 }}>Marketplace</Link>
          <ChevronRight size={11} />
          <span style={{ color:'#374151' }}>{item.pieza}</span>
        </div>

        {/* GRID PRINCIPAL */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }} className="product-layout">

          {/* COL IZQUIERDA */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* IMAGEN */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', overflow:'hidden' }}>
              <div style={{ paddingTop:'62%', position:'relative', background:'#f3f4f6' }}>
                {item.imagen_url
                  ? <img src={item.imagen_url} alt={item.pieza} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:8 }} />
                  : <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <span style={{ fontSize:64, opacity:.18 }}>{ZONA_EMOJI[item.zona]??'🔧'}</span>
                      <span style={{ fontSize:12, color:'#9aa0aa', fontWeight:500 }}>Sin fotografía</span>
                    </div>}
              </div>
              <div style={{ padding:'13px 16px', display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6, background:est.bg, border:`1px solid ${est.border}`, borderRadius:20, padding:'5px 12px', fontSize:11.5, fontWeight:700, color:est.color }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:est.color, display:'inline-block' }} />
                  {est.label}
                </span>
                {item.oem &&
                  <span style={{ display:'flex', alignItems:'center', gap:5, background:'#eef3fc', border:'1px solid #d7e3f7', borderRadius:20, padding:'5px 12px', fontSize:11.5, fontWeight:700, color:'#2f5fdb', fontFamily:'ui-monospace,Menlo,monospace' }}>
                    OEM · {item.oem}
                  </span>}
                <span style={{ display:'flex', alignItems:'center', gap:5, background:'#eefbf2', border:'1px solid #c8f0d6', borderRadius:20, padding:'5px 12px', fontSize:11.5, fontWeight:700, color:'#16a34a' }}>
                  <Shield size={11} /> Verificado
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:5, background:'#fafafa', border:'1px solid #ececea', borderRadius:20, padding:'5px 12px', fontSize:11.5, color:'#6b7280' }}>
                  <Eye size={11} /> {item.vistas} vistas
                </span>
              </div>
            </div>

            {/* DESCRIPCIÓN / DETALLES */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', padding:20 }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:'#16181d', margin:'0 0 14px' }}>Detalles de la pieza</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Pieza',    value:item.pieza },
                  { label:'Marca auto', value:item.marca },
                  { label:'Modelo',   value:item.modelo },
                  { label:'Años',     value:item.anios },
                  { label:'Estado',   value:est.label },
                  { label:'OEM',      value:item.oem||'—' },
                ].map(({label,value})=>(
                  <div key={label} style={{ padding:'10px 12px', background:'#fafafa', borderRadius:10 }}>
                    <p style={{ fontSize:9.5, fontWeight:700, color:'#9aa0aa', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 3px' }}>{label}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:'#16181d', margin:0 }}>{value||'—'}</p>
                  </div>
                ))}
              </div>

              {item.fitment.length > 0 && (
                <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #f1f2f4' }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#374151', margin:'0 0 10px' }}>Compatibilidad declarada</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {item.fitment.map((f,i)=>(
                      <span key={i} style={{ background:'#eef3fc', border:'1px solid #d7e3f7', borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:600, color:'#2f5fdb' }}>
                        {f.make} {f.model} {f.yearFrom}–{f.yearTo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VERIFICAR COMPATIBILIDAD */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:38, height:38, background:'#eef3fc', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Car size={18} color="#2f5fdb" />
                </div>
                <div>
                  <p style={{ fontWeight:800, fontSize:14, color:'#16181d', margin:0 }}>¿Sirve para mi auto?</p>
                  <p style={{ fontSize:12, color:'#9aa0aa', margin:'2px 0 0' }}>Verifica compatibilidad antes de consultar</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <select value={vMake} onChange={e=>{setVMake(e.target.value);setVModel('');setVYear('')}} style={SEL}>
                  <option value="">Marca</option>
                  {makes.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vModel} onChange={e=>{setVModel(e.target.value);setVYear('')}} disabled={!vMake} style={{...SEL, opacity:vMake?1:.5}}>
                  <option value="">Modelo</option>
                  {models.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vYear} onChange={e=>setVYear(e.target.value)} disabled={!vModel} style={{...SEL, opacity:vModel?1:.5}}>
                  <option value="">Año</option>
                  {years.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {compat && (
                <div style={{ borderRadius:11, padding:'13px 15px', display:'flex', alignItems:'flex-start', gap:11,
                  background:compat==='compatible'?'#eefbf2':compat==='incompatible'?'#fff5f5':'#fafafa',
                  border:`1.5px solid ${compat==='compatible'?'#b9ecc9':compat==='incompatible'?'#fca5a5':'#ececea'}` }}>
                  {compat==='compatible'   && <CheckCircle size={20} color="#16a34a" fill="#16a34a" />}
                  {compat==='incompatible' && <AlertTriangle size={20} color="#b91c1c" />}
                  {compat==='unknown'      && <HelpCircle size={20} color="#6b7280" />}
                  <div>
                    <p style={{ fontWeight:800, fontSize:13.5, margin:'0 0 3px',
                      color:compat==='compatible'?'#116e35':compat==='incompatible'?'#b91c1c':'#374151' }}>
                      {compat==='compatible'?'Compatible con tu vehículo':compat==='incompatible'?'No compatible':'Sin datos suficientes'}
                    </p>
                    <p style={{ fontSize:12, margin:0, color:compat==='compatible'?'#22824f':compat==='incompatible'?'#b91c1c':'#6b7280' }}>
                      {compat==='compatible'?`${vMake} ${vModel} ${vYear} — debería funcionar`:compat==='incompatible'?'Consulta al vendedor para confirmar':'Confirma directamente con el vendedor'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RESEÑAS — placeholder hasta tener tabla reviews real */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <h2 style={{ fontSize:15, fontWeight:800, color:'#16181d', margin:0 }}>Reseñas de compradores</h2>
                  <span style={{ fontSize:12, color:'#9aa0aa' }}>{mockSeller.reviewCount} reseñas</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:'#16181d' }}>{mockSeller.rating}</span>
                  <span style={{ color:'#facc15', fontSize:14, letterSpacing:1 }}>★★★★★</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {MOCK_REVIEWS.map(r => (
                  <div key={r.nombre} style={{ padding:'14px 15px', background:'#fafafa', borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:26, height:26, borderRadius:8, background:'#dbe4f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#2f5fdb' }}>{r.iniciales}</div>
                        <span style={{ fontSize:12.5, fontWeight:700, color:'#16181d' }}>{r.nombre}</span>
                      </div>
                      <span style={{ color:'#facc15', fontSize:11, letterSpacing:1 }}>{'★'.repeat(r.estrellas)}{'☆'.repeat(5-r.estrellas)}</span>
                    </div>
                    <p style={{ fontSize:12.5, lineHeight:1.55, color:'#374151', margin:0 }}>{r.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COL DERECHA */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:72 }}>

            {/* PRECIO Y CTA */}
            <div style={{ background:'#16181d', borderRadius:18, padding:26, boxShadow:'0 14px 36px rgba(0,0,0,.2)' }}>
              <p style={{ fontSize:10.5, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 6px' }}>
                {item.marca} {item.modelo} · {item.anios}
              </p>
              <h1 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:'0 0 18px', lineHeight:1.3, letterSpacing:-.3 }}>{item.pieza}</h1>

              <p style={{ fontSize:40, fontWeight:900, color:'#fff', margin:'0 0 20px', letterSpacing:-1.5, lineHeight:1 }}>
                ${item.precio.toLocaleString('es-CL')}
                <span style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,.5)', letterSpacing:0, marginLeft:5 }}>CLP</span>
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9, padding:16, borderRadius:12, background:'#16a34a', color:'#fff', fontWeight:800, fontSize:15, textDecoration:'none', boxShadow:'0 8px 20px rgba(22,163,74,.35)' }}>
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
                <a href={`tel:${sTel}`}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:13, borderRadius:12, background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.15)', color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none' }}>
                  <Phone size={16} /> Llamar al vendedor
                </a>
                {isReal && (
                  <div style={{ display:'flex', gap:8 }}>
                    <Link href={`/checkout/${id}`}
                      style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:12, borderRadius:11, background:'#fff', color:'#16181d', fontWeight:800, fontSize:13, textDecoration:'none' }}>
                      Comprar · ${item.precio.toLocaleString('es-CL')}
                    </Link>
                    <button onClick={()=>cart.has(id)?cart.remove(id):cart.add({id, pieza:item.pieza, precio:item.precio, imagen_url:item.imagen_url, seller_id:item.seller_id??undefined})}
                      title={cart.has(id)?'Quitar del carrito':'Agregar al carrito'}
                      style={{ padding:'12px 14px', borderRadius:11, border:'1.5px solid rgba(255,255,255,.2)', background:cart.has(id)?'rgba(255,255,255,.15)':'transparent', cursor:'pointer', display:'flex', alignItems:'center', color:'#fff', fontSize:12, fontWeight:600, gap:5 }}>
                      🛒 {cart.has(id)?'En carrito':'Agregar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* VENDEDOR */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <p style={{ fontSize:10.5, fontWeight:700, color:'#9aa0aa', textTransform:'uppercase', letterSpacing:.5, margin:0 }}>Vendedor</p>
                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:700, color:'#16a34a' }}>
                  <Shield size={11} /> Verificado
                </span>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
                <div style={{ width:46, height:46, borderRadius:13, background:sColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontWeight:900, fontSize:17, color:'#fff' }}>{sInitial}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  {isReal
                    ? <p style={{ fontWeight:800, fontSize:14.5, color:'#16181d', margin:'0 0 2px' }}>{sNombre}</p>
                    : <Link href={`/d/${mockSeller.slug}`} style={{ fontWeight:800, fontSize:14.5, color:'#16181d', textDecoration:'none' }}>{sNombre}</Link>}
                  <p style={{ fontSize:11, color:'#9aa0aa', margin:0 }}>
                    <span style={{ color:'#facc15' }}>★★★★★</span> {mockSeller.rating} · {mockSeller.reviewCount} reseñas
                  </p>
                </div>
              </div>
              {!isReal && (
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <div style={{ flex:1, textAlign:'center', padding:'8px 6px', background:'#fafafa', borderRadius:9 }}><p style={{ fontSize:13, fontWeight:800, color:'#16181d', margin:0 }}>{mockSeller.totalVentas}</p><p style={{ fontSize:9, fontWeight:500, color:'#9aa0aa', margin:'1px 0 0', textTransform:'uppercase' }}>ventas</p></div>
                  <div style={{ flex:1, textAlign:'center', padding:'8px 6px', background:'#fafafa', borderRadius:9 }}><p style={{ fontSize:13, fontWeight:800, color:'#16181d', margin:0 }}>&lt;1h</p><p style={{ fontSize:9, fontWeight:500, color:'#9aa0aa', margin:'1px 0 0', textTransform:'uppercase' }}>respuesta</p></div>
                  <div style={{ flex:1, textAlign:'center', padding:'8px 6px', background:'#fafafa', borderRadius:9 }}><p style={{ fontSize:13, fontWeight:800, color:'#16181d', margin:0 }}>{mockSeller.fundacion}</p><p style={{ fontSize:9, fontWeight:500, color:'#9aa0aa', margin:'1px 0 0', textTransform:'uppercase' }}>en Componenta</p></div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                {mockSeller.direccion && (
                  <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'#6b7280' }}>
                    <MapPin size={12} color="#9aa0aa" /> {mockSeller.direccion}
                  </div>
                )}
                {mockSeller.horario && (
                  <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:'#6b7280' }}>
                    <Clock size={12} color="#9aa0aa" /> {mockSeller.horario}
                  </div>
                )}
              </div>
              {!isReal && (
                <Link href={`/d/${mockSeller.slug}`}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:9, borderRadius:9, background:'#fafafa', border:'1px solid #ececea', color:'#374151', fontSize:11.5, fontWeight:600, textDecoration:'none' }}>
                  Ver tienda completa <ChevronRight size={13} />
                </Link>
              )}
            </div>

            {/* GARANTÍAS */}
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', padding:16 }}>
              {[
                { icon:Truck,   color:'#2f5fdb', title:'Envío a todo Chile',     sub:'Coordina con el vendedor' },
                { icon:Shield,  color:'#16a34a', title:'Vendedor verificado',    sub:'Revisado por Componenta' },
                { icon:Zap,     color:'#7c3aed', title:'Respuesta rápida',       sub:'WhatsApp directo' },
              ].map(({icon:Icon,color,title,sub})=>(
                <div key={title} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #f9fafb' }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:'#16181d', margin:0 }}>{title}</p>
                    <p style={{ fontSize:11, color:'#9aa0aa', margin:0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIMILARES — reutiliza ProductCard compartido */}
        {similares.length > 0 && (
          <div style={{ marginTop:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#16181d', margin:0, letterSpacing:-.3 }}>Repuestos similares</h2>
              <Link href="/marketplace" style={{ fontSize:13, color:'#2f5fdb', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                Ver todo <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
              {similares.map(sim => {
                const simSeller = mockDesarmaduras.find(d=>d.slug===sim.vendedorSlug) ?? mockDesarmaduras[0]
                const simWaText = encodeURIComponent(`Hola, vi "${sim.pieza}" en Componenta a $${sim.precio.toLocaleString('es-CL')}. ¿Está disponible?`)
                return (
                  <Link key={sim.id} href={`/marketplace/${sim.id}`} style={{ textDecoration:'none' }}>
                    <ProductCard
                      item={sim}
                      sellerNombre={simSeller.nombre}
                      sellerColor={simSeller.color}
                      waLink={`https://wa.me/${simSeller.telefono.replace(/\D/g,'')}?text=${simWaText}`}
                    />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR MÓVIL */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'#fff', borderTop:'1px solid #ececea', padding:'12px 16px', display:'flex', gap:10, alignItems:'center', boxShadow:'0 -6px 20px rgba(0,0,0,.08)' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:11, color:'#9aa0aa', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.pieza}</p>
          <p style={{ fontSize:20, fontWeight:900, color:'#16181d', margin:0, letterSpacing:-.5 }}>${item.precio.toLocaleString('es-CL')}</p>
        </div>
        <a href={`tel:${sTel}`}
          style={{ padding:'13px 14px', borderRadius:12, border:'1.5px solid #ececea', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff' }}>
          <Phone size={18} color="#6b7280" />
        </a>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ flex:1, maxWidth:180, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:13, borderRadius:12, background:'#16a34a', color:'#fff', fontWeight:800, fontSize:14, textDecoration:'none', boxShadow:'0 4px 12px rgba(22,163,74,.3)' }}>
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
