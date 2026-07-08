'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, MessageCircle, ChevronDown, X, Check,
  Car, ChevronRight, Package, SlidersHorizontal, Shield, Truck, Star,
} from 'lucide-react'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CarIllustration from '@/components/consumer/CarIllustration'

/* ─── constantes ─────────────────────────────────────────────── */

const CATS = [
  { id: null,           label: 'Todo' },
  { id: 'motor',        label: 'Motor' },
  { id: 'frenos',       label: 'Frenos' },
  { id: 'suspension-d', label: 'Suspensión' },
  { id: 'electrico',    label: 'Eléctrico' },
  { id: 'transmision',  label: 'Transmisión' },
  { id: 'carroceria',   label: 'Carrocería' },
  { id: 'interior',     label: 'Interior' },
  { id: 'escape',       label: 'Escape' },
]

/* ─── helpers ────────────────────────────────────────────────── */

function normalizeFitment(raw: unknown[]) {
  return (raw ?? []).flatMap((f) => {
    const e = f as Record<string, unknown>
    const make  = ((e.make  as string) || (e.marca  as string) || '').trim()
    const model = ((e.model as string) || (e.modelo as string) || '').trim()
    if (!make || !model) return []
    let yf = (e.yearFrom as number) || 0
    let yt = (e.yearTo   as number) || 0
    if ((!yf || !yt) && e.anios) {
      const s = (e.anios as string).replace('–', '-').replace(/\s/g, '')
      const r = s.match(/^(\d{4})-(\d{4})$/)
      const g = s.match(/^(\d{4})$/)
      yf = r ? +r[1] : g ? +g[1] : 0
      yt = r ? +r[2] : yf
    }
    if (!yf || !yt) return []
    return [{ make, model, yearFrom: yf, yearTo: yt }]
  })
}

function toItem(p: Product) {
  return {
    id: p.id, pieza: p.pieza, marca: p.marca ?? '', modelo: p.modelo ?? '',
    anios: p.anios ?? '', oem: p.oem,
    estado: (p.estado ?? 'bueno') as EstadoPieza,
    precio: p.precio, disponible: p.disponible, zona: 'motor',
    vendedorSlug: 'real',
    sellerNombre: p.seller_nombre ?? 'Vendedor',
    sellerTel: p.seller_telefono ?? null,
    fitment: normalizeFitment(p.fitment ?? []),
    vistas: p.vistas, imagen_url: p.imagen_url, isReal: true,
  }
}

/* ─── MercadoLibre ───────────────────────────────────────────── */

type MlItem = {
  id: string; title: string; price: number; currency: string
  thumbnail: string; permalink: string; condition: string; seller: string
}

function MlCard({ item }: { item: MlItem }) {
  return (
    <a href={item.permalink} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration:'none', display:'flex', flexDirection:'column', background:'#fff', borderRadius:14, border:'2px solid #ffe600', overflow:'hidden', transition:'transform .15s, box-shadow .15s', cursor:'pointer' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px)';el.style.boxShadow='0 8px 24px rgba(255,230,0,.25)'}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='';el.style.boxShadow=''}}>
      <div style={{ background:'#ffe600', padding:'4px 10px', display:'flex', alignItems:'center', gap:6 }}>
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#FFE600"/><path d="M7 14L11.5 9L14 13L16.5 9L21 14L14 21L7 14Z" fill="#2D3277"/></svg>
        <span style={{ fontSize:10, fontWeight:800, color:'#2D3277', letterSpacing:.3 }}>MercadoLibre</span>
        <span style={{ marginLeft:'auto', fontSize:9, fontWeight:600, color:'#2D3277', background:'rgba(45,50,119,.1)', borderRadius:20, padding:'1px 7px' }}>
          {item.condition === 'new' ? 'Nuevo' : 'Usado'}
        </span>
      </div>
      <div style={{ paddingTop:'65%', position:'relative', background:'#f9fafb', flexShrink:0 }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt={item.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:6 }} />
          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Package size={32} color="#d1d5db" />
            </div>}
      </div>
      <div style={{ padding:'11px 13px 13px', flex:1, display:'flex', flexDirection:'column' }}>
        <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:'0 0 8px', lineHeight:1.35,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>
          {item.title}
        </p>
        <p style={{ fontSize:20, fontWeight:900, color:'#111827', margin:'auto 0 10px', letterSpacing:-.5, lineHeight:1 }}>
          ${item.price.toLocaleString('es-CL')}
          <span style={{ fontSize:10, color:'#9ca3af', fontWeight:400, letterSpacing:0, marginLeft:3 }}>CLP</span>
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid #fef9c3' }}>
          <span style={{ fontSize:10, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'55%' }}>{item.seller}</span>
          <span style={{ fontSize:11, fontWeight:700, color:'#2D3277', display:'flex', alignItems:'center', gap:3 }}>
            Ver oferta →
          </span>
        </div>
      </div>
    </a>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function MarketplacePage() {
  const [query,    setQuery]    = useState('')
  const [cat,      setCat]      = useState<string | null>(null)
  const [orden,    setOrden]    = useState('Relevancia')
  const [showOrd,  setShowOrd]  = useState(false)
  const [showVeh,  setShowVeh]  = useState(false)
  const [showFilt, setShowFilt] = useState(false)
  const [items,    setItems]    = useState<ReturnType<typeof toItem>[]>([])
  const [mlItems,      setMlItems]      = useState<MlItem[]>([])
  const [mlLoading,    setMlLoading]    = useState(false)
  const [mlConfigured, setMlConfigured] = useState<boolean | null>(null)
  const [make, setMake] = useState(''); const [model, setModel] = useState(''); const [year, setYear] = useState('')

  useEffect(() => {
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(d => setItems((d.products ?? []).map(toItem)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!query || query.length < 3) { setMlItems([]); return }
    setMlLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/mercadolibre?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(d => { setMlItems(d.items ?? []); setMlConfigured(d.configured ?? false) })
        .catch(() => { setMlItems([]); setMlConfigured(false) })
        .finally(() => setMlLoading(false))
    }, 500)
    return () => clearTimeout(t)
  }, [query])

  const makes  = getAllMakes()
  const models = make  ? getModels(make)        : []
  const years  = model ? getYears(make, model)  : []
  const vSel   = make && model && year
  const yNum   = vSel ? parseInt(year) : 0
  const clrVeh = () => { setMake(''); setModel(''); setYear('') }

  const all = useMemo(() => {
    const src = [
      ...items,
      ...mockInventory.map(i => ({ ...i, imagen_url: i.imagen_url ?? null, isReal: false, sellerNombre: '' as string, sellerTel: null as string | null })),
    ]
    let list = src.filter(i => i.disponible)
      .filter(i => !cat || i.zona === cat)
      .filter(i => {
        const q = query.toLowerCase()
        return !q || i.pieza.toLowerCase().includes(q)
          || i.marca.toLowerCase().includes(q)
          || i.modelo.toLowerCase().includes(q)
          || (i.oem?.toLowerCase().includes(q) ?? false)
      })
    if (vSel) list = [...list].sort((a, b) => {
      const s = (c: string) => c==='compatible'?0:c==='unknown'?1:2
      return s(checkCompatibility(a.fitment, make, model, yNum)) - s(checkCompatibility(b.fitment, make, model, yNum))
    })
    if (orden==='Menor precio') list = [...list].sort((a,b)=>a.precio-b.precio)
    if (orden==='Mayor precio') list = [...list].sort((a,b)=>b.precio-a.precio)
    if (orden==='Más vistas')   list = [...list].sort((a,b)=>b.vistas-a.vistas)
    return list
  }, [query, cat, orden, vSel, make, model, yNum, items])

  const catCount = useMemo(() => {
    const src = [...items, ...mockInventory].filter(i => i.disponible)
    return Object.fromEntries(CATS.slice(1).map(c=>[c.id, src.filter(i=>i.zona===c.id).length]))
  }, [items])

  const sellerOf = (slug: string) => mockDesarmaduras.find(d=>d.slug===slug)
  const inSearch = !!query || cat !== null

  /* ── render ── */
  return (
    <div style={{ minHeight:'100vh', background:'#f7f7f5', fontFamily:'var(--font-geist-sans), system-ui, sans-serif', color:'#16181d', overflowX:'hidden' }}>

      {/* ══ TOPBAR ══ */}
      <div style={{ background:'#16181d', padding:'6px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>Chile · Repuestos usados verificados</span>
        <Link href="/" style={{ fontSize:12, color:'rgba(255,255,255,.8)', fontWeight:600, textDecoration:'none' }}>Panel vendedor →</Link>
      </div>

      {/* ══ HEADER ══ */}
      <header style={{ background:'#fff', borderBottom:'1px solid #ececea', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', gap:20 }}>

          <Link href="/marketplace" style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'#16181d', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16 }}>C</div>
            <div>
              <p style={{ fontWeight:900, fontSize:16, color:'#16181d', margin:0, letterSpacing:-.4 }}>Componenta</p>
              <p style={{ fontSize:9, color:'#9aa0aa', margin:0, textTransform:'uppercase', letterSpacing:.5 }}>Marketplace de repuestos</p>
            </div>
          </Link>

          <div style={{ flex:1, maxWidth:520, display:'flex', alignItems:'center', background:'#f5f5f4', border:'1.5px solid #ececea', borderRadius:10, overflow:'hidden', transition:'border .2s' }}
            onFocusCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='#2f5fdb'}
            onBlurCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='#ececea'}>
            <Search size={15} color="#9aa0aa" style={{ marginLeft:12, flexShrink:0 }} />
            <input
              type="text"
              placeholder="Busca pieza, marca, código OEM…"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              style={{ flex:1, padding:'11px 10px', fontSize:14, border:'none', outline:'none', background:'transparent', color:'#16181d' }}
            />
            {query && <button onPointerDown={()=>setQuery('')} style={{ background:'none', border:'none', padding:'0 10px', cursor:'pointer', color:'#9aa0aa', fontSize:16, lineHeight:1 }}>×</button>}
          </div>

          <button onPointerDown={()=>setShowVeh(true)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', border:`1.5px solid ${vSel?'#2f5fdb':'#ececea'}`, borderRadius:10, background:vSel?'#eef3fc':'#f5f5f4', cursor:'pointer', fontSize:13, fontWeight:600, color:vSel?'#2f5fdb':'#374151', flexShrink:0 }}>
            <Car size={15} color={vSel?'#2f5fdb':'#6b7280'} />
            <span className="hidden sm:inline">{vSel ? `${make} ${year}` : 'Mi vehículo'}</span>
          </button>
        </div>

        <div style={{ borderTop:'1px solid #f5f5f4', overflowX:'auto', scrollbarWidth:'none' } as React.CSSProperties}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', gap:4 }}>
            {CATS.map(c=>(
              <button key={String(c.id)} onPointerDown={()=>setCat(c.id)}
                style={{ border:'none', background:'transparent', padding:'11px 14px', cursor:'pointer', fontSize:12.5, fontWeight:cat===c.id?700:500, whiteSpace:'nowrap', flexShrink:0, color:cat===c.id?'#16181d':'#6b7280', borderBottom:`2px solid ${cat===c.id?'#16181d':'transparent'}`, transition:'all .15s' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ══ HERO — vehículo primero, solo cuando no hay búsqueda activa ══ */}
      {!inSearch && (
        <>
          <div style={{ background:'#16181d', width:'100%', overflow:'hidden' }}>
          <section className="hero-grid" style={{ padding:'40px 20px', display:'grid', gridTemplateColumns:'1fr minmax(300px,420px)', gap:32, alignItems:'center', maxWidth:1280, margin:'0 auto' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.75)', marginBottom:18 }}>
                Más de {mockInventory.length + items.length} repuestos disponibles hoy
              </div>
              <h1 style={{ fontSize:38, fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.15, letterSpacing:-1 }}>
                Repuestos que calzan<br />con tu auto, garantizado
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.55)', margin:'0 0 26px', lineHeight:1.7, maxWidth:440 }}>
                Ingresa marca, modelo y año una vez — filtramos automáticamente cada pieza compatible en todas las desarmadurías de Componenta.
              </p>
              <div style={{ display:'flex', gap:22, flexWrap:'wrap' }}>
                <span style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,.65)' }}><Shield size={14} color="#fff" /> Vendedores verificados</span>
                <span style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,.65)' }}><Truck size={14} color="#fff" /> Envío a todo Chile</span>
                <span style={{ display:'flex', alignItems:'center', gap:7, fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,.65)' }}><Star size={14} color="#fff" /> 4.6 promedio vendedores</span>
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 20px 50px rgba(0,0,0,.35)' }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#16181d', margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                <Car size={15} color="#2f5fdb" /> Encuentra piezas para tu vehículo
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                <select value={make} onChange={e=>{setMake(e.target.value);setModel('');setYear('')}}
                  style={{ padding:'11px 12px', borderRadius:9, border:'1.5px solid #ececea', fontSize:13.5, color:'#16181d', background:'#fafafa' }}>
                  <option value="">Selecciona marca</option>
                  {makes.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <select value={model} onChange={e=>{setModel(e.target.value);setYear('')}} disabled={!make}
                  style={{ padding:'11px 12px', borderRadius:9, border:'1.5px solid #ececea', fontSize:13.5, color:'#16181d', background:'#fafafa', opacity:!make?.5:1 }}>
                  <option value="">Selecciona modelo</option>
                  {models.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <select value={year} onChange={e=>setYear(e.target.value)} disabled={!model}
                  style={{ padding:'11px 12px', borderRadius:9, border:'1.5px solid #ececea', fontSize:13.5, color:'#16181d', background:'#fafafa', opacity:!model?.5:1 }}>
                  <option value="">Selecciona año</option>
                  {years.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {vSel && (
                <button onPointerDown={clrVeh} style={{ width:'100%', marginTop:10, padding:9, borderRadius:9, border:'1.5px solid #fca5a5', background:'#fff5f5', color:'#b91c1c', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  Quitar vehículo seleccionado
                </button>
              )}

              <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #f1f2f4' }}>
                <p style={{ fontSize:11, fontWeight:600, color:'#9aa0aa', margin:'0 0 6px', textAlign:'center' }}>o elige la zona del repuesto en el auto</p>
                <CarIllustration
                  theme="light"
                  accentColor="#2f5fdb"
                  selectedZone={cat}
                  onZoneSelect={(id) => {
                    const target = id === 'suspension-t' ? 'suspension-d' : id
                    if (CATS.some(c => c.id === target)) {
                      setCat(cat === target ? null : target)
                      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* tags populares */}
          <div style={{ padding:'0 20px 36px', display:'flex', justifyContent:'center' }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', maxWidth:700 }}>
              {['Amortiguador','Alternador','Disco de freno','Radiador','Caja de cambios','Embrague'].map(t=>(
                <button key={t} onPointerDown={()=>{setQuery(t);document.getElementById('results')?.scrollIntoView({behavior:'smooth'})}}
                  style={{ padding:'5px 14px', borderRadius:20, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.8)', fontSize:12, cursor:'pointer', fontWeight:500 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          </div>{/* /dark wrapper */}

          {/* ── desarmadurías ── */}
          <section style={{ background:'#f7f7f5', padding:'40px 24px', borderBottom:'1px solid #ececea' }}>
            <div style={{ maxWidth:1280, margin:'0 auto' }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#16181d', margin:'0 0 20px', letterSpacing:-.3 }}>Desarmadurías en Componenta</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14 }}>
                {mockDesarmaduras.map(d=>(
                  <Link key={d.id} href={`/d/${d.slug}`} style={{ textDecoration:'none' }}>
                    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #ececea', overflow:'hidden', transition:'all .2s' }}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='0 6px 20px rgba(0,0,0,.08)';el.style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='';el.style.transform=''}}>
                      <div style={{ height:64, position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${d.color}dd,${d.color}99)` }}>
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <div style={{ width:38, height:38, background:'rgba(255,255,255,.2)', border:'2px solid rgba(255,255,255,.5)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:15 }}>
                            {d.nombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding:'10px 12px 12px' }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nombre}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:8 }}>
                          {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:11, color:s<=Math.round(d.rating)?'#d97706':'#ececea' }}>★</span>)}
                          <span style={{ fontSize:11, color:'#9aa0aa', marginLeft:3 }}>{d.rating}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontSize:11, color:'#2f5fdb', fontWeight:600 }}>Ver tienda</span>
                          <ChevronRight size={13} color="#9aa0aa" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── trust ── */}
          <section style={{ background:'#fff', borderBottom:'1px solid #ececea', padding:'24px' }}>
            <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:0 }}>
              {[
                { Icon: Shield, title:'Vendedores verificados', sub:'Revisados por el equipo Componenta' },
                { Icon: Truck,  title:'Envío a todo Chile',     sub:'Desde la desarmaduria hasta tu puerta' },
                { Icon: MessageCircle, title:'Contacto directo', sub:'Sin intermediarios, WhatsApp al instante' },
                { Icon: Check,  title:'Piezas revisadas',       sub:'Estado certificado antes de publicar' },
              ].map(({Icon,title,sub})=>(
                <div key={title} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 24px' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'#f5f5f4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={17} color="#2f5fdb" />
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:0 }}>{title}</p>
                    <p style={{ fontSize:11, color:'#9aa0aa', margin:0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══ RESULTADOS ══ */}
      <div id="results" className="mp-results-row" style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px 80px', display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* sidebar */}
        <aside className="mp-aside" style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:12, position:'sticky', top:80 }}>

          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ececea', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 }}>
              <Car size={13} color="#2f5fdb" /> Filtrar por auto
            </p>
            {vSel
              ? <div>
                  <div style={{ background:'#eef3fc', border:'1px solid #d7e3f7', borderRadius:8, padding:'8px 11px', marginBottom:8 }}>
                    <p style={{ fontWeight:700, color:'#2f5fdb', fontSize:13, margin:0 }}>{make} {model}</p>
                    <p style={{ color:'#5b7fd8', fontSize:11, margin:'2px 0 0' }}>Año {year}</p>
                  </div>
                  <button onPointerDown={clrVeh} style={{ width:'100%', padding:'7px', borderRadius:8, border:'1px solid #ececea', background:'#fff', color:'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    Cambiar vehículo
                  </button>
                </div>
              : <button onPointerDown={()=>setShowVeh(true)}
                  style={{ width:'100%', padding:'10px', borderRadius:9, border:'none', background:'#16181d', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  <Car size={13} /> Seleccionar vehículo
                </button>}
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ececea', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px' }}>Categorías</p>
            {CATS.map(c=>(
              <button key={String(c.id)} onPointerDown={()=>setCat(c.id)}
                style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:13, marginBottom:1, display:'flex', alignItems:'center', justifyContent:'space-between', background:cat===c.id?'#eef3fc':'transparent', color:cat===c.id?'#2f5fdb':'#374151', fontWeight:cat===c.id?700:400 }}>
                <span>{c.label}</span>
                {c.id!==null && <span style={{ fontSize:10, color:'#9aa0aa', background:'#f5f5f4', padding:'1px 6px', borderRadius:20 }}>{catCount[c.id as string]??0}</span>}
              </button>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ececea', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px' }}>Vendedores</p>
            {mockDesarmaduras.map(d=>(
              <Link key={d.id} href={`/d/${d.slug}`} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 4px', borderRadius:7, textDecoration:'none', marginBottom:2 }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafafa'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=''}>
                <div style={{ width:26, height:26, borderRadius:7, background:d.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:900, flexShrink:0 }}>
                  {d.nombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#16181d', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nombre}</p>
                  <p style={{ fontSize:10, color:'#9aa0aa', margin:0 }}>★ {d.rating}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* main */}
        <div style={{ flex:1, minWidth:0 }}>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#16181d', margin:0, letterSpacing:-.3 }}>
                {cat ? CATS.find(c=>c.id===cat)?.label : query ? `Resultados para "${query}"` : vSel ? `Compatible con tu ${make} ${model} ${year}` : 'Todos los repuestos'}
              </h2>
              <span style={{ fontSize:13, color:'#9aa0aa' }}>{all.length} piezas</span>
              {(cat||query||vSel) &&
                <button onPointerDown={()=>{setCat(null);setQuery('');clrVeh()}}
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:'#fff5f5', border:'1px solid #fca5a5', color:'#b91c1c', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                  <X size={10} /> Limpiar
                </button>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button onPointerDown={()=>setShowFilt(true)} className="sm:hidden"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:'1.5px solid #ececea', background:'#fff', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <SlidersHorizontal size={13} /> Filtrar
              </button>
              <div style={{ position:'relative' }}>
                <button onPointerDown={()=>setShowOrd(v=>!v)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:'1px solid #ececea', background:'#fff', fontSize:13, color:'#374151', cursor:'pointer', fontWeight:500 }}>
                  {orden} <ChevronDown size={13} color="#9aa0aa" />
                </button>
                {showOrd &&
                  <div style={{ position:'absolute', top:'110%', right:0, background:'#fff', border:'1px solid #ececea', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.10)', zIndex:30, minWidth:160, overflow:'hidden' }}>
                    {['Relevancia','Menor precio','Mayor precio','Más vistas'].map(op=>(
                      <button key={op} onPointerDown={()=>{setOrden(op);setShowOrd(false)}}
                        style={{ width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:orden===op?'#eef3fc':'#fff', color:orden===op?'#2f5fdb':'#374151', fontSize:13, fontWeight:orden===op?700:400, cursor:'pointer' }}>
                        {op}
                      </button>
                    ))}
                  </div>}
              </div>
            </div>
          </div>

          {all.length===0
            ? <div style={{ background:'#fff', borderRadius:16, padding:'60px 24px', textAlign:'center', border:'1px solid #ececea' }}>
                <Package size={40} color="#d1d5db" style={{ margin:'0 auto 12px', display:'block' }} />
                <p style={{ fontSize:16, fontWeight:700, color:'#16181d', margin:'0 0 6px' }}>Sin resultados en Componenta</p>
                <p style={{ fontSize:14, color:'#9aa0aa', margin:'0 0 20px' }}>Prueba con otro término o mira los resultados de MercadoLibre abajo</p>
                <button onPointerDown={()=>{setQuery('');setCat(null)}} style={{ padding:'10px 22px', borderRadius:10, background:'#16181d', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>Ver todo</button>
              </div>
            : <div className="mp-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
                {all.map(item=>{
                  const ri = item as { isReal?:boolean; sellerNombre?:string; sellerTel?:string|null }
                  const isReal       = ri.isReal ?? false
                  const mock         = isReal ? null : sellerOf(item.vendedorSlug)
                  const sNombre      = isReal ? (ri.sellerNombre??'Vendedor') : (mock?.nombre??'Vendedor')
                  const sTel         = isReal ? (ri.sellerTel??'56912345678') : (mock?.telefono??'56912345678')
                  const sColor       = isReal ? '#2f5fdb' : (mock?.color??'#6b7280')
                  const compat       = vSel ? checkCompatibility(item.fitment, make, model, yNum)==='compatible' : false
                  const wa           = `https://wa.me/${sTel.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola, vi "${item.pieza}" en Componenta. ¿Está disponible?`)}`
                  return (
                    <ProductCard key={item.id} item={item} sellerNombre={sNombre} sellerColor={sColor} compatible={compat} waLink={wa}
                      onClick={()=>window.location.href=`/marketplace/${item.id}`} />
                  )
                })}
              </div>}

          {/* ── Sección MercadoLibre ── */}
          {query.length >= 3 && (mlLoading || mlItems.length > 0 || mlConfigured === false) && (
            <div style={{ marginTop:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, background:'#ffe600', borderRadius:10, padding:'7px 14px' }}>
                  <svg width="16" height="16" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#FFE600"/><path d="M7 14L11.5 9L14 13L16.5 9L21 14L14 21L7 14Z" fill="#2D3277"/></svg>
                  <span style={{ fontSize:13, fontWeight:800, color:'#2D3277', letterSpacing:.2 }}>MercadoLibre</span>
                </div>
                <div>
                  <span style={{ fontSize:15, fontWeight:700, color:'#16181d' }}>También encontramos</span>
                  <span style={{ fontSize:13, color:'#9aa0aa', marginLeft:6 }}>Haz clic para ver en MercadoLibre</span>
                </div>
              </div>

              {mlConfigured === false
                ? <div style={{ background:'#fffbeb', border:'2px dashed #fcd34d', borderRadius:14, padding:'22px 24px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
                    <div style={{ background:'#ffe600', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#FFE600"/><path d="M7 14L11.5 9L14 13L16.5 9L21 14L14 21L7 14Z" fill="#2D3277"/></svg>
                      <span style={{ fontSize:14, fontWeight:800, color:'#2D3277' }}>MercadoLibre</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:14, color:'#92400e', margin:'0 0 4px' }}>Conecta MercadoLibre para mostrar productos aquí</p>
                      <p style={{ fontSize:12, color:'#b45309', margin:0 }}>
                        1. Regístrate gratis en{' '}
                        <a href="https://developers.mercadolibre.cl" target="_blank" rel="noopener noreferrer" style={{ color:'#2f5fdb', fontWeight:600 }}>developers.mercadolibre.cl</a>
                        {' '}→ crea una app → copia <strong>APP_ID</strong> y <strong>SECRET_KEY</strong>
                        <br />2. Agrégalos en Vercel → Settings → Environment Variables: <code style={{ background:'#fef3c7', padding:'1px 5px', borderRadius:4 }}>ML_APP_ID</code> y <code style={{ background:'#fef3c7', padding:'1px 5px', borderRadius:4 }}>ML_SECRET_KEY</code>
                        <br />3. Redeploy y listo.
                      </p>
                    </div>
                  </div>
                : mlLoading
                ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{ background:'#fff', borderRadius:12, border:'2px solid #fef9c3', overflow:'hidden', height:280 }}>
                        <div style={{ background:'#ffe600', height:26 }} />
                        <div style={{ padding:12 }}>
                          <div style={{ background:'#f3f4f6', borderRadius:8, height:120, marginBottom:10 }} />
                          <div style={{ background:'#f3f4f6', borderRadius:6, height:12, marginBottom:6, width:'80%' }} />
                          <div style={{ background:'#f3f4f6', borderRadius:6, height:12, width:'50%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
                    {mlItems.map(item=><MlCard key={item.id} item={item} />)}
                  </div>}
            </div>
          )}
        </div>
      </div>

      {/* ── modal vehículo ── */}
      {showVeh &&
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>setShowVeh(false)}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, maxWidth:420, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,.2)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <p style={{ fontWeight:800, fontSize:16, color:'#16181d', margin:0 }}>Busca por tu vehículo</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:'4px 0 0' }}>Filtra piezas compatibles</p>
              </div>
              <button onPointerDown={()=>setShowVeh(false)} style={{ background:'#f5f5f4', border:'none', borderRadius:8, padding:8, cursor:'pointer' }}><X size={16} color="#6b7280" /></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {val:make, set:(v:string)=>{setMake(v);setModel('');setYear('')}, opts:makes, label:'Marca', dis:false},
                {val:model, set:(v:string)=>{setModel(v);setYear('')}, opts:models, label:'Modelo', dis:!make},
                {val:year,  set:(v:string)=>{setYear(v);setShowVeh(false)}, opts:years, label:'Año', dis:!model},
              ].map(({val,set,opts,label,dis})=>(
                <select key={label} value={val} onChange={e=>set(e.target.value)} disabled={dis}
                  style={{ padding:'11px 14px', borderRadius:10, border:'1.5px solid #ececea', fontSize:14, outline:'none', background:'#fff', color:'#16181d', opacity:dis?.5:1 }}>
                  <option value="">Selecciona {label.toLowerCase()}</option>
                  {opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
            {vSel && <button onPointerDown={()=>{clrVeh();setShowVeh(false)}} style={{ marginTop:12, width:'100%', padding:10, borderRadius:10, border:'1.5px solid #fca5a5', background:'#fff5f5', color:'#b91c1c', fontSize:13, fontWeight:600, cursor:'pointer' }}>Quitar filtro de vehículo</button>}
          </div>
        </div>}

      {/* ── filtros móvil ── */}
      {showFilt &&
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'flex-end' }} onClick={()=>setShowFilt(false)}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px', width:'100%', maxHeight:'85vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ fontSize:16, fontWeight:800, color:'#16181d' }}>Filtros</span>
              <button onPointerDown={()=>setShowFilt(false)} style={{ background:'#f5f5f4', border:'none', borderRadius:8, padding:'6px 10px', color:'#6b7280', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 10px' }}>Categoría</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {CATS.map(c=>(
                <button key={String(c.id)} onPointerDown={()=>{setCat(c.id);setShowFilt(false)}}
                  style={{ padding:'10px 12px', borderRadius:10, border:`1.5px solid ${cat===c.id?'#2f5fdb':'#ececea'}`, background:cat===c.id?'#eef3fc':'#fff', color:cat===c.id?'#2f5fdb':'#374151', fontSize:12, fontWeight:cat===c.id?700:500, cursor:'pointer', textAlign:'left' }}>
                  {c.label}
                </button>
              ))}
            </div>
            {(cat||vSel) && <button onPointerDown={()=>{setCat(null);clrVeh();setShowFilt(false)}} style={{ marginTop:16, width:'100%', padding:12, borderRadius:10, border:'1.5px solid #fca5a5', background:'#fff5f5', color:'#b91c1c', fontSize:13, fontWeight:700, cursor:'pointer' }}>Limpiar filtros</button>}
          </div>
        </div>}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width:700px){
          .hero-grid{grid-template-columns:1fr !important;padding:28px 16px 0 !important;gap:20px !important}
          .mp-aside{display:none !important}
          .mp-results-row{flex-direction:column !important;padding:16px 14px 80px !important}
          .mp-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr)) !important}
        }
      ` }} />
    </div>
  )
}
