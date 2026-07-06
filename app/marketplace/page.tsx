'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, MessageCircle, ChevronDown, X, Check, Truck, Car, User, ChevronRight, Package, SlidersHorizontal, ShieldCheck, Phone, Tag } from 'lucide-react'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'

const CATEGORIAS = [
  { id: null,           label: 'Todas',       emoji: '🔍' },
  { id: 'motor',        label: 'Motor',       emoji: '⚙️' },
  { id: 'electrico',    label: 'Eléctrico',   emoji: '⚡' },
  { id: 'frenos',       label: 'Frenos',      emoji: '🛑' },
  { id: 'suspension-d', label: 'Suspensión',  emoji: '🔩' },
  { id: 'transmision',  label: 'Transmisión', emoji: '🔧' },
  { id: 'interior',     label: 'Interior',    emoji: '🪑' },
  { id: 'escape',       label: 'Escape',      emoji: '💨' },
  { id: 'carroceria',   label: 'Carrocería',  emoji: '🚘' },
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
  const [busqueda,          setBusqueda]          = useState('')
  const [categoria,         setCategoria]         = useState<string | null>(null)
  const [orden,             setOrden]             = useState('Relevancia')
  const [showOrden,         setShowOrden]         = useState(false)
  const [showVehicleModal,  setShowVehicleModal]  = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [realItems,         setRealItems]         = useState<ReturnType<typeof productToItem>[]>([])
  const [vMake, setVMake] = useState(''); const [vModel, setVModel] = useState(''); const [vYear, setVYear] = useState('')

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
      .filter(i => { if (!busqueda) return true; const q = busqueda.toLowerCase(); return i.pieza.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q) || i.modelo.toLowerCase().includes(q) || (i.oem?.toLowerCase().includes(q) ?? false) })
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {/* Top row */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Logo */}
          <Link href="/marketplace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 17 }}>C</div>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#111827', letterSpacing: -0.3 }}>Componenta</span>
          </Link>

          {/* Buscador principal — como citrolidi */}
          <div style={{ flex: 1, maxWidth: 600, display: 'flex', border: '2px solid #1d4ed8', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(29,78,216,0.12)' }}>
            <input type="text" placeholder="¿Qué repuesto buscas? Marca, nombre, código OEM…"
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', fontSize: 14, border: 'none', outline: 'none', color: '#111827', background: 'transparent' }} />
            <button style={{ background: '#1d4ed8', padding: '0 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              <Search size={16} /> Buscar
            </button>
          </div>

          {/* Vehículo + usuario (desktop) */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 12 }}>
            <button onPointerDown={() => setShowVehicleModal(true)}
              style={{ touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: `1.5px solid ${vehicleSelected ? '#1d4ed8' : '#e5e7eb'}`, borderRadius: 10, background: vehicleSelected ? '#eff6ff' : '#f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: vehicleSelected ? '#1d4ed8' : '#374151' }}>
              <Car size={15} color={vehicleSelected ? '#1d4ed8' : '#6b7280'} />
              {vehicleSelected ? `${vMake} ${vYear}` : 'Mi vehículo'}
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', background: '#f9fafb' }}>
              <User size={15} color="#6b7280" /> Panel
            </Link>
          </div>
        </div>

        {/* Barra de categorías */}
        <div style={{ background: '#fff', borderTop: '1px solid #f1f2f4', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 2 }}>
            {CATEGORIAS.map(cat => (
              <button key={String(cat.id)} onPointerDown={() => setCategoria(cat.id)}
                style={{ touchAction: 'manipulation', border: 'none', background: 'transparent', color: categoria === cat.id ? '#1d4ed8' : '#6b7280', padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontWeight: categoria === cat.id ? 700 : 500, whiteSpace: 'nowrap', flexShrink: 0, borderBottom: `2px solid ${categoria === cat.id ? '#1d4ed8' : 'transparent'}`, transition: 'all 0.15s' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Búsqueda + filtro móvil */}
      <div className="sm:hidden" style={{ background: '#fff', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <input type="text" placeholder="¿Qué repuesto buscas?" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ flex: 1, padding: '9px 12px', fontSize: 13, border: 'none', outline: 'none', color: '#111827' }} />
          {busqueda && <button onPointerDown={() => setBusqueda('')} style={{ background: 'none', border: 'none', padding: '0 10px', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>×</button>}
        </div>
        <button onPointerDown={() => setShowMobileFilters(true)}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${(categoria || vehicleSelected) ? '#1d4ed8' : '#e5e7eb'}`, background: (categoria || vehicleSelected) ? '#eff6ff' : '#fff', color: (categoria || vehicleSelected) ? '#1d4ed8' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <SlidersHorizontal size={14} /> Filtrar
        </button>
      </div>

      {/* Modal vehículo */}
      {showVehicleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
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

      {/* Panel filtros móvil (bottom sheet) */}
      {showMobileFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowMobileFilters(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Filtros</span>
              <button onPointerDown={() => setShowMobileFilters(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#6b7280', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Mi vehículo</p>
            {vehicleSelected ? (
              <div style={{ background: '#eff6ff', border: '1.5px solid #1d4ed8', borderRadius: 10, padding: '10px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 13 }}>{vMake} {vModel} {vYear}</span>
                <button onPointerDown={clearVehicle} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: 12 }}>Quitar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { value: vMake, set: (v: string) => { setVMake(v); setVModel(''); setVYear('') }, opts: makes, label: 'Marca', dis: false },
                  { value: vModel, set: (v: string) => { setVModel(v); setVYear('') }, opts: models, label: 'Modelo', dis: !vMake },
                  { value: vYear, set: (v: string) => setVYear(v), opts: years, label: 'Año', dis: !vModel },
                ].map(({ value, set, opts, label, dis }) => (
                  <select key={label} value={value} onChange={e => set(e.target.value)} disabled={dis} style={{ ...SEL, opacity: dis ? 0.5 : 1 }}>
                    <option value="">{label}</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ))}
              </div>
            )}
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

      {/* ══ BODY ══ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 80px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* SIDEBAR */}
        <aside className="mp-aside" style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Filtro vehículo */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Car size={15} color="#1d4ed8" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Filtra por tu auto</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>Ver piezas compatibles</p>
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

          {/* Categorías */}
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

          {/* Vendedores */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: '0 0 10px' }}>Desarmadurías</p>
            {mockDesarmaduras.map(d => (
              <Link key={d.id} href={`/d/${d.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, textDecoration: 'none', marginBottom: 2, background: 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${d.color}bb,${d.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{d.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={8} fill={s <= Math.round(d.rating) ? '#facc15' : '#e5e7eb'} color={s <= Math.round(d.rating) ? '#facc15' : '#e5e7eb'} />)}
                    <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 2 }}>{d.rating}</span>
                  </div>
                </div>
                <ChevronRight size={12} color="#d1d5db" />
              </Link>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {[
              { icon: ShieldCheck, color: '#15803d', text: 'Vendedores verificados' },
              { icon: Truck,       color: '#1d4ed8', text: 'Envío a todo Chile' },
              { icon: Phone,       color: '#7c3aed', text: 'Contacto directo' },
            ].map(({ icon: Icon, color, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} color={color} />
                </div>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af' }}>
              <span style={{ cursor: 'pointer', color: '#1d4ed8', fontWeight: 600 }} onPointerDown={() => { setBusqueda(''); setCategoria(null) }}>Repuestos</span>
              {categoria && <><ChevronRight size={12} /><span style={{ color: '#111827', fontWeight: 600 }}>{CATEGORIAS.find(c => c.id === categoria)?.label}</span></>}
              {busqueda && <><ChevronRight size={12} /><span style={{ color: '#111827' }}>&ldquo;{busqueda}&rdquo;</span></>}
              <span>({allItems.length} resultados)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {vehicleSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '5px 10px' }}>
                  <Check size={12} color="#1d4ed8" />
                  <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>{vMake} {vModel} {vYear}</span>
                  <button onPointerDown={clearVehicle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={11} color="#1d4ed8" /></button>
                </div>
              )}
              <span style={{ fontSize: 13, color: '#6b7280' }}>Ordenar:</span>
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
                        {op} {orden === op && <Check size={12} color="#1d4ed8" style={{ display: 'inline', marginLeft: 6 }} />}
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
                    style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaed', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s,transform 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>

                    {/* Imagen */}
                    <div style={{ paddingTop: '72%', position: 'relative', background: '#f8f9fa', overflow: 'hidden' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.pieza} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={36} color="#d1d5db" />
                        </div>
                      )}
                      {/* Compat badge */}
                      {compat === 'compatible' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: '#1d4ed8', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={9} /> Compatible
                        </div>
                      )}
                      {compat === 'incompatible' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: '#b91c1c', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>No compatible</div>
                      )}
                      {/* Estado */}
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: e.bg, color: e.color }}>
                        {e.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px 13px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '4px 0 0', letterSpacing: -0.5 }}>
                        ${item.precio.toLocaleString('es-CL')}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Truck size={10} color="#1d4ed8" />
                        <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>Envío disponible</span>
                      </div>

                      {/* Vendedor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 8, borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: isReal ? '#1d4ed8' : (mockSeller?.color ?? '#6b7280'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 900, flexShrink: 0 }}>
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

                      {/* CTAs */}
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer"
                          onClick={ev => ev.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 9, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                          <MessageCircle size={13} /> Consultar por WhatsApp
                        </a>
                        <a href={`/chat/directo?room=pieza-${item.id}&pieza=${encodeURIComponent(item.pieza)}&vendedor=${encodeURIComponent(sellerNombre)}&wa=${encodeURIComponent(waLink)}`}
                          onClick={ev => ev.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 9, background: '#f0f9ff', border: '1.5px solid #bae6fd', color: '#1d4ed8', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                          <Tag size={12} /> Chat directo
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
