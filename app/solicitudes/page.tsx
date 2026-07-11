'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Send, Clock, Car, Package, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

type Solicitud = {
  id: string
  pieza: string
  marca: string | null
  modelo: string | null
  anio: string | null
  descripcion: string | null
  buyer_name: string
  created_at: string
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)  return 'Ahora'
  if (diff < 60) return `Hace ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24)    return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading]         = useState(true)
  const [enviando, setEnviando]       = useState(false)
  const [enviado, setEnviado]         = useState(false)
  const [error, setError]             = useState('')

  const [form, setForm] = useState({
    pieza: '', marca: '', modelo: '', anio: '',
    descripcion: '', buyer_name: '', buyer_phone: '',
  })

  useEffect(() => {
    fetch('/api/solicitudes')
      .then(r => r.json())
      .then(d => setSolicitudes(d.solicitudes ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pieza.trim() || !form.buyer_name.trim()) return
    setEnviando(true)
    setError('')

    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // Recargar lista
    fetch('/api/solicitudes').then(r => r.json()).then(d => setSolicitudes(d.solicitudes ?? []))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid #ececea', background: '#fafafa', color: '#16181d',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid #ececea', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 40 }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Marketplace
        </Link>
        <div style={{ width: 1, height: 20, background: '#ececea' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Search size={15} color="#2f5fdb" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#16181d' }}>Tablero de búsquedas</span>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eef3fc', border: '1.5px solid #d7e3f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Search size={26} color="#2f5fdb" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#16181d', margin: '0 0 8px', letterSpacing: -0.5 }}>
            ¿Buscas una pieza?
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Publica lo que necesitas y todos los desarmaderos de la zona recibirán un WhatsApp al instante.
          </p>
        </div>

        {/* Formulario */}
        <div style={{ background: '#fff', border: '1.5px solid #ececea', borderRadius: 18, padding: '24px 20px', marginBottom: 36, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={40} color="#16a34a" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 17, fontWeight: 800, color: '#16181d', margin: '0 0 8px' }}>¡Búsqueda enviada!</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>Los desarmaderos de la zona recibieron tu WhatsApp. Espera su contacto.</p>
              <button
                onClick={() => setEnviado(false)}
                style={{ padding: '9px 24px', background: '#fff', border: '1.5px solid #ececea', borderRadius: 10, color: '#16181d', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Publicar otra búsqueda
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#16181d', margin: '0 0 16px' }}>Nueva búsqueda</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Pieza (obligatorio) */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                    ¿Qué pieza buscas? <span style={{ color: '#b91c1c' }}>*</span>
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="Ej: Alternador, Radiador, Amortiguador delantero…"
                    value={form.pieza}
                    onChange={e => setForm(f => ({ ...f, pieza: e.target.value }))}
                    required
                  />
                </div>

                {/* Marca / Modelo / Año */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Marca</label>
                    <input style={inputStyle} placeholder="Toyota" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Modelo</label>
                    <input style={inputStyle} placeholder="Yaris" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Año</label>
                    <input style={inputStyle} placeholder="2015" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>Descripción adicional (opcional)</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
                    placeholder="OEM, detalles de desgaste, urgencia…"
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  />
                </div>

                {/* Nombre y teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>
                      Tu nombre <span style={{ color: '#b91c1c' }}>*</span>
                    </label>
                    <input style={inputStyle} placeholder="Juan Pérez" value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 5 }}>WhatsApp</label>
                    <input style={inputStyle} placeholder="+569 1234 5678" value={form.buyer_phone} onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))} />
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: 12, color: '#b91c1c', margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando || !form.pieza.trim() || !form.buyer_name.trim()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 12, border: 'none', background: enviando || !form.pieza.trim() || !form.buyer_name.trim() ? '#ececea' : '#2f5fdb', color: enviando || !form.pieza.trim() || !form.buyer_name.trim() ? '#9aa0aa' : '#fff', fontWeight: 800, fontSize: 14, cursor: enviando ? 'default' : 'pointer', transition: 'all 0.2s', boxShadow: enviando || !form.pieza.trim() || !form.buyer_name.trim() ? 'none' : '0 4px 14px rgba(47,95,219,0.3)' }}
                >
                  {enviando
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando…</>
                    : <><Send size={15} /> Notificar a desarmaderos</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tablero de búsquedas activas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Package size={15} color="#9aa0aa" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#16181d', margin: 0 }}>Búsquedas activas</h2>
            <span style={{ fontSize: 11, color: '#6b7280', background: '#f0f0ee', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
              {solicitudes.length} publicadas
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader2 size={24} color="#9aa0aa" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            </div>
          ) : solicitudes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 16, border: '1.5px dashed #d7e3f7' }}>
              <Search size={32} color="#2f5fdb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#16181d', margin: '0 0 6px' }}>Aún no hay búsquedas publicadas</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>¡Sé el primero en publicar la tuya arriba! 👆</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {solicitudes.map(s => {
                const isRecent = (Date.now() - new Date(s.created_at).getTime()) < 10 * 60000
                return (
                <div key={s.id}
                  style={{ background: '#fff', border: `1.5px solid ${isRecent ? '#a9c2f2' : '#ececea'}`, borderRadius: 14, padding: '16px 18px', transition: 'border-color 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#2f5fdb'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = isRecent ? '#a9c2f2' : '#ececea'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: s.descripcion ? 8 : 0 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#16181d', margin: 0 }}>{s.pieza}</p>
                        {isRecent && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#2f5fdb', padding: '2px 7px', borderRadius: 20, letterSpacing: 0.3 }}>
                            NUEVA
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(s.marca || s.modelo || s.anio) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2f5fdb', background: '#eef3fc', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                            <Car size={10} /> {[s.marca, s.modelo, s.anio].filter(Boolean).join(' ')}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9aa0aa' }}>
                          <Clock size={10} /> {timeAgo(s.created_at)}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0, fontWeight: 500 }}>{s.buyer_name}</span>
                  </div>
                  {s.descripcion && (
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.5, borderTop: '1px solid #f1f2f4', paddingTop: 8 }}>
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
