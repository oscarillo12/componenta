'use client'

import { useState } from 'react'
import { Product } from '@/lib/supabase'
import { Plus, Search, Eye, Package, Trash2, CheckCircle, RotateCcw, Loader2 } from 'lucide-react'
import Link from 'next/link'

const estadoConfig: Record<string, { label: string; className: string }> = {
  excelente:      { label: 'Excelente',    className: 'text-blue-800 bg-blue-50 border-blue-200' },
  bueno:          { label: 'Buen estado',  className: 'text-blue-700 bg-blue-50 border-blue-200' },
  'con-detalles': { label: 'Con detalles', className: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  'para-reparar': { label: 'Para reparar', className: 'text-red-700 bg-red-50 border-red-200' },
}

function PartCard({
  item,
  onDelete,
  onToggleSold,
}: {
  item: Product
  onDelete:    (id: string) => Promise<void>
  onToggleSold: (id: string, disponible: boolean) => Promise<void>
}) {
  const [loadingSold,   setLoadingSold]   = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const est = estadoConfig[item.estado] ?? estadoConfig.bueno

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

  return (
    <div className="bg-[#161B22] rounded-2xl border border-white/10 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Imagen */}
      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative flex-shrink-0">
        {item.imagen_url ? (
          <img src={item.imagen_url} alt={item.pieza} className="w-full h-full object-cover" />
        ) : (
          <Package size={40} className="text-slate-600" />
        )}
        {!item.disponible && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-gray-900/70 px-3 py-1 rounded-full">Vendida</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full border ${est.className}`}>
          {est.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-semibold text-slate-100 leading-tight">{item.pieza}</p>
        <p className="text-xs text-slate-500 mt-0.5">{item.marca} {item.modelo}</p>
        <p className="text-xs text-slate-600 mt-0.5">{item.anios}{item.oem ? ` · OEM ${item.oem}` : ''}</p>

        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-base font-bold text-slate-100">${item.precio.toLocaleString('es-CL')}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Eye size={11} />
            <span>{item.vistas}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-1.5 mt-auto border-t border-white/5 pt-3">
          {/* Marcar como vendida / disponible */}
          <button
            onClick={handleToggleSold}
            disabled={loadingSold}
            title={item.disponible ? 'Marcar como vendida' : 'Volver a disponible'}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              item.disponible
                ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            {loadingSold ? (
              <Loader2 size={12} className="animate-spin" />
            ) : item.disponible ? (
              <><CheckCircle size={12} /> Vender</>
            ) : (
              <><RotateCcw size={12} /> Reactivar</>
            )}
          </button>

          {/* Eliminar */}
          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            title={confirmDelete ? 'Confirmar eliminación' : 'Eliminar publicación'}
            className={`flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              confirmDelete
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
            }`}
          >
            {loadingDelete ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            {confirmDelete ? '¿Eliminar?' : ''}
          </button>
        </div>

        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            className="mt-1.5 text-xs text-slate-500 hover:text-slate-400 text-center w-full"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

type Filtro = 'todos' | 'disponible' | 'vendido'

export default function InventarioClient({ products: initial, isDemo = false }: { products: Product[]; isDemo?: boolean }) {
  const [products, setProducts] = useState<Product[]>(initial)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState<Filtro>('todos')

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  async function handleToggleSold(id: string, disponible: boolean) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponible }),
    })
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, disponible } : p),
      )
    }
  }

  const filtered = products.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || item.pieza.toLowerCase().includes(q)
      || (item.marca ?? '').toLowerCase().includes(q)
      || (item.modelo ?? '').toLowerCase().includes(q)
    const matchFiltro =
      filtro === 'todos' ||
      (filtro === 'disponible' ? item.disponible : !item.disponible)
    return matchSearch && matchFiltro
  })

  const disponiblesCount = products.filter((i) => i.disponible).length
  const vendidoCount     = products.filter((i) => !i.disponible).length

  return (
    <>
      {isDemo && (
        <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Modo demostración</p>
            <p className="text-xs text-amber-700">
              Ejecuta el SQL en Supabase para ver tu inventario real.{' '}
              <a href="/planes" className="underline">Ver instrucciones →</a>
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Mi inventario</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {disponiblesCount} disponible{disponiblesCount !== 1 ? 's' : ''}
            {vendidoCount > 0 && ` · ${vendidoCount} vendida${vendidoCount !== 1 ? 's' : ''}`}
            {isDemo ? ' · demo' : ''}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <Plus size={15} />
          Nueva pieza
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar pieza, marca…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-white/10 rounded-lg bg-[#161B22] focus:outline-none focus:border-blue-500 w-56"
          />
        </div>
        <div className="flex rounded-lg border border-white/10 bg-[#161B22] overflow-hidden">
          {(['todos', 'disponible', 'vendido'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${
                filtro === f ? 'bg-blue-700 text-white' : 'text-slate-400 hover:bg-[#21262D]/50'
              }`}
            >
              {f === 'vendido' ? 'Vendidas' : f === 'disponible' ? 'Disponibles' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-100 mb-1">Sin piezas publicadas aún</p>
          <p className="text-sm text-slate-500 mb-6">Publica tu primera pieza y aparecerá aquí</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
            <Plus size={15} /> Publicar primera pieza
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">No hay piezas que coincidan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <PartCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onToggleSold={handleToggleSold}
            />
          ))}
        </div>
      )}
    </>
  )
}
