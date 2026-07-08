'use client'

import { useMemo, useState } from 'react'
import { Car, ChevronDown, ArrowRight, SkipForward, Search } from 'lucide-react'
import { getAllMakes, getModels, getYears } from '@/lib/vehicle-db'
import type { VehicleHint } from '@/lib/types'

interface Props {
  onConfirm: (hint: VehicleHint | null) => void
}

export default function Step0Vehicle({ onConfirm }: Props) {
  const [marca,  setMarca]  = useState('')
  const [modelo, setModelo] = useState('')
  const [anio,   setAnio]   = useState('')
  const [query,  setQuery]  = useState('')

  const allMakes = getAllMakes()
  const models   = marca  ? getModels(marca)       : []
  const years    = modelo ? getYears(marca, modelo) : []

  const filteredMakes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allMakes.filter(m => m.toLowerCase().includes(q)).slice(0, 8)
  }, [query, allMakes])

  const canContinue = marca && modelo && anio

  function handleMarca(m: string) {
    setMarca(m)
    setModelo('')
    setAnio('')
    setQuery('')
  }

  function handleModelo(m: string) {
    setModelo(m)
    setAnio('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Título */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eef3fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={18} color="#2f5fdb" />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#16181d', margin: 0 }}>¿A qué vehículo pertenece la pieza?</h1>
        </div>
        <p style={{ fontSize: 13, color: '#9aa0aa', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          Esto ayuda a la IA a identificar piezas genéricas como cuerpos de aceleración, bombas de agua o sensores.
        </p>
      </div>

      {/* Buscador de marca — reemplaza la grilla de marcas frecuentes */}
      <div style={{ position: 'relative', maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fafafa', border: '1.5px solid #ececea', borderRadius: 11, overflow: 'hidden' }}>
          <Search size={15} color="#9aa0aa" style={{ marginLeft: 12, flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busca entre 40+ marcas…"
            style={{ flex: 1, padding: 10, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', color: '#16181d' }}
          />
        </div>
        {filteredMakes.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #ececea', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.08)', zIndex: 10, overflow: 'hidden' }}>
            {filteredMakes.map(m => (
              <button key={m} onPointerDown={() => handleMarca(m)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#16181d' }}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selectores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>MARCA *</label>
          <div style={{ position: 'relative' }}>
            <select
              value={marca}
              onChange={e => handleMarca(e.target.value)}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 9, border: `1.5px solid ${marca ? '#2f5fdb' : '#ececea'}`, fontSize: 13, color: marca ? '#16181d' : '#9aa0aa', background: marca ? '#fff' : '#fafafa', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
              <option value="">Selecciona marca</option>
              {allMakes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} color="#9aa0aa" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>MODELO *</label>
          <div style={{ position: 'relative' }}>
            <select
              value={modelo}
              onChange={e => handleModelo(e.target.value)}
              disabled={!marca}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 9, border: `1.5px solid ${modelo ? '#2f5fdb' : '#ececea'}`, fontSize: 13, color: modelo ? '#16181d' : '#9aa0aa', background: marca ? '#fff' : '#fafafa', outline: 'none', appearance: 'none', cursor: marca ? 'pointer' : 'not-allowed', opacity: marca ? 1 : 0.6, boxSizing: 'border-box' }}>
              <option value="">{marca ? 'Selecciona modelo' : 'Primero la marca'}</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} color="#9aa0aa" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>AÑO *</label>
          <div style={{ position: 'relative' }}>
            <select
              value={anio}
              onChange={e => setAnio(e.target.value)}
              disabled={!modelo}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 9, border: `1.5px solid ${anio ? '#2f5fdb' : '#ececea'}`, fontSize: 13, color: anio ? '#16181d' : '#9aa0aa', background: modelo ? '#fff' : '#fafafa', outline: 'none', appearance: 'none', cursor: modelo ? 'pointer' : 'not-allowed', opacity: modelo ? 1 : 0.6, boxSizing: 'border-box' }}>
              <option value="">{modelo ? 'Selecciona año' : 'Primero el modelo'}</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <ChevronDown size={14} color="#9aa0aa" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Vista previa de selección */}
      {canContinue && (
        <div style={{ background: '#eef3fc', border: '1.5px solid #d7e3f7', borderRadius: 11, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Car size={16} color="#2f5fdb" />
          <p style={{ fontSize: 12.5, color: '#1e3a8a', fontWeight: 600, margin: 0 }}>
            {marca} {modelo} · {anio} — La IA usará este contexto para identificar la pieza con mayor precisión
          </p>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, borderTop: '1px solid #f1f2f4' }}>
        <button
          onPointerDown={() => onConfirm(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #ececea', background: '#fafafa', color: '#6b7280', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
          <SkipForward size={14} /> No sé el modelo
        </button>
        <button
          onPointerDown={() => { if (canContinue) onConfirm({ marca, modelo, anio }) }}
          disabled={!canContinue}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 11, border: 'none', background: canContinue ? '#16181d' : '#ececea', color: canContinue ? '#fff' : '#9aa0aa', fontWeight: 700, fontSize: 13.5, cursor: canContinue ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
          Continuar <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
