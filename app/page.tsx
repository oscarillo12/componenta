'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Step0Vehicle from '@/components/steps/Step0Vehicle'
import Step1Photo from '@/components/steps/Step1Photo'
import Step2Identify from '@/components/steps/Step2Identify'
import Step3Publish from '@/components/steps/Step3Publish'
import { PartData, Step, VehicleHint } from '@/lib/types'
import { UserButton } from '@clerk/nextjs'
import { Sparkles, Camera, Brain, Rocket, ArrowRight, Globe, Zap, Shield, Car } from 'lucide-react'

const STEPS = [
  { num: 0, icon: Car,    label: 'Vehículo',           desc: 'Marca, modelo y año' },
  { num: 1, icon: Camera, label: 'Fotografía',         desc: 'Saca una foto a la pieza' },
  { num: 2, icon: Brain,  label: 'Identificación IA',  desc: 'La IA detecta la pieza' },
  { num: 3, icon: Rocket, label: 'Publicación',        desc: 'Precio, estado y canales' },
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f4', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar />

      <div className="flex-1 sm:ml-16 pb-16 sm:pb-0" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

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

        <main className="page-main" style={{ flex: 1, padding: '28px 32px 48px', maxWidth: 900, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

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
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                    borderRadius: 12, transition: 'all 0.3s',
                    background: isCurrent ? '#eef3fc' : '#fafafa',
                    border: `1.5px solid ${isCurrent ? '#d7e3f7' : '#ececea'}`,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: isDone || isCurrent ? '#2f5fdb' : '#ececea',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone
                        ? <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>✓</span>
                        : <Icon size={14} color={isCurrent ? '#fff' : '#9aa0aa'} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 11.5, fontWeight: 700, color: '#16181d', margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: 10, color: '#9aa0aa', margin: 0 }}>{s.desc}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 6px', background: isDone ? '#2f5fdb' : '#ececea', transition: 'background 0.3s' }} />
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
      </div>
    </div>
  )
}
