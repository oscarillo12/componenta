'use client'

import { useState } from 'react'
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import Step0Vehicle from '@/components/steps/Step0Vehicle'
import Step1Photo from '@/components/steps/Step1Photo'
import Step2Identify from '@/components/steps/Step2Identify'
import Step3Publish from '@/components/steps/Step3Publish'
import { PartData, Step, VehicleHint } from '@/lib/types'
import { UserButton } from '@clerk/nextjs'
import { Sparkles, Camera, Brain, Rocket, ArrowRight, Globe, Zap, Shield, Car, Package, MessageCircle, BarChart3, CheckCircle } from 'lucide-react'

// ── Landing page para visitantes no autenticados ──────────────────────────────
function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif', color: '#E6EDF3' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(16px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff', boxShadow: '0 2px 8px rgba(29,78,216,0.4)' }}>C</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#E6EDF3', letterSpacing: -0.3 }}>Componenta</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/marketplace" style={{ fontSize: 13, color: '#8B949E', textDecoration: 'none', fontWeight: 600, padding: '7px 14px', borderRadius: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#CDD9E5')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8B949E')}>
            Ver marketplace
          </a>
          <SignInButton mode="modal">
            <button style={{ fontSize: 13, color: '#CDD9E5', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontWeight: 600, transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.28)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              Iniciar sesión
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button style={{ fontSize: 13, color: '#fff', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px rgba(29,78,216,0.35)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
              Publicar mis piezas gratis
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '96px 24px 72px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.25)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#79C0FF', marginBottom: 28 }}>
          <Sparkles size={12} /> Potenciado por IA · Gratis para empezar
        </div>
        <h1 style={{ fontSize: 'clamp(36px,5.5vw,62px)', fontWeight: 900, color: '#E6EDF3', margin: '0 0 22px', lineHeight: 1.08, letterSpacing: -1.5 }}>
          Tu desarmadería,<br />
          <span style={{ background: 'linear-gradient(135deg,#388BFD 30%,#79C0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>digital en minutos</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: '#8B949E', margin: '0 auto 40px', maxWidth: 560, lineHeight: 1.7 }}>
          Fotografía una pieza, la IA la identifica y la publica en tu catálogo online, MercadoLibre y WhatsApp — automáticamente.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <SignUpButton mode="modal">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 14, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.4)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(29,78,216,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(29,78,216,0.4)' }}>
              Publicar mis piezas gratis <ArrowRight size={16} />
            </button>
          </SignUpButton>
          <a href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 26px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#CDD9E5', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.1)', transition: 'border-color 0.15s, background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}>
            Ver marketplace
          </a>
        </div>
        {/* Social proof */}
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[
            { val: '30 seg', label: 'promedio por pieza' },
            { val: '40+', label: 'marcas de autos' },
            { val: '100%', label: 'gratis para empezar' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#388BFD', margin: '0 0 2px' }}>{val}</p>
              <p style={{ fontSize: 12, color: '#6E7681', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#6E7681', textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center', marginBottom: 28 }}>Todo lo que necesitas incluido</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          {[
            { icon: Camera, color: '#388BFD', bg: 'rgba(56,139,253,0.1)', title: 'Foto → publicado en segundos', desc: 'Saca una foto a la pieza. La IA la identifica, completa los datos y la publica automáticamente.' },
            { icon: Globe, color: '#3FB950', bg: 'rgba(63,185,80,0.1)', title: 'Multi-canal automático', desc: 'Publica a la vez en Componenta, MercadoLibre y Google Shopping sin trabajo extra.' },
            { icon: MessageCircle, color: '#25d366', bg: 'rgba(37,211,102,0.1)', title: 'Bot WhatsApp incluido', desc: 'Compradores consultan por WhatsApp y tú recibes notificaciones de cada pedido.' },
            { icon: BarChart3, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', title: 'Dashboard de ventas', desc: 'Vistas por pieza, región de compradores y tasa de conversión en tiempo real.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} style={{ background: '#161B22', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 20px', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, border: `1.5px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#E6EDF3', margin: '0 0 8px', lineHeight: 1.4 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#8B949E', margin: 0, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan gratuito */}
      <section style={{ maxWidth: 520, margin: '0 auto 96px', padding: '0 24px' }}>
        <div style={{ background: 'linear-gradient(160deg,#161B22 0%,#1a2332 100%)', border: '1.5px solid rgba(56,139,253,0.22)', borderRadius: 22, padding: '40px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* subtle glow */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,139,253,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#388BFD', textTransform: 'uppercase', letterSpacing: 1.2, background: 'rgba(56,139,253,0.12)', border: '1px solid rgba(56,139,253,0.25)', borderRadius: 20, padding: '3px 12px', marginBottom: 16 }}>Plan gratuito</span>
            <p style={{ fontSize: 42, fontWeight: 900, color: '#E6EDF3', margin: '0 0 4px', letterSpacing: -1 }}>$0<span style={{ fontSize: 16, fontWeight: 500, color: '#8B949E', letterSpacing: 0 }}> / mes</span></p>
            <p style={{ fontSize: 14, color: '#6E7681', margin: '0 0 28px' }}>Para empezar sin riesgo · Sin tarjeta de crédito</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 30, textAlign: 'left' }}>
              {[
                { text: 'Hasta 5 repuestos publicados', note: '' },
                { text: 'Identificación con IA incluida', note: '' },
                { text: 'Recibe pedidos online con pago', note: 'vía Flow' },
                { text: 'Bot WhatsApp para compradores', note: '' },
                { text: 'Dashboard de analíticas básico', note: '' },
              ].map(({ text, note }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(63,185,80,0.15)', border: '1.5px solid rgba(63,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={11} color="#3FB950" />
                  </div>
                  <span style={{ fontSize: 14, color: '#CDD9E5' }}>{text}</span>
                  {note && <span style={{ fontSize: 11, color: '#6E7681', marginLeft: 2 }}>· {note}</span>}
                </div>
              ))}
            </div>
            <SignUpButton mode="modal">
              <button style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,78,216,0.35)', transition: 'opacity 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                Publicar mis piezas gratis
              </button>
            </SignUpButton>
            <p style={{ fontSize: 12, color: '#6E7681', margin: '12px 0 0' }}>Activo en 2 minutos · Sin compromisos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff' }}>C</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6E7681' }}>Componenta</span>
        </div>
        <p style={{ fontSize: 12, color: '#6E7681', margin: 0, lineHeight: 2 }}>
          © 2025 Componenta · La Araucanía, Chile
          <br />
          <a href="/marketplace" style={{ color: '#388BFD', textDecoration: 'none' }}>Marketplace</a>
          {' · '}
          <a href="/solicitudes" style={{ color: '#388BFD', textDecoration: 'none' }}>Tablero de búsquedas</a>
          {' · '}
          <a href="/terminos" style={{ color: '#388BFD', textDecoration: 'none' }}>Términos</a>
          {' · '}
          <a href="/privacidad" style={{ color: '#388BFD', textDecoration: 'none' }}>Privacidad</a>
        </p>
      </footer>

      <style>{`
        @media(max-width:600px){
          nav>div:last-child>button:first-child{ display: none; }
          nav>div:last-child>*:nth-child(2){ display: none; }
        }
      `}</style>
    </div>
  )
}

const STEPS = [
  { num: 0, icon: Car,    label: 'Vehículo',           desc: 'Marca, modelo y año' },
  { num: 1, icon: Camera, label: 'Fotografía',         desc: 'Saca una foto a la pieza' },
  { num: 2, icon: Brain,  label: 'Identificación IA',  desc: 'La IA detecta la pieza' },
  { num: 3, icon: Rocket, label: 'Publicación',        desc: 'Precio, estado y canales' },
]

export default function Home() {
  const { user, isLoaded } = useUser()
  const [step,        setStep]        = useState<Step>(0)
  const [vehicleHint, setVehicleHint] = useState<VehicleHint | null>(null)
  const [photo,       setPhoto]       = useState<{ file: File; preview: string } | null>(null)
  const [partData,    setPartData]    = useState<PartData | null>(null)

  // Mostrar landing para visitantes no autenticados
  if (isLoaded && !user) return <LandingPage />

  const handleVehicle = (hint: VehicleHint | null) => {
    setVehicleHint(hint)
    setStep(1)
  }

  const handlePhotoSelected = (file: File, preview: string) => {
    setPhoto({ file, preview })
    setStep(2)
  }

  const handleIdentified = (data: PartData) => {
    setPartData(data)
    setStep(3)
  }

  const handlePublished = () => {
    setStep(0)
    setVehicleHint(null)
    setPhoto(null)
    setPartData(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <Sidebar />

      <div className="flex-1 sm:ml-16 pb-16 sm:pb-0" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden', minWidth: 0 }}>

        {/* ── Header ── */}
        <header className="page-header" style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: '#fff', borderBottom: '1px solid #ececea',
          padding: '0 32px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#16181d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>C</div>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: '#16181d' }}>Componenta</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9aa0aa', padding: '3px 9px', background: '#f5f5f4', borderRadius: 20 }}>Nuevo ingreso</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <a href="/inventario" style={{ fontSize: 12.5, color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Mi inventario</a>
            <UserButton />
          </div>
        </header>

        <main className="page-main" style={{ flex: 1, padding: '20px 16px 48px', maxWidth: 900, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* ── Hero ── */}
          <div className="hero-banner" style={{
            marginBottom: 26,
            borderRadius: 18,
            background: '#16181d',
            padding: '34px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,95,219,.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(47,95,219,.15)', border: '1px solid rgba(47,95,219,.35)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
                <Sparkles size={12} color="#8fb0f2" />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#8fb0f2' }}>Potenciado por IA</span>
              </div>

              <h1 className="hero-title" style={{ fontSize: 27, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: -0.5 }}>
                Publica tus repuestos en menos de 30 segundos
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', margin: '0 0 20px', maxWidth: 480, lineHeight: 1.65 }}>
                Saca una foto, la IA identifica la pieza, marca y compatibilidad automáticamente. Llega al marketplace al instante.
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: Zap, text: '30 seg promedio' },
                  { icon: Shield, text: 'Compatibilidad IA' },
                  { icon: Globe, text: '40+ marcas · 400+ modelos' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon size={13} color="#8fb0f2" />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', fontWeight: 600 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Step pills ── */}
          <div className="step-pills" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 22 }}>
            {STEPS.map((s, i) => {
              const isDone    = step > s.num
              const isCurrent = step === s.num
              const Icon = s.icon
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none', minWidth: 0 }}>
                  <div className="step-pill-card" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                    borderRadius: 12, transition: 'all 0.3s', flexShrink: 0,
                    background: isCurrent ? '#eef3fc' : '#fafafa',
                    border: `1.5px solid ${isCurrent ? '#d7e3f7' : '#ececea'}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isDone || isCurrent ? '#2f5fdb' : '#ececea',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone
                        ? <span style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>✓</span>
                        : <Icon size={13} color={isCurrent ? '#fff' : '#9aa0aa'} />}
                    </div>
                    <div className="step-pill-label">
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#16181d', margin: 0, whiteSpace: 'nowrap' }}>{s.label}</p>
                      <p style={{ fontSize: 9.5, color: '#9aa0aa', margin: 0, whiteSpace: 'nowrap' }}>{s.desc}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, minWidth: 6, height: 2, margin: '0 4px', background: isDone ? '#2f5fdb' : '#ececea', transition: 'background 0.3s' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Contenido del paso ── */}
          <div style={{
            background: '#fff', borderRadius: 18,
            border: '1px solid #ececea',
            overflow: 'hidden',
          }}>
            <div style={{ height: 3, background: '#2f5fdb' }} />

            <div className="step-content" style={{ padding: '32px 36px' }}>
              {step === 0 && <Step0Vehicle onConfirm={handleVehicle} />}

              {step === 1 && <Step1Photo onPhotoSelected={handlePhotoSelected} />}

              {step === 2 && photo && (
                <Step2Identify
                  photoFile={photo.file}
                  photoPreview={photo.preview}
                  vehicleHint={vehicleHint}
                  onConfirm={handleIdentified}
                />
              )}

              {step === 3 && photo && partData && (
                <Step3Publish
                  photoPreview={photo.preview}
                  partData={partData}
                  onPublished={handlePublished}
                />
              )}
            </div>
          </div>

          {/* ── Tips contextuales ── */}
          {(step === 1) && (
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { emoji: '💡', tip: 'Foto en luz natural, fondo neutro' },
                { emoji: '📐', tip: 'Incluye el número de parte si es visible' },
                { emoji: '🔍', tip: 'La IA detecta marca y compatibilidad sola' },
              ].map(({ emoji, tip }) => (
                <div key={tip} style={{ background: '#fff', border: '1px solid #ececea', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 18, background: '#eef3fc', border: '1.5px solid #d7e3f7', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={16} color="#2f5fdb" />
                <p style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 600, margin: 0 }}>
                  Al publicar, la pieza quedará visible inmediatamente en el marketplace de Componenta
                </p>
              </div>
              <a href="/marketplace" target="_blank"
                style={{ fontSize: 12, color: '#2f5fdb', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver marketplace <ArrowRight size={12} />
              </a>
            </div>
          )}
        </main>

        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 560px) {
            .step-pill-label { display: none !important; }
            .hero-banner { padding: 22px 20px !important; }
            .page-header { padding: 0 14px !important; }
            .step-content { padding: 20px 16px !important; }
          }
        ` }} />
      </div>
    </div>
  )
}
