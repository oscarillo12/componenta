'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Phone, MapPin, ExternalLink, Eye, Tag, Wrench, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

type Fitment = { make: string; model: string; yearFrom: number; yearTo: number }

type Product = {
  id: string; pieza: string; marca: string | null; modelo: string | null
  anios: string | null; oem: string | null; estado: string; precio: number
  envio: string | null; descripcion: string | null; canales: string[]
  fitment: Fitment[]; vistas: number; imagen_url: string | null
  created_at: string; seller_nombre: string | null; seller_telefono: string | null
  ml_item_id: string | null; ml_permalink: string | null
}

type SellerProfile = {
  slug: string; nombre: string; color: string
  ciudad: string | null; whatsapp: string | null; banner_url: string | null
}

const ESTADO_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  excelente:      { label: 'Excelente',     color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  bueno:          { label: 'Buen estado',   color: '#2563eb', bg: '#eff6ff', icon: CheckCircle },
  'con-detalles': { label: 'Con detalles',  color: '#d97706', bg: '#fffbeb', icon: AlertCircle },
  'para-reparar': { label: 'Para reparar',  color: '#b91c1c', bg: '#fff5f5', icon: AlertCircle },
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export default function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct]           = useState<Product | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading]           = useState(true)
  const [notFound, setNotFound]         = useState(false)
  const [waCopied, setWaCopied]         = useState(false)

  useEffect(() => {
    fetch(`/api/producto/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setNotFound(true); return }
        setProduct(d.product)
        setSellerProfile(d.sellerProfile ?? null)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#2f5fdb', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound || !product) return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Pieza no encontrada</p>
      <Link href="/" style={{ color: '#2f5fdb', fontWeight: 600, textDecoration: 'none' }}>← Ver todas las piezas</Link>
    </div>
  )

  const estado   = ESTADO_MAP[product.estado] ?? ESTADO_MAP.bueno
  const EstIcon  = estado.icon
  const whatsapp = sellerProfile?.whatsapp ?? product.seller_telefono
  const waNum    = whatsapp?.replace(/\D/g, '')
  const waMsg    = encodeURIComponent(`Hola, vi tu pieza "${product.pieza}"${product.marca ? ` para ${product.marca}` : ''} en Componenta y me interesa. ¿Está disponible?`)
  const waLink   = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : null

  const titulo = [product.pieza, product.marca, product.modelo, product.anios].filter(Boolean).join(' · ')

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f7f7f5 }
        @media (min-width: 768px) { .layout { flex-direction: row !important } .sidebar { width: 320px !important; max-width: 320px !important; flex-shrink: 0; position: sticky !important; top: 20px; align-self: flex-start } }
      `}</style>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={16} />
            Volver
          </Link>
          <span style={{ color: '#e5e7eb' }}>|</span>
          <Link href="/" style={{ fontWeight: 900, fontSize: 15, color: '#16181d', textDecoration: 'none', letterSpacing: '-0.3px' }}>
            comp<span style={{ color: '#2f5fdb' }}>●</span>nenta
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={13} color="#9aa0aa" />
            <span style={{ fontSize: 12, color: '#9aa0aa' }}>{product.vistas} vistas</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: '#9aa0aa' }}>
          <Link href="/" style={{ color: '#9aa0aa', textDecoration: 'none' }}>Inicio</Link>
          <ChevronRight size={12} />
          {product.marca && <><Link href={`/?marca=${product.marca}`} style={{ color: '#9aa0aa', textDecoration: 'none' }}>{product.marca}</Link><ChevronRight size={12} /></>}
          <span style={{ color: '#374151', fontWeight: 600 }}>{product.pieza}</span>
        </div>

        <div className="layout" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Columna izquierda: imagen + detalles ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Imagen */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 12 }}>
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={titulo}
                  style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', background: '#f9fafb' }}
                />
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f2f4', fontSize: 48 }}>
                  🔧
                </div>
              )}
            </div>

            {/* Título + precio + estado */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 20px 24px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: estado.bg, color: estado.color, flexShrink: 0 }}>
                  <EstIcon size={11} />
                  {estado.label}
                </span>
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#16181d', margin: '0 0 6px', lineHeight: 1.25 }}>
                {product.pieza}
                {product.marca && <span style={{ fontWeight: 600, color: '#6b7280' }}> · {product.marca}</span>}
              </h1>

              {(product.modelo || product.anios) && (
                <p style={{ fontSize: 14, color: '#9aa0aa', margin: '0 0 16px' }}>
                  {[product.modelo, product.anios].filter(Boolean).join(' · ')}
                </p>
              )}

              <p style={{ fontSize: 32, fontWeight: 900, color: '#16181d', margin: '0 0 4px', letterSpacing: '-1px' }}>
                {fmtPrice(product.precio)}
              </p>

              {product.envio && (
                <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, margin: 0 }}>✓ {product.envio}</p>
              )}
            </div>

            {/* Descripción */}
            {product.descripcion && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Descripción</h2>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{product.descripcion}</p>
              </div>
            )}

            {/* Detalles técnicos */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', marginBottom: 12 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Detalles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                <DetailRow icon={<Wrench size={13} color="#9aa0aa" />} label="Pieza" value={product.pieza} />
                {product.marca  && <DetailRow icon={<Tag size={13} color="#9aa0aa" />}    label="Marca vehículo" value={product.marca} />}
                {product.modelo && <DetailRow icon={<Tag size={13} color="#9aa0aa" />}    label="Modelo"         value={product.modelo} />}
                {product.anios  && <DetailRow icon={<Tag size={13} color="#9aa0aa" />}    label="Años"           value={product.anios} />}
                {product.oem    && <DetailRow icon={<Tag size={13} color="#9aa0aa" />}    label="Código OEM"     value={product.oem} mono />}
                <DetailRow icon={<Tag size={13} color="#9aa0aa" />} label="Estado" value={estado.label} />
                <DetailRow icon={<Tag size={13} color="#9aa0aa" />} label="Publicado" value={fmtDate(product.created_at)} />
              </div>
            </div>

            {/* Compatibilidad */}
            {product.fitment && product.fitment.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Compatibilidad</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {product.fitment.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 9 }}>
                      <CheckCircle size={13} color="#16a34a" />
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                        {f.make} {f.model}
                      </span>
                      <span style={{ fontSize: 12, color: '#9aa0aa', marginLeft: 'auto' }}>
                        {f.yearFrom === f.yearTo ? f.yearFrom : `${f.yearFrom}–${f.yearTo}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* También en MercadoLibre */}
            {product.ml_permalink && (
              <div style={{ background: '#fffde7', borderRadius: 12, border: '1.5px solid #FFE600', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#FFE600', borderRadius: 8, padding: '4px 8px', flexShrink: 0 }}>
                  <span style={{ fontWeight: 900, fontSize: 10, color: '#2D3277' }}>ML</span>
                </div>
                <p style={{ fontSize: 13, color: '#374151', margin: 0, flex: 1 }}>Esta pieza también está publicada en MercadoLibre</p>
                <a href={product.ml_permalink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#2D3277', textDecoration: 'none', flexShrink: 0 }}>
                  Ver en ML <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>

          {/* ── Columna derecha: contacto + vendedor ── */}
          <div className="sidebar" style={{ width: '100%', maxWidth: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Botones contacto */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Contactar vendedor</p>

                {waLink ? (
                  <>
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 0', borderRadius: 12, background: '#25D366', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', marginBottom: 10 }}>
                      <MessageCircle size={18} />
                      Contactar por WhatsApp
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`https://wa.me/${waNum}`); setWaCopied(true); setTimeout(() => setWaCopied(false), 2000) }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      <Phone size={14} />
                      {waCopied ? '¡Número copiado!' : `+${waNum?.slice(0, 3)} ${waNum?.slice(3, 5)} ${waNum?.slice(5)}`}
                    </button>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: '#9aa0aa', textAlign: 'center', margin: 0 }}>
                    Número de contacto no disponible
                  </p>
                )}
              </div>

              {/* Tarjeta vendedor */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ height: 6, background: sellerProfile?.color ?? '#2f5fdb' }} />
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 10px' }}>Vendedor</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: sellerProfile?.color ?? '#2f5fdb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff' }}>
                      {(sellerProfile?.nombre ?? product.seller_nombre ?? 'V').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#16181d', margin: 0 }}>
                        {sellerProfile?.nombre ?? product.seller_nombre ?? 'Vendedor Componenta'}
                      </p>
                      {sellerProfile?.ciudad && (
                        <p style={{ fontSize: 12, color: '#9aa0aa', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {sellerProfile.ciudad}
                        </p>
                      )}
                    </div>
                  </div>
                  {sellerProfile?.slug && (
                    <Link href={`/d/${sellerProfile.slug}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      Ver catálogo completo <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Info adicional */}
              <div style={{ background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.55 }}>
                  <strong>Componenta no cobra comisión.</strong> El precio que ves es el precio final que acuerdes con el vendedor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9aa0aa', fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: 13, color: '#16181d', fontWeight: 700, margin: 0, fontFamily: mono ? 'monospace' : undefined }}>
        {value}
      </p>
    </div>
  )
}
