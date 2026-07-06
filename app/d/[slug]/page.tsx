'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, MessageCircle, Clock, Shield, ArrowLeft,
  Loader2, Pencil, Eye, Package, Star, Truck,
  Search, SlidersHorizontal, CheckCircle, ChevronDown,
  Star as StarIcon
} from 'lucide-react'
import type { Product } from '@/lib/supabase'
import type { EstadoPieza } from '@/lib/types'

const ESTADO: Record<EstadoPieza, { label: string; color: string; bg: string; border: string }> = {
  excelente:      { label: 'Excelente',    color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fff5f5', border: '#fca5a5' },
}

type SellerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; banner_url?: string | null; whatsapp?: string; direccion?: string
  horario?: string; ciudad?: string; especialidades?: string[]
}

function ProductCard({ item, waBase }: {
  item: Product & { zona?: string }
  waBase: string
}) {
  const estado = ESTADO[item.estado as EstadoPieza] ?? ESTADO['bueno']
  const wa = `${waBase}?text=${encodeURIComponent(`Hola, vi la pieza "${item.pieza}" en Componenta. ¿Está disponible?`)}`

  return (
    <article
      style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden', display:'flex', flexDirection:'column', cursor:'pointer', transition:'transform .15s, box-shadow .15s' }}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-3px)';el.style.boxShadow='0 8px 24px rgba(0,0,0,.10)'}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='';el.style.boxShadow=''}}
    >
      <div style={{ position:'relative', paddingTop:'68%', background:'#f3f4f6', flexShrink:0 }}>
        {item.imagen_url
          ? <img src={item.imagen_url} alt={item.pieza} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:6 }} />
          : <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Package size={36} color="#d1d5db" />
            </div>}
        <span style={{ position:'absolute', top:8, left:8, background:estado.bg, border:`1px solid ${estado.border}`, borderRadius:20, padding:'3px 9px', fontSize:9, fontWeight:700, color:estado.color }}>
          {estado.label}
        </span>
        <span style={{ position:'absolute', top:8, right:8, display:'flex', alignItems:'center', gap:3, background:'rgba(0,0,0,.45)', borderRadius:20, padding:'3px 8px', fontSize:9, color:'#fff' }}>
          <Eye size={9} /> {item.vistas??0}
        </span>
      </div>

      <div style={{ padding:'11px 13px 13px', flex:1, display:'flex', flexDirection:'column' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, margin:'0 0 3px' }}>
          {item.marca} {item.modelo} {item.anios ? `· ${item.anios}` : ''}
        </p>
        <p style={{ fontSize:13, fontWeight:600, color:'#111827', margin:'0 0 6px', lineHeight:1.35, flex:1,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as React.CSSProperties}>
          {item.pieza}
        </p>
        {item.oem && <p style={{ fontSize:10, color:'#9ca3af', margin:'0 0 8px', fontFamily:'monospace' }}>OEM {item.oem}</p>}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:10, borderTop:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:19, fontWeight:900, color:'#111827', letterSpacing:-.5 }}>${item.precio?.toLocaleString('es-CL')}</span>
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={ev=>ev.stopPropagation()}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 11px', borderRadius:9, background:'#16a34a', color:'#fff', fontWeight:700, fontSize:11, textDecoration:'none' }}>
            <MessageCircle size={11} /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}

export default function DesarmaduriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [profile, setProfile]   = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [isOwner, setIsOwner]   = useState(false)
  const [search, setSearch]     = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/d/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || data.notFound) return
        setProfile(data)
        fetch('/api/profile').then(r=>r.json()).then(me=>{
          setIsOwner(me?.userId===data.user_id)
        }).catch(()=>{})
        fetch(`/api/marketplace?seller=${data.user_id}&limit=100`)
          .then(r=>r.json()).then(d=>setProducts(d.products??[])).catch(()=>{})
      })
      .finally(()=>setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa' }}>
      <Loader2 size={28} color="#9ca3af" className="animate-spin" />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'#f8f9fa' }}>
      <p style={{ fontSize:16, fontWeight:700, color:'#374151' }}>Tienda no encontrada</p>
      <Link href="/marketplace" style={{ color:'#1d4ed8', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
        <ArrowLeft size={14} /> Volver al marketplace
      </Link>
    </div>
  )

  const accentColor = profile.color
  const tel  = profile.whatsapp ?? ''
  const waBase = `https://wa.me/${tel.replace(/\D/g,'')}`

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.pieza?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q) || p.modelo?.toLowerCase().includes(q)
    const matchE = !filterEstado || p.estado===filterEstado
    return matchQ && matchE
  })

  const initials = profile.nombre.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:"'Inter',system-ui,sans-serif", color:'#111827' }}>

      {/* ── NAV ── */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 20px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/marketplace" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', color:'#374151', fontSize:13, fontWeight:600 }}>
          <ArrowLeft size={15} color="#1d4ed8" /> Marketplace
        </Link>
        <div style={{ display:'flex', gap:8 }}>
          {isOwner && (
            <Link href="/mi-tienda" style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:9, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#374151', fontSize:12, fontWeight:600, textDecoration:'none' }}>
              <Pencil size={12} /> Editar tienda
            </Link>
          )}
          <a href={`${waBase}?text=${encodeURIComponent(`Hola ${profile.nombre}, los contacto desde Componenta.`)}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 15px', borderRadius:9, background:'#16a34a', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}>
            <MessageCircle size={13} /> Contactar
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: profile.banner_url
        ? `linear-gradient(to bottom,rgba(0,0,0,.55),rgba(0,0,0,.75)),url(${profile.banner_url}) center/cover`
        : 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#1e3a5f 100%)',
        padding:'52px 20px 0', position:'relative' }}>

        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          {/* Identity */}
          <div style={{ display:'flex', gap:20, alignItems:'flex-end', marginBottom:32, flexWrap:'wrap' }}>
            <div style={{ width:88, height:88, borderRadius:22, flexShrink:0, background:`${accentColor}25`, border:`3px solid ${accentColor}70`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:26, letterSpacing:-1, boxShadow:'0 8px 32px rgba(0,0,0,.3)' }}>
              {initials}
            </div>
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                <span style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.8)' }}>
                  <Shield size={10} /> Verificado · Componenta
                </span>
                {profile.ciudad && (
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'rgba(255,255,255,.6)' }}>
                    <MapPin size={11} /> {profile.ciudad}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', margin:'0 0 6px', lineHeight:1.1, letterSpacing:-.5 }}>{profile.nombre}</h1>
              {profile.tagline && <p style={{ fontSize:14, color:'rgba(255,255,255,.7)', margin:0, lineHeight:1.5 }}>{profile.tagline}</p>}
            </div>
          </div>

          {/* Stats bar — ahora debajo del hero, fondo blanco */}
          <div style={{ background:'rgba(0,0,0,.25)', backdropFilter:'blur(8px)', borderRadius:'14px 14px 0 0', padding:'14px 24px', display:'flex', gap:0 }}>
            {[
              { val:products.length,                                                  label:'piezas en stock',    icon:'📦' },
              { val:products.filter(p=>p.estado==='excelente').length,                label:'excelente estado',   icon:'⭐' },
              { val:'5.0',                                                            label:'calificación',       icon:'✅' },
              { val:products.filter(p=>p.disponible).length,                         label:'disponibles',        icon:'🟢' },
            ].map((s,i)=>(
              <div key={i} style={{ flex:1, textAlign:'center', borderRight:i<3?'1px solid rgba(255,255,255,.1)':'none', padding:'0 12px' }}>
                <p style={{ fontWeight:900, fontSize:typeof s.val==='string'?18:s.val>99?20:24, color:'#fff', margin:'0 0 2px', lineHeight:1 }}>{s.val}</p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,.5)', margin:0, textTransform:'uppercase', letterSpacing:.4, fontWeight:600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 20px 80px' }}>

        {/* Info bar blanca pegada al hero */}
        <div style={{ background:'#fff', borderRadius:'0 0 14px 14px', borderTop:'1px solid #f3f4f6', padding:'14px 20px', marginBottom:20, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', boxShadow:'0 4px 16px rgba(0,0,0,.05)' }}>
          {profile.direccion && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'#374151' }}>
              <MapPin size={13} color="#9ca3af" /> {profile.direccion}
            </span>
          )}
          {profile.horario && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'#374151' }}>
              <Clock size={13} color="#9ca3af" /> {profile.horario}
            </span>
          )}
          {tel && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'#374151' }}>
              <Phone size={13} color="#9ca3af" /> {tel}
            </span>
          )}
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <a href={`${waBase}?text=${encodeURIComponent(`Hola ${profile.nombre}, consulto desde Componenta.`)}`} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, background:'#16a34a', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
            {tel && (
              <a href={`tel:${tel}`}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:9, background:'#f9fafb', border:'1.5px solid #e5e7eb', color:'#374151', fontWeight:600, fontSize:13, textDecoration:'none' }}>
                <Phone size={14} /> Llamar
              </a>
            )}
          </div>
        </div>

        {/* Especialidades */}
        {(profile.especialidades?.length??0)>0 && (
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
            {profile.especialidades!.map(e=>(
              <span key={e} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:600, background:`${accentColor}12`, color:accentColor, border:`1px solid ${accentColor}30` }}>
                <CheckCircle size={11} /> {e}
              </span>
            ))}
          </div>
        )}

        {/* Descripción */}
        {profile.descripcion && (
          <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', marginBottom:20, border:'1px solid #e5e7eb' }}>
            <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, margin:'0 0 14px' }}>{profile.descripcion}</p>
            <div style={{ display:'flex', gap:20, paddingTop:12, borderTop:'1px solid #f3f4f6', flexWrap:'wrap' }}>
              {[['🚚','Envío a todo Chile'],['✅','Piezas verificadas'],['💬','Respuesta por WhatsApp']].map(([icon,text])=>(
                <span key={String(text)} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#6b7280' }}>
                  <span style={{ fontSize:14 }}>{icon}</span> {text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CATÁLOGO ── */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e5e7eb', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111827', margin:'0 0 2px', letterSpacing:-.2 }}>Catálogo de repuestos</h2>
              <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>{products.length} piezas publicadas</p>
            </div>
            <div style={{ display:'flex', gap:8, flex:1, maxWidth:380, justifyContent:'flex-end' }}>
              <div style={{ position:'relative', flex:1 }}>
                <Search size={13} color="#9ca3af" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Buscar pieza, marca…"
                  style={{ width:'100%', paddingLeft:30, paddingRight:10, paddingTop:8, paddingBottom:8, borderRadius:9, border:'1.5px solid #e5e7eb', fontSize:13, color:'#111827', outline:'none', boxSizing:'border-box', background:'#f9fafb' }} />
              </div>
              <button onPointerDown={()=>setShowFilters(v=>!v)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', borderRadius:9, border:`1.5px solid ${showFilters?accentColor:'#e5e7eb'}`, background:showFilters?`${accentColor}10`:'#f9fafb', color:showFilters?accentColor:'#374151', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                <SlidersHorizontal size={13} /> Filtrar <ChevronDown size={11} />
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div style={{ padding:'10px 20px', borderBottom:'1px solid #f3f4f6', background:'#f9fafb', display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#6b7280' }}>Estado:</span>
              {[null,'excelente','bueno','con-detalles','para-reparar'].map(e=>{
                const active = filterEstado===e
                const info   = e ? ESTADO[e as EstadoPieza] : null
                return (
                  <button key={String(e)} onPointerDown={()=>setFilterEstado(e)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:active?700:500, border:`1.5px solid ${active?(info?.color??accentColor):'#e5e7eb'}`, background:active?(info?.bg??`${accentColor}10`):'#fff', color:active?(info?.color??accentColor):'#6b7280', cursor:'pointer' }}>
                    {e ? info?.label : 'Todos'}
                  </button>
                )
              })}
            </div>
          )}

          {/* Grid */}
          <div style={{ padding:18 }}>
            {filtered.length===0
              ? <div style={{ padding:'48px 0', textAlign:'center' }}>
                  <Package size={36} color="#d1d5db" style={{ margin:'0 auto 10px', display:'block' }} />
                  <p style={{ fontSize:14, color:'#9ca3af', margin:0 }}>No se encontraron piezas</p>
                </div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:14 }}>
                  {filtered.map(item=>(
                    <ProductCard key={item.id} item={item} waBase={waBase} />
                  ))}
                </div>}
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ background:'#fff', borderRadius:14, padding:'16px 20px', marginTop:16, border:'1px solid #e5e7eb', display:'flex', gap:0, justifyContent:'space-around', flexWrap:'wrap' }}>
          {[
            { icon:Shield,  color:'#15803d', text:'Vendedor verificado' },
            { icon:Truck,   color:'#1d4ed8', text:'Envío a todo Chile' },
            { icon:StarIcon,color:'#d97706', text:'Calificación 5.0' },
          ].map(({icon:Icon,color,text},i)=>(
            <div key={text} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 14px', borderRight:i<2?'1px solid #f3f4f6':'none', flex:1, justifyContent:'center' }}>
              <div style={{ width:30, height:30, borderRadius:9, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={14} color={color} />
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div style={{ marginTop:16, textAlign:'center' }}>
          <Link href="/marketplace" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:12, background:'#fff', border:'1px solid #e5e7eb', textDecoration:'none' }}>
            <div style={{ width:20, height:20, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:10 }}>C</div>
            <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Ver más en Componenta</span>
          </Link>
        </div>
      </div>

      {/* FAB WhatsApp */}
      <a href={`${waBase}?text=${encodeURIComponent(`Hola ${profile.nombre}, los contacto desde Componenta.`)}`}
        target="_blank" rel="noopener noreferrer"
        style={{ position:'fixed', bottom:20, right:18, display:'flex', alignItems:'center', gap:8, background:'#16a34a', color:'#fff', fontWeight:700, fontSize:13, padding:'13px 20px', borderRadius:50, zIndex:50, textDecoration:'none', boxShadow:'0 8px 28px rgba(22,163,74,.4)' }}>
        <MessageCircle size={17} /> WhatsApp
      </a>
    </div>
  )
}
