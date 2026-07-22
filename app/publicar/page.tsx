'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import StepIndicator from '@/components/StepIndicator'
import Step0Vehicle  from '@/components/steps/Step0Vehicle'
import Step1Photo    from '@/components/steps/Step1Photo'
import Step2Identify from '@/components/steps/Step2Identify'
import Step3Publish  from '@/components/steps/Step3Publish'
import type { Step, VehicleHint, PartData } from '@/lib/types'

export default function PublicarPage() {
  const router = useRouter()
  const [step,         setStep]         = useState<Step>(0)
  const [vehicleHint,  setVehicleHint]  = useState<VehicleHint | null>(null)
  const [photoFile,    setPhotoFile]    = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [partData,     setPartData]     = useState<PartData | null>(null)

  function handleVehicle(hint: VehicleHint | null) {
    setVehicleHint(hint)
    setStep(1)
  }

  function handlePhoto(file: File, preview: string) {
    setPhotoFile(file)
    setPhotoPreview(preview)
    setStep(2)
  }

  function handleIdentified(data: PartData) {
    setPartData(data)
    setStep(3)
  }

  function handlePublished() {
    router.push('/inventario')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f7', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#16181d', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', gap: 14,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/inventario" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}>
          <ArrowLeft size={15} /> Inventario
        </Link>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Publicar nueva pieza</span>
      </header>

      {/* Contenido */}
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px 80px' }}>
        {step > 0 && <StepIndicator currentStep={step} />}

        {step === 0 && <Step0Vehicle onConfirm={handleVehicle} />}

        {step === 1 && <Step1Photo onPhotoSelected={handlePhoto} />}

        {step === 2 && photoFile && (
          <Step2Identify
            photoFile={photoFile}
            photoPreview={photoPreview}
            vehicleHint={vehicleHint}
            onConfirm={handleIdentified}
          />
        )}

        {step === 3 && partData && (
          <Step3Publish
            photoPreview={photoPreview}
            partData={partData}
            onPublished={handlePublished}
          />
        )}
      </main>
    </div>
  )
}
