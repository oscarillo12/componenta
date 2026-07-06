'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, MessageCircle, ChevronDown, X, Check,
  Car, ChevronRight, Package, SlidersHorizontal,
  Star, MapPin, Shield, Zap, ArrowRight
} from 'lucide-react'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'

/* ─── constantes ─────────────────────────────────────────────── */

const CATS = [
  { id: null,           label: 'Todo',        icon: '🔍' },
  { id: 'motor',        label: 'Motor',       icon: '⚙️' },
  { id: 'frenos',       label: 'Frenos',      icon: '🛑' },
  { id: 'suspension-d', label: 'Suspensión',  icon: '🔩' },
  { id: 'electrico',    label: 'Eléctrico',   icon: '⚡' },
  { id: 'transmision',  label: 'Transmisión', icon: '🔧' },
  { id: 'carroceria',   label: 'Carrocería',  icon: '🚘' },
  { id: 'interior',     label: 'Interior',    icon: '🪑' },
  { id: 'escape',       label: 'Escape',      icon: '💨' },
]

const ESTADO: Record<EstadoPieza, { label: string; dot: string }> = {
  excelente:      { label: 'Excelente',    dot: '#16a34a' },
  bueno:          { label: 'Buen estado',  dot: '#2563eb' },
  'con-detalles': { label: 'Con detalles', dot: '#d97706' },
  'para-reparar': { label: 'Para reparar', dot: '#dc2626' },
}

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

/* ─── ProductCard ─────────────────────────────────────────────── */

function ProductCard({ item, compat, sellerNombre, sellerTel, sellerColor }: {
  item: ReturnType<typeof toItem>
  compat: string | null
  sellerNombre: string
  sellerTel: string
  sellerColor: string
}) {
  const est = ESTADO[item.estado]
  const wa  = `https://wa.me/${sellerTel.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi "${item.pieza}" en Componenta. ¿Está disponible?`)}`

  return (
    <article
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,.10)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
      onClick={() => window.location.href = `/marketplace/${item.id}`}
    >
      {/* imagen */}
      <div style={{ position: 'relative', paddingTop: '65%', background: '#f3f4f6', flexShrink: 0 }}>
        {item.imagen_url
          ? <img src={item.imagen_url} alt={item.pieza}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 42, opacity: .2 }}>
                {{ motor:'⚙️', frenos:'🛑', 'suspension-d':'🔩', electrico:'⚡', transmision:'🔧', carroceria:'🚘', interior:'🪑', escape:'💨' }[item.zona] ?? '🔧'}
              </span>
            </div>
        }

        {/* compat pill */}
        {compat === 'compatible' &&
          <span style={{ position:'absolute', top:8, left:8, background:'#16a34a', color:'#fff', fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
            <Check size={8} /> Compatible
          </span>}

        {/* estado dot */}
        <span style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,.9)', border:'1px solid #e5e7eb', borderRadius:20, padding:'3px 8px', fontSize:10, fontWeight:600, color:'#374151' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:est.dot, flexShrink:0, display:'inline-block' }} />
          {est.label}
        </span>
      </div>

      {/* body */}
      <div style={{ padding:'12px 13px 14px', flex:1, display:'flex', flexDirection:'column' }}>
        {/* marca / modelo */}
        <p style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 4px' }}>
          {item.marca}{item.modelo ? ` · ${item.modelo}` : ''}{item.anios ? ` · ${item.anios}` : ''}
        </p>

        {/* nombre */}
        <p style={{
          fontSize:13, fontWeight:600, color:'#111827', lineHeight:1.35,
          margin:'0 0 8px', minHeight:36,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        } as React.CSSProperties}>
          {item.pieza}
        </p>

        {/* OEM */}
        {item.oem &&
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:6, padding:'2px 7px', fontSize:9, fontWeight:700, color:'#0369a1', width:'fit-content', marginBottom:8 }}>
            OEM {item.oem}
          </span>}

        {/* precio */}
        <p style={{ fontSize:22, fontWeight:900, color:'#111827', letterSpacing:-1, margin:'auto 0 10px', lineHeight:1 }}>
          ${item.precio.toLocaleString('es-CL')}
          <span style={{ fontSize:11, fontWeight:500, color:'#9ca3af', letterSpacing:0, marginLeft:3 }}>CLP</span>
        </p>

        {/* vendedor */}
        <div style={{ display:'flex', alignItems:'center', gap:6, paddingTop:10, borderTop:'1px solid #f3f4f6', marginBottom:10 }}>
          <div style={{ width:20, height:20, borderRadius:6, background:sellerColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9, fontWeight:900, flexShrink:0 }}>
            {sellerNombre[0].toUpperCase()}
          </div>
          <span style={{ fontSize:11, color:'#6b7280', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {sellerNombre}
          </span>
        </div>

        {/* CTA */}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={ev => ev.stopPropagation()}
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            padding:'10px 0', borderRadius:10,
            background:'#16a34a', color:'#fff', fontWeight:700, fontSize:12,
            textDecoration:'none', letterSpacing:.1,
          }}
        >
          <MessageCircle size={14} /> Consultar por WhatsApp
        </a>
      </div>
    </article>
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
  const [make, setMake] = useState(''); const [model, setModel] = useState(''); const [year, setYear] = useState('')

  useEffect(() => {
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(d => setItems((d.products ?? []).map(toItem)))
      .catch(() => {})
  }, [])

  const makes  = getAllMakes()
  const models = make  ? getModels(make)        : []
  const years  = model ? getYears(make, model)  : []
  const vSel   = make && model && year
  const yNum   = vSel ? parseInt(year) : 0
  const clrVeh = () => { setMake(''); setModel(''); setYear('') }

  const all = useMemo(() => {
    const src = [
      ...items,
      ...mockInventory.map(i => ({ ...i, isReal: false, sellerNombre: undefined as string | undefined, sellerTel: null as string | null })),
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
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:"'Inter',system-ui,sans-serif", color:'#111827' }}>

      {/* ══ TOPBAR ══ */}
      <div style={{ background:'#1e293b', padding:'6px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>🇨🇱 Chile · Repuestos usados verificados</span>
        <Link href="/" style={{ fontSize:12, color:'#60a5fa', fontWeight:600, textDecoration:'none' }}>Panel vendedor →</Link>
      </div>

      {/* ══ HEADER ══ */}
      <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', gap:20 }}>

          {/* logo */}
          <Link href="/marketplace" style={{ textDecoration:'none', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18 }}>C</div>
            <div>
              <p style={{ fontWeight:900, fontSize:16, color:'#111827', margin:0, letterSpacing:-.4 }}>Componenta</p>
              <p style={{ fontSize:9, color:'#9ca3af', margin:0, textTransform:'uppercase', letterSpacing:.5 }}>Marketplace de repuestos</p>
            </div>
          </Link>

          {/* buscador */}
          <div style={{ flex:1, maxWidth:520, display:'flex', alignItems:'center', background:'#f3f4f6', border:'1.5px solid #e5e7eb', borderRadius:10, overflow:'hidden', transition:'border .2s' }}
            onFocusCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='#1d4ed8'}
            onBlurCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'}>
            <Search size={15} color="#9ca3af" style={{ marginLeft:12, flexShrink:0 }} />
            <input
              type="text"
              placeholder="Busca pieza, marca, código OEM…"
              value={query}
              onChange={e=>setQuery(e.target.value)}
              style={{ flex:1, padding:'11px 10px', fontSize:14, border:'none', outline:'none', background:'transparent', color:'#111827' }}
            />
            {query && <button onPointerDown={()=>setQuery('')} style={{ background:'none', border:'none', padding:'0 10px', cursor:'pointer', color:'#9ca3af', fontSize:16, lineHeight:1 }}>×</button>}
          </div>

          {/* vehiculo */}
          <button onPointerDown={()=>setShowVeh(true)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', border:`1.5px solid ${vSel?'#1d4ed8':'#e5e7eb'}`, borderRadius:10, background:vSel?'#eff6ff':'#f9fafb', cursor:'pointer', fontSize:13, fontWeight:600, color:vSel?'#1d4ed8':'#374151', flexShrink:0 }}>
            <Car size={15} color={vSel?'#1d4ed8':'#6b7280'} />
            <span className="hidden sm:inline">{vSel ? `${make} ${year}` : 'Mi vehículo'}</span>
          </button>
        </div>

        {/* nav categorías */}
        <div style={{ borderTop:'1px solid #f3f4f6', overflowX:'auto', scrollbarWidth:'none' } as React.CSSProperties}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', gap:2 }}>
            {CATS.map(c=>(
              <button key={String(c.id)} onPointerDown={()=>setCat(c.id)}
                style={{ border:'none', background:'transparent', padding:'10px 14px', cursor:'pointer', fontSize:13, fontWeight:cat===c.id?700:500, whiteSpace:'nowrap', flexShrink:0, color:cat===c.id?'#1d4ed8':'#6b7280', borderBottom:`2px solid ${cat===c.id?'#1d4ed8':'transparent'}`, transition:'all .15s' }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ══ HERO — solo cuando no hay búsqueda activa ══ */}
      {!inSearch && (
        <>
          <section style={{ background:'linear-gradient(130deg,#0f172a 0%,#1e3a5f 55%,#1e40af 100%)', padding:'56px 24px 64px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, borderRadius:'50%', background:'rgba(59,130,246,.12)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-40, left:'25%', width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }} />

            <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,.75)', marginBottom:20 }}>
                <Zap size={11} color="#60a5fa" /> Más de {mockInventory.length + items.length} repuestos disponibles hoy
              </div>
              <h1 style={{ fontSize:42, fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.1, letterSpacing:-1.5 }}>
                Encuentra el repuesto<br />que necesitas, hoy
              </h1>
              <p style={{ fontSize:16, color:'rgba(255,255,255,.6)', margin:'0 0 36px', lineHeight:1.7 }}>
                Conectamos compradores con desarmadurías verificadas de todo Chile.<br />Contacto directo por WhatsApp, sin intermediarios.
              </p>

              {/* buscador hero */}
              <div style={{ display:'flex', maxWidth:580, margin:'0 auto 20px', background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,.3)' }}>
                <input
                  type="text"
                  placeholder="Ej: amortiguador Corolla, pastillas freno, alternador…"
                  defaultValue=""
                  onKeyDown={e=>{ if(e.key==='Enter'&&(e.target as HTMLInputElement).value) { setQuery((e.target as HTMLInputElement).value); document.getElementById('results')?.scrollIntoView({behavior:'smooth'}) } }}
                  style={{ flex:1, padding:'16px 20px', fontSize:15, border:'none', outline:'none', color:'#111827' }}
                />
                <button
                  onPointerDown={e=>{ const inp=e.currentTarget.previousElementSibling as HTMLInputElement; if(inp?.value){setQuery(inp.value);document.getElementById('results')?.scrollIntoView({behavior:'smooth'})} }}
                  style={{ background:'#1d4ed8', padding:'0 24px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, color:'#fff', fontWeight:700, fontSize:14, flexShrink:0 }}>
                  <Search size={16} /> Buscar
                </button>
              </div>

              {/* tags populares */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                {['Amortiguador','Alternador','Disco de freno','Radiador','Caja de cambios','Embrague'].map(t=>(
                  <button key={t} onPointerDown={()=>{setQuery(t);document.getElementById('results')?.scrollIntoView({behavior:'smooth'})}}
                    style={{ padding:'5px 14px', borderRadius:20, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.8)', fontSize:12, cursor:'pointer', fontWeight:500 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </section>


          {/* ── desarmadurías ── */}
          <section style={{ background:'#f8f9fa', padding:'40px 24px', borderBottom:'1px solid #e5e7eb' }}>
            <div style={{ maxWidth:1280, margin:'0 auto' }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#111827', margin:'0 0 20px', letterSpacing:-.3 }}>Desarmadurías en Componenta</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14 }}>
                {mockDesarmaduras.map(d=>(
                  <Link key={d.id} href={`/d/${d.slug}`} style={{ textDecoration:'none' }}>
                    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', overflow:'hidden', transition:'all .2s' }}
                      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='0 6px 20px rgba(0,0,0,.08)';el.style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.boxShadow='';el.style.transform=''}}>
                      <div style={{ height:54, background:`linear-gradient(135deg,${d.color}dd,${d.color}88)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:40, height:40, background:'rgba(255,255,255,.25)', border:'2px solid rgba(255,255,255,.5)', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:16 }}>
                          {d.nombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}
                        </div>
                      </div>
                      <div style={{ padding:'10px 12px 12px' }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nombre}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:8 }}>
                          {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:11, color:s<=Math.round(d.rating)?'#facc15':'#e5e7eb' }}>★</span>)}
                          <span style={{ fontSize:11, color:'#9ca3af', marginLeft:3 }}>{d.rating}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontSize:11, color:'#1d4ed8', fontWeight:600 }}>Ver tienda</span>
                          <ChevronRight size={13} color="#9ca3af" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ── trust ── */}
          <section style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'24px' }}>
            <div style={{ maxWidth:1280, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:0 }}>
              {[
                { icon:'🛡️', title:'Vendedores verificados',  sub:'Revisados por el equipo Componenta' },
                { icon:'🚚', title:'Envío a todo Chile',       sub:'Desde la desarmaduria hasta tu puerta' },
                { icon:'💬', title:'Contacto directo',         sub:'Sin intermediarios, WhatsApp al instante' },
                { icon:'🔧', title:'Piezas revisadas',         sub:'Estado certificado antes de publicar' },
              ].map(({icon,title,sub},i)=>(
                <div key={title} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 24px', borderRight:i<3?'1px solid #f3f4f6':'none' }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>{title}</p>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ══ RESULTADOS ══ */}
      <div id="results" style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px 80px', display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* sidebar */}
        <aside className="mp-aside" style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:12, position:'sticky', top:80 }}>

          {/* vehículo */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 }}>
              <Car size={13} color="#1d4ed8" /> Filtrar por auto
            </p>
            {vSel
              ? <div>
                  <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'8px 11px', marginBottom:8 }}>
                    <p style={{ fontWeight:700, color:'#1d4ed8', fontSize:13, margin:0 }}>{make} {model}</p>
                    <p style={{ color:'#3b82f6', fontSize:11, margin:'2px 0 0' }}>Año {year}</p>
                  </div>
                  <button onPointerDown={clrVeh} style={{ width:'100%', padding:'7px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    Cambiar vehículo
                  </button>
                </div>
              : <button onPointerDown={()=>setShowVeh(true)}
                  style={{ width:'100%', padding:'10px', borderRadius:9, border:'none', background:'#1d4ed8', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  <Car size={13} /> Seleccionar vehículo
                </button>}
          </div>

          {/* categorías */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px' }}>Categorías</p>
            {CATS.map(c=>(
              <button key={String(c.id)} onPointerDown={()=>setCat(c.id)}
                style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:13, marginBottom:1, display:'flex', alignItems:'center', justifyContent:'space-between', background:cat===c.id?'#eff6ff':'transparent', color:cat===c.id?'#1d4ed8':'#374151', fontWeight:cat===c.id?700:400 }}>
                <span>{c.icon} {c.label}</span>
                {c.id!==null && <span style={{ fontSize:10, color:'#9ca3af', background:'#f3f4f6', padding:'1px 6px', borderRadius:20 }}>{catCount[c.id as string]??0}</span>}
              </button>
            ))}
          </div>

          {/* vendedores */}
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:16 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 10px' }}>Vendedores</p>
            {mockDesarmaduras.map(d=>(
              <Link key={d.id} href={`/d/${d.slug}`} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 4px', borderRadius:7, textDecoration:'none', marginBottom:2 }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f9fafb'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=''}>
                <div style={{ width:26, height:26, borderRadius:7, background:d.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:900, flexShrink:0 }}>
                  {d.nombre.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nombre}</p>
                  <p style={{ fontSize:10, color:'#9ca3af', margin:0 }}>★ {d.rating}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* main */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#111827', margin:0, letterSpacing:-.3 }}>
                {cat ? CATS.find(c=>c.id===cat)?.label : query ? `Resultados para "${query}"` : 'Todos los repuestos'}
              </h2>
              <span style={{ fontSize:13, color:'#9ca3af' }}>{all.length} piezas</span>
              {(cat||query||vSel) &&
                <button onPointerDown={()=>{setCat(null);setQuery('');clrVeh()}}
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:'#fff5f5', border:'1px solid #fca5a5', color:'#b91c1c', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                  <X size={10} /> Limpiar
                </button>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button onPointerDown={()=>setShowFilt(true)} className="sm:hidden"
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <SlidersHorizontal size={13} /> Filtrar
              </button>
              <div style={{ position:'relative' }}>
                <button onPointerDown={()=>setShowOrd(v=>!v)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, color:'#374151', cursor:'pointer', fontWeight:500 }}>
                  {orden} <ChevronDown size={13} color="#9ca3af" />
                </button>
                {showOrd &&
                  <div style={{ position:'absolute', top:'110%', right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.10)', zIndex:30, minWidth:160, overflow:'hidden' }}>
                    {['Relevancia','Menor precio','Mayor precio','Más vistas'].map(op=>(
                      <button key={op} onPointerDown={()=>{setOrden(op);setShowOrd(false)}}
                        style={{ width:'100%', textAlign:'left', padding:'10px 14px', border:'none', background:orden===op?'#eff6ff':'#fff', color:orden===op?'#1d4ed8':'#374151', fontSize:13, fontWeight:orden===op?700:400, cursor:'pointer' }}>
                        {op}
                      </button>
                    ))}
                  </div>}
              </div>
            </div>
          </div>

          {all.length===0
            ? <div style={{ background:'#fff', borderRadius:16, padding:'60px 24px', textAlign:'center', border:'1px solid #e5e7eb' }}>
                <Package size={40} color="#d1d5db" style={{ margin:'0 auto 12px', display:'block' }} />
                <p style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>Sin resultados</p>
                <p style={{ fontSize:14, color:'#9ca3af', margin:'0 0 20px' }}>Prueba con otro término o categoría</p>
                <button onPointerDown={()=>{setQuery('');setCat(null)}} style={{ padding:'10px 22px', borderRadius:10, background:'#1d4ed8', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>Ver todo</button>
              </div>
            : <div className="mp-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
                {all.map(item=>{
                  const ri = item as { isReal?:boolean; sellerNombre?:string; sellerTel?:string|null }
                  const isReal       = ri.isReal ?? false
                  const mock         = isReal ? null : sellerOf(item.vendedorSlug)
                  const sNombre      = isReal ? (ri.sellerNombre??'Vendedor') : (mock?.nombre??'Vendedor')
                  const sTel         = isReal ? (ri.sellerTel??'56912345678') : (mock?.telefono??'56912345678')
                  const sColor       = isReal ? '#1d4ed8' : (mock?.color??'#6b7280')
                  const compat       = vSel ? checkCompatibility(item.fitment, make, model, yNum) : null
                  return <ProductCard key={item.id} item={item} compat={compat} sellerNombre={sNombre} sellerTel={sTel} sellerColor={sColor} />
                })}
              </div>}
        </div>
      </div>

      {/* ── modal vehículo ── */}
      {showVeh &&
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>setShowVeh(false)}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, maxWidth:420, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,.2)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <p style={{ fontWeight:800, fontSize:16, color:'#111827', margin:0 }}>Busca por tu vehículo</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:'4px 0 0' }}>Filtra piezas compatibles</p>
              </div>
              <button onPointerDown={()=>setShowVeh(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:8, padding:8, cursor:'pointer' }}><X size={16} color="#6b7280" /></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {val:make, set:(v:string)=>{setMake(v);setModel('');setYear('')}, opts:makes, label:'Marca', dis:false},
                {val:model, set:(v:string)=>{setModel(v);setYear('')}, opts:models, label:'Modelo', dis:!make},
                {val:year,  set:(v:string)=>{setYear(v);setShowVeh(false)}, opts:years, label:'Año', dis:!model},
              ].map(({val,set,opts,label,dis})=>(
                <select key={label} value={val} onChange={e=>set(e.target.value)} disabled={dis}
                  style={{ padding:'11px 14px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:14, outline:'none', background:'#fff', color:'#111827', opacity:dis?.5:1 }}>
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
              <span style={{ fontSize:16, fontWeight:800, color:'#111827' }}>Filtros</span>
              <button onPointerDown={()=>setShowFilt(false)} style={{ background:'#f3f4f6', border:'none', borderRadius:8, padding:'6px 10px', color:'#6b7280', cursor:'pointer', fontSize:18, lineHeight:1 }}>×</button>
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:'#111827', margin:'0 0 10px' }}>Categoría</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
              {CATS.map(c=>(
                <button key={String(c.id)} onPointerDown={()=>{setCat(c.id);setShowFilt(false)}}
                  style={{ padding:'10px 12px', borderRadius:10, border:`1.5px solid ${cat===c.id?'#1d4ed8':'#e5e7eb'}`, background:cat===c.id?'#eff6ff':'#fff', color:cat===c.id?'#1d4ed8':'#374151', fontSize:12, fontWeight:cat===c.id?700:500, cursor:'pointer', textAlign:'left' }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {(cat||vSel) && <button onPointerDown={()=>{setCat(null);clrVeh();setShowFilt(false)}} style={{ marginTop:16, width:'100%', padding:12, borderRadius:10, border:'1.5px solid #fca5a5', background:'#fff5f5', color:'#b91c1c', fontSize:13, fontWeight:700, cursor:'pointer' }}>Limpiar filtros</button>}
          </div>
        </div>}
    </div>
  )
}
