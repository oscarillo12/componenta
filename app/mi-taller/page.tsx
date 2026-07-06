'use client'

import { useState, useEffect, useCallback } from 'react'
import SellerLayout from '@/components/SellerLayout'
import { Check, Copy, ExternalLink, MapPin, Clock, Phone, MessageCircle, Loader2, ChevronDown, ChevronUp, AlertCircle, Sparkles, Plus, Trash2 } from 'lucide-react'

const COLOR_PRESETS = [
  { label: 'Rojo', value: '#dc2626' }, { label: 'Naranja', value: '#ea580c' },
  { label: 'Ámbar', value: '#d97706' }, { label: 'Verde', value: '#16a34a' },
  { label: 'Azul', value: '#1d4ed8' }, { label: 'Celeste', value: '#0284c7' },
  { label: 'Morado', value: '#7c3aed' }, { label: 'Rosa', value: '#db2777' },
  { label: 'Teal', value: '#0f766e' }, { label: 'Gris', value: '#374151' },
]

const TIPOS = [
  { value: 'taller', label: 'Taller Mecánico General' },
  { value: 'electrico', label: 'Taller Eléctrico' },
  { value: 'especialista', label: 'Especialista (marca o sistema)' },
  { value: 'vulcanizacion', label: 'Vulcanización' },
  { value: 'carroceria', label: 'Carrocería y Pintura' },
]

type Servicio = { nombre: string; precio_desde?: number; precio_hasta?: number; descripcion?: string }
type Profile = {
  user_id: string; slug: string; nombre: string; tagline: string; descripcion: string
  color: string; whatsapp: string; telefono: string; direccion: string; horario: string
  ciudad: string; marcas: string[]; servicios: Servicio[]; tipo: string
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)',
  fontSize: 14, color: '#E6EDF3', outline: 'none', boxSizing: 'border-box', background: '#21262D',
}

export default function MiTallerPage() {
  const [form,      setForm]      = useState<Profile | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')
  const [copied,    setCopied]    = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [marcaInput, setMarcaInput] = useState('')
  const [newServicio, setNewServicio] = useState<Servicio>({ nombre: '', precio_desde: undefined, precio_hasta: undefined })

  useEffect(() => {
    fetch('/api/mi-taller').then(r => r.json()).then(d => setForm(d))
      .catch(() => setError('Error cargando perfil')).finally(() => setLoading(false))
  }, [])

  const set = useCallback(<K extends keyof Profile>(key: K, val: Profile[K]) => {
    setForm(prev => prev ? { ...prev, [key]: val } : prev)
  }, [])

  const mejorarConIA = async () => {
    if (!form) return
    setAiLoading(true)
    try {
      const r = await fetch('/api/ai-describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre, especialidades: form.marcas, ciudad: form.ciudad, tipo: form.tipo }),
      })
      const d = await r.json()
      if (d.descripcion) set('descripcion', d.descripcion)
    } finally { setAiLoading(false) }
  }

  const addMarca = () => {
    const v = marcaInput.trim()
    if (!v || !form || form.marcas.includes(v)) return
    set('marcas', [...form.marcas, v])
    setMarcaInput('')
  }

  const addServicio = () => {
    if (!form || !newServicio.nombre.trim()) return
    set('servicios', [...form.servicios, { ...newServicio }])
    setNewServicio({ nombre: '', precio_desde: undefined, precio_hasta: undefined })
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const r = await fetch('/api/mi-taller', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Error al guardar'); return }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Error de conexión') } finally { setSaving(false) }
  }

  const copyUrl = () => {
    if (!form) return
    navigator.clipboard.writeText(`${window.location.origin}/taller/${form.slug}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return (
    <SellerLayout section="mi-taller">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader2 size={28} color="#79C0FF" className="animate-spin" />
      </div>
    </SellerLayout>
  )

  if (!form) return (
    <SellerLayout section="mi-taller">
      <div style={{ padding: 24, color: '#F85149' }}>{error || 'Error cargando perfil'}</div>
    </SellerLayout>
  )

  return (
    <SellerLayout section="mi-taller">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 22, color: '#E6EDF3', margin: 0 }}>Mi página de taller</h1>
            <p style={{ color: '#8B949E', fontSize: 14, margin: '4px 0 0' }}>Tu página pública para que los clientes te encuentren</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onPointerDown={copyUrl} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', background: '#21262D', fontSize: 13, fontWeight: 600, color: '#E6EDF3', cursor: 'pointer', touchAction: 'manipulation' }}>
              {copied ? <Check size={14} color="#79C0FF" /> : <Copy size={14} color="#8B949E" />}
              {copied ? 'Copiado' : 'Copiar URL'}
            </button>
            <a href={`/taller/${form.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.1)', background: '#21262D', fontSize: 13, fontWeight: 600, color: '#E6EDF3', textDecoration: 'none' }}>
              <ExternalLink size={14} color="#8B949E" /> Ver página
            </a>
            <button onPointerDown={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', touchAction: 'manipulation', opacity: saving ? 0.8 : 1 }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
              {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <AlertCircle size={15} color="#F85149" />
            <span style={{ color: '#F85149', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* URL banner */}
        <div style={{ background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={14} color="#79C0FF" />
          <span style={{ fontSize: 13, color: '#79C0FF' }}>Tu taller: <strong>componenta.cl/taller/{form.slug}</strong></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Section title="Identidad del taller">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Tipo de taller</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={{ ...inputStyle }}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Nombre del taller *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} placeholder="Ej: Taller Mecánico El Rápido" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>URL de tu página</label>
              <div style={{ display: 'flex', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 9, overflow: 'hidden', background: '#21262D' }}>
                <span style={{ padding: '10px 12px', background: '#161B22', borderRight: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: '#8B949E', whiteSpace: 'nowrap' }}>componenta.cl/taller/</span>
                <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40))}
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, background: 'transparent' }} placeholder="mi-taller" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Frase de presentación</label>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={inputStyle} maxLength={80} placeholder="Ej: Mecánica rápida y confiable desde 2005" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#E6EDF3' }}>Descripción</label>
                <button onPointerDown={mejorarConIA} disabled={aiLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(56,139,253,0.4)', background: 'rgba(56,139,253,0.1)', fontSize: 11, color: '#79C0FF', fontWeight: 600, cursor: 'pointer', touchAction: 'manipulation', opacity: aiLoading ? 0.6 : 1 }}>
                  {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  {aiLoading ? 'Generando…' : 'Mejorar con IA'}
                </button>
              </div>
              <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                placeholder="Describe tu taller, especialidades y lo que te diferencia…" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Marcas que trabajan</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {form.marcas.map(m => (
                  <span key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${form.color}20`, color: form.color, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                    {m}
                    <button onPointerDown={() => set('marcas', form.marcas.filter(x => x !== m))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.color, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={marcaInput} onChange={e => setMarcaInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMarca())}
                  style={{ ...inputStyle, flex: 1 }} placeholder="Toyota, Honda, Chevrolet…" />
                <button onPointerDown={addMarca}
                  style={{ padding: '0 16px', borderRadius: 9, border: 'none', background: form.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap' }}>
                  + Añadir
                </button>
              </div>
            </div>
          </Section>

          <Section title="Color de marca">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLOR_PRESETS.map(c => (
                <button key={c.value} onPointerDown={() => set('color', c.value)} title={c.label}
                  style={{ width: 36, height: 36, borderRadius: 10, background: c.value, border: form.color === c.value ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', touchAction: 'manipulation', position: 'relative' }}>
                  {form.color === c.value && <Check size={14} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Servicios y precios">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {form.servicios.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#21262D', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{s.nombre}</p>
                    {(s.precio_desde || s.precio_hasta) && (
                      <p style={{ fontSize: 11, color: '#8B949E', margin: '2px 0 0' }}>
                        ${s.precio_desde?.toLocaleString('es-CL') ?? '?'} – ${s.precio_hasta?.toLocaleString('es-CL') ?? '?'}
                      </p>
                    )}
                  </div>
                  <button onPointerDown={() => set('servicios', form.servicios.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F85149', padding: 4, touchAction: 'manipulation' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ background: '#21262D', borderRadius: 12, padding: 14, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#8B949E', margin: '0 0 10px' }}>Agregar servicio</p>
              <input value={newServicio.nombre} onChange={e => setNewServicio(p => ({ ...p, nombre: e.target.value }))}
                style={{ ...inputStyle, marginBottom: 8 }} placeholder="Ej: Alineación y balanceo" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input type="number" value={newServicio.precio_desde ?? ''} onChange={e => setNewServicio(p => ({ ...p, precio_desde: e.target.value ? Number(e.target.value) : undefined }))}
                  style={inputStyle} placeholder="Precio desde (CLP)" />
                <input type="number" value={newServicio.precio_hasta ?? ''} onChange={e => setNewServicio(p => ({ ...p, precio_hasta: e.target.value ? Number(e.target.value) : undefined }))}
                  style={inputStyle} placeholder="Precio hasta (CLP)" />
              </div>
              <button onPointerDown={addServicio}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: 'none', background: form.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', touchAction: 'manipulation' }}>
                <Plus size={13} /> Agregar servicio
              </button>
            </div>
          </Section>

          <Section title="Contacto y ubicación">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} style={inputStyle} placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Teléfono fijo</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)} style={inputStyle} placeholder="+56 45 234 5678" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Dirección</label>
              <input value={form.direccion} onChange={e => set('direccion', e.target.value)} style={inputStyle} placeholder="Av. Principal 1234, Ciudad" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Ciudad / Región</label>
              <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} style={inputStyle} placeholder="Temuco, La Araucanía" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#E6EDF3', marginBottom: 6 }}>Horario de atención</label>
              <input value={form.horario} onChange={e => set('horario', e.target.value)} style={inputStyle} placeholder="Lun–Vie 9:00–18:00 · Sáb 9:00–13:00" />
            </div>
          </Section>

        </div>
      </div>
    </SellerLayout>
  )
}
