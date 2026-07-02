'use client'

import { Check } from 'lucide-react'
import { Step } from '@/lib/types'

interface StepIndicatorProps {
  currentStep: Step
}

const steps = [
  { number: 1, label: 'Fotografiar pieza' },
  { number: 2, label: 'Digitalizar con IA' },
  { number: 3, label: 'Publicar en canales' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done = step.number < currentStep
        const active = step.number === currentStep

        return (
          <div key={step.number} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                done
                  ? 'bg-blue-100 text-blue-800'
                  : active
                  ? 'bg-blue-700 text-white'
                  : 'bg-white/10 text-slate-500'
              }`}
            >
              {done ? (
                <Check size={14} />
              ) : (
                <span className="w-4 h-4 flex items-center justify-center rounded-full border border-current text-xs">
                  {step.number}
                </span>
              )}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <span className="text-slate-600 text-xs">›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
