'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Star, MessageCircle, Clock, Shield, Truck, ChevronRight, Eye, Package, TrendingUp, Award, ArrowLeft, Check, Loader2, Pencil } from 'lucide-react'
import { mockDesarmaduras, mockInventory } from '@/lib/mock-data'
import type { EstadoPieza } from '@/lib/types'
import type { Product } from '@/lib/supabase'

const ESTADO: Record<EstadoPieza, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#A5D6FF',  bg: '#dbeafe' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8',  bg: '#dbeafe' },
  'con-detalles': { label: 'Con detalles', color: '#92400e',  bg: '#fef3c7' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c',  bg: '#fee2e2' },
}

const ZONA_LABELS: Record<string, string> = {
  motor: 'Motor', electrico: 'Eléctrico', 'suspension-d': 'Suspensión D.',
  'suspension-t': 'Suspensión T.', frenos: 'Frenos', transmision: 'Transmisión',
  interior: 'Interior', maletero: 'Maletero', escape: 'Escape',
}

type SellerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; banner_url?: string | null; whatsapp?: string; direccion?: string
  horario?: string; ciudad?: string; especialidades?: string[]
}

type MockSeller = typeof mockDesarmaduras[0]

export default function DesarmaduriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [profile,    setProfile]    = useState<SellerProfile | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [zonaFiltro, setZonaFiltro] = useState<string | null>(null)
  const [isOwner,    setIsOwner]    = useState(false)
  const [realProducts, setRealProducts] = useState<Product[]>([])

  useEffect(() => {
    const mockSeller = mockDesarmaduras.find(d => d.slug === slug)

    fetch(`/api/d/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.notFound) {
          setProfile(data)
          fetch('/api/profile').then(r => r.json()).then(me => {
            setIsOwner(me?.userId === data.user_id || false)
          }).catch(() => {})
          // Fetch products by this seller
          fetch(`/api/marketplace?seller=${data.user_id}`).then(r => r.json()).then(d => setRealProducts(d.products ?? [])).catch(() => {})
        } else if (mockSeller) {
          setProfile({ slug: mockSeller.slug, nombre: mockSeller.nombre, tagline: mockSeller.tagline, descripcion: mockSeller.descripcion, color: mockSeller.color, whatsapp: mockSeller.telefono, direccion: mockSeller.direccion, horario: mockSeller.horario, ciudad: 'Temuco', especialidades: mockSeller.especialidades })
        }
      })
      .catch(() => {
        if (mockSeller) {
          setProfile({ slug: mockSeller.slug, nombre: mockSeller.nombre, tagline: mockSeller.tagline, descripcion: mockSeller.descripcion, color: mockSeller.color, whatsapp: mockSeller.telefono, direccion: mockSeller.direccion, horario: mockSeller.horario, ciudad: 'Temuco', especialidades: mockSeller.especialidades })
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1117' }}>
      <Loader2 size={32} color="#79C0FF" className="animate-spin" />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0D1117' }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#B1BAC4' }}>Tienda no encontrada</p>
      <Link href="/marketplace" style={{ color: '#79C0FF', fontWeight: 600 }}>← Volver al marketplace</Link>
    </div>
  )

  const mockSeller   = mockDesarmaduras.find(d => d.slug === slug)
  const mockItems    = mockInventory.filter(i => i.vendedorSlug === slug && i.disponible)
  const allInventory = realProducts.length > 0 ? realProducts : mockItems
  const filtrado     = zonaFiltro ? allInventory.filter(i => 'zona' in i ? i.zona === zonaFiltro : false) : allInventory
  const zonas        = [...new Set(allInventory.map(i => 'zona' in i ? (i as { zona: string }).zona : ''))]
  const stats        = { rating: mockSeller?.rating ?? 5.0, reviewCount: mockSeller?.reviewCount ?? 0, totalVentas: mockSeller?.totalVentas ?? 0 }

  const tel          = profile.whatsapp ?? ''
  const waLink       = `https://wa.me/${tel.replace(/\D/g, '')}`
  const color        = profile.color

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'system-ui,sans-serif' }}>

      {/* ══ HERO ══ */}
      <div style={{ background: `linear-gradient(165deg, ${color} 0%, ${color}d0 55%, #0f172a 100%)`, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Nav */}
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'color 0.15s' }}>
            <ArrowLeft size={15} /> componenta.cl
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOwner && (
              <Link href="/mi-tienda" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
                <Pencil size={11} /> Editar tienda
              </Link>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <MessageCircle size={12} /> Contactar
            </a>
          </div>
        </div>

        {/* Identity */}
        <div style={{ padding: '8px 18px 0', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
            {/* Logo */}
            <div style={{ width: 74, height: 74, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 22, flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}>
              {profile.nombre.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Shield size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>Vendedor verificado · componenta.cl</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: -0.3 }}>{profile.nombre}</h1>
              {profile.tagline && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '5px 0 0', lineHeight: 1.4 }}>{profile.tagline}</p>}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '12px 8px', backdropFilter: 'blur(6px)' }}>
            {[
              { value: stats.rating.toFixed(1), label: 'Rating',   icon: '⭐' },
              { value: stats.reviewCount,        label: 'Reseñas',  icon: '💬' },
              { value: allInventory.length,      label: 'En stock', icon: '📦' },
              { value: stats.totalVentas,        label: 'Ventas',   icon: '📈' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, margin: '0 0 3px' }}>{s.icon}</p>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#fff', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info strip */}
          <div style={{ padding: '14px 0 4px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {profile.direccion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <MapPin size={13} style={{ flexShrink: 0 }} /> {profile.direccion}
              </div>
            )}
            {profile.horario && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <Clock size={13} style={{ flexShrink: 0 }} /> {profile.horario}
              </div>
            )}
            {tel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <Phone size={13} style={{ flexShrink: 0 }} /> {tel}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 0 24px' }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#161B22', borderRadius: 14, padding: '13px', textDecoration: 'none', fontWeight: 800, fontSize: 14, color: '#E6EDF3', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <MessageCircle size={17} color={color} /> WhatsApp
            </a>
            <a href={`tel:${tel}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '13px', textDecoration: 'none', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              <Phone size={17} /> Llamar
            </a>
          </div>
        </div>
      </div>

      {/* ══ CONTENIDO ══ */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* Especialidades */}
        {profile.especialidades && profile.especialidades.length > 0 && (
          <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: 16, marginTop: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Especialidades</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {profile.especialidades.map(e => (
                <span key={e} style={{ padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', background: color }}>{e}</span>
              ))}
              {mockSeller && (
                <span style={{ padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#B1BAC4', background: '#21262D' }}>
                  Desde {mockSeller.fundacion}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Descripción */}
        {profile.descripcion && (
          <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: 16, marginTop: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Sobre nosotros</p>
            <p style={{ fontSize: 14, color: '#E6EDF3', lineHeight: 1.6, margin: 0 }}>{profile.descripcion}</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {[['🚚', 'Envío a todo Chile'], ['✅', 'Piezas verificadas'], ['💬', 'Atención inmediata']].map(([icon, text]) => (
                <div key={String(text)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#B1BAC4', fontWeight: 500 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catálogo */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, color: '#E6EDF3', margin: 0 }}>Catálogo de repuestos</h2>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color: '#fff', background: color }}>
              {allInventory.length} piezas
            </span>
          </div>

          {/* Filtros de zona */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {[{ id: null, label: `Todos (${allInventory.length})` }, ...zonas.filter(Boolean).map(z => ({ id: z, label: `${ZONA_LABELS[z] ?? z} (${allInventory.filter(i => 'zona' in i && (i as { zona: string }).zona === z).length})` }))].map(z => {
              const active = zonaFiltro === z.id
              return (
                <button key={String(z.id)} onPointerDown={() => setZonaFiltro(z.id)}
                  style={{ touchAction: 'manipulation', flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${active ? color : '#e5e7eb'}`, background: active ? color : '#fff', color: active ? '#fff' : '#374151', fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                  {z.label}
                </button>
              )
            })}
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtrado.length === 0 ? (
              <div style={{ background: '#161B22', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#B1BAC4', fontSize: 14 }}>Sin piezas en esta categoría</p>
              </div>
            ) : filtrado.map(item => {
              const isReal = 'imagen_url' in item
              const estado = (isReal ? (item as Product).estado : (item as { estado: string }).estado) as EstadoPieza
              const pieza  = isReal ? (item as Product).pieza  : (item as { pieza: string }).pieza
              const marca  = isReal ? (item as Product).marca  : (item as { marca: string }).marca
              const modelo = isReal ? (item as Product).modelo : (item as { modelo: string }).modelo
              const anios  = isReal ? (item as Product).anios  : (item as { anios: string }).anios
              const precio = isReal ? (item as Product).precio : (item as { precio: number }).precio
              const vistas = isReal ? (item as Product).vistas : (item as { vistas: number }).vistas
              const oem    = isReal ? (item as Product).oem    : (item as { oem?: string | null }).oem
              const imgUrl = isReal ? (item as Product).imagen_url : null
              const e      = ESTADO[estado ?? 'bueno']
              const itemWa = `${waLink}?text=${encodeURIComponent(`Hola! Vi en Componenta la pieza "${pieza}" (${marca} ${modelo} ${anios}) a $${precio?.toLocaleString('es-CL')}. ¿Está disponible?`)}`

              return (
                <div key={'id' in item ? item.id : String(Math.random())}
                  style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex' }}>
                    {/* Imagen */}
                    <div style={{ width: 100, flexShrink: 0, background: `linear-gradient(135deg,${color}18,${color}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 34, opacity: 0.7 }}>🔧</span>
                      )}
                    </div>
                    <div style={{ flex: 1, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: e.bg, color: e.color }}>{e.label}</span>
                        {oem && <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#B1BAC4' }}>{oem}</span>}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 3px', lineHeight: 1.3 }}>{pieza}</p>
                      <p style={{ fontSize: 11, color: '#B1BAC4', margin: 0 }}>{marca} {modelo} · {anios}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <div>
                          <p style={{ fontSize: 22, fontWeight: 900, color: color, margin: 0, letterSpacing: -0.5, lineHeight: 1 }}>
                            ${precio?.toLocaleString('es-CL')}
                          </p>
                          <p style={{ fontSize: 10, color: '#B1BAC4', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={9} /> {vistas} vistas
                          </p>
                        </div>
                        <a href={itemWa} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, background: color, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                          <MessageCircle size={13} /> Consultar
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#0D1117', borderTop: '1px solid #f0f0f0', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={10} color="#6E7681" />
                    <span style={{ fontSize: 10, color: '#B1BAC4' }}>Envío disponible · {profile.nombre}</span>
                    <ChevronRight size={10} color="#3b5280" style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ubicación */}
        {profile.direccion && (
          <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color={color} />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3' }}>Ubicación</span>
              </div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.direccion)}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 600, color: color, textDecoration: 'none' }}>Abrir en Maps →</a>
            </div>
            <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-72.66%2C-38.77%2C-72.56%2C-38.71&layer=mapnik"
              width="100%" height="160" style={{ border: 0, display: 'block' }} loading="lazy" />
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{profile.nombre}</p>
              <p style={{ fontSize: 12, color: '#B1BAC4', margin: '3px 0 0' }}>{profile.direccion}</p>
              {profile.horario && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                  <Clock size={10} color="#6E7681" />
                  <p style={{ fontSize: 11, color: '#B1BAC4', margin: 0 }}>{profile.horario}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: 16, marginTop: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', margin: 0 }}>Reseñas</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#E6EDF3' }}>{stats.rating.toFixed(1)}</span>
              <span style={{ fontSize: 12, color: '#B1BAC4' }}>({stats.reviewCount})</span>
            </div>
          </div>
          {[
            { n: 'Carlos M.', nota: 5, t: 'Excelente atención, la pieza llegó en perfectas condiciones. Muy recomendable.' },
            { n: 'Javiera S.', nota: 5, t: 'Rápidos y confiables. El sensor MAP que compré funcionó perfecto.' },
            { n: 'Pablo R.',   nota: 4, t: 'Buen stock, precios razonables. Tiempo de envío normal.' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {r.n[0]}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3', flex: 1 }}>{r.n}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: r.nota }).map((_, j) => <span key={j} style={{ fontSize: 12 }}>⭐</span>)}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0, lineHeight: 1.5 }}>{r.t}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, paddingBottom: 4 }}>
          <Link href="/marketplace" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#161B22', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 22, height: 22, background: '#388BFD', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>C</div>
                <span style={{ fontWeight: 700, color: '#E6EDF3', fontSize: 14 }}>componenta.cl</span>
              </div>
              <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>Ver más repuestos en el marketplace</p>
              <p style={{ fontSize: 12, color: '#79C0FF', fontWeight: 600, margin: '4px 0 0' }}>Explorar catálogo completo →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* FAB WhatsApp */}
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 20, right: 16, display: 'flex', alignItems: 'center', gap: 8, background: color, color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: 30, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 50, textDecoration: 'none' }}>
        <MessageCircle size={18} /> Consultar por WhatsApp
      </a>
    </div>
  )
}
