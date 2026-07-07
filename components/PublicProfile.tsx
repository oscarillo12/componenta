'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, MessageCircle, Phone, Pencil, Shield, MapPin, Clock,
  CheckCircle, Truck, Star, Package, Search, ChevronRight,
} from 'lucide-react'
import ProductCard, { ProductCardItem } from './ProductCard'

export type Servicio = { nombre: string; precio_desde?: number; precio_hasta?: number; descripcion?: string }

export type PublicProfileData = {
  slug: string
  nombre: string
  tagline?: string | null
  descripcion?: string | null
  color: string
  bannerUrl?: string | null
  whatsapp?: string | null
  telefono?: string | null
  direccion?: string | null
  horario?: string | null
  ciudad?: string | null
  tags?: string[]
  kindLabel: string // "Vendedor verificado" | "Taller verificado"
}

export default function PublicProfile({
  profile, products, servicios, isOwner, editHref, backHref = '/marketplace',
}: {
  profile: PublicProfileData
  products?: ProductCardItem[]
  servicios?: Servicio[]
  isOwner?: boolean
  editHref?: string
  backHref?: string
}) {
  const hasProductos = (products?.length ?? 0) > 0
  const hasServicios = (servicios?.length ?? 0) > 0
  const [tab, setTab] = useState<'catalogo' | 'servicios' | 'sobre'>(hasProductos ? 'catalogo' : hasServicios ? 'servicios' : 'sobre')
  const [search, setSearch] = useState('')

  const tel = profile.whatsapp || profile.telefono || ''
  const waBase = `https://wa.me/${tel.replace(/\D/g, '')}`
  const waSaludo = `${waBase}?text=${encodeURIComponent(`Hola ${profile.nombre}, los contacto desde Componenta.`)}`
  const color = profile.color || '#2f5fdb'
  const initials = profile.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const filteredProducts = useMemo(() => {
    if (!products) return []
    const q = search.toLowerCase()
    if (!q) return products
    return products.filter(p => p.pieza.toLowerCase().includes(q) || (p.marca ?? '').toLowerCase().includes(q) || (p.modelo ?? '').toLowerCase().includes(q))
  }, [products, search])

  const stats: { value: string | number; label: string }[] = [
    ...(hasProductos ? [{ value: products!.length, label: 'piezas' }] : []),
    { value: '4.8', label: 'rating' },
    ...(hasServicios ? [{ value: servicios!.length, label: 'servicios' }] : []),
    { value: 'Verificado', label: 'estado' },
  ].slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: 'var(--font-geist-sans), system-ui, sans-serif', color: '#16181d' }}>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ececea', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} color="#2f5fdb" /> {backHref === '/talleres' ? 'Directorio talleres' : 'Marketplace'}
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOwner && editHref && (
            <Link href={editHref} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: '1px solid #ececea', background: '#fafafa', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <Pencil size={12} /> Editar
            </Link>
          )}
          <a href={waSaludo} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 9, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            <MessageCircle size={13} /> Contactar
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: `linear-gradient(150deg, ${color} 0%, ${color}cc 60%, #16181d 130%)`, padding: '28px 28px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,.18)', border: '2.5px solid rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 22, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, paddingBottom: 2, minWidth: 200 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 20, padding: '3px 10px', fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,.85)', marginBottom: 8 }}>
                <Shield size={10} /> {profile.kindLabel} · Componenta
              </span>
              <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', margin: '0 0 5px', letterSpacing: '-.5px' }}>{profile.nombre}</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', margin: 0 }}>
                {profile.tagline}{profile.ciudad ? ` · ${profile.ciudad}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              <a href={waSaludo} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', borderRadius: 10, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                <MessageCircle size={13} /> WhatsApp
              </a>
              {tel && (
                <a href={`tel:${tel}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.22)', color: '#fff', borderRadius: 10, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                  <Phone size={13} /> Llamar
                </a>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,.22)', borderRadius: '12px 12px 0 0', padding: '14px 20px', display: 'flex' }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.12)' : 'none' }}>
                <p style={{ fontWeight: 900, fontSize: typeof s.value === 'string' && s.value.length > 3 ? 14 : 20, color: '#fff', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,.55)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS + CONTENT */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 28px 60px' }}>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #ececea', marginBottom: 20 }}>
          {hasProductos && (
            <button onClick={() => setTab('catalogo')}
              style={{ padding: '12px 4px', marginRight: 22, background: 'none', border: 'none', cursor: 'pointer', font: tab === 'catalogo' ? '700 13px var(--font-geist-sans),sans-serif' : '600 13px var(--font-geist-sans),sans-serif', color: tab === 'catalogo' ? '#16181d' : '#9aa0aa', borderBottom: tab === 'catalogo' ? `2px solid ${color}` : '2px solid transparent' }}>
              Catálogo
            </button>
          )}
          {hasServicios && (
            <button onClick={() => setTab('servicios')}
              style={{ padding: '12px 4px', marginRight: 22, background: 'none', border: 'none', cursor: 'pointer', font: tab === 'servicios' ? '700 13px var(--font-geist-sans),sans-serif' : '600 13px var(--font-geist-sans),sans-serif', color: tab === 'servicios' ? '#16181d' : '#9aa0aa', borderBottom: tab === 'servicios' ? `2px solid ${color}` : '2px solid transparent' }}>
              Servicios
            </button>
          )}
          <button onClick={() => setTab('sobre')}
            style={{ padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer', font: tab === 'sobre' ? '700 13px var(--font-geist-sans),sans-serif' : '600 13px var(--font-geist-sans),sans-serif', color: tab === 'sobre' ? '#16181d' : '#9aa0aa', borderBottom: tab === 'sobre' ? `2px solid ${color}` : '2px solid transparent' }}>
            Sobre nosotros
          </button>
        </div>

        {(profile.tags?.length ?? 0) > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {profile.tags!.map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: `${color}14`, color, border: `1px solid ${color}30` }}>
                <CheckCircle size={10} /> {t}
              </span>
            ))}
          </div>
        )}

        {tab === 'catalogo' && hasProductos && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#9aa0aa', margin: 0 }}>{filteredProducts.length} piezas publicadas</p>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #ececea', borderRadius: 9, overflow: 'hidden', width: 240 }}>
                <Search size={13} color="#9aa0aa" style={{ marginLeft: 10, flexShrink: 0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en esta tienda…"
                  style={{ flex: 1, padding: '8px 10px', fontSize: 12.5, border: 'none', outline: 'none', background: 'transparent', color: '#16181d' }} />
              </div>
            </div>

            {filteredProducts.length === 0
              ? <div style={{ background: '#fff', borderRadius: 14, padding: '48px 20px', textAlign: 'center', border: '1px solid #ececea' }}>
                  <Package size={32} color="#d1d5db" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <p style={{ fontSize: 13, color: '#9aa0aa', margin: 0 }}>No se encontraron piezas</p>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} item={p} sellerNombre={profile.nombre} sellerColor={color}
                      waLink={`${waBase}?text=${encodeURIComponent(`Hola, vi la pieza "${p.pieza}" en Componenta. ¿Está disponible?`)}`}
                      onClick={() => window.location.href = `/marketplace/${p.id}`} />
                  ))}
                </div>}
          </>
        )}

        {tab === 'servicios' && hasServicios && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {servicios!.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}16`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#16181d', margin: 0 }}>{s.nombre}</p>
                  {s.descripcion && <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{s.descripcion}</p>}
                </div>
                {(s.precio_desde || s.precio_hasta) && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color, margin: 0 }}>
                      {s.precio_desde ? `$${s.precio_desde.toLocaleString('es-CL')}` : ''}
                      {s.precio_desde && s.precio_hasta ? ' – ' : ''}
                      {s.precio_hasta ? `$${s.precio_hasta.toLocaleString('es-CL')}` : ''}
                    </p>
                    <p style={{ fontSize: 10, color: '#9aa0aa', margin: '2px 0 0' }}>Precio ref.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'sobre' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profile.descripcion && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '18px 20px' }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 10px' }}>Sobre nosotros</p>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{profile.descripcion}</p>
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ececea', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {profile.direccion && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}><MapPin size={14} color="#9aa0aa" /> {profile.direccion}</span>}
              {profile.horario && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}><Clock size={14} color="#9aa0aa" /> {profile.horario}</span>}
              {tel && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}><Phone size={14} color="#9aa0aa" /> {tel}</span>}
            </div>
          </div>
        )}

        {/* Trust strip */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px 0', marginTop: 20, border: '1px solid #ececea', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {[
            { Icon: Shield, color: '#1a7a42', text: 'Vendedor verificado' },
            { Icon: Truck, color: '#2f5fdb', text: 'Envío a todo Chile' },
            { Icon: Star, color: '#d97706', text: 'Calificación 4.8' },
          ].map(({ Icon, color: c, text }, i) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${c}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={c} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, background: '#fff', border: '1px solid #ececea', textDecoration: 'none' }}>
            <div style={{ width: 20, height: 20, background: '#16181d', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 10 }}>C</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ver más en Componenta</span>
            <ChevronRight size={13} color="#9aa0aa" />
          </Link>
        </div>
      </div>

      {/* FAB */}
      <a href={waSaludo} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 20, right: 18, display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, padding: '13px 20px', borderRadius: 50, zIndex: 50, textDecoration: 'none', boxShadow: '0 8px 28px rgba(22,163,74,.4)' }}>
        <MessageCircle size={17} /> {hasServicios && !hasProductos ? 'Pedir hora' : 'WhatsApp'}
      </a>
    </div>
  )
}
