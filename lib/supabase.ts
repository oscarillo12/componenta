import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side anon client (respects RLS)
// For the server-side admin client, import from lib/supabase-server.ts
export const supabaseClient = createClient(supabaseUrl, anonKey)

export type Product = {
  id: string
  user_id: string
  pieza: string
  marca: string | null
  modelo: string | null
  anios: string | null
  oem: string | null
  estado: 'excelente' | 'bueno' | 'con-detalles' | 'para-reparar'
  precio: number
  envio: string | null
  descripcion: string | null
  canales: string[]
  fitment: { make: string; model: string; yearFrom: number; yearTo: number }[]
  disponible: boolean
  vistas: number
  imagen_url: string | null
  created_at: string
  seller_nombre: string | null
  seller_telefono: string | null
  image_hash:   string | null
  ml_item_id:   string | null
  ml_permalink: string | null
  fb_item_id:   string | null
  fb_permalink: string | null
}
