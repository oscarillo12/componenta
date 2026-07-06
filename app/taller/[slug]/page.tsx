'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, MessageCircle, Clock, Shield, ArrowLeft, Loader2, Pencil, Wrench, Car, Zap, CheckCircle } from 'lucide-react'

type Servicio = { nombre: string; precio_desde?: number; precio_hasta?: number; descripcion?: string }

type TallerProfile = {
  user_id?: string; slug: string; nombre: string; tagline?: string; descripcion?: string
  color: string; whatsapp?: string; telefono?: string; direccion?: string
  horario?: string; ciudad?: string; marcas?: string[]; servicios?: Servicio[]; tipo?: string
}

const TIPO_LABEL: Record<string, string> = {
  taller: 'Taller Mecánico', vulcanizacion: 'Vulcanización', electrico: 'Taller Eléctrico',
  especialista: 'Taller Especialista', carroceria: 'Carrocería y Pintura',
}
const TIPO_ICON: Record<string, React.ElementType> = {
  taller: Wrench, electrico: Zap, especialista: Car,
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1117' }}>
      <Loader2 size={32} color="#79C0FF" className="animate-spin" />
    </div>
  )

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0D1117' }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#B1BAC4' }}>Taller no encontrado</p>
      <Link href="/talleres" style={{ color: '#79C0FF', fontWeight: 600 }}>← Volver al directorio</Link>
    </div>
  )

  const tel    = profile.whatsapp || profile.telefono || ''
  const waLink = `https://wa.me/${tel.replace(/\D/g, '')}`
  const color  = profile.color
  const TipoIcon = TIPO_ICON[profile.tipo ?? 'taller'] ?? Wrench
  const servicios = profile.servicios ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>

      {/* ══ HERO ══ */}
      <div style={{ background: `linear-gradient(165deg, ${color} 0%, ${color}cc 50%, #0D1117 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        {/* Nav */}
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/talleres" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={15} /> Directorio talleres
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOwner && (
              <Link href="/mi-taller" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                <Pencil size={11} /> Editar
              </Link>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <MessageCircle size={12} /> Contactar
            </a>
          </div>
        </div>

        {/* Identity */}
        <div style={{ padding: '8px 18px 0' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 74, height: 74, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <TipoIcon size={30} color="#fff" />
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Shield size={11} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {TIPO_LABEL[profile.tipo ?? 'taller']} · componenta.cl
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.15 }}>{profile.nombre}</h1>
              {profile.tagline && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '5px 0 0' }}>{profile.tagline}</p>}
            </div>
          </div>

          {/* Info strip */}
          <div style={{ padding: '4px 0 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {profile.ciudad && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <MapPin size={13} style={{ flexShrink: 0 }} /> {profile.direccion || profile.ciudad}
              </div>
            )}
            {profile.horario && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <Clock size={13} style={{ flexShrink: 0 }} /> {profile.horario}
              </div>
            )}
            {tel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                <Phone size={13} style={{ flexShrink: 0 }} /> {tel}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 24 }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#161B22', borderRadius: 14, padding: '13px', textDecoration: 'none', fontWeight: 800, fontSize: 14, color: '#E6EDF3', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <MessageCircle size={17} color={color} /> WhatsApp
            </a>
            <a href={`tel:${tel}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '13px', textDecoration: 'none', fontWeight: 700, fontSize: 14, color: '#fff' }}>
              <Phone size={17} /> Llamar
            </a>
          </div>
        </div>
      </div>

      {/* ══ CONTENIDO ══ */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* Descripción */}
        {profile.descripcion && (
          <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: 18, marginTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Sobre el taller</p>
            <p style={{ fontSize: 14, color: '#E6EDF3', lineHeight: 1.65, margin: 0 }}>{profile.descripcion}</p>
          </div>
        )}

        {/* Marcas que trabajan */}
        {(profile.marcas?.length ?? 0) > 0 && (
          <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: 18, marginTop: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#B1BAC4', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Marcas que trabajamos</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.marcas!.map(m => (
                <span key={m} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', background: color }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {servicios.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, color: '#E6EDF3', margin: '0 0 14px' }}>Servicios y precios</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {servicios.map((s, i) => (
                <div key={i} style={{ background: '#161B22', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{s.nombre}</p>
                    {s.descripcion && <p style={{ fontSize: 12, color: '#8B949E', margin: '3px 0 0' }}>{s.descripcion}</p>}
                  </div>
                  {(s.precio_desde || s.precio_hasta) && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: color, margin: 0 }}>
                        {s.precio_desde ? `$${s.precio_desde.toLocaleString('es-CL')}` : ''}
                        {s.precio_desde && s.precio_hasta ? ' – ' : ''}
                        {s.precio_hasta ? `$${s.precio_hasta.toLocaleString('es-CL')}` : ''}
                      </p>
                      <p style={{ fontSize: 10, color: '#6E7681', margin: '2px 0 0' }}>Precio ref.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 20 }}>
          <Link href="/talleres" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#161B22', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 22, height: 22, background: '#388BFD', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>C</div>
                <span style={{ fontWeight: 700, color: '#E6EDF3', fontSize: 14 }}>componenta.cl</span>
              </div>
              <p style={{ fontSize: 12, color: '#79C0FF', fontWeight: 600, margin: 0 }}>Ver todos los talleres →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* FAB WhatsApp */}
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 20, right: 16, display: 'flex', alignItems: 'center', gap: 8, background: color, color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 20px', borderRadius: 30, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 50, textDecoration: 'none' }}>
        <MessageCircle size={18} /> Pedir hora
      </a>
    </div>
  )
}
