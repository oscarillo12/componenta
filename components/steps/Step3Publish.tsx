'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle, Lightning, WhatsappLogo, ShoppingCart,
  Storefront, Eye, Globe, Sparkle,
  Tag, Check, Warning, Phone
} from '@phosphor-icons/react'
import { PartData, CHANNELS } from '@/lib/types'

interface Step3PublishProps {
  photoPreview: string
  partData: PartData
  onPublished: () => void
}

const CANAL_CONFIG = {
  componenta: {
    icon: <Storefront size={24} weight="fill" color="#2f5fdb" />,
    color: '#2f5fdb', bg: '#eff6ff', border: '#bfdbfe',
    preview: 'Aparecerá en componenta.cl/marketplace visible para compradores de toda Chile',
    badge: 'Recomendado',
  },
  whatsapp: {
    icon: <WhatsappLogo size={24} weight="fill" color="#25d366" />,
    color: '#25d366', bg: '#f0fdf9', border: '#a7f3d0',
    preview: 'Los compradores contactarán directamente a tu número de WhatsApp',
    badge: null,
  },
  mercadolibre: {
    icon: <ShoppingCart size={24} weight="fill" color="#f59e0b" />,
    color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d',
    preview: 'Se publicará en MercadoLibre con descripción generada automáticamente',
    badge: 'Próximamente',
  },
}

const ESTADOS = [
  { id: 'excelente',    label: 'Excelente',    desc: 'Como nuevo, sin detalles',  color: '#A5D6FF', bg: '#dbeafe' },
  { id: 'bueno',        label: 'Buen estado',  desc: 'Uso normal, funciona bien', color: '#1d4ed8', bg: '#dbeafe' },
  { id: 'con-detalles', label: 'Con detalles', desc: 'Algunos detalles menores',  color: '#b45309', bg: '#fef3c7' },
  { id: 'para-reparar', label: 'Para reparar', desc: 'Requiere reparación',       color: '#b91c1c', bg: '#fee2e2' },
]

const ENVIO_OPS = ['Solo retiro en local', 'Envío a todo Chile', 'Envío región Araucanía']

// Valida y normaliza número chileno → +569XXXXXXXX o null
function parseChileanPhone(input: string): string | null {
  const d = input.replace(/\D/g, '')
  if (d.length === 9 && d.startsWith('9'))   return `+56${d}`
  if (d.length === 10 && d.startsWith('09'))  return `+56${d.slice(1)}`
  if (d.length === 11 && d.startsWith('569')) return `+${d}`
  if (d.length === 12 && d.startsWith('0056')) return `+56${d.slice(4)}`
  return null
}

function formatPhoneDisplay(e164: string): string {
  const d = e164.replace(/\D/g, '')
  if (d.startsWith('56') && d.length === 11) {
    return `+56 ${d[2]} ${d.slice(3, 7)} ${d.slice(7)}`
  }
  return e164
}

export default function Step3Publish({ photoPreview, partData, onPublished }: Step3PublishProps) {
  // ── Perfil del vendedor ────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true)
  const [sellerNombre,   setSellerNombre]   = useState('Tu nombre')
  const [sellerTelefono, setSellerTelefono] = useState<string | null>(null)

  // ── Gate teléfono ──────────────────────────────────────────────────────────
  const [phoneInput,   setPhoneInput]   = useState('')
  const [phoneError,   setPhoneError]   = useState<string | null>(null)
  const [phoneSaving,  setPhoneSaving]  = useState(false)
  const [phoneConfirmed, setPhoneConfirmed] = useState(false)

  // ── Formulario publicación ─────────────────────────────────────────────────
  const [selected,    setSelected]    = useState<Set<string>>(new Set(['componenta', 'whatsapp']))
  const [precio,      setPrecio]      = useState('')
  const [estado,      setEstado]      = useState('bueno')
  const [envio,       setEnvio]       = useState('Envío a todo Chile')
  const [descripcion, setDescripcion] = useState('')

  // ── Estados de publicación ─────────────────────────────────────────────────
  const [publishing,      setPublishing]      = useState(false)
  const [published,       setPublished]       = useState(false)
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false)
  const [publishError,    setPublishError]    = useState<string | null>(null)

  // Cargar perfil al montar
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d.nombre)   setSellerNombre(d.nombre)
        if (d.telefono) { setSellerTelefono(d.telefono); setPhoneConfirmed(true) }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [])

  const toggle = (id: string) => {
    if (id === 'mercadolibre') return
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  // Guardar teléfono
  async function savePhone() {
    setPhoneError(null)
    const parsed = parseChileanPhone(phoneInput)
    if (!parsed) {
      setPhoneError('Formato inválido. Ingresa tu número de 9 dígitos, ej: 9 1234 5678')
      return
    }
    setPhoneSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: parsed }),
      })
      if (res.ok) {
        setSellerTelefono(parsed)
        setPhoneConfirmed(true)
      } else {
        setPhoneError('No se pudo guardar el número. Intenta de nuevo.')
      }
    } catch {
      setPhoneError('Sin conexión. Intenta de nuevo.')
    } finally {
      setPhoneSaving(false)
    }
  }

  async function compressImage(dataUrl: string): Promise<string> {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const MAX = 900
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }

  const publish = async () => {
    if (!precio || !sellerTelefono) return
    setPublishError(null)
    setPublishing(true)
    try {
      let imagen_url: string | null = null
      let image_hash: string | null = null
      if (photoPreview) {
        const compressed = await compressImage(photoPreview)
        const upRes  = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: compressed }),
        })
        const upData = await upRes.json()
        if (!upRes.ok) {
          setPublishing(false)
          setPublishError(
            upData.error === 'duplicate_image'
              ? `Foto duplicada: ${upData.detail}`
              : `Error al subir imagen: ${upData.error ?? 'desconocido'}.`,
          )
          return
        }
        imagen_url = upData.url       ?? null
        image_hash = upData.imageHash ?? null
      }

      const compat0 = partData.compatibilidad[0]
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pieza:          partData.pieza,
          marca:          partData.marca,
          modelo:         compat0?.modelo ?? null,
          anios:          compat0?.anios  ?? null,
          oem:            partData.oem,
          compatibilidad: partData.compatibilidad,
          precio:         parseInt(precio.replace(/\D/g, '')),
          estado,
          envio,
          descripcion,
          canales:        [...selected],
          imagen_url,
          image_hash,
        }),
      })
      let data: Record<string, string> = {}
      try { data = await res.json() } catch { /* non-JSON */ }

      if (res.status === 403 && data.error === 'limite_alcanzado') { setLimiteAlcanzado(true); return }
      if (res.status === 409 && data.error === 'duplicate_pieza') {
        setPublishError(data.detail ?? 'Ya tienes esta pieza publicada.')
        return
      }
      if (!res.ok) {
        const msg = data?.detail ?? data?.error ?? `HTTP ${res.status}`
        setPublishError(
          res.status === 401 ? 'No estás autenticado. Cierra sesión y vuelve a entrar.'
          : msg.includes('does not exist') ? 'Ejecuta el SQL de migración en Supabase.'
          : `Error del servidor (${res.status}): ${msg}`,
        )
        return
      }
      setPublished(true)
      setTimeout(onPublished, 3000)
    } catch {
      setPublishError('Sin conexión al servidor. Verifica tu red e intenta de nuevo.')
    } finally {
      setPublishing(false)
    }
  }

  const estadoConfig = ESTADOS.find(e => e.id === estado)!
  const precioNum    = parseInt(precio.replace(/\D/g, '')) || 0

  // ── Pantalla: límite alcanzado ─────────────────────────────────────────────
  if (limiteAlcanzado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', gap: 16, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef3c7', border: '3px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>⚡</div>
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#16181d', margin: '0 0 8px' }}>Límite gratuito alcanzado</p>
          <p style={{ fontSize: 14, color: '#9aa0aa', margin: '0 0 4px' }}>Has publicado los <strong>5 productos</strong> de la prueba gratuita.</p>
          <p style={{ fontSize: 14, color: '#9aa0aa', margin: 0 }}>Sube a Plan Pro para publicar repuestos ilimitados.</p>
        </div>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '20px', width: '100%', maxWidth: 300 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#16181d', margin: '0 0 12px' }}>Plan Pro</p>
          {['Repuestos ilimitados', 'Página web en componenta.cl', 'Dashboard completo', 'Soporte prioritario'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Check size={14} weight="bold" color="#2f5fdb" />
              <span style={{ fontSize: 13, color: '#16181d' }}>{f}</span>
            </div>
          ))}
          <p style={{ fontSize: 22, fontWeight: 900, color: '#16181d', margin: '12px 0' }}>USD $20<span style={{ fontSize: 13, fontWeight: 400, color: '#9aa0aa' }}>/mes</span></p>
          <a href="/planes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: '#2f5fdb', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <Lightning size={16} weight="fill" /> Ver Plan Pro
          </a>
        </div>
      </div>
    )
  }

  // ── Pantalla: publicado ────────────────────────────────────────────────────
  if (published) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 16, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(56,139,253,0.15)', border: '3px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} weight="fill" color="#2f5fdb" />
        </div>
        <div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#16181d', margin: '0 0 8px' }}>¡Pieza publicada!</p>
          <p style={{ fontSize: 14, color: '#9aa0aa', margin: 0 }}>Publicada en {selected.size} {selected.size === 1 ? 'canal' : 'canales'} · Ya es visible en el marketplace</p>
        </div>
        {sellerTelefono && (
          <div style={{ background: '#f0fdf9', border: '1.5px solid #a7f3d0', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <WhatsappLogo size={20} color="#25d366" weight="fill" />
            <p style={{ fontSize: 13, color: '#065f46', fontWeight: 600, margin: 0 }}>
              Los compradores te contactarán al {formatPhoneDisplay(sellerTelefono)}
            </p>
          </div>
        )}
        <div style={{ background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Globe size={20} color="#2f5fdb" weight="fill" />
          <p style={{ fontSize: 13, color: '#A5D6FF', fontWeight: 600, margin: 0 }}>Ver en componenta.cl/marketplace →</p>
        </div>
      </div>
    )
  }

  // ── Cargando perfil ────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#2f5fdb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  // ── GATE: Registro de teléfono requerido ───────────────────────────────────
  if (!phoneConfirmed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header explicativo */}
        <div style={{ background: 'linear-gradient(135deg,#f0fdf9,#dbeafe)', border: '1.5px solid #a7f3d0', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WhatsappLogo size={24} weight="fill" color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#16181d', margin: '0 0 6px' }}>
              Registra tu número de WhatsApp
            </p>
            <p style={{ fontSize: 13, color: '#16181d', margin: 0, lineHeight: 1.5 }}>
              Es <strong>obligatorio</strong> para publicar como vendedor independiente. Los compradores te contactarán directamente por WhatsApp cuando vean tu pieza en el marketplace.
            </p>
          </div>
        </div>

        {/* Diagrama de flujo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', borderRadius: 14, padding: '14px 18px' }}>
          {[
            { icon: '🛒', label: 'Comprador ve la pieza' },
            { icon: '→', label: '' },
            { icon: <WhatsappLogo size={18} weight="fill" color="#25d366" />, label: 'Click en "Consultar"' },
            { icon: '→', label: '' },
            { icon: <Phone size={18} weight="fill" color="#CDD9E5" />, label: 'Llega a tu WhatsApp' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: item.icon === '→' ? 'none' : 1 }}>
              {item.icon === '→' ? (
                <span style={{ fontSize: 18, color: '#9aa0aa' }}>→</span>
              ) : (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fafafa', border: '1.5px solid #ececea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {item.icon}
                  </div>
                  <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{item.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Input de teléfono */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 8 }}>
            NÚMERO DE WHATSAPP (Chile)
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Prefijo fijo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', border: '1.5px solid #ececea', borderRadius: 10, background: '#ffffff', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>🇨🇱</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#16181d' }}>+56</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="9 1234 5678"
              value={phoneInput}
              onChange={e => {
                setPhoneError(null)
                setPhoneInput(e.target.value)
              }}
              onKeyDown={e => { if (e.key === 'Enter') savePhone() }}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 10,
                border: `1.5px solid ${phoneError ? '#fca5a5' : phoneInput ? '#2f5fdb' : '#e5e7eb'}`,
                fontSize: 16,
                fontWeight: 600,
                outline: 'none',
                letterSpacing: 1,
              }}
            />
          </div>
          {phoneError && (
            <p style={{ fontSize: 12, color: '#b91c1c', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Warning size={12} weight="fill" /> {phoneError}
            </p>
          )}
          <p style={{ fontSize: 11, color: '#9aa0aa', margin: '6px 0 0' }}>
            Ej: 9 8765 4321 — Solo números móviles chilenos
          </p>
        </div>

        {/* Nota de privacidad */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: '#ffffff', borderRadius: 10, border: '1px solid #ececea' }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: '#9aa0aa', margin: 0, lineHeight: 1.5 }}>
            Tu número solo se mostrará a compradores que hagan clic en "Consultar" para una pieza tuya. No se publica públicamente.
          </p>
        </div>

        {/* Botón guardar */}
        <button
          onPointerDown={savePhone}
          disabled={phoneSaving || !phoneInput.trim()}
          style={{
            touchAction: 'manipulation',
            padding: '14px 24px', borderRadius: 12, border: 'none',
            cursor: !phoneInput.trim() ? 'not-allowed' : 'pointer',
            background: !phoneInput.trim() ? '#e5e7eb' : '#25d366',
            color: !phoneInput.trim() ? '#9ca3af' : '#fff',
            fontWeight: 800, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {phoneSaving ? (
            <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Guardando…</>
          ) : (
            <><WhatsappLogo size={18} weight="fill" /> Guardar número y continuar</>
          )}
        </button>
      </div>
    )
  }

  const compat = partData.compatibilidad.map(c => `${c.marca} ${c.modelo} ${c.anios}`).join(' · ')

  // ── Formulario principal de publicación ───────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Banner teléfono confirmado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf9', border: '1.5px solid #a7f3d0', borderRadius: 12, padding: '10px 16px', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} weight="fill" color="#2f5fdb" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>
            WhatsApp vinculado: {formatPhoneDisplay(sellerTelefono!)}
          </span>
        </div>
        <button
          onPointerDown={() => { setPhoneConfirmed(false); setPhoneInput('') }}
          style={{ fontSize: 12, color: '#2f5fdb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
          Cambiar número
        </button>
      </div>

      {/* ── Título ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56,139,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkle size={18} weight="fill" color="#2f5fdb" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#16181d', margin: 0 }}>Personalizar y publicar</h1>
        </div>
        <p style={{ fontSize: 14, color: '#9aa0aa', margin: 0 }}>Ajusta los detalles y elige dónde aparecerá tu pieza</p>
      </div>

      {/* ── PRECIO Y ENVÍO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 6 }}>
            <Tag size={12} style={{ marginRight: 4 }} />PRECIO (CLP) *
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#9aa0aa', fontSize: 16 }}>$</span>
            <input
              type="text"
              placeholder="0"
              value={precio}
              onChange={e => setPrecio(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
              style={{ width: '100%', padding: '11px 12px 11px 26px', borderRadius: 10, border: `1.5px solid ${precio ? '#2f5fdb' : '#e5e7eb'}`, fontSize: 16, fontWeight: 700, color: '#16181d', outline: 'none', boxSizing: 'border-box', background: precio ? '#eff6ff' : '#fff' }}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 6 }}>ENVÍO</label>
          <select value={envio} onChange={e => setEnvio(e.target.value)}
            style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #ececea', fontSize: 13, outline: 'none', background: '#fafafa', color: '#16181d' }}>
            {ENVIO_OPS.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
      </div>

      {/* ── ESTADO ── */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 10 }}>CONDICIÓN DE LA PIEZA</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ESTADOS.map(e => (
            <button key={e.id}
              onPointerDown={() => setEstado(e.id)}
              style={{ touchAction: 'manipulation', border: `2px solid ${estado === e.id ? e.color : '#e5e7eb'}`, borderRadius: 12, padding: '12px', cursor: 'pointer', textAlign: 'left', background: estado === e.id ? e.bg : '#fff', transition: 'all 0.15s' }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: estado === e.id ? e.color : '#374151', margin: '0 0 2px' }}>{e.label}</p>
              <p style={{ fontSize: 11, color: '#9aa0aa', margin: 0 }}>{e.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── DESCRIPCIÓN ── */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 6 }}>DESCRIPCIÓN ADICIONAL (opcional)</label>
        <textarea
          placeholder="Ej: Desmontado de Chevrolet Spark 2014 accidentado. Funciona perfecto."
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1.5px solid #ececea', fontSize: 13, outline: 'none', resize: 'vertical', color: '#16181d', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      </div>

      {/* ── CANALES ── */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#16181d', display: 'block', marginBottom: 10 }}>¿DÓNDE SE PUBLICARÁ?</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHANNELS.map(channel => {
            const cfg = CANAL_CONFIG[channel.id as keyof typeof CANAL_CONFIG]
            const isSelected = selected.has(channel.id)
            const disabled   = channel.id === 'mercadolibre'
            return (
              <button key={channel.id}
                onPointerDown={() => toggle(channel.id)}
                style={{ touchAction: 'manipulation', cursor: disabled ? 'default' : 'pointer', border: `2px solid ${isSelected ? cfg.border : '#e5e7eb'}`, borderRadius: 14, padding: '14px 16px', textAlign: 'left', background: isSelected ? cfg.bg : '#fff', opacity: disabled ? 0.6 : 1, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#16181d', margin: 0 }}>{channel.name}</p>
                    {cfg.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: channel.id === 'componenta' ? '#2f5fdb' : '#e5e7eb', color: channel.id === 'componenta' ? '#fff' : '#6b7280' }}>
                        {cfg.badge}
                      </span>
                    )}
                    {isSelected && !disabled && (
                      <span style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <CheckCircle size={18} weight="fill" color={cfg.color} />
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#9aa0aa', margin: 0 }}>{cfg.preview}</p>
                  {channel.id === 'whatsapp' && isSelected && sellerTelefono && (
                    <p style={{ fontSize: 11, color: '#25d366', fontWeight: 600, margin: '4px 0 0' }}>
                      → {formatPhoneDisplay(sellerTelefono)}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <div style={{ border: '1.5px solid #ececea', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: '#ffffff', borderBottom: '1px solid #ececea', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={14} color="#6b7280" weight="fill" />
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9aa0aa', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Vista previa — componenta.cl/marketplace
          </p>
        </div>
        <div style={{ padding: '16px', background: '#fafafa' }}>
          <div style={{ border: '1.5px solid #ececea', borderRadius: 14, overflow: 'hidden', maxWidth: 200 }}>
            <div style={{ height: 110, background: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            </div>
            <div style={{ padding: '10px' }}>
              <p style={{ fontSize: 10, color: '#9aa0aa', margin: '0 0 2px' }}>{partData.marca || 'Sin marca'}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#16181d', margin: '0 0 4px', lineHeight: 1.3 }}>{partData.pieza}</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#16181d', margin: '0 0 6px' }}>
                {precioNum > 0 ? `$${precioNum.toLocaleString('es-CL')}` : <span style={{ color: '#3b5280' }}>$ —</span>}
              </p>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: estadoConfig.bg, color: estadoConfig.color }}>
                {estadoConfig.label}
              </span>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: '#2f5fdb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 900 }}>
                  {sellerNombre[0].toUpperCase()}
                </div>
                <p style={{ fontSize: 9, color: '#9aa0aa', margin: 0 }}>{sellerNombre}</p>
              </div>
            </div>
          </div>
          {compat && <p style={{ fontSize: 11, color: '#9aa0aa', margin: '10px 0 0' }}>Compatible: {compat.slice(0, 60)}{compat.length > 60 ? '…' : ''}</p>}
        </div>
      </div>

      {/* ── ERROR ── */}
      {publishError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Warning size={18} color="#b91c1c" weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '0 0 2px' }}>No se pudo publicar</p>
            <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0 }}>{publishError}</p>
          </div>
        </div>
      )}

      {/* ── BOTÓN PUBLICAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <div>
          {!precio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Warning size={14} color="#f59e0b" weight="fill" />
              <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>Ingresa un precio para publicar</p>
            </div>
          )}
          {precio && selected.size > 0 && (
            <p style={{ fontSize: 12, color: '#9aa0aa', margin: 0 }}>
              Se publicará en <strong style={{ color: '#16181d' }}>{selected.size}</strong> canal{selected.size > 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <button
          onPointerDown={publish}
          disabled={selected.size === 0 || publishing || !precio}
          style={{
            touchAction: 'manipulation',
            padding: '12px 28px', borderRadius: 12, border: 'none',
            cursor: selected.size === 0 || !precio ? 'not-allowed' : 'pointer',
            background: selected.size === 0 || !precio ? '#e5e7eb' : '#2f5fdb',
            color: selected.size === 0 || !precio ? '#9ca3af' : '#fff',
            fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
          }}>
          {publishing ? (
            <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Publicando…</>
          ) : (
            <><Lightning size={16} weight="fill" /> Publicar ahora</>
          )}
        </button>
      </div>
    </div>
  )
}
