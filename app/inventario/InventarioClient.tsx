'use client'

import { useState, useEffect } from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://componenta.vercel.app'
import { Product } from '@/lib/supabase'
import { Plus, Search, Package, Trash2, CheckCircle, RotateCcw, Loader2, ExternalLink, Eye, Pencil, X, Sparkles, Copy, Check, Globe } from 'lucide-react'
import Link from 'next/link'

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#1a7a42', bg: '#eefbf2' },
  bueno:          { label: 'Buen estado',  color: '#2f5fdb', bg: '#eef3fc' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fffbeb' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fff5f5' },
}

function MlIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="14" fill="#FFE600" />
      <path d="M7 14L11.5 9L14 13L16.5 9L21 14L14 21L7 14Z" fill="#2D3277" />
    </svg>
  )
}

// ── Calidad de la publicación ────────────────────────────────────────────
// Heurística simple client-side. Si más adelante se calcula en el backend
// (p.ej. junto con el guardado del producto), reemplazar por el valor real.
function computeQuality(item: Product): { score: number; label: string; color: string; tip: string } {
  let score = 20 // base por tener precio y estado
  const missing: string[] = []

  if (item.imagen_url) score += 35; else missing.push('Agrega fotos')
  if (item.descripcion && item.descripcion.trim().length > 20) score += 20; else missing.push('Agrega descripción')
  if (item.oem) score += 15; else missing.push('Agrega código OEM')
  if (item.fitment && item.fitment.length > 0) score += 10; else missing.push('Agrega compatibilidad')

  score = Math.min(100, score)
  const label = score >= 80 ? 'Completa' : score >= 50 ? 'Buena' : 'Básica'
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#b91c1c'
  const tip = missing.length > 0 ? missing[0] : 'Publicación completa'
  return { score, label, color, tip }
}

function QualityRing({ score, color, size = 46 }: { score: number; color: string; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * score) / 100
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f2f4" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={13} fontWeight={800} fontFamily="Inter,sans-serif" fill={color}>{score}</text>
    </svg>
  )
}

function EditModal({ item, onClose, onSave }: {
  item: Product
  onClose: () => void
  onSave: (id: string, data: Partial<Product>) => Promise<void>
}) {
  const [form, setForm] = useState({
    pieza:       item.pieza,
    marca:       item.marca ?? '',
    modelo:      item.modelo ?? '',
    anios:       item.anios ?? '',
    oem:         item.oem ?? '',
    estado:      item.estado,
    precio:      item.precio,
    envio:       item.envio ?? '',
    descripcion: item.descripcion ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [oemSuggesting, setOemSuggesting] = useState(false)
  const [oemError, setOemError] = useState<string | null>(null)

  async function suggestOem() {
    setOemSuggesting(true)
    setOemError(null)
    try {
      const res = await fetch('/api/suggest-oem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieza: form.pieza, marca: form.marca, modelo: form.modelo, anios: form.anios }),
      })
      const data = await res.json()
      if (!res.ok || !data.oem) {
        setOemError(data.oem === null ? 'La IA no pudo sugerir un código para esta pieza' : (data.error ?? 'Error al sugerir'))
        return
      }
      setForm(p => ({ ...p, oem: data.oem }))
    } catch {
      setOemError('Sin conexión. Intenta de nuevo.')
    } finally {
      setOemSuggesting(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type: 'text' | 'number' | 'textarea' = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea rows={3} value={form[key] as string}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={{ fontSize: 13.5, border: '1.5px solid #ececea', borderRadius: 10, padding: '10px 12px', color: '#16181d', resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: '#fafafa', transition: 'border-color .15s' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#2f5fdb')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ececea')} />
      ) : (
        <input type={type} value={form[key] as string | number}
          onChange={e => setForm(p => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          style={{ fontSize: 13.5, border: '1.5px solid #ececea', borderRadius: 10, padding: '10px 12px', color: '#16181d', outline: 'none', background: '#fafafa', transition: 'border-color .15s' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#2f5fdb')}
          onBlur={e => (e.currentTarget.style.borderColor = '#ececea')} />
      )}
    </div>
  )

  const section = (label: string) => (
    <p style={{ fontSize: 11, fontWeight: 800, color: '#2f5fdb', textTransform: 'uppercase', letterSpacing: 0.6, margin: '4px 0 -2px' }}>{label}</p>
  )

  async function handleSave() {
    setSaving(true)
    await onSave(item.id, { ...form, precio: Number(form.precio) })
    setSaving(false)
    onClose()
  }

  const liveQuality = computeQuality({ ...item, ...form } as Product)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,24,39,0.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -12px 48px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px 18px', borderBottom: '1px solid #f1f2f4', flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eef3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pencil size={18} color="#2f5fdb" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#16181d', margin: 0 }}>Editar pieza</h2>
            <p style={{ fontSize: 12, color: '#9aa0aa', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.pieza}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <QualityRing score={liveQuality.score} color={liveQuality.color} size={38} />
            <button onClick={onClose} style={{ background: '#f5f5f4', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={16} color="#6b7280" /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px 8px', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {section('Información básica')}
            {field('Nombre de la pieza', 'pieza')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Marca', 'marca')}
              {field('Modelo', 'modelo')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {field('Año(s)', 'anios')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Código OEM</label>
                  <button type="button" onClick={suggestOem} disabled={oemSuggesting || !form.pieza.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 7, border: '1px solid #d7e3f7', background: '#eef3fc', fontSize: 10, color: '#2f5fdb', fontWeight: 700, cursor: oemSuggesting ? 'default' : 'pointer', opacity: !form.pieza.trim() ? 0.5 : 1 }}>
                    {oemSuggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {oemSuggesting ? 'Buscando…' : 'Sugerir con IA'}
                  </button>
                </div>
                <input value={form.oem} onChange={e => { setOemError(null); setForm(p => ({ ...p, oem: e.target.value })) }}
                  placeholder="Ej: 27060-21050"
                  style={{ fontSize: 13.5, border: '1.5px solid #ececea', borderRadius: 10, padding: '10px 12px', color: '#16181d', outline: 'none', background: '#fafafa' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#2f5fdb')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ececea')} />
                {oemError && <p style={{ fontSize: 10.5, color: '#b91c1c', margin: 0 }}>{oemError}</p>}
              </div>
            </div>

            {section('Precio y estado')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Precio (CLP)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, fontWeight: 700, color: '#9aa0aa' }}>$</span>
                  <input type="number" value={form.precio}
                    onChange={e => setForm(p => ({ ...p, precio: Number(e.target.value) }))}
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: 13.5, fontWeight: 700, border: '1.5px solid #ececea', borderRadius: 10, padding: '10px 12px 10px 24px', color: '#16181d', outline: 'none', background: '#fafafa' }} />
                </div>
              </div>
              {field('Envío', 'envio')}
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Estado de la pieza</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['excelente', 'bueno', 'con-detalles', 'para-reparar'] as const).map(id => {
                  const cfg = estadoConfig[id]
                  const active = form.estado === id
                  return (
                    <button type="button" key={id} onClick={() => setForm(p => ({ ...p, estado: id }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 11px', borderRadius: 10, border: `1.5px solid ${active ? cfg.color : '#ececea'}`, background: active ? cfg.bg : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: active ? cfg.color : '#374151' }}>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {section('Descripción')}
            {field('Descripción', 'descripcion', 'textarea')}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid #f1f2f4', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1.5px solid #ececea', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: '12px 0', background: '#2f5fdb', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(47,95,219,0.3)' }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando…</> : <><CheckCircle size={15} /> Guardar cambios</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function InventoryRow({ item, mlConnected, gscConnected, onDelete, onToggleSold, onPublishML, onEdit, onAddFB }: {
  item: Product
  mlConnected: boolean
  gscConnected: boolean
  onDelete: (id: string) => Promise<void>
  onToggleSold: (id: string, disponible: boolean) => Promise<void>
  onPublishML: (id: string) => Promise<{ ml_item_id: string; permalink: string } | null>
  onEdit: (item: Product) => void
  onAddFB: (id: string) => Promise<void>
}) {
  const [loadingSold,   setLoadingSold]   = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loadingML,     setLoadingML]     = useState(false)
  const [mlError,       setMlError]       = useState<string | null>(null)
  const [mlResult,      setMlResult]      = useState<{ ml_item_id: string; permalink: string } | null>(
    item.ml_item_id && item.ml_permalink ? { ml_item_id: item.ml_item_id, permalink: item.ml_permalink } : null
  )
  const [fbCopied,    setFbCopied]    = useState(false)
  const [fbLoading,   setFbLoading]   = useState(false)
  const [fbScheduled, setFbScheduled] = useState((item.canales ?? []).includes('facebook'))
  const [gscLoading,  setGscLoading]  = useState(false)
  const [gscError,    setGscError]    = useState<string | null>(null)
  const [gscPublished, setGscPublished] = useState((item.canales ?? []).includes('google_shopping'))

  async function handlePublishGSC() {
    setGscLoading(true)
    setGscError(null)
    try {
      const res = await fetch('/api/google/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: item.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al publicar')
      setGscPublished(true)
    } catch (e: unknown) {
      setGscError(e instanceof Error ? e.message : 'Error al publicar en Google Shopping')
    }
    setGscLoading(false)
  }

  function buildFbPost() {
    const auto = [item.marca, item.modelo, item.anios].filter(Boolean).join(' ')
    const estado = estadoConfig[item.estado]?.label ?? 'Usado'
    const tags = ['#repuestos', '#desarmaduria', '#autopartes', item.marca ? `#${item.marca.toLowerCase().replace(/\s+/g, '')}` : '', '#ComponentaChile'].filter(Boolean).join(' ')
    return `🔧 VENDO: ${item.pieza}${auto ? ` para ${auto}` : ''}
Estado: ${estado}
💵 $${item.precio.toLocaleString('es-CL')}
${item.descripcion ? `📝 ${item.descripcion.slice(0, 120)}\n` : ''}📸 Ver foto y contactar:
${APP_URL}/p/${item.id}

${tags}`
  }

  const est = estadoConfig[item.estado] ?? estadoConfig.bueno
  const quality = computeQuality(item)
  const isPublishedOnML = !!mlResult

  async function handleToggleSold() {
    setLoadingSold(true)
    await onToggleSold(item.id, !item.disponible)
    setLoadingSold(false)
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setLoadingDelete(true)
    await onDelete(item.id)
    setLoadingDelete(false)
    setConfirmDelete(false)
  }

  async function handlePublishML() {
    setLoadingML(true)
    setMlError(null)
    try {
      const result = await onPublishML(item.id)
      if (result) setMlResult(result)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al publicar. Intenta de nuevo.'
      setMlError(msg === 'ml_not_connected' ? '__ml_not_connected__' : msg)
    }
    setLoadingML(false)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', opacity: item.disponible ? 1 : 0.6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 210px 150px', alignItems: 'center' }} className="inv-row">

        {/* Foto + título */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 16, minWidth: 0 }}>
          <div style={{ width: 56, height: 48, borderRadius: 9, background: '#f5f6f7', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {item.imagen_url ? <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="#d1d5db" />}
            {isPublishedOnML && (
              <div style={{ position: 'absolute', top: 2, left: 2, background: '#FFE600', borderRadius: 6, padding: '1px 4px' }}><MlIcon size={9} /></div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 10, color: '#9aa0aa', margin: '0 0 3px', fontFamily: 'ui-monospace,Menlo,monospace' }}>#{item.id.slice(0, 8)}</p>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#16181d', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{item.pieza}</p>
            <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: est.bg, color: est.color }}>{est.label}</span>
          </div>
        </div>

        {/* Precio / envío / vistas */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', padding: 16, borderLeft: '1px solid #f1f2f4', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#16181d', margin: 0, letterSpacing: -0.3 }}>${item.precio.toLocaleString('es-CL')}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#2f5fdb', margin: '2px 0 0' }}>{item.envio || 'Coordina envío'}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} color="#9aa0aa" /> {item.vistas} vistas</p>
            {item.disponible && (
              <button
                onClick={() => { navigator.clipboard.writeText(buildFbPost()); setFbCopied(true); setTimeout(() => setFbCopied(false), 2500) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3, fontSize: 10.5, fontWeight: 700, color: fbCopied ? '#16a34a' : '#1877F2', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {fbCopied ? <Check size={10} /> : <Copy size={10} />}
                {fbCopied ? 'Copiado' : 'Post para grupos FB'}
              </button>
            )}
          </div>
        </div>

        {/* Calidad de la publicación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderLeft: '1px solid #f1f2f4' }}>
          <QualityRing score={quality.score} color={quality.color} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, color: quality.color, margin: '0 0 2px' }}>{quality.label}</p>
            <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0, lineHeight: 1.4 }}>{quality.tip}</p>
          </div>
        </div>

        {/* Estado + acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, padding: 16 }}>
          <button onClick={handleToggleSold} disabled={loadingSold}
            title={item.disponible ? 'Marcar como vendida' : 'Reactivar'}
            style={{ width: 38, height: 22, borderRadius: 20, border: 'none', cursor: 'pointer', background: item.disponible ? '#2f5fdb' : '#e5e7eb', position: 'relative', padding: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: item.disponible ? 19 : 3, transition: 'left .15s' }} />
          </button>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => onEdit(item)} title="Editar"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280' }}>
              <Pencil size={12} />
            </button>
            <button onClick={handleToggleSold} disabled={loadingSold} title={item.disponible ? 'Vender' : 'Reactivar'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280' }}>
              {loadingSold ? <Loader2 size={12} className="animate-spin" /> : item.disponible ? <CheckCircle size={12} /> : <RotateCcw size={12} />}
            </button>
            <button onClick={handleDelete} disabled={loadingDelete}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 8px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', background: confirmDelete ? '#b91c1c' : '#fff5f5', borderColor: confirmDelete ? '#b91c1c' : '#fca5a5', color: confirmDelete ? '#fff' : '#b91c1c', fontSize: 10, fontWeight: 700 }}>
              {loadingDelete ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              {confirmDelete ? '¿Sí?' : ''}
            </button>
          </div>
          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 10, color: '#9aa0aa', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
          )}
        </div>
      </div>

      {/* Fila MercadoLibre — solo si conectado y disponible */}
      {mlConnected && item.disponible && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f2f4', background: '#fafafa' }}>
          {isPublishedOnML ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a href={mlResult!.permalink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textDecoration: 'none', color: '#2D3277' }}>
                <MlIcon size={12} /> Publicado en MercadoLibre <ExternalLink size={10} />
              </a>
              <button onClick={async () => {
                await fetch(`/api/products/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ml_item_id: null, ml_permalink: null }) })
                setMlResult(null)
              }} style={{ fontSize: 10, color: '#9aa0aa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                desconectar
              </button>
            </div>
          ) : (
            <>
              <button onClick={handlePublishML} disabled={loadingML}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: loadingML ? 'default' : 'pointer', border: '1.5px solid #FFE600', background: loadingML ? '#fffde7' : '#fffbdb', color: '#2D3277' }}>
                {loadingML ? <Loader2 size={11} className="animate-spin" /> : <MlIcon size={11} />}
                {loadingML ? 'Publicando…' : 'Publicar en MercadoLibre'}
              </button>
              {mlError && mlError === '__ml_not_connected__' ? (
                <p style={{ fontSize: 10, margin: '4px 0 0' }}>
                  <span style={{ color: '#b91c1c' }}>Sesión de MercadoLibre expirada. </span>
                  <a href="/api/mercadolibre/connect" style={{ color: '#2D3277', fontWeight: 700, textDecoration: 'underline' }}>Reconectar →</a>
                </p>
              ) : mlError ? (
                <p style={{ fontSize: 10, color: '#b91c1c', margin: '4px 0 0' }}>{mlError}</p>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* Fila Facebook Marketplace — siempre visible si disponible */}
      {item.disponible && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f2f4', background: '#f0f4ff', display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.fb_item_id ? (
            <a href={item.fb_permalink ?? `https://www.facebook.com/marketplace/item/${item.fb_item_id}/`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#1877F2', textDecoration: 'none' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: '#1877F2', color: '#fff', fontSize: 9, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>f</span>
              Publicado en Facebook Marketplace <ExternalLink size={10} />
            </a>
          ) : fbScheduled ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#7c6f00' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: '#fde68a', color: '#7c6f00', fontSize: 9, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>f</span>
              Programado — el agente lo publicará en la próxima corrida
            </span>
          ) : (
            <button
              onClick={async () => {
                setFbLoading(true)
                await onAddFB(item.id)
                setFbScheduled(true)
                setFbLoading(false)
              }}
              disabled={fbLoading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: fbLoading ? 'default' : 'pointer', border: '1.5px solid #93c5fd', background: '#dbeafe', color: '#1e40af' }}>
              {fbLoading
                ? <><Loader2 size={11} className="animate-spin" /> Programando…</>
                : <><span style={{ width: 14, height: 14, borderRadius: 3, background: '#1877F2', color: '#fff', fontSize: 8, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>f</span> Publicar en Facebook Marketplace</>
              }
            </button>
          )}
        </div>
      )}

      {/* Fila Google Shopping — solo si conectado y disponible */}
      {gscConnected && item.disponible && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f2f4', background: '#f8faff', display: 'flex', alignItems: 'center', gap: 10 }}>
          {gscPublished ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
              <CheckCircle size={12} /> Publicado en Google Shopping
            </span>
          ) : (
            <>
              <button onClick={handlePublishGSC} disabled={gscLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: gscLoading ? 'default' : 'pointer', border: '1.5px solid #4285F4', background: gscLoading ? '#f0f4ff' : '#eef2ff', color: '#4285F4' }}>
                {gscLoading ? <Loader2 size={11} className="animate-spin" /> : <Globe size={11} />}
                {gscLoading ? 'Publicando…' : 'Publicar en Google Shopping'}
              </button>
              {gscError && <p style={{ fontSize: 10, color: '#b91c1c', margin: 0 }}>{gscError}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

type Filtro = 'todos' | 'disponible' | 'vendido'

export default function InventarioClient({
  products: initial,
  isDemo = false,
  mlConnected = false,
  gscConnected = false,
}: {
  products: Product[]
  isDemo?: boolean
  mlConnected?: boolean
  gscConnected?: boolean
}) {
  const [products,     setProducts]     = useState<Product[]>(initial)
  const [search,       setSearch]       = useState('')
  const [filtro,       setFiltro]       = useState<Filtro>('todos')
  const [editingItem,  setEditingItem]  = useState<Product | null>(null)
  const [mlToast,      setMlToast]      = useState(false)
  const [mlErrorToast,  setMlErrorToast]  = useState<string | null>(null)
  const [mlErrorDetail, setMlErrorDetail] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('ml_connected') === '1') setMlToast(true)
    if (params.get('ml_error'))  setMlErrorToast(params.get('ml_error'))
    if (params.get('ml_detail')) setMlErrorDetail(params.get('ml_detail'))
  }, [])
  const [gscToast, setGscToast] = useState(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('gsc_connected') === '1'
  )

  async function handleEdit(id: string, data: Partial<Product>) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleToggleSold(id: string, disponible: boolean) {
    const res = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disponible }) })
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, disponible } : p))
  }

  async function handleAddFB(id: string) {
    const product = products.find(p => p.id === id)
    if (!product) return
    const canales = [...new Set([...(product.canales ?? []), 'facebook'])]
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canales }),
    })
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, canales } : p))
  }

  async function handlePublishML(id: string) {
    const res = await fetch('/api/mercadolibre/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: id }),
    })
    const data = await res.json()
    if (!res.ok) {
      const cause = data?.details?.cause?.map((c: {message?: string}) => c.message).join(', ')
      const msg = cause || data?.details?.message || data?.error || JSON.stringify(data)
      throw new Error(msg)
    }
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, ml_item_id: data.ml_item_id, ml_permalink: data.permalink } : p
    ))
    return { ml_item_id: data.ml_item_id, permalink: data.permalink }
  }

  const filtered = products.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.pieza.toLowerCase().includes(q) || (item.marca ?? '').toLowerCase().includes(q) || (item.modelo ?? '').toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || (filtro === 'disponible' ? item.disponible : !item.disponible)
    return matchSearch && matchFiltro
  })

  const disponiblesCount = products.filter(i => i.disponible).length
  const vendidoCount     = products.filter(i => !i.disponible).length
  const mlCount          = products.filter(i => i.ml_item_id).length
  const bajaCalidadCount = products.filter(i => computeQuality(i).score < 50).length

  return (
    <>
      {mlErrorToast && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px' }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', margin: '0 0 2px' }}>Error al conectar MercadoLibre</p>
            <p style={{ fontSize: 12, color: '#7f1d1d', margin: 0 }}>
              {mlErrorToast === 'cancelled' && 'MercadoLibre rechazó la autorización.'}
              {mlErrorToast === 'token' && 'MercadoLibre rechazó el intercambio de código. Verifica que la URL de redirección en tu app ML coincida exactamente.'}
              {mlErrorToast === 'config' && 'Faltan variables de entorno ML_APP_ID o ML_REDIRECT_URI en Vercel.'}
              {!['cancelled','token','config'].includes(mlErrorToast ?? '') && `Error: ${mlErrorToast}`}
              {mlErrorDetail && <> — <code style={{ background: '#fee2e2', padding: '1px 4px', borderRadius: 4 }}>{mlErrorDetail}</code></>}
              {' '}
              <a href="/api/mercadolibre/connect" style={{ color: '#b91c1c', fontWeight: 700 }}>Intentar de nuevo →</a>
            </p>
          </div>
          <button onClick={() => setMlErrorToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontSize: 16 }}>✕</button>
        </div>
      )}

      {mlToast && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#fffde7', border: '1.5px solid #FFE600', borderRadius: 12, padding: '12px 16px' }}>
          <MlIcon size={20} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D3277', margin: 0 }}>¡MercadoLibre conectado!</p>
            <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Ya puedes publicar piezas directamente en ML desde cada fila.</p>
          </div>
          <button onClick={() => setMlToast(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9aa0aa', lineHeight: 1 }}>×</button>
        </div>
      )}

      {isDemo && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '12px 16px' }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: 0 }}>Modo demostración</p>
            <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>
              Ejecuta el SQL en Supabase para ver tu inventario real.{' '}
              <a href="/planes" style={{ textDecoration: 'underline', color: '#d97706' }}>Ver instrucciones →</a>
            </p>
          </div>
        </div>
      )}

      {/* Banner Facebook Marketplace */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
        <div style={{ background: '#1877F2', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>f</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Facebook Marketplace</span>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', margin: '0 0 2px' }}>El agente publica automáticamente en Temuco</p>
          <p style={{ fontSize: 11, color: '#3b82f6', margin: 0 }}>Activa el canal en cada pieza con el botón azul y el agente la publicará en la próxima corrida.</p>
        </div>
        <a href="/marketing" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#1877F2', color: '#fff', borderRadius: 9, fontSize: 12, fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}>
          Ver Marketing →
        </a>
      </div>

      {!mlConnected && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, background: '#fffde7', border: '1.5px dashed #FFE600', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#FFE600', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <MlIcon size={18} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#2D3277' }}>MercadoLibre</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2D3277', margin: '0 0 2px' }}>Publica en ML con un clic</p>
            <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Conecta tu cuenta de MercadoLibre y publica cualquier pieza directamente desde aquí.</p>
          </div>
          <a href="/api/mercadolibre/connect"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#2D3277', color: '#FFE600', borderRadius: 9, fontSize: 12, fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}>
            Conectar cuenta →
          </a>
        </div>
      )}

      {gscToast && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, background: '#eef2ff', border: '1.5px solid #4285F4', borderRadius: 12, padding: '12px 16px' }}>
          <Globe size={20} color="#4285F4" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a3a8f', margin: 0 }}>¡Google Shopping conectado!</p>
            <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Ya puedes publicar piezas directamente en Google Shopping desde cada fila.</p>
          </div>
          <button onClick={() => setGscToast(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9aa0aa', lineHeight: 1 }}>×</button>
        </div>
      )}

      {!gscConnected && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, background: '#f0f4ff', border: '1.5px dashed #4285F4', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
          <div style={{ background: '#4285F4', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <Globe size={18} color="#fff" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Google Shopping</span>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a3a8f', margin: '0 0 2px' }}>Publica en Google Shopping con un clic</p>
            <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Conecta tu cuenta de Google Merchant Center y aparece en búsquedas de Google.</p>
          </div>
          <a href="/api/google/connect"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#4285F4', color: '#fff', borderRadius: 9, fontSize: 12, fontWeight: 800, textDecoration: 'none', flexShrink: 0 }}>
            Conectar cuenta →
          </a>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#16181d', margin: '0 0 4px' }}>Mi inventario</h1>
          <p style={{ fontSize: 13, color: '#9aa0aa', margin: 0 }}>
            {disponiblesCount} disponible{disponiblesCount !== 1 ? 's' : ''}
            {vendidoCount > 0 && ` · ${vendidoCount} vendida${vendidoCount !== 1 ? 's' : ''}`}
            {mlCount > 0 && ` · ${mlCount} en ML`}
            {bajaCalidadCount > 0 && ` · ${bajaCalidadCount} con calidad baja`}
            {isDemo ? ' · demo' : ''}
          </p>
        </div>
        <Link href="/publicar" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#2f5fdb', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <Plus size={14} /> Nueva pieza
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="#9aa0aa" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Buscar pieza, marca…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#16181d', outline: 'none', width: 220 }} />
        </div>
        <div style={{ display: 'flex', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', overflow: 'hidden' }}>
          {(['todos', 'disponible', 'vendido'] as Filtro[]).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ padding: '8px 14px', fontSize: 12, fontWeight: filtro === f ? 700 : 500, border: 'none', cursor: 'pointer', background: filtro === f ? '#2f5fdb' : 'transparent', color: filtro === f ? '#fff' : '#6b7280' }}>
              {f === 'vendido' ? 'Vendidas' : f === 'disponible' ? 'Disponibles' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={28} color="#9aa0aa" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#16181d', margin: '0 0 6px' }}>Sin piezas publicadas aún</p>
          <p style={{ fontSize: 13, color: '#9aa0aa', margin: '0 0 20px' }}>Publica tu primera pieza y aparecerá aquí</p>
          <Link href="/publicar" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: '#2f5fdb', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={14} /> Publicar primera pieza
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9aa0aa', fontSize: 13 }}>No hay piezas que coincidan</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(item => (
            <InventoryRow
              key={item.id}
              item={item}
              mlConnected={mlConnected}
              gscConnected={gscConnected}
              onDelete={handleDelete}
              onToggleSold={handleToggleSold}
              onPublishML={handlePublishML}
              onEdit={setEditingItem}
              onAddFB={handleAddFB}
            />
          ))}
        </div>
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleEdit}
        />
      )}

      <style>{`
        @media (max-width: 860px) {
          .inv-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
