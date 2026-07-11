export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SellerLayout from '@/components/SellerLayout'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Product } from '@/lib/supabase'
import { mockInventory } from '@/lib/mock-data'
import InventarioClient from './InventarioClient'

function mockToProduct(item: typeof mockInventory[0], userId: string): Product {
  return {
    id: item.id,
    user_id: userId,
    pieza: item.pieza,
    marca: item.marca,
    modelo: item.modelo,
    anios: item.anios,
    oem: item.oem ?? null,
    estado: item.estado as Product['estado'],
    precio: item.precio,
    envio: null,
    descripcion: null,
    canales: [],
    fitment: item.fitment ?? [],
    disponible: item.disponible,
    vistas: item.vistas,
    imagen_url:      null,
    created_at:      new Date().toISOString(),
    seller_nombre:   null,
    seller_telefono: null,
    image_hash:      null,
    ml_item_id:      null,
    ml_permalink:    null,
  }
}

export default async function InventarioPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: realProducts, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Mock solo si hay error de BD (tabla no existe, etc.) — usuario nuevo sin piezas → array vacío
  const hasDbError = !!error
  const products: Product[] = error
    ? mockInventory.slice(0, 8).map(i => mockToProduct(i, userId))
    : (realProducts ?? [])

  // Verificar si el usuario tiene ML conectado
  let mlConnected = false
  try {
    const { data: mlToken } = await supabaseAdmin
      .from('ml_tokens')
      .select('expires_at')
      .eq('user_id', userId)
      .single()
    mlConnected = !!mlToken
  } catch {
    mlConnected = false
  }

  return (
    <SellerLayout section="inventario">
      <InventarioClient products={products} isDemo={hasDbError} mlConnected={mlConnected} />
    </SellerLayout>
  )
}
