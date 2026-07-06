import Link from 'next/link'
import { MapPin, Clock, Wrench, Zap, Car, ChevronRight, Plus, MessageCircle, ShieldCheck } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'

type Servicio = { nombre: string }
type Taller = {
  slug: string; nombre: string; tagline?: string; color: string
  ciudad?: string; direccion?: string; horario?: string; whatsapp?: string
  marcas?: string[]; servicios?: Servicio[]; tipo?: string
}

const TIPO_LABEL: Record<string, string> = {
  taller: 'Taller Mecánico', vulcanizacion: 'Vulcanización', electrico: 'Taller Eléctrico',
  especialista: 'Especialista', carroceria: 'Carrocería',
}
const TIPO_ICON: Record<string, React.ElementType> = {
  taller: Wrench, electrico: Zap, especialista: Car,
}

export const revalidate = 60

export default async function TalleresPage() {
  const { data } = await supabaseAdmin
    .from('taller_profiles')
    .select('slug, nombre, tagline, color, ciudad, direccion, horario, whatsapp, marcas, servicios, tipo')
    .order('created_at', { ascending: false })

  const talleres: Taller[] = data ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/marketplace" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Marketplace
          </Link>
          <span style={{ color: '#e5e7eb' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Talleres Mecánicos</span>
          </div>
        </div>
        <Link href="/mi-taller" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#1d4ed8', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <Plus size={13} /> Registrar mi taller
        </Link>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#1d4ed8', marginBottom: 14 }}>
            <Wrench size={11} /> Directorio de talleres en Chile
          </span>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: -0.5 }}>Talleres Mecánicos</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Encuentra talleres cercanos, compara servicios y agenda directo por WhatsApp</p>
        </div>

        {/* Trust strip */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 20px', marginBottom: 28, display: 'flex', gap: 0, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {[
            { icon: ShieldCheck, color: '#15803d', text: 'Talleres verificados' },
            { icon: MessageCircle, color: '#1d4ed8', text: 'Contacto por WhatsApp' },
            { icon: MapPin, color: '#7c3aed', text: 'Todo Chile' },
          ].map(({ icon: Icon, color, text }, i) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{text}</span>
            </div>
          ))}
        </div>

        {talleres.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e5e7eb', padding: '56px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Wrench size={28} color="#9ca3af" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Sé el primero en registrarte</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>Llega a miles de dueños de autos en tu ciudad</p>
            <Link href="/mi-taller" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Plus size={14} /> Registrar mi taller gratis
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {talleres.map(t => {
              const TipoIcon = TIPO_ICON[t.tipo ?? 'taller'] ?? Wrench
              const waLink = t.whatsapp ? `https://wa.me/${t.whatsapp.replace(/\D/g, '')}` : '#'
              return (
                <div key={t.slug} className="taller-card" style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}>
                  {/* Color bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${t.color}, ${t.color}60)` }} />
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 54, height: 54, borderRadius: 14, background: `${t.color}15`, border: `2px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TipoIcon size={22} color={t.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</h3>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: '#fff', background: t.color, flexShrink: 0 }}>
                            {TIPO_LABEL[t.tipo ?? 'taller']}
                          </span>
                        </div>
                        {t.tagline && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          {t.ciudad && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                              <MapPin size={11} color="#9ca3af" /> {t.ciudad}
                            </span>
                          )}
                          {t.horario && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                              <Clock size={11} color="#9ca3af" /> {t.horario}
                            </span>
                          )}
                        </div>
                        {(t.marcas?.length ?? 0) > 0 && (
                          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                            {t.marcas!.slice(0, 4).map(m => (
                              <span key={m} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: '#374151', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>{m}</span>
                            ))}
                            {(t.marcas?.length ?? 0) > 4 && (
                              <span style={{ fontSize: 10, color: '#9ca3af' }}>+{t.marcas!.length - 4} más</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <Link href={`/taller/${t.slug}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          Ver perfil <ChevronRight size={12} />
                        </Link>
                        {t.whatsapp && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                    {(t.servicios?.length ?? 0) > 0 && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {t.servicios!.slice(0, 4).map((s, i) => (
                          <span key={i} style={{ fontSize: 11, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '3px 10px', fontWeight: 500 }}>{s.nombre}</span>
                        ))}
                        {(t.servicios?.length ?? 0) > 4 && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>+{t.servicios!.length - 4} servicios</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
