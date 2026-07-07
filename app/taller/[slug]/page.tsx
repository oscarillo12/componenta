'use client'

import { useState, use, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import PublicProfile from '@/components/PublicProfile'

type Servicio = { nombre: string; precio_desde?: number; precio_hasta?: number; descripcion?: string }

type TallerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; whatsapp?: string; telefono?: string; direccion?: string
  horario?: string; ciudad?: string; marcas?: string[]; servicios?: Servicio[]; tipo?: string
}

const TIPO_LABEL: Record<string, string> = {
  taller: 'Taller mecánico', vulcanizacion: 'Vulcanización', electrico: 'Taller eléctrico',
  especialista: 'Taller especialista', carroceria: 'Carrocería y pintura',
}

export default function TallerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [profile, setProfile] = useState<TallerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetch(`/api/taller/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.notFound) {
          setProfile(data)
          fetch('/api/profile').then(r => r.json()).then(me => {
            setIsOwner(me?.userId === data.user_id)
          }).catch(() => {})
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
      <p style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>Taller no encontrado</p>
      <Link href="/talleres" style={{ color: '#2f5fdb', fontWeight: 600, textDecoration: 'none' }}>← Volver al directorio</Link>
    </div>
  )

  return (
    <PublicProfile
      backHref="/talleres"
      isOwner={isOwner}
      editHref="/mi-taller"
      profile={{
        slug: profile.slug,
        nombre: profile.nombre,
        tagline: profile.tagline,
        descripcion: profile.descripcion,
        color: profile.color,
        whatsapp: profile.whatsapp || profile.telefono,
        direccion: profile.direccion,
        horario: profile.horario,
        ciudad: profile.ciudad,
        tags: profile.marcas,
        kindLabel: TIPO_LABEL[profile.tipo ?? 'taller'] ?? 'Taller verificado',
      }}
      servicios={profile.servicios}
    />
  )
}
