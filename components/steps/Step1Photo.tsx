'use client'

import { useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'

interface Step1PhotoProps {
  onPhotoSelected: (file: File, preview: string) => void
}

export default function Step1Photo({ onPhotoSelected }: Step1PhotoProps) {
  const [dragging, setDragging] = useState(false)

  function processFile(file: File | null | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        onPhotoSelected(file, result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    processFile(e.target.files?.[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100 mb-1">Fotografía la pieza</h1>
      <p className="text-sm text-slate-400 mb-6">
        Saca una foto clara y Componenta identificará automáticamente la pieza, marca y compatibilidad.
      </p>

      {/* Móvil: dos botones label→input directo */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:hidden">
        <label
          className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-blue-600 bg-blue-50 py-6 cursor-pointer select-none"
          style={{ touchAction: 'manipulation' } as React.CSSProperties}
        >
          <Camera size={26} className="text-blue-700 pointer-events-none" />
          <span className="text-sm font-semibold text-blue-800 pointer-events-none">Abrir cámara</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="absolute inset-0 opacity-0 w-full h-full"
            onChange={handleInput}
          />
        </label>

        <label
          className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/10 bg-[#21262D]/50 py-6 cursor-pointer select-none"
          style={{ touchAction: 'manipulation' } as React.CSSProperties}
        >
          <ImageIcon size={26} className="text-slate-400 pointer-events-none" />
          <span className="text-sm font-semibold text-slate-400 pointer-events-none">Desde galería</span>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 w-full h-full"
            onChange={handleInput}
          />
        </label>
      </div>

      {/* Escritorio: drop zone */}
      <div
        className={`hidden sm:flex border-2 border-dashed rounded-xl p-14 flex-col items-center justify-center transition-colors ${
          dragging ? 'border-blue-600 bg-blue-50' : 'border-white/10 bg-[#21262D]/50 hover:border-blue-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Camera size={24} className="text-blue-700" />
        </div>
        <p className="text-sm font-medium text-slate-300 mb-1">Arrastra la foto aquí</p>
        <p className="text-xs text-slate-500 mb-4">JPG, PNG, WEBP — hasta 10 MB</p>
        <label className="relative px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-800 transition-colors">
          Seleccionar archivo
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={handleInput}
          />
        </label>
      </div>
    </div>
  )
}
