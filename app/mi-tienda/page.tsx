'use client'

import { useState, useEffect, useCallback } from 'react'
import SellerLayout from '@/components/SellerLayout'
import { Check, Copy, ExternalLink, MapPin, Clock, Phone, MessageCircle, Star, Shield, Package, TrendingUp, Award, Truck, AlertCircle, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

const COLOR_PRESETS = [
  { label: 'Verde',   value: '#1A56DB' },
  { label: 'Esmeralda', value: '#059669' },
  { label: 'Azul',   value: '#1d4ed8' },
  { label: 'Celeste', value: '#0284c7' },
  { label: 'Morado', value: '#7c3aed' },
  { label: 'Rojo',   value: '#dc2626' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Ámbar',  value: '#d97706' },
  { label: 'Rosa',   value: '#db2777' },
  { label: 'Teal',   value: '#0f766e' },
  { label: 'Gris',   value: '#374151' },
  { label: 'Negro',  value: '#111827' },
]

type Profile = {
  user_id: string; slug: string; nombre: string; tagline: string; descripcion: string
  color: string; banner_url: string | null; whatsapp: string; direccion: string
  horario: string; ciudad: string; especialidades: string[]
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#161B22', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <button onPointerDown={() => setOpen(v => !v)} style={{ width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#E6EDF3' }}>{title}</span>
        {open ? <ChevronUp size={16} color="#6E7681" /> : <ChevronDown size={16} color="#6E7681" />}
      </button>
      {open && <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)',
  fontSize: 14, color: '#E6EDF3', outline: 'none', boxSizing: 'border-box', background: '#161B22',
}

export default function MiTiendaPage() {
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [form,     setForm]     = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [specInput, setSpecInput] = useState('')
  const [copied,   setCopied]   = useState(false)
  const [showCustomColor, setShowCustomColor] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch('/api/mi-tienda').then(r => r.json()).then(d => {
      setProfile(d); setForm(d)
    }).catch(() => setError('Error cargando perfil')).finally(() => setLoading(false))
  }, [])

  const set = useCallback(<K extends keyof Profile>(key: K, val: Profile[K]) => {
    setForm(prev => prev ? { ...prev, [key]: val } : prev)
  }, [])

  const addEspecialidad = () => {
    const v = specInput.trim()
    if (!v || !form) return
    if (form.especialidades.includes(v)) return
    set('especialidades', [...form.especialidades, v])
    setSpecInput('')
  }

  const removeEspecialidad = (s: string) => {
    if (!form) return
    set('especialidades', form.especialidades.filter(e => e !== s))
  }

  const mejorarConIA = async () => {
    if (!form) return
    setAiLoading(true)
    try {
      const r = await fetch('/api/ai-describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, especialidades: form.especialidades, ciudad: form.ciudad, tipo: 'desarmaduria' }),
      })
      const d = await r.json()
      if (d.descripcion) set('descripcion', d.descripcion)
    } finally { setAiLoading(false) }
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const r = await fetch('/api/mi-tienda', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Error al guardar'); return }
      setProfile(form); setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Error de conexión') } finally { setSaving(false) }
  }

  const copyUrl = () => {
    if (!form) return
    navigator.clipboard.writeText(`${window.location.origin}/d/${form.slug}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (loading) return (
    <SellerLayout section="mi-tienda">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader2 size={28} color="#79C0FF" className="animate-spin" />
      </div>
    </SellerLayout>
  )

  if (!form) return (
    <SellerLayout section="mi-tienda">
      <div style={{ padding: 24, color: '#b91c1c' }}>Error cargando perfil: {error}</div>
    </SellerLayout>
  )

  const previewWhatsapp = `https://wa.me/${(form.whatsapp || '56912345678').replace(/\D/g, '')}`

  return (
    <SellerLayout section="mi-tienda">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: '#E6EDF3', margin: 0 }}>Mi página de tienda</h1>
            <p style={{ color: '#B1BAC4', fontSize: 14, margin: '4px 0 0' }}>Personaliza cómo te ven los compradores en el marketplace</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onPointerDown={copyUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', background: '#161B22', fontSize: 13, fontWeight: 600, color: '#E6EDF3', cursor: 'pointer', touchAction: 'manipulation' }}>
              {copied ? <Check size={14} color="#79C0FF" /> : <Copy size={14} color="#8B949E" />}
              {copied ? 'Copiado' : 'Copiar URL'}
            </button>
            <a href={`/d/${form.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', background: '#161B22', fontSize: 13, fontWeight: 600, color: '#E6EDF3', textDecoration: 'none' }}>
              <ExternalLink size={14} color="#8B949E" /> Ver publicada
            </a>
            <button onPointerDown={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: saved ? '#1A56DB' : '#1A56DB', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', touchAction: 'manipulation', opacity: saving ? 0.8 : 1 }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
              {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <AlertCircle size={15} color="#b91c1c" />
            <span style={{ color: '#b91c1c', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* URL banner */}
        <div style={{ background: 'rgba(56,139,253,0.15)', border: '1px solid rgba(56,139,253,0.4)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={14} color="#79C0FF" />
          <span style={{ fontSize: 13, color: '#166534' }}>Tu tienda: <strong>componenta.cl/d/{form.slug}</strong></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

          {/* ── FORMULARIO ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Section title="Identidad de la tienda">
              <Field label="Nombre de la tienda *">
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} placeholder="Ej: Desarmaduria El Rey" />
              </Field>
              <Field label="URL de tu página">
                <div style={{ display: 'flex', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 9, overflow: 'hidden', background: '#161B22' }}>
                  <span style={{ padding: '10px 12px', background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#B1BAC4', whiteSpace: 'nowrap' }}>componenta.cl/d/</span>
                  <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40))}
                    style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }} placeholder="mi-tienda" />
                </div>
              </Field>
              <Field label="Frase de presentación">
                <input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={inputStyle} maxLength={80} placeholder="Ej: Repuestos usados de calidad desde 2010" />
              </Field>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3' }}>Descripción / Sobre nosotros</label>
                  <button onPointerDown={mejorarConIA} disabled={aiLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(56,139,253,0.4)', background: 'rgba(56,139,253,0.1)', fontSize: 11, color: '#79C0FF', fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation', opacity: aiLoading ? 0.6 : 1 }}>
                    {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {aiLoading ? 'Generando…' : 'Mejorar con IA'}
                  </button>
                </div>
                <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                  placeholder="Cuenta quiénes son, en qué se especializan, qué garantías ofrecen…" />
              </div>
              <Field label="Especialidades">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {form.especialidades.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, background: form.color + '20', color: form.color, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                      {s}
                      <button onPointerDown={() => removeEspecialidad(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, touchAction: 'manipulation', color: form.color, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={specInput} onChange={e => setSpecInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEspecialidad())}
                    style={{ ...inputStyle, flex: 1 }} placeholder="Ej: Toyota, Motor, Frenos…" />
                  <button onPointerDown={addEspecialidad}
                    style={{ padding: '0 16px', borderRadius: 9, border: 'none', background: form.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap' }}>
                    + Añadir
                  </button>
                </div>
              </Field>
            </Section>

            <Section title="Color y apariencia">
              <Field label="Color principal">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {COLOR_PRESETS.map(c => (
                    <button key={c.value} onPointerDown={() => set('color', c.value)} title={c.label}
                      style={{ width: 34, height: 34, borderRadius: 9, background: c.value, border: form.color === c.value ? `3px solid #111827` : '2px solid transparent', cursor: 'pointer', touchAction: 'manipulation', position: 'relative', boxShadow: form.color === c.value ? '0 0 0 2px #fff inset' : 'none' }}>
                      {form.color === c.value && <Check size={14} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />}
                    </button>
                  ))}
                </div>
                <button onPointerDown={() => setShowCustomColor(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', background: '#161B22', fontSize: 13, color: '#E6EDF3', cursor: 'pointer', touchAction: 'manipulation' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: form.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                  Color personalizado: {form.color}
                </button>
                {showCustomColor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                      style={{ width: 44, height: 44, borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: '#161B22' }} />
                    <input value={form.color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set('color', e.target.value) }}
                      style={{ ...inputStyle, width: 120 }} placeholder="#1A56DB" />
                  </div>
                )}
              </Field>
            </Section>

            <Section title="Contacto y ubicación">
              <Field label="WhatsApp (con código de país)">
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} style={inputStyle} placeholder="+56 9 1234 5678" />
              </Field>
              <Field label="Dirección">
                <input value={form.direccion} onChange={e => set('direccion', e.target.value)} style={inputStyle} placeholder="Av. Ejemplo 1234, Ciudad" />
              </Field>
              <Field label="Ciudad / Región">
                <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} style={inputStyle} placeholder="Temuco, La Araucanía" />
              </Field>
              <Field label="Horario de atención">
                <input value={form.horario} onChange={e => set('horario', e.target.value)} style={inputStyle} placeholder="Lun–Vie 9:00–18:00 · Sáb 9:00–13:00" />
              </Field>
            </Section>
          </div>

          {/* ── PREVIEW ── */}
          <div style={{ position: 'sticky', top: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#E6EDF3', marginBottom: 10, textAlign: 'center' }}>Vista previa</p>
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', background: '#21262D' }}>

              {/* Hero preview */}
              <div style={{ background: `linear-gradient(160deg, ${form.color} 0%, ${form.color}cc 60%, #111827 100%)`, padding: '20px 16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                    {form.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MT'}
                  </div>
                  <div>
                    <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendedor verificado</p>
                    <p style={{ fontWeight: 900, fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.2 }}>{form.nombre || 'Mi Tienda'}</p>
                    {form.tagline && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '3px 0 0', lineHeight: 1.3 }}>{form.tagline}</p>}
                  </div>
                </div>

                {/* Stats mini */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 10 }}>
                  {[{ v: '4.8', l: 'Rating' }, { v: '0', l: 'Reseñas' }, { v: '0', l: 'Stock' }, { v: '0', l: 'Ventas' }].map(s => (
                    <div key={s.l} style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: '#fff', margin: 0 }}>{s.v}</p>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {form.direccion && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={9} />{form.direccion}</p>}
                  {form.horario   && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={9} />{form.horario}</p>}
                  {form.whatsapp  && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={9} />{form.whatsapp}</p>}
                </div>

                {/* CTA buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#161B22', borderRadius: 9, padding: '8px', fontSize: 11, fontWeight: 700, color: form.color }}>
                    <MessageCircle size={12} /> WhatsApp
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9, padding: '8px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    <Phone size={12} /> Llamar
                  </div>
                </div>
              </div>

              {/* Body preview */}
              <div style={{ padding: '12px 14px 14px', background: '#0D1117', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Especialidades */}
                {form.especialidades.length > 0 && (
                  <div style={{ background: '#161B22', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 6px' }}>Especialidades</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {form.especialidades.map(s => (
                        <span key={s} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: '#fff', background: form.color }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Descripción */}
                {form.descripcion && (
                  <div style={{ background: '#161B22', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Sobre nosotros</p>
                    <p style={{ fontSize: 11, color: '#E6EDF3', margin: 0, lineHeight: 1.5, WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{form.descripcion}</p>
                  </div>
                )}
                {/* Ejemplo pieza */}
                <div style={{ background: '#161B22', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Catálogo de repuestos</p>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: '#fff', background: form.color }}>0 piezas</span>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 44, borderRadius: 8, background: form.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Bomba de agua completa</p>
                      <p style={{ fontSize: 9, color: '#B1BAC4', margin: '2px 0 0' }}>Chevrolet Spark · 2010–2018</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: form.color, margin: '3px 0 0' }}>$35.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#B1BAC4', marginTop: 10 }}>
              Vista previa aproximada — la página real tiene más contenido
            </p>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
