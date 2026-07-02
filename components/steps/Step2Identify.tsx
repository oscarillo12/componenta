'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, X, Loader2 } from 'lucide-react'
import { PartData, VehicleCompat } from '@/lib/types'

import type { VehicleHint } from '@/lib/types'

interface Step2IdentifyProps {
  photoFile: File
  photoPreview: string
  vehicleHint: VehicleHint | null
  onConfirm: (data: PartData) => void
}

export default function Step2Identify({ photoFile, photoPreview, vehicleHint, onConfirm }: Step2IdentifyProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PartData | null>(null)

  useEffect(() => {
    identify()
  }, [])

  const identify = async () => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', photoFile)
      if (vehicleHint) {
        formData.append('vehicleMarca',  vehicleHint.marca)
        formData.append('vehicleModelo', vehicleHint.modelo)
        formData.append('vehicleAnio',   vehicleHint.anio)
      }
      const res = await fetch('/api/identify', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error desconocido')
      }
      const result: PartData = await res.json()
      setData(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al identificar')
    } finally {
      setLoading(false)
    }
  }

  const removeCompat = (index: number) => {
    if (!data) return
    setData({ ...data, compatibilidad: data.compatibilidad.filter((_, i) => i !== index) })
  }

  const addCompat = () => {
    if (!data) return
    const newCompat: VehicleCompat = { marca: '', modelo: '', anios: '' }
    setData({ ...data, compatibilidad: [...data.compatibilidad, newCompat] })
  }

  const updateCompat = (index: number, field: keyof VehicleCompat, value: string) => {
    if (!data) return
    const updated = data.compatibilidad.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    )
    setData({ ...data, compatibilidad: updated })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="text-blue-700 animate-spin" />
        <p className="text-sm text-slate-400">
          {vehicleHint
            ? `Identificando pieza para ${vehicleHint.marca} ${vehicleHint.modelo} ${vehicleHint.anio}…`
            : 'Componenta está identificando la pieza…'}
        </p>
      </div>
    )
  }

  if (error) {
    const isOverload = error.includes('demanda') || error.includes('503')
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-2xl">
          {isOverload ? '⏳' : '❌'}
        </div>
        <div>
          <p className="font-semibold text-slate-100 mb-1">
            {isOverload ? 'IA con alta demanda' : 'No se pudo identificar'}
          </p>
          <p className="text-sm text-slate-400 max-w-xs">{error}</p>
        </div>
        <button
          onClick={identify}
          className="px-6 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          🔄 Volver a intentar
        </button>
        <p className="text-xs text-slate-500">La IA estará disponible en unos segundos</p>
      </div>
    )
  }

  if (!data) return null

  const confidenceColor =
    data.confianza >= 80 ? 'text-blue-800 bg-blue-50 border-blue-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100 mb-1">Digitalización con IA</h1>
      <p className="text-sm text-slate-400 mb-6">
        Componenta identificó la pieza automáticamente. Revisa y confirma — puedes editar cualquier campo
        antes de publicar.
      </p>

      <div className={`flex items-center justify-between px-4 py-3 rounded-lg border mb-6 text-sm font-medium ${confidenceColor}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          Componenta identificó la pieza con {data.confianza >= 80 ? 'alta' : 'media'} confianza
        </div>
        <span>{data.confianza}% confianza</span>
      </div>

      <div className="flex gap-6">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreview} alt="Pieza" className="w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 bg-blue-700 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            foto cargada
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <Field
            label="Pieza identificada"
            value={data.pieza}
            onChange={(v) => setData({ ...data, pieza: v })}
          />
          <Field
            label="Marca / OEM"
            value={data.oem ? `${data.marca} — OEM ${data.oem}` : data.marca}
            onChange={(v) => setData({ ...data, marca: v })}
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Compatibilidad de vehículos <span className="text-blue-700 normal-case font-normal ml-1">IA</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {data.compatibilidad.map((c, i) => (
            <div
              key={i}
              className="group flex items-center gap-1 bg-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-full"
            >
              <input
                className="bg-transparent outline-none w-auto text-sm"
                value={`${c.marca} ${c.modelo} ${c.anios}`}
                onChange={(e) => {
                  const parts = e.target.value.split(' ')
                  updateCompat(i, 'marca', parts[0] || '')
                  updateCompat(i, 'modelo', parts[1] || '')
                  updateCompat(i, 'anios', parts.slice(2).join(' ') || '')
                }}
                style={{ width: `${Math.max((`${c.marca} ${c.modelo} ${c.anios}`).length, 8) * 7}px` }}
              />
              <button
                onClick={() => removeCompat(i)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={addCompat}
            className="flex items-center gap-1 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-dashed border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus size={12} /> agregar
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onConfirm(data)}
          className="px-6 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Confirmar y continuar →
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <p className="text-xs text-slate-500">{label}</p>
        <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded font-medium">IA</span>
      </div>
      <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
        <input
          className="flex-1 text-sm text-slate-200 outline-none bg-transparent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Pencil size={14} className="text-slate-500 flex-shrink-0" />
      </div>
    </div>
  )
}
