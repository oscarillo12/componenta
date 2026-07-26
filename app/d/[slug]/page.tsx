'use client'

import { use, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import PublicProfile from '@/components/PublicProfile'
import type { Product } from '@/lib/supabase'
import { mockDesarmaduras, mockInventory } from '@/lib/mock-data'

type SellerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; banner_url?: string | null; whatsapp?: string; direccion?: string
  horario?: string; ciudad?: string; especialidades?: string[]
}

export default function DesarmaduriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [profile, setProfile]   = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [isOwner, setIsOwner]   = useState(false)

  useEffect(() => {
    fetch(`/api/d/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.notFound) {
          setProfile(data)
          fetch('/api/profile').then(r => r.json()).then(me => {
            setIsOwner(me?.userId === data.user_id)
          }).catch(() => {})
          fetch(`/api/marketplace?seller=${data.user_id}&limit=100`)
            .then(r => r.json()).then(d => setProducts(d.products ?? [])).catch(() => {})
          return
        }
        // Caer a datos mock si no existe en Supabase
        const mock = mockDesarmaduras.find(d => d.slug === slug)
        if (mock) {
          setProfile({
            slug: mock.slug, nombre: mock.nombre, tagline: mock.tagline,
            descripcion: mock.descripcion, color: mock.color, whatsapp: mock.telefono,
            direccion: mock.direccion, horario: mock.horario, especialidades: mock.especialidades,
          })
          const mockProds = mockInventory
            .filter(i => i.vendedorSlug === slug && i.disponible)
            .map(i => ({
              id: i.id, pieza: i.pieza, marca: i.marca, modelo: i.modelo,
              anios: i.anios, oem: i.oem ?? null, estado: i.estado,
              precio: i.precio, disponible: i.disponible, vistas: i.vistas,
              imagen_url: null, seller_nombre: mock.nombre, seller_telefono: mock.telefono,
            } as unknown as Product))
          setProducts(mockProds)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5' }}>
      <Loader2 size={28} color="#9aa0aa" className="animate-spin" />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f7f7f5' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Tienda no encontrada</p>
      <Link href="/" style={{ color: '#2f5fdb', fontWeight: 600, textDecoration: 'none' }}>← Ver todos los repuestos</Link>
    </div>
  )

  return (
    <PublicProfile
      backHref="/"
      isOwner={isOwner}
      editHref="/mi-tienda"
      profile={{
        slug: profile.slug,
        nombre: profile.nombre,
        tagline: profile.tagline,
        descripcion: profile.descripcion,
        color: profile.color,
        bannerUrl: profile.banner_url,
        whatsapp: profile.whatsapp,
        direccion: profile.direccion,
        horario: profile.horario,
        ciudad: profile.ciudad,
        tags: profile.especialidades,
        kindLabel: 'Vendedor verificado',
      }}
      products={products.map(p => ({
        id: p.id, pieza: p.pieza, marca: p.marca, modelo: p.modelo, anios: p.anios,
        oem: p.oem, estado: p.estado, precio: p.precio, vistas: p.vistas, imagen_url: p.imagen_url,
      }))}
    />
  )
}
