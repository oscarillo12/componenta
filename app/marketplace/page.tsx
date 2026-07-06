'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, MessageCircle, ChevronDown, X, Check, Truck, Car, ChevronRight, Package, SlidersHorizontal, ShieldCheck, Tag, ArrowRight } from 'lucide-react'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'

const CATEGORIAS = [
  { id: null,           label: 'Todas',       emoji: '🔍', desc: 'Ver todo' },
  { id: 'motor',        label: 'Motor',       emoji: '⚙️', desc: 'Pistones, culatas…' },
  { id: 'electrico',    label: 'Eléctrico',   emoji: '⚡', desc: 'Alternadores, fusibles…' },
  { id: 'frenos',       label: 'Frenos',      emoji: '🛑', desc: 'Pastillas, discos…' },
  { id: 'suspension-d', label: 'Suspensión',  emoji: '🔩', desc: 'Amortiguadores…' },
  { id: 'transmision',  label: 'Transmisión', emoji: '🔧', desc: 'Cajas, embragues…' },
  { id: 'interior',     label: 'Interior',    emoji: '🪑', desc: 'Tapicería, tablero…' },
  { id: 'escape',       label: 'Escape',      emoji: '💨', desc: 'Caños, catalizadores…' },
  { id: 'carroceria',   label: 'Carrocería',  emoji: '🚘', desc: 'Puertas, parachoque…' },
]

const ORDEN_OPS = ['Relevancia', 'Menor precio', 'Mayor precio', 'Más vistas']

const ESTADO_BADGE: Record<EstadoPieza, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#15803d', bg: '#dcfce7' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#dbeafe' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fef3c7' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fee2e2' },
}

function normalizeFitment(raw: unknown[]): { make: string; model: string; yearFrom: number; yearTo: number }[] {
  return (raw ?? []).flatMap(f => {
    const e = f as Record<string, unknown>
    const make  = ((e.make  as string) || (e.marca  as string) || '').trim()
    const model = ((e.model as string) || (e.modelo as string) || '').trim()
    if (!make || !model) return []
    let yearFrom = (e.yearFrom as number) || 0
    let yearTo   = (e.yearTo   as number) || 0
    if ((!yearFrom || !yearTo) && e.anios) {
      const anios = (e.anios as string).replace('–', '-').replace(/\s/g, '')
      const range  = anios.match(/^(\d{4})-(\d{4})$/)
      const single = anios.match(/^(\d{4})$/)
      yearFrom = range ? parseInt(range[1]) : single ? parseInt(single[1]) : 0
      yearTo   = range ? parseInt(range[2]) : yearFrom
    }
    if (!yearFrom || !yearTo) return []
    return [{ make, model, yearFrom, yearTo }]
  })
}

function productToItem(p: Product) {
  return {
    id: p.id, pieza: p.pieza, marca: p.marca ?? '', modelo: p.modelo ?? '',
    anios: p.anios ?? '', oem: p.oem,
    estado: (p.estado ?? 'bueno') as EstadoPieza,
    precio: p.precio, disponible: p.disponible, zona: 'motor',
    vendedorSlug: 'real',
    sellerNombre: p.seller_nombre ?? 'Vendedor Componenta',
    sellerTel: p.seller_telefono ?? null,
    fitment: normalizeFitment(p.fitment ?? []),
    vistas: p.vistas, imagen_url: p.imagen_url, isReal: true,
  }
}

export default function MarketplacePage() {
  const [busqueda,          setBusqueda]         = useState('')
  const [categoria,         setCategoria]        = useState<string | null>(null)
  const [orden,             setOrden]            = useState('Relevancia')
  const [showOrden,         setShowOrden]        = useState(false)
  const [showVehicleModal,  setShowVehicleModal] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [realItems,         setRealItems]        = useState<ReturnType<typeof productToItem>[]>([])
  const [vMake, setVMake] = useState(''); const [vModel, setVModel] = useState(''); const [vYear, setVYear] = useState('')
  const [heroSearch, setHeroSearch] = useState('')

  useEffect(() => {
    fetch('/api/marketplace').then(r => r.json()).then(d => setRealItems((d.products ?? []).map(productToItem))).catch(() => {})
  }, [])

  const makes = getAllMakes(); const models = vMake ? getModels(vMake) : []; const years = vMake && vModel ? getYears(vMake, vModel) : []
  const vehicleSelected = vMake && vModel && vYear; const yearNum = vehicleSelected ? parseInt(vYear) : 0
  const clearVehicle = () => { setVMake(''); setVModel(''); setVYear('') }
  const sellerOf = (slug: string) => mockDesarmaduras.find(d => d.slug === slug)

  const allItems = useMemo(() => {
    const src = [...realItems, ...mockInventory.map(i => ({ ...i, isReal: false, sellerNombre: undefined as string | undefined, sellerTel: null as string | null }))]
    let list = src.filter(i => i.disponible)
      .filter(i => !categoria || i.zona === categoria)
      .filter(i => {
        const q = busqueda.toLowerCase()
        return !q || i.pieza.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.modelo.toLowerCase().includes(q) || (i.oem?.toLowerCase().includes(q) ?? false)
      })
    if (vehicleSelected) list = [...list].sort((a, b) => { const s = (c: string) => c === 'compatible' ? 0 : c === 'unknown' ? 1 : 2; return s(checkCompatibility(a.fitment, vMake, vModel, yearNum)) - s(checkCompatibility(b.fitment, vMake, vModel, yearNum)) })
    if (orden === 'Menor precio') list = [...list].sort((a, b) => a.precio - b.precio)
    if (orden === 'Mayor precio') list = [...list].sort((a, b) => b.precio - a.precio)
    if (orden === 'Más vistas')   list = [...list].sort((a, b) => b.vistas - a.vistas)
    return list
  }, [busqueda, categoria, orden, vehicleSelected, vMake, vModel, yearNum, realItems])

  const countByCat = useMemo(() => {
    const src = [...realItems, ...mockInventory].filter(i => i.disponible)
    return Object.fromEntries(CATEGORIAS.slice(1).map(c => [c.id, src.filter(i => i.zona === c.id).length]))
  }, [realItems])

  const SEL: React.CSSProperties = { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#fff', color: '#111827', width: '100%', boxSizing: 'border-box' }
  const inCatalog = !!busqueda || categoria !== null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/marketplace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>C</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 15, color: '#111827', margin: 0, letterSpacing: -0.3 }}>Componenta</p>
              <p style={{ fontSize: 9, color: '#9ca3af', margin: 0, letterSpacing: 0.3, textTransform: 'uppercase' }}>repuestos usados Chile</p>
            </div>
          </Link>

          {/* Búsqueda desktop */}
          <div className="hidden sm:flex" style={{ flex: 1, maxWidth: 520, alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#f9fafb' }}>
            <input type="text" placeholder="¿Qué repuesto buscas?" value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', fontSize: 14, border: 'none', outline: 'none', color: '#111827', background: 'transparent' }} />
            <button style={{ background: '#1d4ed8', padding: '0 16px', height: 38, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#fff" />
            </button>
          </div>

          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <button onPointerDown={() => setShowVehicleModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', border: `1.5px solid ${vehicleSelected ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 9, background: vehicleSelected ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: vehicleSelected ? '#1d4ed8' : '#374151' }}>
              <Car size={14} color={vehicleSelected ? '#1d4ed8' : '#6b7280'} />
              {vehicleSelected ? `${vMake} ${vYear}` : 'Mi vehículo'}
            </button>
            <Link href="/" style={{ padding: '8px 14px', border: '1.5px solid #1d4ed8', borderRadius: 9, fontSize: 12, fontWeight: 700, color: '#1d4ed8', textDecoration: 'none', background: '#fff' }}>
              Panel vendedor →
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════ HERO BANNER ══════════════ */}
      {!inCatalog && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
          padding: '52px 20px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decoración */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 18 }}>
              🇨🇱 El marketplace de repuestos usados de Chile
            </span>
            <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.15, letterSpacing: -1 }}>
              Encuentra el repuesto<br />que tu auto necesita
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 32px', lineHeight: 1.6 }}>
              Miles de piezas usadas verificadas de desarmadurías de todo Chile.<br />Contacto directo, sin intermediarios.
            </p>

            {/* Buscador hero */}
            <div style={{ display: 'flex', maxWidth: 580, margin: '0 auto 20px', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
              <input type="text" placeholder="Ej: amortiguador delantero, disco freno, alternador…"
                value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && heroSearch) { setBusqueda(heroSearch); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) } }}
                style={{ flex: 1, padding: '15px 18px', fontSize: 15, border: 'none', outline: 'none', color: '#111827' }} />
              <button
                onPointerDown={() => { if (heroSearch) { setBusqueda(heroSearch); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) } }}
                style={{ background: '#1d4ed8', padding: '0 24px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                <Search size={16} /> Buscar
              </button>
            </div>

            {/* Búsquedas populares */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Amortiguador', 'Alternador', 'Pastillas de freno', 'Radiador', 'Embrague'].map(t => (
                <button key={t} onPointerDown={() => { setBusqueda(t); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) }}
                  style={{ padding: '5px 13px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CATEGORÍAS VISUALES ══════════════ */}
      {!inCatalog && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '32px 20px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Explorar por categoría</h2>
              <button onPointerDown={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todo <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {CATEGORIAS.slice(1).map(cat => (
                <button key={String(cat.id)} onPointerDown={() => { setCategoria(cat.id); document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }) }}
                  style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '18px 10px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.borderColor = '#1d4ed8' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb' }}>
                  <span style={{ fontSize: 30 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{cat.label}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{countByCat[cat.id as string] ?? 0} piezas</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ VENDEDORES DESTACADOS ══════════════ */}
      {!inCatalog && (
        <div style={{ background: '#f5f6f7', padding: '32px 20px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 18px' }}>Desarmadurías destacadas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {mockDesarmaduras.map(d => (
                <Link key={d.id} href={`/d/${d.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
                    {/* Banner */}
                    <div style={{ height: 60, background: `linear-gradient(135deg, ${d.color}dd, ${d.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 17 }}>
                        {d.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= Math.round(d.rating) ? '#facc15' : '#e5e7eb'} color={s <= Math.round(d.rating) ? '#facc15' : '#e5e7eb'} />)}
                        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 2 }}>{d.rating}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>Ver tienda</span>
                        <ChevronRight size={13} color="#9ca3af" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TRUST STRIP ══════════════ */}
      {!inCatalog && (
        <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '18px 20px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 0, justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {[
              { icon: ShieldCheck, color: '#15803d', title: 'Vendedores verificados', sub: 'Todos revisados por Componenta' },
              { icon: Truck,       color: '#1d4ed8', title: 'Envío a todo Chile',     sub: 'Despacho desde la desarmaduria' },
              { icon: MessageCircle, color: '#7c3aed', title: 'Contacto directo',     sub: 'WhatsApp sin intermediarios' },
            ].map(({ icon: Icon, color, title, sub }, i) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 24px', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none', flex: 1, justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ CATÁLOGO ══════════════ */}
      <div id="catalogo" style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 16px 80px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* SIDEBAR */}
        <aside className="mp-aside" style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 76 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Car size={15} color="#1d4ed8" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Filtrar por auto</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>Ver solo piezas compatibles</p>
            {vehicleSelected ? (
              <div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 13, margin: 0 }}>{vMake} {vModel}</p>
                  <p style={{ color: '#3b82f6', fontSize: 12, margin: '2px 0 0' }}>Año {vYear}</p>
                </div>
                <button onPointerDown={clearVehicle}
                  style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Cambiar vehículo
                </button>
              </div>
            ) : (
              <button onPointerDown={() => setShowVehicleModal(true)}
                style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Car size={14} /> Seleccionar vehículo
              </button>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: '0 0 10px' }}>Categorías</p>
            {CATEGORIAS.map(cat => (
              <button key={String(cat.id)} onPointerDown={() => setCategoria(cat.id)}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: categoria === cat.id ? '#eff6ff' : 'transparent', color: categoria === cat.id ? '#1d4ed8' : '#374151', fontWeight: categoria === cat.id ? 700 : 400 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span>{cat.emoji}</span> {cat.label}</span>
                {cat.id !== null && (
                  <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '1px 6px', borderRadius: 20 }}>{countByCat[cat.id as string] ?? 0}</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>
                {categoria ? CATEGORIAS.find(c => c.id === categoria)?.label : busqueda ? `"${busqueda}"` : 'Todos los repuestos'}
              </h2>
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>{allItems.length} resultados</span>
              {(categoria || busqueda || vehicleSelected) && (
                <button onPointerDown={() => { setCategoria(null); setBusqueda(''); clearVehicle() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#fff5f5', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  <X size={10} /> Limpiar filtros
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Búsqueda móvil */}
              <div className="sm:hidden" style={{ position: 'relative' }}>
                <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Buscar…" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#111827', outline: 'none', width: 130 }} />
              </div>
              <button onPointerDown={() => setShowMobileFilters(true)} className="sm:hidden"
                style={{ padding: '7px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <SlidersHorizontal size={13} /> Filtros
              </button>
              <div style={{ position: 'relative' }}>
                <button onPointerDown={() => setShowOrden(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  {orden} <ChevronDown size={13} color="#9ca3af" />
                </button>
                {showOrden && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', zIndex: 30, minWidth: 160, overflow: 'hidden' }}>
                    {ORDEN_OPS.map(op => (
                      <button key={op} onPointerDown={() => { setOrden(op); setShowOrden(false) }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: orden === op ? '#eff6ff' : '#fff', color: orden === op ? '#1d4ed8' : '#374151', fontSize: 13, fontWeight: orden === op ? 700 : 400, cursor: 'pointer' }}>
                        {op}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GRID */}
          {allItems.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '60px 24px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
              <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Sin resultados</p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>Prueba con otro término o categoría</p>
              <button onPointerDown={() => { setBusqueda(''); setCategoria(null) }}
                style={{ padding: '10px 22px', borderRadius: 10, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                Ver todo
              </button>
            </div>
          ) : (
            <div className="mp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 14 }}>
              {allItems.map(item => {
                const ri = item as { isReal?: boolean; sellerNombre?: string; sellerTel?: string | null }
                const isReal       = ri.isReal ?? false
                const mockSeller   = isReal ? null : sellerOf(item.vendedorSlug)
                const sellerNombre = isReal ? (ri.sellerNombre ?? 'Vendedor') : (mockSeller?.nombre ?? 'Vendedor')
                const sellerTel    = isReal ? (ri.sellerTel ?? '56912345678') : (mockSeller?.telefono ?? '56912345678')
                const e            = ESTADO_BADGE[item.estado]
                const compat       = vehicleSelected ? checkCompatibility(item.fitment, vMake, vModel, yearNum) : null
                const imgUrl       = (item as { imagen_url?: string | null }).imagen_url
                const waLink       = `https://wa.me/${sellerTel.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Vi "${item.pieza}" en Componenta a $${item.precio.toLocaleString('es-CL')}. ¿Está disponible?`)}`

                return (
                  <div key={item.id}
                    onClick={() => window.location.href = `/marketplace/${item.id}`}
                    style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s,transform 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>

                    {/* Imagen */}
                    <div style={{ paddingTop: '68%', position: 'relative', background: '#f8f9fa', overflow: 'hidden' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.pieza} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 44, opacity: 0.25 }}>
                            {{ motor: '⚙️', electrico: '⚡', frenos: '🛑', 'suspension-d': '🔩', transmision: '🔧', interior: '🪑', escape: '💨', carroceria: '🚘' }[item.zona ?? ''] ?? '🔧'}
                          </span>
                        </div>
                      )}
                      {compat === 'compatible' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: '#1d4ed8', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={9} /> Compatible
                        </div>
                      )}
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: e.bg, color: e.color }}>{e.label}</span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '11px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        {item.marca}{item.modelo ? ` · ${item.modelo}` : ''}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3, minHeight: 34, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                        {item.pieza}
                      </p>
                      {item.oem && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 5, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: '#0369a1', width: 'fit-content' }}>
                          OEM {item.oem}
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                        <p style={{ fontSize: 21, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: -0.5 }}>
                          ${item.precio.toLocaleString('es-CL')}
                        </p>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>CLP</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <Truck size={10} color="#1d4ed8" />
                        <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>Envío disponible</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 8, borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 5, background: isReal ? '#1d4ed8' : (mockSeller?.color ?? '#6b7280'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 900, flexShrink: 0 }}>
                          {sellerNombre[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 11, color: '#6b7280', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sellerNombre}</span>
                        {!isReal && mockSeller && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star size={9} fill="#facc15" color="#facc15" />
                            <span style={{ fontSize: 10, color: '#374151', fontWeight: 700 }}>{mockSeller.rating}</span>
                          </div>
                        )}
                      </div>

                      <a href={waLink} target="_blank" rel="noopener noreferrer"
                        onClick={ev => ev.stopPropagation()}
                        style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
                        <MessageCircle size={13} /> Consultar por WhatsApp
                      </a>
                      <a href={`/chat/directo?room=pieza-${item.id}&pieza=${encodeURIComponent(item.pieza)}&vendedor=${encodeURIComponent(sellerNombre)}&wa=${encodeURIComponent(waLink)}`}
                        onClick={ev => ev.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 10, background: '#f0f9ff', border: '1.5px solid #bae6fd', color: '#1d4ed8', fontWeight: 700, fontSize: 11, textDecoration: 'none' }}>
                        <Tag size={11} /> Chat directo
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal vehículo */}
      {showVehicleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowVehicleModal(false)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>Busca por tu vehículo</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Filtra piezas compatibles con tu auto</p>
              </div>
              <button onPointerDown={() => setShowVehicleModal(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}><X size={16} color="#6b7280" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: vMake, set: (v: string) => { setVMake(v); setVModel(''); setVYear('') }, opts: makes, label: 'Selecciona la marca', dis: false },
                { value: vModel, set: (v: string) => { setVModel(v); setVYear('') }, opts: models, label: 'Selecciona el modelo', dis: !vMake },
                { value: vYear, set: (v: string) => { setVYear(v); setShowVehicleModal(false) }, opts: years, label: 'Selecciona el año', dis: !vModel },
              ].map(({ value, set, opts, label, dis }) => (
                <select key={label} value={value} onChange={e => set(e.target.value)} disabled={dis} style={{ ...SEL, opacity: dis ? 0.5 : 1 }}>
                  <option value="">{label}</option>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>
            {vehicleSelected && (
              <button onPointerDown={() => { clearVehicle(); setShowVehicleModal(false) }}
                style={{ marginTop: 12, width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#b91c1c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Quitar filtro de vehículo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel filtros móvil */}
      {showMobileFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowMobileFilters(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Filtros</span>
              <button onPointerDown={() => setShowMobileFilters(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#6b7280', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Categoría</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {CATEGORIAS.map(cat => (
                <button key={String(cat.id)} onPointerDown={() => { setCategoria(cat.id); setShowMobileFilters(false) }}
                  style={{ padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${categoria === cat.id ? '#1d4ed8' : '#e5e7eb'}`, background: categoria === cat.id ? '#eff6ff' : '#fff', color: categoria === cat.id ? '#1d4ed8' : '#374151', fontSize: 12, fontWeight: categoria === cat.id ? 700 : 500, cursor: 'pointer', textAlign: 'left' }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            {(categoria || vehicleSelected) && (
              <button onPointerDown={() => { setCategoria(null); clearVehicle(); setShowMobileFilters(false) }}
                style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#b91c1c', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
