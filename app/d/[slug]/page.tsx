'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, MessageCircle, Clock, Shield, ArrowLeft,
  Loader2, Pencil, Eye, Package, Star, Truck, ChevronDown,
  Search, SlidersHorizontal, CheckCircle
} from 'lucide-react'
import type { Product } from '@/lib/supabase'
import type { EstadoPieza } from '@/lib/types'

const ESTADO: Record<EstadoPieza, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#15803d', bg: '#dcfce7' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#dbeafe' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fef3c7' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fee2e2' },
}

type SellerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; banner_url?: string | null; whatsapp?: string; direccion?: string
  horario?: string; ciudad?: string; especialidades?: string[]
}

function ProductCard({ item, color, waLink }: {
  item: Product & { zona?: string }
  color: string
  waLink: string
}) {
  const estado = ESTADO[item.estado as EstadoPieza] ?? ESTADO['bueno']
  const itemWa = `${waLink}?text=${encodeURIComponent(`Hola, vi la pieza "${item.pieza}" (${item.marca} ${item.modelo} ${item.anios}) en Componenta. ¿Está disponible?`)}`

  return (
    <div style={{
      background: '#fff', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s',
    }}>
      {/* Imagen */}
      <div style={{ position: 'relative', paddingTop: '72%', background: '#f8f9fa', overflow: 'hidden' }}>
        {item.imagen_url ? (
          <img src={item.imagen_url} alt={item.pieza}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={36} color="#d1d5db" />
          </div>
        )}
        {/* Badge estado */}
        <span style={{
          position: 'absolute', top: 10, left: 10,
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: estado.bg, color: estado.color,
        }}>{estado.label}</span>
        {/* Badge vistas */}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
          background: 'rgba(0,0,0,0.5)', color: '#fff',
        }}>
          <Eye size={9} /> {item.vistas ?? 0}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
          {item.pieza}
        </p>
        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{item.marca} {item.modelo} · {item.anios}</p>
        {item.oem && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, fontFamily: 'monospace' }}>OEM: {item.oem}</p>}

        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: color, margin: 0, letterSpacing: -0.5 }}>
            ${item.precio?.toLocaleString('es-CL')}
          </p>
          <a href={itemWa} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10,
              background: color, color: '#fff', fontWeight: 700, fontSize: 11, textDecoration: 'none' }}>
            <MessageCircle size={12} /> Consultar
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DesarmaduriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [profile, setProfile]       = useState<SellerProfile | null>(null)
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [isOwner, setIsOwner]       = useState(false)
  const [search, setSearch]         = useState('')
  const [scrolled, setScrolled]     = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterEstado, setFilterEstado] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch(`/api/d/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || data.notFound) return
        setProfile(data)
        fetch('/api/profile').then(r => r.json()).then(me => {
          setIsOwner(me?.userId === data.user_id)
        }).catch(() => {})
        fetch(`/api/marketplace?seller=${data.user_id}&limit=100`)
          .then(r => r.json()).then(d => setProducts(d.products ?? [])).catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <Loader2 size={32} color="#6b7280" className="animate-spin" />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f3f4f6' }}>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>Tienda no encontrada</p>
      <Link href="/marketplace" style={{ color: '#1d4ed8', fontWeight: 600 }}>← Volver al marketplace</Link>
    </div>
  )

  const color  = profile.color
  const tel    = profile.whatsapp ?? ''
  const waLink = `https://wa.me/${tel.replace(/\D/g, '')}`

  const filtered = products.filter(p => {
    const matchSearch = !search || p.pieza?.toLowerCase().includes(search.toLowerCase())
      || p.marca?.toLowerCase().includes(search.toLowerCase())
      || p.modelo?.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filterEstado || p.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui,sans-serif' }}>

      {/* ══ HEADER FIJO ══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
        transition: 'all 0.3s',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6,
          color: scrolled ? '#374151' : 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Componenta
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwner && (
            <Link href="/mi-tienda" style={{ display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              color: scrolled ? '#374151' : '#fff', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <Pencil size={11} /> Editar
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6,
              background: color, color: '#fff', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none',
              boxShadow: `0 4px 12px ${color}50` }}>
            <MessageCircle size={13} /> Contactar
          </a>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <div style={{
        background: profile.banner_url
          ? `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.7) 100%), url(${profile.banner_url}) center/cover`
          : `linear-gradient(135deg, ${color} 0%, ${color}dd 40%, #111827 100%)`,
        paddingTop: 80, paddingBottom: 0,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        {!profile.banner_url && (
          <>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
          </>
        )}

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 0' }}>
          {/* Identity row */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 32 }}>
            {/* Logo */}
            <div style={{
              width: 96, height: 96, borderRadius: 24, flexShrink: 0,
              background: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 28,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              {profile.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Shield size={13} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Vendedor verificado · Componenta
                </span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.1, letterSpacing: -0.5 }}>
                {profile.nombre}
              </h1>
              {profile.tagline && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{profile.tagline}</p>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px 16px 0 0',
            padding: '16px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 0,
          }}>
            {[
              { value: products.length, label: 'Piezas en stock', icon: '📦' },
              { value: products.filter(p => p.estado === 'excelente').length, label: 'Excelente estado', icon: '⭐' },
              { value: '5.0', label: 'Calificación', icon: '✅' },
              { value: profile.ciudad ?? 'Chile', label: 'Ubicación', icon: '📍' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 8px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <p style={{ fontSize: 13, margin: '0 0 4px' }}>{s.icon}</p>
                <p style={{ fontWeight: 900, fontSize: i === 3 ? 13 : 22, color: '#fff', margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENIDO ══ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Info bar */}
        <div style={{
          background: '#fff',
          borderRadius: '0 0 16px 16px',
          borderTop: '1px solid #f3f4f6',
          padding: '14px 24px',
          marginBottom: 24,
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          {profile.direccion && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
              <MapPin size={14} color={color} /> {profile.direccion}
            </span>
          )}
          {profile.horario && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
              <Clock size={14} color={color} /> {profile.horario}
            </span>
          )}
          {tel && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
              <Phone size={14} color={color} /> {tel}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                background: color, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={`tel:${tel}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              <Phone size={14} /> Llamar
            </a>
          </div>
        </div>

        {/* Especialidades */}
        {(profile.especialidades?.length ?? 0) > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {profile.especialidades!.map(e => (
              <span key={e} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: `${color}15`, color, border: `1px solid ${color}30`
              }}>
                <CheckCircle size={11} /> {e}
              </span>
            ))}
          </div>
        )}

        {/* Descripción */}
        {profile.descripcion && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{profile.descripcion}</p>
            <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              {[['🚚', 'Envío a todo Chile'], ['✅', 'Piezas verificadas'], ['💬', 'Respuesta rápida']].map(([icon, text]) => (
                <span key={String(text)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                  <span style={{ fontSize: 15 }}>{icon}</span> {text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── CATÁLOGO ── */}
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>

          {/* Header catálogo */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>Catálogo de repuestos</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{products.length} piezas disponibles</p>
            </div>
            {/* Búsqueda */}
            <div style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 400, justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar pieza, marca, modelo…"
                  style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#111827',
                    outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }}
                />
              </div>
              <button onPointerDown={() => setShowFilters(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                  border: `1.5px solid ${showFilters ? color : '#e5e7eb'}`, background: showFilters ? `${color}10` : '#f9fafb',
                  color: showFilters ? color : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap' }}>
                <SlidersHorizontal size={14} /> Filtrar <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb',
              display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Estado:</span>
              {[null, 'excelente', 'bueno', 'con-detalles', 'para-reparar'].map(e => {
                const active = filterEstado === e
                const info = e ? ESTADO[e as EstadoPieza] : null
                return (
                  <button key={String(e)} onPointerDown={() => setFilterEstado(e)}
                    style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500,
                      border: `1.5px solid ${active ? (info?.color ?? color) : '#e5e7eb'}`,
                      background: active ? (info?.bg ?? `${color}10`) : '#fff',
                      color: active ? (info?.color ?? color) : '#6b7280',
                      cursor: 'pointer', touchAction: 'manipulation' }}>
                    {e ? info?.label : 'Todos'}
                  </button>
                )
              })}
            </div>
          )}

          {/* Grid productos */}
          <div style={{ padding: 20 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No se encontraron piezas</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {filtered.map(item => (
                  <ProductCard key={item.id} item={item} color={color} waLink={waLink} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', marginTop: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6',
          display: 'flex', gap: 0, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {[
            { icon: Shield, text: 'Vendedor verificado en Componenta' },
            { icon: Truck, text: 'Despacho a todo Chile' },
            { icon: Star, text: 'Calificación 5.0' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
              borderRight: i < 2 ? '1px solid #f3f4f6' : 'none', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link href="/marketplace" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 22, height: 22, background: color, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>C</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ver más en Componenta</span>
            </div>
          </Link>
        </div>
      </div>

      {/* FAB WhatsApp */}
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          background: color, color: '#fff', fontWeight: 700, fontSize: 14,
          padding: '14px 22px', borderRadius: 50, zIndex: 50, textDecoration: 'none',
          boxShadow: `0 8px 24px ${color}60` }}>
        <MessageCircle size={18} /> Consultar por WhatsApp
      </a>
    </div>
  )
}
