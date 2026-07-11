'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  Search, Send, Clock, Car, Package, ArrowLeft, Loader2,
  CheckCircle, Phone, Filter, ChevronDown, ChevronUp,
  MessageCircle, Star, AlertCircle, RefreshCw, X,
} from 'lucide-react'

type Solicitud = {
  id:          string
  pieza:       string
  marca:       string | null
  modelo:      string | null
  anio:        string | null
  descripcion: string | null
  buyer_name:  string
  buyer_phone: string | null   // solo viene si el viewer está autenticado
  created_at:  string
}

type MiPieza = {
  id: string; pieza: string; marca: string | null; modelo: string | null
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)  return 'Ahora'
  if (diff < 60) return `Hace ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24)    return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

function urgencyLevel(iso: string): 'hot' | 'warm' | 'cool' {
  const h = (Date.now() - new Date(iso).getTime()) / 3600000
  if (h < 2)  return 'hot'
  if (h < 24) return 'warm'
  return 'cool'
}

function matchesInventory(s: Solicitud, piezas: MiPieza[]): MiPieza | null {
  if (!piezas.length) return null
  const marcaQ  = s.marca?.toLowerCase().trim() ?? ''
  const modeloQ = s.modelo?.toLowerCase().trim() ?? ''
  return piezas.find(p => {
    const marcaP  = p.marca?.toLowerCase().trim() ?? ''
    const modeloP = p.modelo?.toLowerCase().trim() ?? ''
    if (marcaQ && modeloQ) return marcaP.includes(marcaQ) && modeloP.includes(modeloQ)
    if (marcaQ)  return marcaP.includes(marcaQ)
    if (modeloQ) return modeloP.includes(modeloQ)
    return false
  }) ?? null
}

function buildWhatsAppMsg(s: Solicitud, sellerName: string) {
  const auto = [s.marca, s.modelo, s.anio].filter(Boolean).join(' ')
  return encodeURIComponent(
    `Hola ${s.buyer_name}! Soy ${sellerName} de Componenta.\n` +
    `Vi que estás buscando *${s.pieza}*${auto ? ` para ${auto}` : ''}.\n` +
    `Puede que tenga lo que necesitas. ¿Conversamos?`
  )
}

// ── Vista vendedor (autenticado) ──────────────────────────────────────────────
function SellerView({ solicitudes, misProductos, loading, refetch }: {
  solicitudes: Solicitud[]
  misProductos: MiPieza[]
  loading: boolean
  refetch: () => void
}) {
  const { user } = useUser()
  const sellerName = user?.firstName ?? 'el vendedor'

  const [filterMarca,  setFilterMarca]  = useState('')
  const [filterModelo, setFilterModelo] = useState('')
  const [soloMatch,    setSoloMatch]    = useState(false)
  const [showFilters,  setShowFilters]  = useState(false)

  const filtered = useMemo(() => {
    return solicitudes.filter(s => {
      const marcaOk  = !filterMarca  || (s.marca?.toLowerCase().includes(filterMarca.toLowerCase()))
      const modeloOk = !filterModelo || (s.modelo?.toLowerCase().includes(filterModelo.toLowerCase()))
      const matchOk  = !soloMatch    || !!matchesInventory(s, misProductos)
      return marcaOk && modeloOk && matchOk
    })
  }, [solicitudes, filterMarca, filterModelo, soloMatch, misProductos])

  const matchCount = solicitudes.filter(s => matchesInventory(s, misProductos)).length
  const hotCount   = solicitudes.filter(s => urgencyLevel(s.created_at) === 'hot').length

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 9, fontSize: 13,
    border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#111827',
    outline: 'none', boxSizing: 'border-box', width: '100%', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Search size={15} color="#1d4ed8" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Solicitudes de compradores</span>
        </div>
        <button onClick={refetch} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
          <RefreshCw size={12} /> Actualizar
        </button>
      </header>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total activas',   value: solicitudes.length, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Recientes (<2h)', value: hotCount,           color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Coinciden contigo', value: matchCount,       color: '#15803d', bg: '#eefbf2', border: '#a7f3d0' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, border: `1.5px solid ${stat.border}`, borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: stat.color, margin: '0 0 2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: stat.color, margin: 0, fontWeight: 600, opacity: 0.8 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Match banner si hay coincidencias */}
        {matchCount > 0 && (
          <div style={{ background: '#eefbf2', border: '1.5px solid #a7f3d0', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Star size={16} color="#15803d" />
            <p style={{ fontSize: 13, color: '#14532d', margin: 0, fontWeight: 600 }}>
              {matchCount === 1 ? 'Hay 1 solicitud que coincide' : `Hay ${matchCount} solicitudes que coinciden`} con piezas de tu inventario.{' '}
              <button onClick={() => setSoloMatch(true)} style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 800, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: 13 }}>
                Ver solo esas →
              </button>
            </p>
          </div>
        )}

        {/* Filtros */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '12px 16px', marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={13} color="#6b7280" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Filtros</span>
              {(filterMarca || filterModelo || soloMatch) && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: 20 }}>
                  {[filterMarca && `Marca: ${filterMarca}`, filterModelo && `Modelo: ${filterModelo}`, soloMatch && 'Solo mis coincidencias'].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(filterMarca || filterModelo || soloMatch) && (
                <button onClick={() => { setFilterMarca(''); setFilterModelo(''); setSoloMatch(false) }}
                  style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <X size={11} /> Limpiar
                </button>
              )}
              <button onClick={() => setShowFilters(f => !f)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {showFilters ? 'Ocultar' : 'Expandir'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Marca</label>
                <input style={inputStyle} placeholder="Toyota, Chevrolet…" value={filterMarca} onChange={e => setFilterMarca(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Modelo</label>
                <input style={inputStyle} placeholder="Yaris, Spark…" value={filterModelo} onChange={e => setFilterModelo(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => setSoloMatch(m => !m)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${soloMatch ? '#15803d' : '#e5e7eb'}`, background: soloMatch ? '#eefbf2' : '#fff', color: soloMatch ? '#15803d' : '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Star size={12} /> Solo mis coincidencias
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={26} color="#9ca3af" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 16, border: '1.5px dashed #e5e7eb' }}>
            <Search size={28} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>Sin solicitudes que coincidan</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              {solicitudes.length === 0 ? 'Aún no hay búsquedas activas.' : 'Prueba quitando los filtros.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => {
              const match   = matchesInventory(s, misProductos)
              const urgency = urgencyLevel(s.created_at)
              const waPhone = s.buyer_phone?.replace(/\D/g, '')

              const borderColor =
                match    ? '#a7f3d0' :
                urgency === 'hot'  ? '#fca5a5' :
                urgency === 'warm' ? '#fde68a' : '#e5e7eb'

              const topBg =
                match    ? '#eefbf2' :
                urgency === 'hot'  ? '#fef2f2' :
                urgency === 'warm' ? '#fffbeb' : '#f9fafb'

              return (
                <div key={s.id} style={{ background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}>

                  {/* Top accent bar */}
                  <div style={{ background: topBg, padding: '8px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {match && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 20, letterSpacing: 0.2 }}>
                        <Star size={9} /> COINCIDE — {match.pieza}
                      </span>
                    )}
                    {urgency === 'hot' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: 20 }}>
                        <AlertCircle size={9} /> RECIENTE
                      </span>
                    )}
                    {urgency === 'warm' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 20 }}>
                        Hoy
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af' }}>
                      <Clock size={10} /> {timeAgo(s.created_at)}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>{s.pieza}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: s.descripcion ? 8 : 0 }}>
                          {(s.marca || s.modelo || s.anio) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#1d4ed8', background: '#eff6ff', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
                              <Car size={10} /> {[s.marca, s.modelo, s.anio].filter(Boolean).join(' ')}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                            por <strong style={{ color: '#374151' }}>{s.buyer_name}</strong>
                          </span>
                        </div>
                        {s.descripcion && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{s.descripcion}</p>
                        )}
                      </div>

                      {/* Acciones */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
                        {waPhone ? (
                          <a
                            href={`https://wa.me/${waPhone}?text=${buildWhatsAppMsg(s, sellerName)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#25d366', color: '#fff', borderRadius: 11, fontSize: 12, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}>
                            <MessageCircle size={13} /> Tengo esta pieza
                          </a>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: '#f3f4f6', borderRadius: 11, fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
                            <Phone size={11} /> Sin teléfono
                          </div>
                        )}
                        {s.buyer_phone && (
                          <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                            {s.buyer_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA publicar pieza propia */}
        <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={18} color="#1d4ed8" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>¿Tienes piezas que no aparecen en tu inventario?</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Publícalas y aparecerán automáticamente cuando alguien busque esa pieza.</p>
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#1d4ed8', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Publicar pieza
          </Link>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Vista pública (comprador) ─────────────────────────────────────────────────
function PublicView({ solicitudes, loading }: { solicitudes: Solicitud[]; loading: boolean }) {
  const [enviando, setEnviando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)
  const [error,    setError]    = useState('')
  const [step,     setStep]     = useState<1 | 2>(1)

  const [form, setForm] = useState({
    pieza: '', marca: '', modelo: '', anio: '',
    descripcion: '', buyer_name: '', buyer_phone: '',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid #e5e7eb', background: '#fafafa', color: '#111827',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pieza.trim() || !form.buyer_name.trim()) return
    setEnviando(true)
    setError('')

    const res  = await fetch('/api/solicitudes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al enviar. Inténtalo de nuevo.')
      setEnviando(false)
      return
    }
    setEnviado(true)
    setEnviando(false)
    setForm({ pieza: '', marca: '', modelo: '', anio: '', descripcion: '', buyer_name: '', buyer_phone: '' })
    setStep(1)
  }

  const canGoStep2 = form.pieza.trim().length > 0

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Inter',system-ui,sans-serif" }}>

      <header style={{ borderBottom: '1px solid #ececea', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 40 }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Marketplace
        </Link>
        <div style={{ width: 1, height: 20, background: '#ececea' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Search size={15} color="#1d4ed8" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Buscar pieza</span>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: '#eff6ff', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Search size={24} color="#1d4ed8" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: -0.5 }}>
            ¿Buscas una pieza?
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Cuéntanos qué necesitas y los desarmaderos de la zona te contactarán por WhatsApp.
          </p>
        </div>

        {/* Formulario por pasos */}
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '24px 22px', marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={44} color="#15803d" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>¡Búsqueda enviada!</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.6 }}>
                Los desarmaderos de la zona recibieron tu solicitud.
                <br />Te contactarán por WhatsApp si tienen tu pieza.
              </p>
              <div style={{ margin: '14px auto 20px', padding: '10px 16px', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, maxWidth: 360 }}>
                <p style={{ fontSize: 12, color: '#15803d', margin: 0, fontWeight: 600 }}>
                  💡 Mientras esperas, revisa el marketplace — puede que alguien ya tenga tu pieza publicada.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setEnviado(false)} style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, color: '#111827', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Publicar otra búsqueda
                </button>
                <Link href="/marketplace" style={{ padding: '9px 20px', background: '#1d4ed8', border: '1.5px solid #1d4ed8', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  Ver marketplace →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* Indicador de pasos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 22 }}>
                {[{ n: 1, label: 'La pieza' }, { n: 2, label: 'Tus datos' }].map((s, i) => (
                  <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i === 0 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800,
                        background: step === s.n ? '#1d4ed8' : step > s.n ? '#eefbf2' : '#f3f4f6',
                        color:      step === s.n ? '#fff'     : step > s.n ? '#15803d' : '#9ca3af',
                        border:     step > s.n ? '2px solid #15803d' : 'none' }}>
                        {step > s.n ? '✓' : s.n}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: step === s.n ? 700 : 500, color: step === s.n ? '#111827' : '#9ca3af' }}>{s.label}</span>
                    </div>
                    {i === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? '#1d4ed8' : '#e5e7eb', margin: '0 10px' }} />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                      ¿Qué pieza necesitas? <span style={{ color: '#b91c1c' }}>*</span>
                    </label>
                    <input
                      style={inputStyle}
                      placeholder="Ej: Alternador, Radiador, Amortiguador delantero…"
                      value={form.pieza}
                      onChange={e => setForm(f => ({ ...f, pieza: e.target.value }))}
                      autoFocus
                      required
                    />
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '5px 0 0' }}>Sé específico — "Alternador Toyota Yaris" obtendrá mejores respuestas que solo "repuesto".</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Marca del auto</label>
                      <input style={inputStyle} placeholder="Toyota" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Modelo</label>
                      <input style={inputStyle} placeholder="Yaris" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Año</label>
                      <input style={inputStyle} placeholder="2018" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Detalles adicionales</label>
                    <textarea
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                      placeholder="¿Es urgente? ¿Necesitas original o alternativo? ¿Tiene algún código OEM? ¿En qué estado lo necesitas?"
                      value={form.descripcion}
                      onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!canGoStep2}
                    onClick={() => setStep(2)}
                    style={{ padding: '13px', borderRadius: 12, border: 'none', background: canGoStep2 ? '#1d4ed8' : '#e5e7eb', color: canGoStep2 ? '#fff' : '#9ca3af', fontWeight: 800, fontSize: 14, cursor: canGoStep2 ? 'pointer' : 'default', boxShadow: canGoStep2 ? '0 4px 14px rgba(29,78,216,0.3)' : 'none', transition: 'all 0.2s' }}>
                    Continuar →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Resumen de paso 1 */}
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{form.pieza}</p>
                      {(form.marca || form.modelo) && (
                        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                          {[form.marca, form.modelo, form.anio].filter(Boolean).join(' ')}
                        </p>
                      )}
                    </div>
                    <button type="button" onClick={() => setStep(1)} style={{ fontSize: 11, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Editar
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                        Tu nombre <span style={{ color: '#b91c1c' }}>*</span>
                      </label>
                      <input style={inputStyle} placeholder="Juan Pérez" value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} required autoFocus />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                        Tu WhatsApp <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(recomendado)</span>
                      </label>
                      <input style={inputStyle} placeholder="+569 1234 5678" value={form.buyer_phone} onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))} />
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px' }}>
                    <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
                      📱 <strong>Sin WhatsApp</strong> los vendedores no podrán contactarte directamente. Al menos agrega uno para recibir ofertas.
                    </p>
                  </div>

                  {error && <p style={{ fontSize: 12, color: '#b91c1c', margin: 0 }}>{error}</p>}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ padding: '13px 20px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                      ← Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={enviando || !form.buyer_name.trim()}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, border: 'none', background: enviando || !form.buyer_name.trim() ? '#e5e7eb' : '#1d4ed8', color: enviando || !form.buyer_name.trim() ? '#9ca3af' : '#fff', fontWeight: 800, fontSize: 14, cursor: enviando ? 'default' : 'pointer', boxShadow: !enviando && form.buyer_name.trim() ? '0 4px 14px rgba(29,78,216,0.3)' : 'none', transition: 'all 0.2s' }}>
                      {enviando
                        ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando…</>
                        : <><Send size={15} /> Notificar a desarmaderos</>}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Tablero público */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Package size={14} color="#9ca3af" />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>Búsquedas activas</h2>
            <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
              {solicitudes.length} publicadas
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader2 size={22} color="#9ca3af" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            </div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 16, border: '1.5px dashed #bfdbfe' }}>
              <Search size={28} color="#1d4ed8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Aún no hay búsquedas</p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>¡Sé el primero en publicar arriba! 👆</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {solicitudes.map(s => {
                const isRecent = urgencyLevel(s.created_at) === 'hot'
                return (
                  <div key={s.id} style={{ background: '#fff', border: `1.5px solid ${isRecent ? '#bfdbfe' : '#e5e7eb'}`, borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{s.pieza}</p>
                          {isRecent && <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#1d4ed8', padding: '2px 7px', borderRadius: 20 }}>NUEVA</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(s.marca || s.modelo || s.anio) && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                              <Car size={10} /> {[s.marca, s.modelo, s.anio].filter(Boolean).join(' ')}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} /> {timeAgo(s.created_at)}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>{s.buyer_name}</span>
                    </div>
                    {s.descripcion && (
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                        {s.descripcion}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Root component — detecta rol ──────────────────────────────────────────────
export default function SolicitudesPage() {
  const { user, isLoaded } = useUser()
  const [solicitudes,  setSolicitudes]  = useState<Solicitud[]>([])
  const [misProductos, setMisProductos] = useState<MiPieza[]>([])
  const [loading,      setLoading]      = useState(true)

  function fetchSolicitudes() {
    setLoading(true)
    fetch('/api/solicitudes')
      .then(r => r.json())
      .then(d => setSolicitudes(d.solicitudes ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isLoaded) return
    fetchSolicitudes()

    if (user) {
      fetch('/api/mis-piezas')
        .then(r => r.ok ? r.json() : { products: [] })
        .then(d => setMisProductos((d.products ?? []) as MiPieza[]))
        .catch(() => {})
    }
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f7' }}>
        <Loader2 size={28} color="#9ca3af" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return user
    ? <SellerView solicitudes={solicitudes} misProductos={misProductos} loading={loading} refetch={fetchSolicitudes} />
    : <PublicView solicitudes={solicitudes} loading={loading} />
}
