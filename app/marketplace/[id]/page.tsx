'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, WhatsappLogo, Phone, Star, MapPin, Clock,
  CheckCircle, Warning, Question, Share, Heart,
  Wrench, Lightning, Gauge, Gear, ArrowRight,
  ShieldCheck, Truck, Tag, Certificate, SealCheck,
  Car, CalendarBlank, Hash, Package, ShoppingCart, ChatCircle
} from '@phosphor-icons/react'
import { useCart } from '@/lib/cart-context'
import { mockInventory, mockDesarmaduras } from '@/lib/mock-data'
import { getAllMakes, getModels, getYears, checkCompatibility } from '@/lib/vehicle-db'
import type { EstadoPieza, InventoryItem } from '@/lib/types'

const ESTADO_CONFIG: Record<EstadoPieza, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  excelente:      { label: 'Excelente',    color: '#A5D6FF', bg: '#dbeafe', icon: <SealCheck size={14} weight="fill" /> },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#dbeafe', icon: <CheckCircle size={14} weight="fill" /> },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fef3c7', icon: <Warning size={14} weight="fill" /> },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fee2e2', icon: <Wrench size={14} weight="fill" /> },
}

const ZONA_EMOJI: Record<string, string> = {
  motor: '⚙️', electrico: '⚡', frenos: '🛑', 'suspension-d': '🔩',
  'suspension-t': '🔩', transmision: '🔧', interior: '🪑', escape: '💨', maletero: '📦',
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  type RichItem = InventoryItem & {
    imagen_url?:      string | null
    descripcion?:     string | null
    envio?:           string | null
    seller_nombre?:   string | null
    seller_telefono?: string | null
    seller_id?:       string | null
    isReal?:          boolean
  }

  const mockItem = mockInventory.find(i => i.id === id)
  const [item, setItem] = useState<RichItem | null>(mockItem ?? null)
  const [loading, setLoading] = useState(!mockItem)

  useEffect(() => {
    if (!mockItem) {
      fetch(`/api/products/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d?.product) return
          const raw = d.product
          // Normaliza fitment a {make,model,yearFrom,yearTo} independiente del formato guardado
          const fitment = (raw.fitment ?? []).flatMap((f: Record<string, unknown>) => {
            const make  = ((f.make as string) || (f.marca  as string) || '').trim()
            const model = ((f.model as string) || (f.modelo as string) || '').trim()
            if (!make || !model) return []
            let yf = (f.yearFrom as number) || 0
            let yt = (f.yearTo   as number) || 0
            if ((!yf || !yt) && f.anios) {
              const a = (f.anios as string).replace('–', '-').replace(/\s/g, '')
              const rng = a.match(/^(\d{4})-(\d{4})$/)
              const sg  = a.match(/^(\d{4})$/)
              yf = rng ? parseInt(rng[1]) : sg ? parseInt(sg[1]) : 0
              yt = rng ? parseInt(rng[2]) : yf
            }
            if (!yf || !yt) return []
            return [{ make, model, yearFrom: yf, yearTo: yt }]
          })
          setItem({ ...raw, fitment, isReal: true })
        })
        .finally(() => setLoading(false))
    }
  }, [id, mockItem])

  const isRealProduct = item?.isReal ?? false
  const mockSeller   = item?.vendedorSlug ? mockDesarmaduras.find(d => d.slug === item.vendedorSlug) ?? mockDesarmaduras[0] : mockDesarmaduras[0]
  const sellerNombre = isRealProduct ? (item?.seller_nombre ?? 'Vendedor Componenta') : mockSeller.nombre
  const sellerTel    = isRealProduct ? (item?.seller_telefono ?? '56912345678') : mockSeller.telefono
  const seller       = mockSeller
  const similares = item
    ? mockInventory.filter(i => i.id !== id && i.disponible && (i.zona === item.zona || i.vendedorSlug === item.vendedorSlug)).slice(0, 4)
    : []

  const [vMake,  setVMake]  = useState('')
  const [vModel, setVModel] = useState('')
  const [vYear,  setVYear]  = useState('')
  const [guardado, setGuardado] = useState(false)
  const cart = useCart()

  const makes  = getAllMakes()
  const models = vMake ? getModels(vMake) : []
  const years  = vMake && vModel ? getYears(vMake, vModel) : []
  const vehicleSelected = vMake && vModel && vYear
  const yearNum = vehicleSelected ? parseInt(vYear) : 0
  const compat = vehicleSelected && item ? checkCompatibility(item.fitment, vMake, vModel, yearNum) : null

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ color: '#B1BAC4', fontSize: 15 }}>Cargando...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui,sans-serif' }}>
        <Package size={48} color="#3b5280" weight="thin" />
        <p style={{ color: '#B1BAC4', fontSize: 16 }}>Producto no encontrado</p>
        <Link href="/marketplace" style={{ color: '#79C0FF', fontWeight: 700, textDecoration: 'none' }}>← Volver al marketplace</Link>
      </div>
    )
  }

  const e = ESTADO_CONFIG[item.estado]
  const waText = encodeURIComponent(`Hola! Vi en Componenta la pieza "${item.pieza}" (${item.marca} ${item.modelo}) a $${item.precio.toLocaleString('es-CL')}. ¿Está disponible?`)
  const waLink = `https://wa.me/${sellerTel.replace(/\D/g, '')}?text=${waText}`

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif', paddingBottom: 100 }}>

      {/* ── Top nav ── */}
      <div style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href="/marketplace"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#E6EDF3', fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={20} weight="bold" color="#79C0FF" />
          Volver al marketplace
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onPointerDown={() => setGuardado(v => !v)}
            style={{ touchAction: 'manipulation', background: guardado ? '#fef2f2' : '#f9fafb', border: `1.5px solid ${guardado ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: guardado ? '#b91c1c' : '#374151' }}>
            <Heart size={16} weight={guardado ? 'fill' : 'regular'} color={guardado ? '#ef4444' : '#9ca3af'} />
            {guardado ? 'Guardado' : 'Guardar'}
          </button>
          <button
            onPointerDown={() => { if (navigator.share) navigator.share({ title: item.pieza, url: window.location.href }) }}
            style={{ touchAction: 'manipulation', background: '#0D1117', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#E6EDF3' }}>
            <Share size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="md:grid-cols-product">

          {/* ── Imagen principal ── */}
          <div style={{ background: '#161B22', borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{
              height: 280,
              background: item.imagen_url ? '#000' : `linear-gradient(160deg, ${seller.color}20, ${seller.color}50)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              position: 'relative', overflow: 'hidden',
            }}>
              {item.imagen_url ? (
                <img src={item.imagen_url} alt={item.pieza}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              ) : (
                <>
                  <span style={{ fontSize: 80 }}>{ZONA_EMOJI[item.zona] ?? '🔧'}</span>
                  <span style={{ background: 'rgba(15,28,63,0.8)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#E6EDF3' }}>
                    Sin foto
                  </span>
                </>
              )}
            </div>

            {/* Chips de info rápida */}
            <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: e.bg, borderRadius: 20, padding: '6px 12px' }}>
                <span style={{ color: e.color }}>{e.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{e.label}</span>
              </div>
              {item.oem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 20, padding: '6px 14px' }}>
                  <Hash size={13} color="#1d4ed8" weight="bold" />
                  <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 700, fontFamily: 'monospace', letterSpacing: 0.5 }}>{item.oem}</span>
                  <span style={{ fontSize: 10, color: '#79C0FF', fontWeight: 600 }}>· Código OEM</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.15)', borderRadius: 20, padding: '6px 12px' }}>
                <ShieldCheck size={12} color="#79C0FF" weight="fill" />
                <span style={{ fontSize: 12, color: '#A5D6FF', fontWeight: 600 }}>Vendedor verificado</span>
              </div>
            </div>
          </div>

          {/* ── Info principal ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Precio y nombre */}
            <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {item.oem && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 8, padding: '5px 12px', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1 }}>Código OEM</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace', letterSpacing: 0.5 }}>{item.oem}</span>
                </div>
              )}
              <p style={{ fontSize: 32, fontWeight: 900, color: '#E6EDF3', margin: '0 0 4px' }}>
                ${item.precio.toLocaleString('es-CL')}
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#E6EDF3', margin: '0 0 8px', lineHeight: 1.3 }}>{item.pieza}</h1>

              {/* Detalles auto */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Car size={15} color="#6E7681" weight="fill" />
                  <span style={{ fontSize: 13, color: '#E6EDF3' }}>{item.marca} {item.modelo}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarBlank size={15} color="#6E7681" weight="fill" />
                  <span style={{ fontSize: 13, color: '#E6EDF3' }}>{item.anios}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Gauge size={15} color="#6E7681" weight="fill" />
                  <span style={{ fontSize: 13, color: '#E6EDF3' }}>{item.vistas} vistas</span>
                </div>
              </div>

              {/* Fitment chips */}
              {item.fitment.length > 0 && (
                <div style={{ marginTop: 14, padding: '12px', background: '#0D1117', borderRadius: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>
                    Compatibilidad declarada
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.fitment.map((f, i) => (
                      <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                        {f.make} {f.model} {f.yearFrom}–{f.yearTo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Verificar compatibilidad ── */}
            <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: 'rgba(56,139,253,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={18} color="#79C0FF" weight="fill" />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#E6EDF3', margin: 0 }}>Verificar compatibilidad</p>
                  <p style={{ fontSize: 12, color: '#B1BAC4', margin: '2px 0 0' }}>¿Sirve para tu vehículo?</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select value={vMake} onChange={e => { setVMake(e.target.value); setVModel(''); setVYear('') }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22' }}>
                  <option value="">Seleccionar marca</option>
                  {makes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vModel} onChange={e => { setVModel(e.target.value); setVYear('') }} disabled={!vMake}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22', opacity: vMake ? 1 : 0.5 }}>
                  <option value="">Seleccionar modelo</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={vYear} onChange={e => setVYear(e.target.value)} disabled={!vModel}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: '#161B22', opacity: vModel ? 1 : 0.5 }}>
                  <option value="">Seleccionar año</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Resultado compatibilidad */}
              {compat && (
                <div style={{
                  marginTop: 12, borderRadius: 12, padding: '14px 16px',
                  background: compat === 'compatible' ? '#eff6ff' : compat === 'incompatible' ? '#fef2f2' : '#f9fafb',
                  border: `1.5px solid ${compat === 'compatible' ? '#bfdbfe' : compat === 'incompatible' ? '#fca5a5' : '#e5e7eb'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {compat === 'compatible'   && <CheckCircle size={24} color="#79C0FF" weight="fill" />}
                  {compat === 'incompatible' && <Warning size={24} color="#dc2626" weight="fill" />}
                  {compat === 'unknown'      && <Question size={24} color="#6E7681" weight="fill" />}
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, margin: 0,
                      color: compat === 'compatible' ? '#1A56DB' : compat === 'incompatible' ? '#b91c1c' : '#374151' }}>
                      {compat === 'compatible'   ? '✓ Compatible con tu vehículo' : ''}
                      {compat === 'incompatible' ? 'No compatible con este vehículo' : ''}
                      {compat === 'unknown'      ? 'Sin datos de compatibilidad' : ''}
                    </p>
                    <p style={{ fontSize: 12, margin: '2px 0 0',
                      color: compat === 'compatible' ? '#1A56DB' : compat === 'incompatible' ? '#dc2626' : '#6b7280' }}>
                      {compat === 'compatible'   ? `${vMake} ${vModel} ${vYear} — esta pieza debería funcionar` : ''}
                      {compat === 'incompatible' ? 'Consulta con el vendedor para confirmar' : ''}
                      {compat === 'unknown'      ? 'Confirma directamente con el vendedor' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Vendedor ── */}
            <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 14px' }}>Vendedor</p>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: isRealProduct ? 'linear-gradient(135deg,#388BFD,#1F6FEB)' : `linear-gradient(135deg,${seller.color}dd,${seller.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>
                    {sellerNombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  {isRealProduct
                    ? <p style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', margin: '0 0 4px' }}>{sellerNombre}</p>
                    : <Link href={`/d/${seller.slug}`} style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', textDecoration: 'none' }}>{sellerNombre}</Link>
                  }
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} weight={s <= Math.round(seller.rating) ? 'fill' : 'regular'} color={s <= Math.round(seller.rating) ? '#facc15' : '#e5e7eb'} />
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3' }}>{seller.rating}</span>
                    <span style={{ fontSize: 12, color: '#B1BAC4' }}>({seller.reviewCount} reseñas)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <MapPin size={12} color="#6E7681" weight="fill" />
                    <span style={{ fontSize: 12, color: '#B1BAC4' }}>{seller.direccion}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Clock size={12} color="#6E7681" weight="fill" />
                    <span style={{ fontSize: 12, color: '#B1BAC4' }}>{seller.horario}</span>
                  </div>
                </div>
              </div>

              {/* Botón comprar + carrito */}
              {isRealProduct && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Link href={`/checkout/${id}`}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', touchAction: 'manipulation' }}>
                    Comprar ahora · ${item.precio.toLocaleString('es-CL')}
                  </Link>
                  <button
                    title={cart.has(id) ? 'Quitar del carrito' : 'Agregar al carrito'}
                    onClick={() => cart.has(id) ? cart.remove(id) : cart.add({ id, pieza: item.pieza, precio: item.precio, imagen_url: item.imagen_url, seller_id: item.seller_id ?? undefined })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', borderRadius: 12, border: `1.5px solid ${cart.has(id) ? 'rgba(56,139,253,0.6)' : 'rgba(240,246,252,0.15)'}`, background: cart.has(id) ? 'rgba(56,139,253,0.2)' : 'rgba(240,246,252,0.06)', cursor: 'pointer', flexShrink: 0 }}>
                    <ShoppingCart size={20} weight={cart.has(id) ? 'fill' : 'regular'} color={cart.has(id) ? '#79C0FF' : '#8B949E'} />
                  </button>
                </div>
              )}

              {/* Chat directo + WhatsApp + Llamar */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link
                  href={`/chat/directo?room=${encodeURIComponent((item.seller_id ?? seller.slug) + '-' + id)}&pieza=${encodeURIComponent(item.pieza)}&vendedor=${encodeURIComponent(sellerNombre)}&wa=${encodeURIComponent(waLink)}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', touchAction: 'manipulation', minWidth: 120 }}>
                  <ChatCircle size={18} weight="fill" /> Chat directo
                </Link>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 16px', borderRadius: 12, background: '#25d366', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', touchAction: 'manipulation', flexShrink: 0 }}>
                  <WhatsappLogo size={18} weight="fill" /> WhatsApp
                </a>
                <a href={`tel:${sellerTel}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 14px', borderRadius: 12, border: '1.5px solid rgba(240,246,252,0.12)', color: '#E6EDF3', fontWeight: 600, fontSize: 14, textDecoration: 'none', touchAction: 'manipulation', background: 'rgba(240,246,252,0.05)', flexShrink: 0 }}>
                  <Phone size={18} weight="fill" color="#8B949E" />
                </a>
                {!isRealProduct && (
                  <Link href={`/d/${seller.slug}`}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: 12, border: '1.5px solid rgba(240,246,252,0.12)', color: '#E6EDF3', textDecoration: 'none', touchAction: 'manipulation', background: 'rgba(240,246,252,0.05)' }}>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            </div>

            {/* Garantías */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: <Truck size={20} color="#79C0FF" weight="fill" />, label: 'Envío a todo Chile', sub: 'Coordina con el vendedor' },
                { icon: <ShieldCheck size={20} color="#79C0FF" weight="fill" />, label: 'Vendedor verificado', sub: `Desde ${seller.fundacion}` },
                { icon: <Certificate size={20} color="#79C0FF" weight="fill" />, label: 'Pieza usada original', sub: 'Desmontada en desarmaduria' },
                { icon: <Lightning size={20} color="#79C0FF" weight="fill" />, label: 'Respuesta rápida', sub: 'WhatsApp directo' },
              ].map(t => (
                <div key={t.label} style={{ background: '#161B22', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.1)', padding: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{t.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 12, color: '#E6EDF3', margin: 0 }}>{t.label}</p>
                    <p style={{ fontSize: 11, color: '#B1BAC4', margin: '2px 0 0' }}>{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Similares */}
            {similares.length > 0 && (
              <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#E6EDF3', margin: 0 }}>Más repuestos similares</p>
                  <Link href="/marketplace" style={{ fontSize: 12, color: '#79C0FF', fontWeight: 600, textDecoration: 'none' }}>Ver todo →</Link>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 } as React.CSSProperties}>
                  {similares.map(sim => {
                    const simSeller = mockDesarmaduras.find(d => d.slug === sim.vendedorSlug)
                    return (
                      <Link key={sim.id} href={`/marketplace/${sim.id}`}
                        style={{ flexShrink: 0, width: 150, background: '#0D1117', borderRadius: 14, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                        <div style={{ height: 90, background: simSeller ? `linear-gradient(160deg,${simSeller.color}20,${simSeller.color}40)` : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 32 }}>{ZONA_EMOJI[sim.zona] ?? '🔧'}</span>
                        </div>
                        <div style={{ padding: '10px' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#E6EDF3', margin: '0 0 4px', lineHeight: 1.3 }}>{sim.pieza}</p>
                          <p style={{ fontSize: 13, fontWeight: 900, color: '#A5D6FF', margin: 0 }}>${sim.precio.toLocaleString('es-CL')}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR (móvil) ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#161B22', borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>{item.pieza}</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#E6EDF3', margin: 0 }}>${item.precio.toLocaleString('es-CL')}</p>
        </div>
        <a href={`tel:${sellerTel}`}
          style={{ padding: '13px 16px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation', background: '#161B22' }}>
          <Phone size={20} weight="fill" color="#8B949E" />
        </a>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, maxWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, background: '#25d366', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', touchAction: 'manipulation' }}>
          <WhatsappLogo size={20} weight="fill" /> Consultar
        </a>
      </div>
    </div>
  )
}
