'use client'

import { useState } from 'react'
import { Product } from '@/lib/supabase'
import { Plus, Search, Eye, Package, Trash2, CheckCircle, RotateCcw, Loader2 } from 'lucide-react'
import Link from 'next/link'

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  excelente:      { label: 'Excelente',    color: '#15803d', bg: '#dcfce7' },
  bueno:          { label: 'Buen estado',  color: '#1d4ed8', bg: '#dbeafe' },
  'con-detalles': { label: 'Con detalles', color: '#b45309', bg: '#fef3c7' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c', bg: '#fee2e2' },
}

function PartCard({ item, onDelete, onToggleSold }: {
  item: Product
  onDelete: (id: string) => Promise<void>
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
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 148, background: '#f5f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        {item.imagen_url ? (
          <img src={item.imagen_url} alt={item.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Package size={36} color="#d1d5db" />
        )}
        {!item.disponible && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Vendida</span>
          </div>
        )}
        <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: est.bg, color: est.color }}>{est.label}</span>
      </div>

      <div style={{ padding: '12px 13px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.3 }}>{item.pieza}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{item.marca} {item.modelo}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{item.anios}{item.oem ? ` · OEM ${item.oem}` : ''}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 900, color: '#111827', letterSpacing: -0.5 }}>${item.precio.toLocaleString('es-CL')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Eye size={11} color="#9ca3af" />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.vistas}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
          <button onClick={handleToggleSold} disabled={loadingSold}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', background: item.disponible ? '#eff6ff' : '#f9fafb', borderColor: item.disponible ? '#1d4ed8' : '#e5e7eb', color: item.disponible ? '#1d4ed8' : '#6b7280' }}>
            {loadingSold ? <Loader2 size={11} className="animate-spin" /> : item.disponible ? <><CheckCircle size={11} /> Vender</> : <><RotateCcw size={11} /> Reactivar</>}
          </button>
          <button onClick={handleDelete} disabled={loadingDelete}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 10px', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', background: confirmDelete ? '#b91c1c' : '#fff5f5', borderColor: confirmDelete ? '#b91c1c' : '#fca5a5', color: confirmDelete ? '#fff' : '#b91c1c' }}>
            {loadingDelete ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
            {confirmDelete ? '¿Sí?' : ''}
          </button>
        </div>
        {confirmDelete && (
          <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '2px 0' }}>
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
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleToggleSold(id: string, disponible: boolean) {
    const res = await fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disponible }) })
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, disponible } : p))
  }

  const filtered = products.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.pieza.toLowerCase().includes(q) || (item.marca ?? '').toLowerCase().includes(q) || (item.modelo ?? '').toLowerCase().includes(q)
    const matchFiltro = filtro === 'todos' || (filtro === 'disponible' ? item.disponible : !item.disponible)
    return matchSearch && matchFiltro
  })

  const disponiblesCount = products.filter(i => i.disponible).length
  const vendidoCount     = products.filter(i => !i.disponible).length

  return (
    <>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Mi inventario</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {disponiblesCount} disponible{disponiblesCount !== 1 ? 's' : ''}
            {vendidoCount > 0 && ` · ${vendidoCount} vendida${vendidoCount !== 1 ? 's' : ''}`}
            {isDemo ? ' · demo' : ''}
          </p>
        </div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#1d4ed8', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <Plus size={14} /> Nueva pieza
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Buscar pieza, marca…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#111827', outline: 'none', width: 220 }} />
        </div>
        <div style={{ display: 'flex', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', overflow: 'hidden' }}>
          {(['todos', 'disponible', 'vendido'] as Filtro[]).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ padding: '8px 14px', fontSize: 12, fontWeight: filtro === f ? 700 : 500, border: 'none', cursor: 'pointer', background: filtro === f ? '#1d4ed8' : 'transparent', color: filtro === f ? '#fff' : '#6b7280' }}>
              {f === 'vendido' ? 'Vendidas' : f === 'disponible' ? 'Disponibles' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={28} color="#9ca3af" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>Sin piezas publicadas aún</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Publica tu primera pieza y aparecerá aquí</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: '#1d4ed8', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            <Plus size={14} /> Publicar primera pieza
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 13 }}>No hay piezas que coincidan</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
          {filtered.map(item => (
            <PartCard key={item.id} item={item} onDelete={handleDelete} onToggleSold={handleToggleSold} />
          ))}
        </div>
      )}
    </>
  )
}
