'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  pieza: string
  precio: number
  imagen_url?: string | null
  vendedorSlug?: string
  seller_id?: string
  seller_nombre?: string
  seller_telefono?: string
}

interface CartCtx {
  items: CartItem[]
  count: number
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
}

const CartContext = createContext<CartCtx>({
  items: [], count: 0,
  add: () => {}, remove: () => {}, clear: () => {}, has: () => false,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('componenta_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  function save(next: CartItem[]) {
    setItems(next)
    try { localStorage.setItem('componenta_cart', JSON.stringify(next)) } catch {}
  }

  return (
    <CartContext.Provider value={{
      items,
      count: items.length,
      add:    (item) => save(items.some(i => i.id === item.id) ? items : [...items, item]),
      remove: (id)   => save(items.filter(i => i.id !== id)),
      clear:  ()     => save([]),
      has:    (id)   => items.some(i => i.id === id),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
