import Link from 'next/link'
import { MapPin, Clock, Phone, Wrench, Zap, Car, ChevronRight, Plus } from 'lucide-react'
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
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'rgba(1,4,9,0.96)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/marketplace" style={{ color: '#8B949E', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Marketplace</Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wrench size={14} color="#388BFD" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3' }}>Talleres Mecánicos</span>
          </div>
        </div>
        <Link href="/mi-taller" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: '#388BFD', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <Plus size={13} /> Registrar mi taller
        </Link>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 14 }}>
            <Wrench size={12} color="#79C0FF" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#79C0FF' }}>Directorio de talleres en Chile</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#E6EDF3', margin: '0 0 8px' }}>Talleres Mecánicos</h1>
          <p style={{ fontSize: 14, color: '#8B949E', margin: 0 }}>Encuentra talleres cercanos, compara precios y agenda tu servicio</p>
        </div>

        {talleres.length === 0 ? (
          <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', padding: '48px 24px', textAlign: 'center' }}>
            <Wrench size={40} color="#21262D" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>Sé el primero en registrarte</p>
            <p style={{ fontSize: 13, color: '#8B949E', margin: '0 0 20px' }}>Llega a miles de dueños de autos en tu ciudad</p>
            <Link href="/mi-taller" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Plus size={15} /> Registrar mi taller gratis
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {talleres.map(t => {
              const TipoIcon = TIPO_ICON[t.tipo ?? 'taller'] ?? Wrench
              const waLink = t.whatsapp ? `https://wa.me/${t.whatsapp.replace(/\D/g, '')}` : '#'
              return (
                <Link key={t.slug} href={`/taller/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#161B22', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    {/* Color strip */}
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${t.color}, ${t.color}80)` }} />
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${t.color}20`, border: `2px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <TipoIcon size={22} color={t.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nombre}</h3>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, color: '#fff', background: t.color, flexShrink: 0 }}>
                              {TIPO_LABEL[t.tipo ?? 'taller']}
                            </span>
                          </div>
                          {t.tagline && <p style={{ fontSize: 12, color: '#8B949E', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</p>}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {t.ciudad && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8B949E' }}>
                                <MapPin size={10} /> {t.ciudad}
                              </span>
                            )}
                            {t.horario && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8B949E' }}>
                                <Clock size={10} /> {t.horario}
                              </span>
                            )}
                          </div>
                          {(t.marcas?.length ?? 0) > 0 && (
                            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                              {t.marcas!.slice(0, 4).map(m => (
                                <span key={m} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color: '#E6EDF3', background: '#21262D', border: '1px solid rgba(255,255,255,0.1)' }}>{m}</span>
                              ))}
                              {(t.marcas?.length ?? 0) > 4 && (
                                <span style={{ fontSize: 10, color: '#8B949E' }}>+{t.marcas!.length - 4} más</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight size={16} color="#6E7681" style={{ flexShrink: 0, marginTop: 4 }} />
                      </div>
                      {(t.servicios?.length ?? 0) > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {t.servicios!.slice(0, 3).map((s, i) => (
                            <span key={i} style={{ fontSize: 11, color: '#79C0FF', background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.2)', borderRadius: 8, padding: '3px 10px' }}>{s.nombre}</span>
                          ))}
                          {(t.servicios?.length ?? 0) > 3 && (
                            <span style={{ fontSize: 11, color: '#8B949E' }}>+{t.servicios!.length - 3} servicios</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
