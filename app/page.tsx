'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'

/* ─── Datos estructurados ─────────────────────────────────────── */

const MARCAS = [
  'Toyota','Hyundai','Chevrolet','Ford','Nissan','Suzuki','Kia','Mazda',
  'Honda','Volkswagen','Renault','Fiat','Peugeot','Citroën','Mercedes',
  'BMW','Subaru','Mitsubishi','Jeep','Chery','BYD','Haval','JAC','Volvo',
  'Audi','Opel','Peugeot','Isuzu','Dacia','Skoda','Seat','Dodge',
]

const CATEGORIAS = [
  { id:'motor',         label:'Motor',         kw:['motor','culata','bloque','piston','ciguenal','leva','biela','tapa motor'] },
  { id:'frenos',        label:'Frenos',        kw:['freno','pastilla','disco freno','mordaza','pinza','bomba freno'] },
  { id:'suspension',    label:'Suspensión',    kw:['suspension','amortiguador','resorte','rotula','barra','muñon','brazo'] },
  { id:'electrico',     label:'Eléctrico',     kw:['alternador','arranque','bateria','sensor','bujia','modulo','bobina','faro'] },
  { id:'transmision',   label:'Transmisión',   kw:['transmision','caja cambio','embrague','diferencial','junta','palier','cardan'] },
  { id:'refrigeracion', label:'Refrigeración', kw:['radiador','bomba agua','termostato','manguera','intercooler','ventilador'] },
  { id:'combustible',   label:'Combustible',   kw:['bomba combustible','inyector','carburador','filtro combustible','bencina','bomba bencina'] },
  { id:'carroceria',    label:'Carrocería',    kw:['puerta','capot','guardabarro','paragolpe','techo','espejo','vidrio','parabrisas'] },
  { id:'escape',        label:'Escape',        kw:['escape','catalizador','silenciador','tubo escape','colector'] },
  { id:'correas',       label:'Correas/Filtros',kw:['correa distribucion','correa accesorios','filtro aceite','filtro aire','filtro'] },
]

const RANGOS_PRECIO = [
  { label:'Menos de $50.000',      min:0,      max:50000   },
  { label:'$50.000 – $150.000',    min:50000,  max:150000  },
  { label:'$150.000 – $400.000',   min:150000, max:400000  },
  { label:'Más de $400.000',       min:400000, max:Infinity},
]

/* ─── Tipo ────────────────────────────────────────────────────── */
type Listing = {
  id: string; fuente: 'facebook'|'mercadolibre'
  titulo: string|null; precio: number; imagen: string|null
  url_original: string; ubicacion: string|null; vendedor_nombre: string|null
}

/* ─── Helpers de detección ────────────────────────────────────── */
function detectarMarca(titulo: string|null) {
  if (!titulo) return null
  const t = titulo.toLowerCase()
  return MARCAS.find(m => t.includes(m.toLowerCase())) ?? null
}
function detectarCategoria(titulo: string|null) {
  if (!titulo) return null
  const t = titulo.toLowerCase()
  return CATEGORIAS.find(c => c.kw.some(kw => t.includes(kw)))?.id ?? null
}

/* ─── Tarjeta de repuesto ─────────────────────────────────────── */
function Card({ item }: { item: Listing }) {
  const esFB   = item.fuente === 'facebook'
  const accent = esFB ? '#1877f2' : '#f59e0b'

  return (
    <a href={item.url_original} target="_blank" rel="noopener noreferrer"
      style={{ display:'flex', flexDirection:'column', background:'#fff', borderRadius:12,
        border:'1px solid #e5e7eb', overflow:'hidden', textDecoration:'none',
        transition:'transform .15s, box-shadow .15s', cursor:'pointer' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-2px)';el.style.boxShadow='0 6px 20px rgba(0,0,0,.10)'}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='';el.style.boxShadow=''}}>

      {/* Imagen */}
      <div style={{ paddingTop:'68%', position:'relative', background:'#f3f4f6', flexShrink:0 }}>
        {item.imagen
          ? <img src={item.imagen} alt={item.titulo??''} loading="lazy"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
              onError={e=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#d1d5db' }}>🔧</div>
        }
        {/* Badge fuente */}
        <span style={{ position:'absolute', top:8, left:8, background:accent, color:'#fff',
          fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, letterSpacing:.3 }}>
          {esFB ? 'Facebook' : 'MercadoLibre'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding:'10px 12px 12px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0, lineHeight:1.4,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>
          {item.titulo ?? 'Sin título'}
        </p>
        <div style={{ marginTop:'auto', paddingTop:8, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <span style={{ fontSize: item.precio>0 ? 17 : 12, fontWeight:900,
            color: item.precio>0 ? '#111827' : '#9ca3af' }}>
            {item.precio > 0
              ? `$${item.precio.toLocaleString('es-CL')}`
              : 'Consultar precio'}
          </span>
          <span style={{ fontSize:11, fontWeight:700, color:accent }}>Ver →</span>
        </div>
        {item.ubicacion && (
          <span style={{ fontSize:10, color:'#9ca3af' }}>📍 {item.ubicacion}</span>
        )}
      </div>
    </a>
  )
}

/* ─── Chip de filtro activo ───────────────────────────────────── */
function Chip({ label, onRemove }: { label:string; onRemove:()=>void }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px',
      borderRadius:20, background:'#16181d', color:'#fff', fontSize:12, fontWeight:600 }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', color:'rgba(255,255,255,.7)',
        cursor:'pointer', fontSize:14, lineHeight:1, padding:0 }}>×</button>
    </span>
  )
}

/* ─── Página principal ────────────────────────────────────────── */
export default function Vitrina() {
  const [listings,     setListings]     = useState<Listing[]>([])
  const [cargando,     setCargando]     = useState(true)
  const [busqueda,     setBusqueda]     = useState('')
  const [marca,        setMarca]        = useState<string|null>(null)
  const [categoria,    setCategoria]    = useState<string|null>(null)
  const [rangoIdx,     setRangoIdx]     = useState<number|null>(null)
  const [orden,        setOrden]        = useState<'reciente'|'precio_asc'|'precio_desc'>('reciente')
  const [showFiltros,  setShowFiltros]  = useState(false)

  useEffect(() => {
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(d => {
        const fb   = (d.facebook        ?? []).map((i:Listing)=>({...i, fuente:'facebook'      as const}))
        const meli = (d.meli_scrapeado  ?? []).map((i:Listing)=>({...i, fuente:'mercadolibre' as const}))
        setListings([...fb, ...meli])
      })
      .catch(()=>{})
      .finally(()=>setCargando(false))
  }, [])

  /* Marcas presentes en los listings actuales (con conteo) */
  const marcasPresentes = useMemo(() => {
    const conteo: Record<string, number> = {}
    for (const item of listings) {
      const m = detectarMarca(item.titulo)
      if (m) conteo[m] = (conteo[m]||0) + 1
    }
    return Object.entries(conteo).sort((a,b)=>b[1]-a[1]).slice(0,15)
  }, [listings])

  /* Categorías presentes */
  const categoriasPresentes = useMemo(() => {
    const conteo: Record<string, number> = {}
    for (const item of listings) {
      const c = detectarCategoria(item.titulo)
      if (c) conteo[c] = (conteo[c]||0) + 1
    }
    return CATEGORIAS.filter(c => conteo[c.id]).map(c=>({ ...c, total: conteo[c.id] }))
  }, [listings])

  /* Resultados filtrados */
  const filtrados = useMemo(() => {
    const q     = busqueda.toLowerCase().trim()
    const rango = rangoIdx !== null ? RANGOS_PRECIO[rangoIdx] : null

    let list = listings
      .filter(i => !q || (i.titulo??'').toLowerCase().includes(q))
      .filter(i => !marca    || detectarMarca(i.titulo) === marca)
      .filter(i => !categoria || detectarCategoria(i.titulo) === categoria)
      .filter(i => !rango    || (i.precio >= rango.min && i.precio <= rango.max))

    if (orden === 'precio_asc')  list = [...list].sort((a,b)=>(a.precio||Infinity)-(b.precio||Infinity))
    if (orden === 'precio_desc') list = [...list].sort((a,b)=>(b.precio||0)-(a.precio||0))

    return list
  }, [listings, busqueda, marca, categoria, rangoIdx, orden])

  const hayFiltros = !!(busqueda || marca || categoria || rangoIdx !== null)
  const limpiarTodo = useCallback(()=>{
    setBusqueda(''); setMarca(null); setCategoria(null); setRangoIdx(null)
  }, [])

  /* ── Panel de filtros (reutilizado en sidebar y modal) ── */
  const PanelFiltros = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Marca de auto */}
      {marcasPresentes.length > 0 && (
        <div>
          <p style={{ fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase',
            letterSpacing:.6, margin:'0 0 10px' }}>Marca del auto</p>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {marcasPresentes.map(([m, total]) => (
              <button key={m} onClick={()=>setMarca(marca===m ? null : m)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'7px 10px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'left',
                  background: marca===m ? '#111827' : 'transparent',
                  color: marca===m ? '#fff' : '#374151', fontSize:13, fontWeight: marca===m ? 700 : 400 }}>
                <span>{m}</span>
                <span style={{ fontSize:11, color: marca===m ? 'rgba(255,255,255,.6)' : '#9ca3af',
                  background: marca===m ? 'rgba(255,255,255,.15)' : '#f3f4f6',
                  borderRadius:20, padding:'1px 7px' }}>{total}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tipo de repuesto */}
      {categoriasPresentes.length > 0 && (
        <div>
          <p style={{ fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase',
            letterSpacing:.6, margin:'0 0 10px' }}>Tipo de repuesto</p>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {categoriasPresentes.map(c => (
              <button key={c.id} onClick={()=>setCategoria(categoria===c.id ? null : c.id)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'7px 10px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'left',
                  background: categoria===c.id ? '#111827' : 'transparent',
                  color: categoria===c.id ? '#fff' : '#374151', fontSize:13, fontWeight: categoria===c.id ? 700 : 400 }}>
                <span>{c.label}</span>
                <span style={{ fontSize:11, color: categoria===c.id ? 'rgba(255,255,255,.6)' : '#9ca3af',
                  background: categoria===c.id ? 'rgba(255,255,255,.15)' : '#f3f4f6',
                  borderRadius:20, padding:'1px 7px' }}>{c.total}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rango de precio */}
      <div>
        <p style={{ fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase',
          letterSpacing:.6, margin:'0 0 10px' }}>Precio</p>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {RANGOS_PRECIO.map((r,i) => (
            <button key={i} onClick={()=>setRangoIdx(rangoIdx===i ? null : i)}
              style={{ padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'left',
                background: rangoIdx===i ? '#111827' : 'transparent',
                color: rangoIdx===i ? '#fff' : '#374151', fontSize:13, fontWeight: rangoIdx===i ? 700 : 400 }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {hayFiltros && (
        <button onClick={()=>{limpiarTodo();setShowFiltros(false)}}
          style={{ padding:'10px', borderRadius:9, border:'1.5px solid #fca5a5', background:'#fff5f5',
            color:'#b91c1c', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          Limpiar todos los filtros
        </button>
      )}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f7f7f5', fontFamily:'system-ui,sans-serif', color:'#16181d' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background:'#16181d', position:'sticky', top:0, zIndex:50,
        boxShadow:'0 1px 12px rgba(0,0,0,.3)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', height:62,
          display:'flex', alignItems:'center', gap:14 }}>

          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:900, fontSize:17, color:'#fff' }}>C</div>
            <div>
              <p style={{ fontWeight:900, fontSize:15, color:'#fff', margin:0, letterSpacing:-.3 }}>Componenta</p>
              <p style={{ fontSize:9, color:'rgba(255,255,255,.4)', margin:0, textTransform:'uppercase', letterSpacing:.5 }}>Repuestos Temuco</p>
            </div>
          </div>

          {/* Buscador */}
          <div style={{ flex:1, maxWidth:520, display:'flex', alignItems:'center',
            background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.15)',
            borderRadius:10, overflow:'hidden' }}
            onFocusCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='#3b82f6'}
            onBlurCapture={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,.15)'}>
            <span style={{ padding:'0 12px', fontSize:14, color:'rgba(255,255,255,.4)' }}>🔍</span>
            <input type="text" placeholder="Busca pieza, marca, modelo…"
              value={busqueda} onChange={e=>setBusqueda(e.target.value)}
              style={{ flex:1, padding:'11px 0', fontSize:14, border:'none', outline:'none',
                background:'transparent', color:'#fff' }} />
            {busqueda && <button onClick={()=>setBusqueda('')}
              style={{ background:'none', border:'none', padding:'0 12px', cursor:'pointer',
                color:'rgba(255,255,255,.4)', fontSize:16 }}>×</button>}
          </div>

          <Link href="/inventario"
            style={{ flexShrink:0, padding:'8px 14px', borderRadius:9,
              background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)',
              color:'rgba(255,255,255,.85)', fontSize:12, fontWeight:700, textDecoration:'none' }}>
            Soy vendedor →
          </Link>
        </div>
      </header>

      {/* ══ BARRA INFERIOR DEL HEADER ══ */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px',
          height:46, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>

          {/* Botón filtros (mobile) */}
          <button onClick={()=>setShowFiltros(true)}
            className="lg-hide"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
              borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff',
              fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer',
              ...(hayFiltros ? { borderColor:'#111827', background:'#111827', color:'#fff' } : {}) }}>
            ⚙ Filtros {hayFiltros ? `(${[marca,categoria,rangoIdx!==null].filter(Boolean).length})` : ''}
          </button>

          {/* Sort */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
            <span style={{ fontSize:12, color:'#9ca3af', flexShrink:0 }}>Ordenar:</span>
            {(['reciente','precio_asc','precio_desc'] as const).map(op=>(
              <button key={op} onClick={()=>setOrden(op)}
                style={{ padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12,
                  fontWeight: orden===op ? 700 : 500,
                  background: orden===op ? '#111827' : '#f3f4f6',
                  color: orden===op ? '#fff' : '#6b7280' }}>
                {op==='reciente' ? 'Reciente' : op==='precio_asc' ? 'Menor precio' : 'Mayor precio'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CUERPO ══ */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px 20px 80px',
        display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* ── Sidebar filtros (desktop) ── */}
        <aside style={{ width:220, flexShrink:0, position:'sticky', top:78 }}
          className="lg-show">
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', padding:16 }}>
            <PanelFiltros />
          </div>
        </aside>

        {/* ── Grid principal ── */}
        <main style={{ flex:1, minWidth:0 }}>

          {/* Chips filtros activos */}
          {hayFiltros && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {busqueda   && <Chip label={`"${busqueda}"`} onRemove={()=>setBusqueda('')} />}
              {marca      && <Chip label={marca}           onRemove={()=>setMarca(null)} />}
              {categoria  && <Chip label={CATEGORIAS.find(c=>c.id===categoria)?.label??categoria} onRemove={()=>setCategoria(null)} />}
              {rangoIdx!==null && <Chip label={RANGOS_PRECIO[rangoIdx].label} onRemove={()=>setRangoIdx(null)} />}
            </div>
          )}

          <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 16px' }}>
            {cargando ? 'Cargando repuestos…'
              : `${filtrados.length.toLocaleString('es-CL')} repuesto${filtrados.length!==1?'s':''} encontrado${filtrados.length!==1?'s':''}`}
          </p>

          {cargando ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:14 }}>
              {Array.from({length:12}).map((_,i)=>(
                <div key={i} style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', height:260 }}>
                  <div style={{ height:'60%', background:'#f3f4f6', borderRadius:'12px 12px 0 0' }} />
                  <div style={{ padding:12 }}>
                    <div style={{ background:'#f3f4f6', borderRadius:6, height:11, marginBottom:6 }} />
                    <div style={{ background:'#f3f4f6', borderRadius:6, height:11, width:'60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff',
              borderRadius:16, border:'1px solid #e5e7eb' }}>
              <p style={{ fontSize:36, margin:'0 0 10px' }}>🔧</p>
              <p style={{ fontSize:16, fontWeight:700, margin:'0 0 6px' }}>
                {listings.length === 0 ? 'Cargando datos…' : 'Sin resultados para estos filtros'}
              </p>
              <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 20px' }}>
                {listings.length === 0 ? 'Los agentes están importando repuestos.' : 'Prueba quitando algún filtro'}
              </p>
              {hayFiltros && (
                <button onClick={limpiarTodo} style={{ padding:'10px 24px', borderRadius:10,
                  background:'#16181d', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>
                  Ver todos los repuestos
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:14 }}>
              {filtrados.map(item => <Card key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>

      {/* ══ ¿CÓMO FUNCIONA? ══ */}
      <div style={{ background:'#16181d', padding:'52px 20px 60px' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>

          <p style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,.3)', textTransform:'uppercase',
            letterSpacing:1.5, margin:'0 0 10px', textAlign:'center' }}>Para desarmadurías</p>
          <h2 style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 6px', textAlign:'center', letterSpacing:-.5, lineHeight:1.2 }}>
            Publica una pieza en 4 pasos
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', margin:'0 0 44px', textAlign:'center' }}>
            Sin computador, sin técnicos, sin complicaciones
          </p>

          {/* ── Pasos ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:36 }} className="steps-grid">
            {[
              { n:1, icon:'📸', title:'Sacas una foto',       desc:'Con tu celular o cámara. Así nomás.' },
              { n:2, icon:'🤖', title:'La IA lo identifica',  desc:'Componenta reconoce la pieza, la marca y el modelo compatible.' },
              { n:3, icon:'💵', title:'Pones el precio',      desc:'Tú decides cuánto vale. Nosotros lo publicamos.' },
              { n:4, icon:'🚀', title:'Aparece en 4 sitios',  desc:'Se publica sola. Compradores llegan a tu WhatsApp.' },
            ].map((s, i) => (
              <div key={i} style={{ position:'relative' }}>
                {i < 3 && (
                  <div style={{ position:'absolute', top:28, right:-14, fontSize:20,
                    color:'rgba(255,255,255,.2)', zIndex:1, fontWeight:900 }} className="step-arrow">→</div>
                )}
                <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)',
                  borderRadius:16, padding:'20px 16px', textAlign:'center', height:'100%', boxSizing:'border-box' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'rgba(47,95,219,.25)',
                    border:'1.5px solid rgba(47,95,219,.4)', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:24, margin:'0 auto 12px' }}>
                    {s.icon}
                  </div>
                  <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                    width:20, height:20, borderRadius:'50%', background:'#2f5fdb',
                    fontSize:10, fontWeight:900, color:'#fff', marginBottom:8 }}>{s.n}</div>
                  <p style={{ fontSize:13, fontWeight:800, color:'#fff', margin:'0 0 6px', lineHeight:1.3 }}>{s.title}</p>
                  <p style={{ fontSize:11.5, color:'rgba(255,255,255,.45)', margin:0, lineHeight:1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Canales donde aparece ── */}
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
            borderRadius:16, padding:'20px 24px' }}>
            <p style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,.35)', textTransform:'uppercase',
              letterSpacing:1, margin:'0 0 14px', textAlign:'center' }}>
              Tu pieza aparece automáticamente en
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10 }}>
              {[
                { label:'Componenta',        bg:'#2f5fdb', text:'#fff',  icon:'C',  desc:'Tu tienda propia' },
                { label:'MercadoLibre',      bg:'#FFE600', text:'#2D3277', icon:'ML', desc:'El marketplace más grande' },
                { label:'Google Shopping',   bg:'#fff',    text:'#333',  icon:'G',  desc:'Apareces en Google' },
                { label:'Facebook Shopping', bg:'#1877F2', text:'#fff',  icon:'f',  desc:'Compradores en FB' },
              ].map(c => (
                <div key={c.label} style={{ display:'flex', alignItems:'center', gap:9,
                  background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)',
                  borderRadius:12, padding:'10px 14px', minWidth:170 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:c.bg, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:900, color:c.text }}>
                    {c.icon}
                  </div>
                  <div>
                    <p style={{ fontSize:12.5, fontWeight:700, color:'#fff', margin:0 }}>{c.label}</p>
                    <p style={{ fontSize:10.5, color:'rgba(255,255,255,.4)', margin:0 }}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ textAlign:'center', marginTop:28 }}>
            <a href="/inventario" style={{ display:'inline-flex', alignItems:'center', gap:8,
              padding:'13px 28px', borderRadius:12, background:'#2f5fdb',
              color:'#fff', fontWeight:800, fontSize:14, textDecoration:'none',
              boxShadow:'0 4px 20px rgba(47,95,219,.4)' }}>
              Empezar gratis →
            </a>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:'10px 0 0' }}>Sin tarjeta. Sin contrato. Empiezas hoy.</p>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html:`
        @media(max-width:640px){
          .steps-grid { grid-template-columns:1fr 1fr !important; }
          .step-arrow { display:none !important; }
        }
      `}} />

      {/* ══ MODAL FILTROS MOBILE ══ */}
      {showFiltros && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,.4)',
          display:'flex', alignItems:'flex-end' }} onClick={()=>setShowFiltros(false)}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'24px 20px 40px',
            width:'100%', maxHeight:'85vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ fontSize:16, fontWeight:800 }}>Filtros</span>
              <button onClick={()=>setShowFiltros(false)}
                style={{ background:'#f3f4f6', border:'none', borderRadius:8, padding:'6px 10px',
                  cursor:'pointer', fontSize:18, color:'#6b7280' }}>×</button>
            </div>
            <PanelFiltros />
            <button onClick={()=>setShowFiltros(false)}
              style={{ marginTop:16, width:'100%', padding:14, borderRadius:10, border:'none',
                background:'#16181d', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer' }}>
              Ver {filtrados.length} resultados
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html:`
        .lg-hide { display:flex }
        .lg-show { display:block }
        @media(max-width:768px){
          .lg-hide { display:flex !important }
          .lg-show { display:none !important }
        }
        @media(min-width:769px){
          .lg-hide { display:none !important }
          .lg-show { display:block !important }
        }
      `}} />
    </div>
  )
}
