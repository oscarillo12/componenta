'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star, MessageCircle, ChevronDown, X, Check, Truck, Car, Menu, User, ShoppingCart, MapPin, ChevronRight } from 'lucide-react'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'

const CATEGORIAS = [
  { id: null,           label: 'Todas las categorías', emoji: '🔍' },
  { id: 'motor',        label: 'Motor',                emoji: '⚙️' },
  { id: 'electrico',    label: 'Eléctrico',            emoji: '⚡' },
  { id: 'frenos',       label: 'Frenos',               emoji: '🛑' },
  { id: 'suspension-d', label: 'Suspensión',           emoji: '🔩' },
  { id: 'transmision',  label: 'Transmisión',          emoji: '🔧' },
  { id: 'interior',     label: 'Interior',             emoji: '🪑' },
  { id: 'escape',       label: 'Escape',               emoji: '💨' },
  { id: 'carroceria',   label: 'Carrocería',           emoji: '🚘' },
]

const ORDEN_OPS = ['Relevancia', 'Menor precio', 'Mayor precio', 'Más vistas']

const ESTADO_BADGE: Record<EstadoPieza, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#A5D6FF', bg: '#dbeafe' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#dbeafe' },
  'con-detalles': { label: 'Con detalles', color: '#92400e', bg: '#fef3c7' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fee2e2' },
}

// Normaliza cualquier formato de fitment que venga de Supabase al formato canónico
// {make,model,yearFrom,yearTo} que checkCompatibility espera
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
  const [busqueda,           setBusqueda]           = useState('')
  const [categoria,          setCategoria]          = useState<string | null>(null)
  const [orden,              setOrden]              = useState('Relevancia')
  const [showOrden,          setShowOrden]          = useState(false)
  const [showVehicleModal,   setShowVehicleModal]   = useState(false)
  const [showMobileFilters,  setShowMobileFilters]  = useState(false)
  const [realItems,          setRealItems]          = useState<ReturnType<typeof productToItem>[]>([])
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

  // Contar por categoría
  const countByCat = useMemo(() => {
    const src = [...realItems, ...mockInventory].filter(i => i.disponible)
    return Object.fromEntries(CATEGORIAS.slice(1).map(c => [c.id, src.filter(i => i.zona === c.id).length]))
  }, [realItems])

  return (
    <div style={{ minHeight: '100vh', background: '#21262D', fontFamily: 'system-ui,sans-serif' }}>

      {/* ═══════════ BARRA SUPERIOR NEGRA ═══════════ */}
      <div style={{ background: '#111827', padding: '6px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Cómo funciona', 'Vendedores', 'Seguimiento'].map(l => (
              <span key={l} style={{ fontSize: 12, color: '#B1BAC4', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}>{l}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#B1BAC4' }}>componenta.cl</span>
            <Link href="/" style={{ fontSize: 12, color: '#79C0FF', fontWeight: 700, textDecoration: 'none' }}>Panel vendedor →</Link>
          </div>
        </div>
      </div>

      {/* ═══════════ HEADER PRINCIPAL ═══════════ */}
      <header style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Logo */}
          <Link href="/marketplace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>C</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: '#E6EDF3', margin: 0, lineHeight: 1 }}>Componenta</p>
              <p style={{ fontSize: 10, color: '#B1BAC4', margin: '2px 0 0' }}>repuestos usados</p>
            </div>
          </Link>

          {/* Buscador — oculto en móvil (se muestra en barra separada) */}
          <div className="hidden sm:flex" style={{ flex: 1, maxWidth: 560, border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden', background: '#21262D' }}>
            <input type="text" placeholder="Busca por nombre, marca o código OEM…" value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ flex: 1, padding: '11px 16px', fontSize: 14, border: 'none', outline: 'none', color: '#E6EDF3', background: 'transparent' }} />
            <button style={{ background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', padding: '0 18px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={18} color="#fff" />
            </button>
          </div>

          {/* Vehículo */}
          <button onPointerDown={() => setShowVehicleModal(true)}
            style={{ touchAction: 'manipulation', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '6px 14px', border: `1.5px solid ${vehicleSelected ? 'rgba(56,139,253,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 9, background: vehicleSelected ? 'rgba(56,139,253,0.15)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', flexShrink: 0 }}>
            <Car size={18} color={vehicleSelected ? '#79C0FF' : '#8B949E'} />
            <span style={{ fontSize: 10, color: vehicleSelected ? '#A5D6FF' : '#8B949E', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {vehicleSelected ? `${vMake} ${vYear}` : 'Mi vehículo'}
            </span>
          </button>

          {/* Usuario */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '4px 12px', textDecoration: 'none', flexShrink: 0 }}>
            <User size={18} color="#8B949E" />
            <span style={{ fontSize: 10, color: '#B1BAC4', fontWeight: 600 }}>Ingresar</span>
          </Link>
        </div>

        {/* Barra de categorías */}
        <div style={{ background: '#010409', borderTop: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'stretch' }}>
            <button onPointerDown={() => setCategoria(null)}
              style={{ touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', border: 'none', background: !categoria ? 'rgba(56,139,253,0.15)' : 'transparent', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, borderBottom: !categoria ? '2px solid #388BFD' : '2px solid transparent', transition: 'all 0.15s' }}>
              <Menu size={15} /> Todas
            </button>
            {CATEGORIAS.slice(1).map(cat => (
              <button key={String(cat.id)} onPointerDown={() => setCategoria(cat.id)}
                style={{ touchAction: 'manipulation', border: 'none', background: categoria === cat.id ? 'rgba(56,139,253,0.12)' : 'transparent', color: categoria === cat.id ? '#E6EDF3' : '#8B949E', padding: '11px 15px', cursor: 'pointer', fontSize: 13, fontWeight: categoria === cat.id ? 700 : 500, whiteSpace: 'nowrap', flexShrink: 0, borderBottom: `2px solid ${categoria === cat.id ? '#388BFD' : 'transparent'}`, transition: 'all 0.15s', letterSpacing: 0.1 }}
                onMouseEnter={e => { if (categoria !== cat.id) (e.currentTarget as HTMLElement).style.color = '#CDD9E5' }}
                onMouseLeave={e => { if (categoria !== cat.id) (e.currentTarget as HTMLElement).style.color = '#8B949E' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Modal vehículo */}
      {showVehicleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowVehicleModal(false)}>
          <div style={{ background: '#161B22', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', margin: 0 }}>Busca por tu vehículo</p>
                <p style={{ fontSize: 13, color: '#B1BAC4', margin: '4px 0 0' }}>Ver compatibilidad en cada pieza</p>
              </div>
              <button onPointerDown={() => setShowVehicleModal(false)} style={{ background: '#21262D', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', touchAction: 'manipulation' }}><X size={16} color="#8B949E" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={vMake} onChange={e => { setVMake(e.target.value); setVModel(''); setVYear('') }}
                style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22' }}>
                <option value="">Selecciona la marca</option>
                {makes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={vModel} onChange={e => { setVModel(e.target.value); setVYear('') }} disabled={!vMake}
                style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22', opacity: vMake ? 1 : 0.5 }}>
                <option value="">Selecciona el modelo</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={vYear} onChange={e => { setVYear(e.target.value); setShowVehicleModal(false) }} disabled={!vModel}
                style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22', opacity: vModel ? 1 : 0.5 }}>
                <option value="">Selecciona el año</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {vehicleSelected && (
              <button onPointerDown={() => { clearVehicle(); setShowVehicleModal(false) }}
                style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #fca5a5', background: '#161B22', color: '#b91c1c', fontSize: 13, fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation' }}>
                Quitar filtro de vehículo
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Barra de búsqueda móvil (bajo el header en pantallas pequeñas) ── */}
      <div className="sm:hidden" style={{ background: '#161B22', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, overflow: 'hidden', background: '#21262D' }}>
          <input type="text" placeholder="Buscar pieza, marca, OEM…" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ flex: 1, padding: '9px 12px', fontSize: 13, border: 'none', outline: 'none', color: '#E6EDF3', background: 'transparent' }} />
          {busqueda && <button onPointerDown={() => setBusqueda('')} style={{ background: 'none', border: 'none', padding: '0 10px', cursor: 'pointer', color: '#8B949E', fontSize: 16 }}>×</button>}
        </div>
        <button onPointerDown={() => setShowMobileFilters(true)}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${(categoria || vehicleSelected) ? 'rgba(56,139,253,0.5)' : 'rgba(255,255,255,0.15)'}`, background: (categoria || vehicleSelected) ? 'rgba(56,139,253,0.15)' : '#21262D', color: (categoria || vehicleSelected) ? '#79C0FF' : '#8B949E', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
          ⚙ Filtros{(categoria || vehicleSelected) ? ' •' : ''}
        </button>
      </div>

      {/* Panel de filtros móvil (bottom sheet) */}
      {showMobileFilters && (
        <div className="filter-sheet-overlay" onClick={() => setShowMobileFilters(false)}>
          <div className="filter-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#E6EDF3' }}>Filtros</span>
              <button onPointerDown={() => setShowMobileFilters(false)} style={{ background: '#21262D', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#8B949E', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            {/* Vehículo */}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: '0 0 10px' }}>Mi vehículo</p>
            {vehicleSelected ? (
              <div style={{ background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 10, padding: '10px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#A5D6FF', fontSize: 13 }}>{vMake} {vModel} {vYear}</span>
                <button onPointerDown={() => { clearVehicle() }} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 12 }}>Quitar</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <select value={vMake} onChange={e => { setVMake(e.target.value); setVModel(''); setVYear('') }}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 13, outline: 'none', background: '#21262D', color: '#E6EDF3' }}>
                  <option value="">Marca</option>
                  {makes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vModel} onChange={e => { setVModel(e.target.value); setVYear('') }} disabled={!vMake}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 13, outline: 'none', background: '#21262D', color: '#E6EDF3', opacity: vMake ? 1 : 0.5 }}>
                  <option value="">Modelo</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vYear} onChange={e => setVYear(e.target.value)} disabled={!vModel}
                  style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 13, outline: 'none', background: '#21262D', color: '#E6EDF3', opacity: vModel ? 1 : 0.5 }}>
                  <option value="">Año</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* Categorías */}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: '16px 0 10px' }}>Categoría</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {CATEGORIAS.map(cat => (
                <button key={String(cat.id)} onPointerDown={() => { setCategoria(cat.id); setShowMobileFilters(false) }}
                  style={{ padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${categoria === cat.id ? 'rgba(56,139,253,0.5)' : 'rgba(255,255,255,0.08)'}`, background: categoria === cat.id ? 'rgba(56,139,253,0.15)' : '#21262D', color: categoria === cat.id ? '#79C0FF' : '#8B949E', fontSize: 12, fontWeight: categoria === cat.id ? 700 : 500, cursor: 'pointer', textAlign: 'left' }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {(categoria || vehicleSelected) && (
              <button onPointerDown={() => { setCategoria(null); clearVehicle(); setShowMobileFilters(false) }}
                style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ BODY ═══════════ */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 12px 80px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── SIDEBAR (solo desktop) ── */}
        <aside className="mp-aside" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Selector vehículo */}
          <div style={{ background: '#161B22', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Car size={16} color="#79C0FF" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3' }}>Busque por su vehículo</span>
            </div>
            <p style={{ fontSize: 11, color: '#B1BAC4', margin: '0 0 12px', lineHeight: 1.4 }}>para ver compatibilidad de cada pieza</p>
            {vehicleSelected ? (
              <div>
                <div style={{ background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, color: '#A5D6FF', fontSize: 13, margin: 0 }}>{vMake} {vModel}</p>
                  <p style={{ color: '#79C0FF', fontSize: 12, margin: '2px 0 0' }}>{vYear}</p>
                </div>
                <button onPointerDown={clearVehicle}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.1)', background: '#161B22', color: '#B1BAC4', fontSize: 12, fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation' }}>
                  Cambiar vehículo
                </button>
              </div>
            ) : (
              <button onPointerDown={() => setShowVehicleModal(true)}
                style={{ touchAction: 'manipulation', width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Car size={15} /> Seleccionar vehículo
              </button>
            )}
          </div>

          {/* Categorías */}
          <div style={{ background: '#161B22', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', margin: '0 0 10px' }}>Categorías</p>
            {CATEGORIAS.map(cat => (
              <button key={String(cat.id)} onPointerDown={() => setCategoria(cat.id)}
                style={{ touchAction: 'manipulation', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: categoria === cat.id ? '#eff6ff' : 'transparent',
                  color: categoria === cat.id ? '#1A56DB' : '#374151',
                  fontWeight: categoria === cat.id ? 700 : 400 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span>{cat.emoji}</span> {cat.label}
                </span>
                {cat.id !== null && (
                  <span style={{ fontSize: 11, color: '#B1BAC4', background: '#21262D', padding: '1px 6px', borderRadius: 20 }}>
                    {countByCat[cat.id as string] ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Vendedores */}
          <div style={{ background: '#161B22', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', margin: '0 0 10px' }}>Vendedores</p>
            {mockDesarmaduras.map(d => (
              <Link key={d.id} href={`/d/${d.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px', borderRadius: 8, textDecoration: 'none', marginBottom: 2 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${d.color}cc,${d.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{d.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                    <Star size={9} fill="#facc15" color="#facc15" />
                    <span style={{ fontSize: 10, color: '#B1BAC4' }}>{d.rating}</span>
                  </div>
                </div>
                <ChevronRight size={12} color="#3b5280" />
              </Link>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Breadcrumb / toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#B1BAC4' }}>
              <span style={{ cursor: 'pointer', color: '#79C0FF', fontWeight: 600 }} onPointerDown={() => { setBusqueda(''); setCategoria(null) }}>Repuestos</span>
              {categoria && <><ChevronRight size={12} /><span style={{ color: '#E6EDF3', fontWeight: 600 }}>{CATEGORIAS.find(c => c.id === categoria)?.label}</span></>}
              {busqueda && <><ChevronRight size={12} /><span style={{ color: '#E6EDF3' }}>&ldquo;{busqueda}&rdquo;</span></>}
              <span style={{ color: '#B1BAC4' }}>({allItems.length})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {vehicleSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.15)', border: '1px solid rgba(56,139,253,0.4)', borderRadius: 8, padding: '5px 10px' }}>
                  <Check size={12} color="#79C0FF" />
                  <span style={{ fontSize: 12, color: '#A5D6FF', fontWeight: 600 }}>{vMake} {vModel} {vYear}</span>
                  <button onPointerDown={clearVehicle} style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation', padding: 0, display: 'flex' }}><X size={11} color="#79C0FF" /></button>
                </div>
              )}
              <span style={{ fontSize: 13, color: '#E6EDF3' }}>Ordenar por:</span>
              <div style={{ position: 'relative' }}>
                <button onPointerDown={() => setShowOrden(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#161B22', fontSize: 13, color: '#E6EDF3', cursor: 'pointer', touchAction: 'manipulation' }}>
                  {orden} <ChevronDown size={13} color="#6E7681" />
                </button>
                {showOrden && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 30, minWidth: 160, overflow: 'hidden' }}>
                    {ORDEN_OPS.map(op => (
                      <button key={op} onPointerDown={() => { setOrden(op); setShowOrden(false) }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: orden === op ? '#eff6ff' : '#fff', color: orden === op ? '#1A56DB' : '#374151', fontSize: 13, fontWeight: orden === op ? 700 : 400, cursor: 'pointer', touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {op} {orden === op && <Check size={12} color="#79C0FF" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── GRID DE PRODUCTOS ── */}
          {allItems.length === 0 ? (
            <div style={{ background: '#161B22', borderRadius: 16, padding: '60px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>Sin resultados</p>
              <p style={{ fontSize: 14, color: '#B1BAC4', margin: '0 0 20px' }}>Prueba con otro término o categoría</p>
              <button onPointerDown={() => { setBusqueda(''); setCategoria(null) }}
                style={{ padding: '10px 22px', borderRadius: 10, background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
                Ver todo
              </button>
            </div>
          ) : (
            <div className="mp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
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
                    style={{ background: '#161B22', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>

                    {/* Imagen */}
                    <div style={{ height: 170, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 54, opacity: 0.25 }}>
                          {{ motor: '⚙️', electrico: '⚡', frenos: '🛑', 'suspension-d': '🔩', transmision: '🔧', interior: '🪑', escape: '💨' }[item.zona ?? ''] ?? '🔧'}
                        </span>
                      )}
                      {/* Compat badge */}
                      {compat === 'compatible' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: '#388BFD', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={9} /> Compatible
                        </div>
                      )}
                      {compat === 'incompatible' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: '#b91c1c', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                          No compatible
                        </div>
                      )}
                      {/* Estado */}
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: e.bg, color: e.color }}>
                        {e.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ fontSize: 10, color: '#B1BAC4', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {item.marca}{item.modelo ? ` · ${item.modelo}` : ''}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3', margin: 0, lineHeight: 1.35, minHeight: 36 }}>{item.pieza}</p>

                      {/* Código de parte original (OEM) */}
                      {item.oem && (
                        <div title="Número de parte original del fabricante (OEM)" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56,139,253,0.12)', border: '1px solid rgba(56,139,253,0.35)', borderRadius: 6, padding: '2px 7px', width: 'fit-content', cursor: 'help' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#79C0FF', letterSpacing: 0.3 }}>N° Parte</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#A5D6FF', fontFamily: 'monospace' }}>{item.oem}</span>
                        </div>
                      )}

                      {/* Precio */}
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#E6EDF3', margin: '4px 0 0', letterSpacing: -0.5, lineHeight: 1 }}>
                        ${item.precio.toLocaleString('es-CL')}
                      </p>

                      {/* Envío */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Truck size={11} color="#79C0FF" />
                        <span style={{ fontSize: 11, color: '#79C0FF', fontWeight: 600 }}>Envío disponible</span>
                      </div>

                      {/* Vendedor + rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 8, borderTop: '1px solid #f3f4f6', marginTop: 4 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: isReal ? '#1A56DB' : (mockSeller?.color ?? '#6b7280'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 900, flexShrink: 0 }}>
                          {sellerNombre[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 11, color: '#B1BAC4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sellerNombre}</span>
                        {!isReal && mockSeller && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Star size={9} fill="#facc15" color="#facc15" />
                            <span style={{ fontSize: 10, color: '#E6EDF3', fontWeight: 700 }}>{mockSeller.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Botones de contacto */}
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <a href={waLink} target="_blank" rel="noopener noreferrer"
                          onClick={ev => ev.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none', touchAction: 'manipulation' }}>
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                        <a
                          href={`/chat/directo?room=pieza-${item.id}&pieza=${encodeURIComponent(item.pieza)}&vendedor=${encodeURIComponent(sellerNombre)}&wa=${encodeURIComponent(waLink)}`}
                          onClick={ev => ev.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', color: '#1d4ed8', fontWeight: 700, fontSize: 12, textDecoration: 'none', touchAction: 'manipulation' }}>
                          <MessageCircle size={13} /> Chat directo
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
