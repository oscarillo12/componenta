export interface VehicleCompat {
  marca: string
  modelo: string
  anios: string
}

export interface PartData {
  pieza: string
  marca: string
  oem: string | null
  compatibilidad: VehicleCompat[]
  confianza: number
}

export type Step = 0 | 1 | 2 | 3

export interface VehicleHint {
  marca: string
  modelo: string
  anio: string
}

export interface PublishChannel {
  id: string
  name: string
  description: string
  icon: string
}

export const CHANNELS: PublishChannel[] = [
  {
    id: 'componenta',
    name: 'Componenta.cl',
    description: 'Catálogo propio — buscable por modelo y año de vehículo',
    icon: '⚡',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Respuesta automática cuando consulten por esta pieza',
    icon: '💬',
  },
  {
    id: 'mercadolibre',
    name: 'MercadoLibre',
    description: 'Publicación automática con descripción generada por Componenta',
    icon: '🛒',
  },
]

export type EstadoPieza = 'excelente' | 'bueno' | 'con-detalles' | 'para-reparar'
export type EstadoPedido = 'pendiente' | 'confirmado' | 'enviado' | 'completado'

export interface Fitment {
  make: string
  model: string
  yearFrom: number
  yearTo: number
}

export interface InventoryItem {
  id: string
  pieza: string
  marca: string
  modelo: string
  anios: string
  oem: string | null
  estado: EstadoPieza
  precio: number
  publicado?: string
  disponible: boolean
  vistas: number
  zona: string
  vendedorSlug: string
  fitment: Fitment[]
  imagen_url?: string | null
}

export interface Order {
  id: string
  pieza: string
  comprador: string
  region: string
  precio: number
  envio: number
  estado: EstadoPedido
  fecha: string
  telefono: string
}

export interface Desarmaduria {
  id: string
  slug: string
  nombre: string
  tagline: string
  descripcion: string
  direccion: string
  telefono: string
  distanciaKm: number
  piezasCompatibles: number
  rating: number
  reviewCount: number
  fundacion: number
  horario: string
  especialidades: string[]
  color: string
  totalVentas: number
}

export interface VehicleInfo {
  vin?: string
  marca: string
  modelo: string
  anio: string
  motor?: string
}

export interface CarZone {
  id: string
  label: string
  icon: string
  keywords: string[]
}
