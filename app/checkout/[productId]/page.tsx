'use client'

import { use, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Truck, CreditCard, Loader2, User } from 'lucide-react'

interface ProductInfo {
  id: string
  pieza: string
  precio: number
  seller_id?: string
  seller_nombre?: string
  seller_telefono?: string
  imagen_url?: string | null
  envio?: string | null
}

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params)
  const { user, isLoaded } = useUser()

  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nombre,    setNombre]    = useState('')
  const [telefono,  setTelefono]  = useState('')
  const [direccion, setDireccion] = useState('')
  const [envioOpt,  setEnvioOpt]  = useState<'retiro' | 'envio'>('envio')

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.product) setProduct(d.product)
      })
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (user) {
      setNombre(user.fullName ?? user.firstName ?? '')
    }
  }, [user])

  const envioCosto = envioOpt === 'envio' ? 5000 : 0
  const total = (product?.precio ?? 0) + envioCosto

  async function handlePay() {
    if (!user || !product) return
    if (!nombre.trim()) { setError('Ingresa tu nombre'); return }
    if (envioOpt === 'envio' && !direccion.trim()) { setError('Ingresa tu dirección de entrega'); return }

    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:    product.id,
          pieza:         product.pieza,
          precio:        product.precio,
          envio_costo:   envioCosto,
          seller_id:     product.seller_id ?? 'unknown',
          imagen_url:    product.imagen_url,
          buyer_name:    nombre,
          buyer_phone:   telefono,
          buyer_address: envioOpt === 'envio' ? direccion : 'Retiro en local',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al procesar'); return }
      window.location.href = data.redirect
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui,sans-serif' }}>
        <p style={{ color: '#B1BAC4' }}>Producto no encontrado</p>
        <Link href="/marketplace" style={{ color: '#79C0FF', fontWeight: 700, textDecoration: 'none' }}>← Volver</Link>
      </div>
    )
  }

  if (!isLoaded || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui,sans-serif' }}>
        <p style={{ color: '#E6EDF3', fontWeight: 600 }}>Debes iniciar sesión para comprar</p>
        <Link href="/sign-in" style={{ padding: '12px 24px', background: '#388BFD', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Iniciar sesión</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
        <Link href={`/marketplace/${productId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: '#21262D', textDecoration: 'none' }}>
          <ArrowLeft size={18} color="#CDD9E5" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3' }}>Finalizar compra</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Resumen del producto */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, background: '#21262D', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.imagen_url
              ? <img src={product.imagen_url} alt={product.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <ShoppingBag size={28} color="#3b5280" />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#E6EDF3', margin: 0 }}>{product.pieza}</p>
            {product.seller_nombre && (
              <p style={{ fontSize: 12, color: '#B1BAC4', margin: '4px 0 0' }}>Vendedor: {product.seller_nombre}</p>
            )}
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#E6EDF3', flexShrink: 0 }}>
            ${product.precio.toLocaleString('es-CL')}
          </p>
        </div>

        {/* Opción de envío */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={16} color="#79C0FF" /> Método de entrega
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'envio', label: 'Envío a domicilio', sub: '+$5.000 · Aprox. 3-5 días hábiles' },
              { id: 'retiro', label: 'Retiro en local', sub: 'Sin costo · Coordinar con vendedor' },
            ].map(op => (
              <label key={op.id} onClick={() => setEnvioOpt(op.id as 'envio' | 'retiro')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `2px solid ${envioOpt === op.id ? '#1A56DB' : '#e5e7eb'}`, background: envioOpt === op.id ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${envioOpt === op.id ? '#1A56DB' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {envioOpt === op.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#388BFD' }} />}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3', margin: 0 }}>{op.label}</p>
                  <p style={{ fontSize: 12, color: '#B1BAC4', margin: '2px 0 0' }}>{op.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Datos del comprador */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={16} color="#79C0FF" /> Tus datos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3', display: 'block', marginBottom: 4 }}>Nombre completo *</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3', display: 'block', marginBottom: 4 }}>Teléfono</label>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 1234 5678"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {envioOpt === 'envio' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3', display: 'block', marginBottom: 4 }}>Dirección de entrega *</label>
                <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle, número, ciudad"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
        </div>

        {/* Resumen total */}
        <div style={{ background: '#161B22', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={16} color="#79C0FF" /> Resumen del pago
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#E6EDF3' }}>
              <span>Pieza</span><span>${product.precio.toLocaleString('es-CL')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#E6EDF3' }}>
              <span>Envío</span><span>{envioCosto > 0 ? `$${envioCosto.toLocaleString('es-CL')}` : 'Gratis'}</span>
            </div>
            <div style={{ height: 1, background: '#21262D', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, color: '#E6EDF3' }}>
              <span>Total</span><span>${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Botón pagar */}
        <button onClick={handlePay} disabled={submitting}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: submitting ? '#e5e7eb' : 'linear-gradient(135deg,#388BFD,#1F6FEB)',
            color: submitting ? '#9ca3af' : '#fff', fontWeight: 800, fontSize: 16,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          {submitting
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
            : <><CreditCard size={18} /> Pagar ${total.toLocaleString('es-CL')} con Flow</>}
        </button>

        <p style={{ fontSize: 11, color: '#B1BAC4', textAlign: 'center', margin: 0 }}>
          Pago 100% seguro procesado por Flow.cl · Tarjetas, débito y transferencia
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
