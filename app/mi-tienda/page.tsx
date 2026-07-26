'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://componenta.vercel.app'
const FEED_URL = `${APP_URL}/api/merchant-feed`
import SellerLayout from '@/components/SellerLayout'
import { Check, Copy, ExternalLink, MapPin, Clock, Phone, MessageCircle, AlertCircle, Loader2, Sparkles, ArrowRight, ArrowLeft, Upload, Globe } from 'lucide-react'

const COLOR_PRESETS = [
  { label: 'Verde',   value: '#1A56DB' },
  { label: 'Esmeralda', value: '#059669' },
  { label: 'Azul',   value: '#2f5fdb' },
  { label: 'Celeste', value: '#0284c7' },
  { label: 'Morado', value: '#7c3aed' },
  { label: 'Rojo',   value: '#dc2626' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Ámbar',  value: '#d97706' },
  { label: 'Rosa',   value: '#db2777' },
  { label: 'Teal',   value: '#0f766e' },
  { label: 'Gris',   value: '#374151' },
  { label: 'Negro',  value: '#16181d' },
]

type Profile = {
  user_id: string; slug: string; nombre: string; tagline: string; descripcion: string
  color: string; banner_url: string | null; whatsapp: string; direccion: string
  horario: string; ciudad: string; especialidades: string[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 12px', borderRadius: 9, border: '1.5px solid #ececea',
  fontSize: 13.5, color: '#16181d', outline: 'none', boxSizing: 'border-box', background: '#fafafa', fontFamily: 'inherit',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const STEPS = ['Marca', 'Estilo', 'Contacto'] as const

// Sube una imagen (banner o logo) a /api/upload-image y devuelve la URL pública.
async function uploadImage(file: File): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: dataUrl }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
  return data.url as string
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
  const [metaCopied, setMetaCopied] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [view, setView] = useState<'summary' | 'edit'>('edit')
  const [step, setStep] = useState(0)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [mlConnected,     setMlConnected]     = useState<boolean|null>(null)
  useEffect(() => {
    fetch('/api/mi-tienda').then(r => r.json()).then(d => {
      setProfile(d); setForm(d)
      if (d.profileSaved) setView('summary')
    }).catch(() => setError('Error cargando perfil')).finally(() => setLoading(false))

    fetch('/api/mercadolibre/status').then(r => r.json()).then(d => setMlConnected(d.connected ?? false)).catch(() => setMlConnected(false))
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

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !form) return
    setUploadingBanner(true)
    setError('')
    try {
      const url = await uploadImage(file)
      set('banner_url', url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const r = await fetch('/api/mi-tienda', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Error al guardar'); return }
      setProfile(form); setSaved(true); setTimeout(() => { setSaved(false); setView('summary') }, 1500)
    } catch { setError('Error de conexión') } finally { setSaving(false) }
  }

  const copyUrl = () => {
    if (!form) return
    navigator.clipboard.writeText(`${window.location.origin}/d/${form.slug}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (loading) return (
    <SellerLayout section="mi-tienda">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader2 size={28} color="#2f5fdb" className="animate-spin" />
      </div>
    </SellerLayout>
  )

  if (!form) return (
    <SellerLayout section="mi-tienda">
      <div style={{ padding: 24, color: '#b91c1c' }}>Error cargando perfil: {error}</div>
    </SellerLayout>
  )

  return (
    <SellerLayout section="mi-tienda">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <AlertCircle size={15} color="#b91c1c" />
            <span style={{ color: '#b91c1c', fontSize: 13 }}>{error}</span>
          </div>
        )}

        {/* ── Vista resumen (perfil ya configurado) ── */}
        {view === 'summary' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ececea', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: form.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff' }}>
              {form.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MT'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#16181d', margin: '0 0 2px' }}>{form.nombre}</p>
              <p style={{ fontSize: 12, color: '#9aa0aa', margin: 0 }}>{form.ciudad}{form.tagline ? ` · ${form.tagline}` : ''}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <a href={`/d/${form.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 9, border: '1.5px solid #ececea', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
                <ExternalLink size={12} color="#9aa0aa" /> Ver
              </a>
              <button onPointerDown={() => { setStep(0); setView('edit') }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, border: 'none', background: '#16181d', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Editar tienda
              </button>
            </div>
          </div>
        )}

        {/* ── Wizard edición ── */}
        {view === 'edit' && (
        <>
        {/* Progreso de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: i <= step ? '#2f5fdb' : '#ececea', color: i <= step ? '#fff' : '#9aa0aa', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: i <= step ? '#16181d' : '#9aa0aa', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#2f5fdb' : '#ececea' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ececea', padding: 24 }}>

          {/* PASO 1 — Marca */}
          {step === 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Cuéntanos de tu tienda</h2>
              <p style={{ fontSize: 12, color: '#9aa0aa', margin: '0 0 20px' }}>Esto es lo primero que ven tus compradores</p>

              <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: '#f5f5f4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: form.color }}>
                  {form.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MT'}
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Nombre de la tienda *">
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} placeholder="Ej: Desarmaduria El Rey" />
                  </Field>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <Field label="Frase de presentación">
                  <input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={inputStyle} maxLength={80} placeholder="Ej: Repuestos usados de calidad desde 2010" />
                </Field>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151' }}>Descripción / Sobre nosotros</label>
                  <button onPointerDown={mejorarConIA} disabled={aiLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: '1px solid #d7e3f7', background: '#eef3fc', fontSize: 11, color: '#2f5fdb', fontWeight: 600, cursor: 'pointer', opacity: aiLoading ? 0.6 : 1 }}>
                    {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {aiLoading ? 'Generando…' : 'Mejorar con IA'}
                  </button>
                </div>
                <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  placeholder="Cuenta quiénes son, en qué se especializan, qué garantías ofrecen…" />
              </div>

              <Field label="Especialidades">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {form.especialidades.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, background: form.color + '18', color: form.color, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                      {s}
                      <button onPointerDown={() => removeEspecialidad(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: form.color, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={specInput} onChange={e => setSpecInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEspecialidad())}
                    style={{ ...inputStyle, flex: 1 }} placeholder="Ej: Toyota, Motor, Frenos…" />
                  <button onPointerDown={addEspecialidad}
                    style={{ padding: '0 16px', borderRadius: 9, border: 'none', background: form.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Añadir
                  </button>
                </div>
              </Field>
            </>
          )}

          {/* PASO 2 — Estilo */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Dale estilo a tu tienda</h2>
              <p style={{ fontSize: 12, color: '#9aa0aa', margin: '0 0 20px' }}>Color y foto de portada</p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Foto de portada</label>
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} style={{ display: 'none' }} />
                <div onClick={() => bannerInputRef.current?.click()}
                  style={{ position: 'relative', height: 110, borderRadius: 12, border: '2px dashed #d7dae0', background: form.banner_url ? undefined : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                  {form.banner_url && <img src={form.banner_url} alt="Banner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {uploadingBanner
                    ? <Loader2 size={20} className="animate-spin" color="#9aa0aa" style={{ position: 'relative' }} />
                    : !form.banner_url && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#9aa0aa' }}>
                        <Upload size={18} />
                        <span style={{ fontSize: 11.5, fontWeight: 600 }}>Sube una foto (1600×400 recomendado)</span>
                      </div>
                    )}
                </div>
              </div>

              <Field label="Color principal">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {COLOR_PRESETS.map(c => (
                    <button key={c.value} onPointerDown={() => set('color', c.value)} title={c.label}
                      style={{ width: 34, height: 34, borderRadius: 9, background: c.value, border: form.color === c.value ? '3px solid #16181d' : '2px solid transparent', cursor: 'pointer', position: 'relative' }}>
                      {form.color === c.value && <Check size={14} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                    style={{ width: 40, height: 40, borderRadius: 9, border: '1.5px solid #ececea', cursor: 'pointer', padding: 2 }} />
                  <input value={form.color} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set('color', e.target.value) }}
                    style={{ ...inputStyle, width: 110 }} placeholder="#2f5fdb" />
                </div>
              </Field>
            </>
          )}

          {/* PASO 3 — Contacto */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>¿Cómo te contactan?</h2>
              <p style={{ fontSize: 12, color: '#9aa0aa', margin: '0 0 20px' }}>Últimos datos antes de guardar</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              </div>

              {/* Preview compacto de las tarjetas de contacto */}
              <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #ececea' }}>
                <div style={{ background: `linear-gradient(140deg, ${form.color}, ${form.color}cc)`, padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{form.nombre || 'Mi Tienda'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#fff', borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 700, color: form.color }}>
                      <MessageCircle size={12} /> WhatsApp
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      <Phone size={12} /> Llamar
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 5, background: '#fafafa' }}>
                  {form.direccion && <p style={{ fontSize: 11, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={11} color="#9aa0aa" />{form.direccion}</p>}
                  {form.horario && <p style={{ fontSize: 11, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={11} color="#9aa0aa" />{form.horario}</p>}
                </div>
              </div>
            </>
          )}

          {/* Navegación entre pasos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26, paddingTop: 20, borderTop: '1px solid #f1f2f4' }}>
            <button onPointerDown={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px', borderRadius: 10, border: '1.5px solid #ececea', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 13, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>
              <ArrowLeft size={14} /> Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button onPointerDown={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 10, border: 'none', background: '#16181d', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button onPointerDown={handleSave} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 10, border: 'none', background: '#2f5fdb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.8 : 1 }}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
                {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </div>
        </> )}

        {/* ── Tu catálogo público ── */}
        <div style={{ marginTop: 20, background: '#fff', borderRadius: 16, border: '1px solid #ececea', padding: '20px 24px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Tu catálogo público</h2>
          <p style={{ fontSize: 12, color: '#9aa0aa', margin: '0 0 14px' }}>Comparte este enlace con tus clientes — ven todos tus repuestos con tu marca</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <div style={{ flex: 1, background: '#f9fafb', border: '1.5px solid #ececea', borderRadius: 9, padding: '10px 12px', fontSize: 12.5, color: '#374151', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.6 }}>
              {APP_URL}/d/{form?.slug}
            </div>
            <button onPointerDown={copyUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 9, border: '1.5px solid #ececea', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', flexShrink: 0 }}>
              {copied ? <Check size={13} color="#2f5fdb" /> : <Copy size={13} color="#9aa0aa" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a href={`/d/${form?.slug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 9, border: '1.5px solid #ececea', background: '#fff', fontSize: 12, fontWeight: 600, color: '#374151', textDecoration: 'none', flexShrink: 0 }}>
              <ExternalLink size={13} color="#9aa0aa" /> Ver
            </a>
          </div>
        </div>

        {/* ── Canales activos ── */}
        <div style={{ marginTop: 20, background: '#fff', borderRadius: 16, border: '1px solid #ececea', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f2f4' }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Canales activos</h2>
            <p style={{ fontSize: 12, color: '#9aa0aa', margin: 0 }}>Cada pieza que publicas aparece automáticamente en estos canales</p>
          </div>

          {/* Componenta */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid #f9fafb' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#2f5fdb', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontWeight:900, fontSize:13, color:'#fff' }}>C</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 1px' }}>Componenta</p>
              <p style={{ fontSize:11.5, color:'#9aa0aa', margin:0 }}>Tu tienda en componenta.vercel.app/d/{form?.slug}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a' }}><span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />Activo</span>
              <a href={`/d/${form?.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:'#2f5fdb', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Ver <ExternalLink size={11} /></a>
            </div>
          </div>

          {/* Google Shopping */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid #f9fafb' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#fff', border:'1.5px solid #e5e7eb', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontWeight:900, fontSize:12, color:'#333' }}>G</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 1px' }}>Google Shopping</p>
              <p style={{ fontSize:11.5, color:'#9aa0aa', margin:0 }}>Feed XML enviándose — aprobación de productos depende de Google Merchant Center</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fffbeb', border:'1px solid #fde68a', color:'#92400e' }}><span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', display:'inline-block' }} />Feed activo</span>
              <a href={FEED_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:'#374151', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Feed <ExternalLink size={11} /></a>
            </div>
          </div>

          {/* Facebook + Instagram Shopping */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid #f9fafb' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#1877F2', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontWeight:900, fontSize:14, color:'#fff' }}>f</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 1px' }}>Facebook + Instagram Shopping</p>
              <p style={{ fontSize:11.5, color:'#9aa0aa', margin:0 }}>Piezas enviadas al catálogo de Meta — visibles cuando conectes a tu página de Facebook</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fffbeb', border:'1px solid #fde68a', color:'#92400e' }}><span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', display:'inline-block' }} />Catálogo listo</span>
              <a href="https://business.facebook.com/commerce" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, fontWeight:700, color:'#1877F2', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>Commerce <ExternalLink size={11} /></a>
            </div>
          </div>

          {/* MercadoLibre */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderBottom:'1px solid #f9fafb' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#FFE600', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontWeight:900, fontSize:10, color:'#2D3277' }}>ML</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 1px' }}>MercadoLibre</p>
              <p style={{ fontSize:11.5, color:'#9aa0aa', margin:0 }}>
                {mlConnected ? 'Publicas cada pieza con un clic desde tu inventario' : 'Conecta tu cuenta para publicar en MercadoLibre'}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              {mlConnected === null
                ? <span style={{ fontSize:11, color:'#9aa0aa' }}>…</span>
                : <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: mlConnected ? '#f0fdf4' : '#fff5f5', border: mlConnected ? '1px solid #bbf7d0' : '1px solid #fca5a5', color: mlConnected ? '#16a34a' : '#b91c1c' }}><span style={{ width:6, height:6, borderRadius:'50%', background: mlConnected ? '#22c55e' : '#f87171', display:'inline-block' }} />{mlConnected ? 'Activo' : 'Sin conectar'}</span>
              }
              {mlConnected === false && (
                <a href="/api/mercadolibre/connect" style={{ fontSize:12, fontWeight:700, color:'#2f5fdb', textDecoration:'none', padding:'5px 12px', borderRadius:8, border:'1.5px solid #d7e3f7', background:'#eef3fc' }}>
                  Conectar
                </a>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#25D366', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MessageCircle size={14} color="#fff" />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#16181d', margin:'0 0 1px' }}>WhatsApp</p>
              <p style={{ fontSize:11.5, color:'#9aa0aa', margin:0 }}>
                {form?.whatsapp ? `Compradores te contactan al ${form.whatsapp}` : 'Agrega tu número para recibir consultas'}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: form?.whatsapp ? '#f0fdf4' : '#fff5f5', border: form?.whatsapp ? '1px solid #bbf7d0' : '1px solid #fca5a5', color: form?.whatsapp ? '#16a34a' : '#b91c1c' }}><span style={{ width:6, height:6, borderRadius:'50%', background: form?.whatsapp ? '#22c55e' : '#f87171', display:'inline-block' }} />{form?.whatsapp ? 'Activo' : 'Sin conectar'}</span>
              {!form?.whatsapp && (
                <button onPointerDown={() => setStep(2)} style={{ fontSize:12, fontWeight:700, color:'#2f5fdb', cursor:'pointer', background:'none', border:'none', padding:0 }}>
                  Agregar →
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </SellerLayout>
  )
}
