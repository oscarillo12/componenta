'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Step0Vehicle from '@/components/steps/Step0Vehicle'
import Step1Photo from '@/components/steps/Step1Photo'
import Step2Identify from '@/components/steps/Step2Identify'
import Step3Publish from '@/components/steps/Step3Publish'
import { PartData, Step, VehicleHint } from '@/lib/types'
import { UserButton } from '@clerk/nextjs'
import { Sparkles, Camera, Brain, Rocket, ArrowRight, Zap, Shield, Globe, Car } from 'lucide-react'

const STEPS = [
  {
    num: 0,
    icon: Car,
    label: 'Vehículo',
    desc: 'Marca, modelo y año',
    color: '#1F6FEB',
    bg: '#eff6ff',
  },
  {
    num: 1,
    icon: Camera,
    label: 'Fotografía',
    desc: 'Saca una foto a la pieza',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    num: 2,
    icon: Brain,
    label: 'Identificación IA',
    desc: 'Gemini detecta la pieza',
    color: '#0891b2',
    bg: '#ecfeff',
  },
  {
    num: 3,
    icon: Rocket,
    label: 'Publicación',
    desc: 'Precio, estado y canales',
    color: '#79C0FF',
    bg: '#eff6ff',
  },
]

export default function Home() {
  const [step,        setStep]        = useState<Step>(0)
  const [vehicleHint, setVehicleHint] = useState<VehicleHint | null>(null)
  const [photo,       setPhoto]       = useState<{ file: File; preview: string } | null>(null)
  const [partData,    setPartData]    = useState<PartData | null>(null)

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: 64, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(1,4,9,0.96)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 32px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3' }}>Componenta</span>
            <span style={{ fontSize: 12, color: '#B1BAC4', padding: '2px 8px', background: '#21262D', borderRadius: 20 }}>Nuevo ingreso</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/inventario" style={{ fontSize: 13, color: '#B1BAC4', textDecoration: 'none', fontWeight: 500 }}>Mi inventario</a>
            <UserButton />
          </div>
        </header>

        <main style={{ flex: 1, padding: '0 32px 48px', maxWidth: 960, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* ── Hero Banner ── */}
          <div style={{
            marginTop: 32, marginBottom: 32,
            borderRadius: 20,
            background: '#161B22',
            padding: '40px 48px',
            position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(240,246,252,0.1)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          }}>
            {/* Glow sutil — azul a la derecha, indigo abajo */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,139,253,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: 80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
                <Sparkles size={12} color="#79C0FF" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#79C0FF' }}>Potenciado por Gemini AI</span>
              </div>

              <h1 style={{ fontSize: 34, fontWeight: 800, color: '#E6EDF3', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: -0.5 }}>
                Publica tus repuestos<br />
                <span style={{ background: 'linear-gradient(90deg,#388BFD,#58A6FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  en menos de 30 segundos
                </span>
              </h1>
              <p style={{ fontSize: 15, color: '#8B949E', margin: '0 0 28px', maxWidth: 440, lineHeight: 1.65 }}>
                Saca una foto, la IA identifica la pieza, marca y compatibilidad automáticamente. Llega al marketplace al instante.
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: Zap, text: '30 seg promedio' },
                  { icon: Shield, text: 'Compatibilidad IA' },
                  { icon: Globe, text: 'Visible en Chile' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(240,246,252,0.05)', border: '1px solid rgba(240,246,252,0.08)', borderRadius: 8, padding: '6px 12px' }}>
                    <Icon size={13} color="#388BFD" />
                    <span style={{ fontSize: 12, color: '#8B949E', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Step progress pills ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
            {STEPS.map((s, i) => {
              const isDone    = step > s.num
              const isCurrent = step === s.num
              const Icon = s.icon
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                    borderRadius: 14, transition: 'all 0.3s',
                    background: isDone ? '#1A56DB' : isCurrent ? '#161B22' : '#21262D',
                    border: `1.5px solid ${isDone ? 'rgba(56,139,253,0.5)' : isCurrent ? 'rgba(56,139,253,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isCurrent ? '0 2px 16px rgba(56,139,253,0.18)' : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                      background: isDone ? 'rgba(255,255,255,0.15)' : isCurrent ? `${s.color}28` : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${isDone ? 'rgba(255,255,255,0.3)' : isCurrent ? s.color : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      {isDone
                        ? <span style={{ fontSize: 13, color: '#fff' }}>✓</span>
                        : <Icon size={14} color={isCurrent ? s.color : '#6E7681'} />}
                    </div>
                    <div style={{ display: isCurrent || isDone ? 'block' : 'none' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: 11, color: '#8B949E', margin: 0 }}>{s.desc}</p>
                    </div>
                    {!isCurrent && !isDone && (
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#6E7681', margin: 0 }}>Paso {s.num}</p>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 6px', background: isDone ? 'rgba(56,139,253,0.4)' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Contenido del paso ── */}
          <div style={{
            background: '#161B22', borderRadius: 20,
            border: '1.5px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {/* Barra de paso activo */}
            <div style={{
              height: 3,
              background: step === 0
                ? 'linear-gradient(90deg,#1F6FEB,#1F6FEB)'
                : step === 1
                  ? 'linear-gradient(90deg,#1F6FEB,#7c3aed)'
                  : step === 2
                    ? 'linear-gradient(90deg,#7c3aed,#0891b2)'
                    : 'linear-gradient(90deg,#1A56DB,#388BFD)',
              transition: 'background 0.5s',
            }} />

            <div style={{ padding: '36px 40px' }}>
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

          {/* ── Tips contextuals por paso ── */}
          {(step === 1) && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { emoji: '💡', tip: 'Foto en luz natural, fondo neutro' },
                { emoji: '📐', tip: 'Incluye el número de parte si es visible' },
                { emoji: '🔍', tip: 'La IA detecta marca y compatibilidad sola' },
              ].map(({ emoji, tip }) => (
                <div key={tip} style={{ background: '#161B22', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0, lineHeight: 1.4 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 20, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={16} color="#79C0FF" />
                <p style={{ fontSize: 13, color: '#A5D6FF', fontWeight: 600, margin: 0 }}>
                  Al publicar, la pieza quedará visible inmediatamente en el marketplace de Componenta
                </p>
              </div>
              <a href="/marketplace" target="_blank"
                style={{ fontSize: 12, color: '#79C0FF', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Ver marketplace <ArrowRight size={12} />
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
