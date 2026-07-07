'use client'

import { MessageCircle, Eye, Check } from 'lucide-react'

export type ProductCardItem = {
  id: string
  pieza: string
  marca?: string | null
  modelo?: string | null
  anios?: string | null
  oem?: string | null
  estado: 'excelente' | 'bueno' | 'con-detalles' | 'para-reparar'
  precio: number
  vistas?: number
  imagen_url?: string | null
}

const ESTADO: Record<ProductCardItem['estado'], { label: string; color: string }> = {
  excelente:      { label: 'Excelente',    color: '#1a7a42' },
  bueno:          { label: 'Buen estado',  color: '#2f5fdb' },
  'con-detalles': { label: 'Con detalles', color: '#b45309' },
  'para-reparar': { label: 'Para reparar', color: '#b91c1c' },
}

export default function ProductCard({
  item, sellerNombre, sellerColor, compatible, waLink, onClick,
}: {
  item: ProductCardItem
  sellerNombre: string
  sellerColor: string
  compatible?: boolean
  waLink: string
  onClick?: () => void
}) {
  const estado = ESTADO[item.estado] ?? ESTADO.bueno
  const initial = (sellerNombre[0] ?? 'V').toUpperCase()

  return (
    <article
      onClick={onClick}
      style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(17,24,39,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: onClick ? 'pointer' : 'default', transition: 'transform .15s ease, box-shadow .15s ease', height: '100%' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 10px 28px rgba(17,24,39,0.10)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}
    >
      <div style={{ position: 'relative', paddingTop: '70%', background: '#f3f4f6', flexShrink: 0 }}>
        {item.imagen_url
          ? <img src={item.imagen_url} alt={item.pieza} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ font: '600 10px ui-monospace,Menlo,monospace', color: '#9aa0aa', letterSpacing: '.3px' }}>foto pieza</span>
            </div>}

        <span style={{ position: 'absolute', top: 9, left: 9, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.95)', border: '1px solid rgba(17,24,39,0.08)', borderRadius: 20, padding: '4px 9px', fontSize: 10, fontWeight: 700, color: estado.color }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: estado.color, display: 'inline-block', flexShrink: 0 }} />
          {estado.label}
        </span>

        {compatible && (
          <span style={{ position: 'absolute', top: 9, right: 9, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1a7a42', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 9px', borderRadius: 20 }}>
            <Check size={9} /> Compatible
          </span>
        )}
      </div>

      <div style={{ padding: '13px 14px 15px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9aa0aa', textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.marca}{item.modelo ? ` · ${item.modelo}` : ''}{item.anios ? ` · ${item.anios}` : ''}
        </p>

        <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, color: '#16181d', margin: '0 0 8px', minHeight: 38, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
          {item.pieza}
        </p>

        {item.oem && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eef3fc', border: '1px solid #d7e3f7', borderRadius: 6, padding: '2px 8px', fontSize: 9.5, fontWeight: 700, color: '#2f5fdb', width: 'fit-content', marginBottom: 9 }}>
            OEM {item.oem}
          </span>
        )}

        <p style={{ fontSize: 21, fontWeight: 900, color: '#16181d', letterSpacing: '-0.5px', margin: 'auto 0 10px', lineHeight: 1 }}>
          ${item.precio.toLocaleString('es-CL')}<span style={{ fontSize: 11, fontWeight: 500, color: '#9aa0aa', letterSpacing: 0, marginLeft: 3 }}>CLP</span>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingTop: 10, borderTop: '1px solid #f1f2f4', marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: sellerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{initial}</div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sellerNombre}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: '#9aa0aa', flexShrink: 0 }}>
            <Eye size={11} /> {item.vistas ?? 0}
          </span>
        </div>

        <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={ev => ev.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 9, background: '#16181d', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: '.1px' }}>
          <MessageCircle size={14} /> Consultar por WhatsApp
        </a>
      </div>
    </article>
  )
}
