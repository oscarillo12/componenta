'use client'

import { useState } from 'react'
import { Car, ChevronDown, ArrowRight, SkipForward } from 'lucide-react'
import { getAllMakes, getModels, getYears } from '@/lib/vehicle-db'
import type { VehicleHint } from '@/lib/types'

interface Props {
  onConfirm: (hint: VehicleHint | null) => void
}

const POPULAR: { marca: string; emoji: string }[] = [
  { marca: 'Toyota',    emoji: '🇯🇵' },
  { marca: 'Chevrolet', emoji: '🇺🇸' },
  { marca: 'Kia',       emoji: '🇰🇷' },
  { marca: 'Hyundai',   emoji: '🇰🇷' },
  { marca: 'Suzuki',    emoji: '🇯🇵' },
  { marca: 'Mazda',     emoji: '🇯🇵' },
  { marca: 'Chery',     emoji: '🇨🇳' },
  { marca: 'Nissan',    emoji: '🇯🇵' },
  { marca: 'Changan',   emoji: '🇨🇳' },
  { marca: 'MG',        emoji: '🇨🇳' },
  { marca: 'Renault',   emoji: '🇫🇷' },
  { marca: 'Ford',      emoji: '🇺🇸' },
]

export default function Step0Vehicle({ onConfirm }: Props) {
  const [marca,  setMarca]  = useState('')
  const [modelo, setModelo] = useState('')
  const [anio,   setAnio]   = useState('')

  const allMakes = getAllMakes()
  const models   = marca  ? getModels(marca)       : []
  const years    = modelo ? getYears(marca, modelo) : []

  const canContinue = marca && modelo && anio

  function handleMarca(m: string) {
    setMarca(m)
    setModelo('')
    setAnio('')
  }

  function handleModelo(m: string) {
    setModelo(m)
    setAnio('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Título */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56,139,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={20} color="#1F6FEB" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#E6EDF3', margin: 0 }}>¿A qué vehículo pertenece la pieza?</h1>
        </div>
        <p style={{ fontSize: 14, color: '#B1BAC4', margin: 0, lineHeight: 1.5 }}>
          Esto ayuda a la IA a identificar piezas genéricas como cuerpos de aceleración, bombas de agua o sensores.
        </p>
      </div>

      {/* Marcas populares */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 10px' }}>
          Marcas más frecuentes en Chile
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {POPULAR.map(({ marca: m, emoji }) => (
            <button key={m}
              onPointerDown={() => handleMarca(m)}
              style={{
                touchAction: 'manipulation', cursor: 'pointer',
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${marca === m ? '#1F6FEB' : '#e5e7eb'}`,
                background: marca === m ? '#eff6ff' : '#fff',
                color: marca === m ? '#1F6FEB' : '#374151',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <span>{emoji}</span>{m}
            </button>
          ))}
        </div>
      </div>

      {/* Selectores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {/* Marca */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#E6EDF3', display: 'block', marginBottom: 6 }}>
            MARCA *
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={marca}
              onChange={e => handleMarca(e.target.value)}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 10, border: `1.5px solid ${marca ? '#1F6FEB' : '#e5e7eb'}`, fontSize: 14, color: marca ? '#111827' : '#9ca3af', background: '#161B22', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
              <option value="">Selecciona marca</option>
              {allMakes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} color="#6E7681" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Modelo */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#E6EDF3', display: 'block', marginBottom: 6 }}>
            MODELO *
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={modelo}
              onChange={e => handleModelo(e.target.value)}
              disabled={!marca}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 10, border: `1.5px solid ${modelo ? '#1F6FEB' : '#e5e7eb'}`, fontSize: 14, color: modelo ? '#111827' : '#9ca3af', background: marca ? '#fff' : '#f9fafb', outline: 'none', appearance: 'none', cursor: marca ? 'pointer' : 'not-allowed', opacity: marca ? 1 : 0.6, boxSizing: 'border-box' }}>
              <option value="">{marca ? 'Selecciona modelo' : 'Primero la marca'}</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} color="#6E7681" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Año */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#E6EDF3', display: 'block', marginBottom: 6 }}>
            AÑO *
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={anio}
              onChange={e => setAnio(e.target.value)}
              disabled={!modelo}
              style={{ width: '100%', padding: '11px 36px 11px 12px', borderRadius: 10, border: `1.5px solid ${anio ? '#1F6FEB' : '#e5e7eb'}`, fontSize: 14, color: anio ? '#111827' : '#9ca3af', background: modelo ? '#fff' : '#f9fafb', outline: 'none', appearance: 'none', cursor: modelo ? 'pointer' : 'not-allowed', opacity: modelo ? 1 : 0.6, boxSizing: 'border-box' }}>
              <option value="">{modelo ? 'Selecciona año' : 'Primero el modelo'}</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <ChevronDown size={14} color="#6E7681" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Vista previa de selección */}
      {canContinue && (
        <div style={{ background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Car size={16} color="#1F6FEB" />
          <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600, margin: 0 }}>
            {marca} {modelo} · {anio} — La IA usará este contexto para identificar la pieza con mayor precisión
          </p>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
        <button
          onPointerDown={() => onConfirm(null)}
          style={{ touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: '#161B22', color: '#B1BAC4', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          <SkipForward size={14} /> No sé el modelo
        </button>
        <button
          onPointerDown={() => {
            if (canContinue) onConfirm({ marca, modelo, anio })
          }}
          disabled={!canContinue}
          style={{ touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, border: 'none', background: canContinue ? '#1F6FEB' : '#e5e7eb', color: canContinue ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14, cursor: canContinue ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
          Continuar <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
