'use client'

import { useState } from 'react'
import { CarZone } from '@/lib/types'

export const CAR_ZONES: CarZone[] = [
  { id: 'motor',       label: 'Motor',               icon: '⚙️', keywords: ['motor', 'bomba', 'culata', 'radiador', 'correa', 'pistón', 'filtro aceite', 'combustible'] },
  { id: 'electrico',   label: 'Sistema Eléctrico',   icon: '⚡', keywords: ['alternador', 'batería', 'sensor', 'módulo', 'ecu', 'bobina', 'faro', 'arranque'] },
  { id: 'suspension-d',label: 'Suspensión Delantera', icon: '🔩', keywords: ['amortiguador', 'resorte', 'muelle', 'rótula', 'barra', 'manga'] },
  { id: 'suspension-t',label: 'Suspensión Trasera',  icon: '🔩', keywords: ['amortiguador trasero', 'resorte trasero', 'brazo', 'tensor'] },
  { id: 'frenos',      label: 'Frenos',              icon: '🛑', keywords: ['disco', 'pastilla', 'cáliper', 'bomba freno', 'abs', 'tambor'] },
  { id: 'transmision', label: 'Transmisión',         icon: '⚙️', keywords: ['caja cambios', 'embrague', 'diferencial', 'cardan', 'palier', 'clutch'] },
  { id: 'interior',    label: 'Interior',            icon: '🪑', keywords: ['asiento', 'tapicería', 'tablero', 'volante', 'airbag', 'panel', 'espejo', 'palanca'] },
  { id: 'maletero',    label: 'Maletero',            icon: '📦', keywords: ['portón', 'compuerta', 'seguro', 'puerta trasera', 'maletero'] },
  { id: 'escape',      label: 'Escape',              icon: '💨', keywords: ['silenciador', 'catalizador', 'tubo escape', 'colector', 'sonda lambda'] },
]

interface Props {
  selectedZone: string | null
  onZoneSelect: (id: string) => void
}

export default function CarIllustration({ selectedZone, onZoneSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const fill = (id: string) => {
    if (selectedZone === id) return 'rgba(22,163,74,0.32)'
    if (hovered === id) return 'rgba(22,163,74,0.14)'
    return 'rgba(255,255,255,0.03)'
  }

  const stroke = (id: string) => {
    if (selectedZone === id) return '#1A56DB'
    if (hovered === id) return 'rgba(22,163,74,0.5)'
    return 'rgba(255,255,255,0.08)'
  }

  const sw = (id: string) => (selectedZone === id ? 2.5 : 1.5)

  const zp = (id: string) => ({
    fill: fill(id),
    stroke: stroke(id),
    strokeWidth: sw(id),
    style: { cursor: 'pointer', transition: 'fill 0.18s ease, stroke 0.18s ease' } as React.CSSProperties,
    onClick: () => onZoneSelect(id),
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
  })

  return (
    <svg viewBox="0 0 560 220" className="w-full select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="280" cy="212" rx="228" ry="7" fill="#064e3b" opacity="0.35" />

      {/* ── CAR BODY ── */}
      {/* Hood */}
      <path d="M 45,162 L 45,118 L 84,97 L 163,81 L 166,162 Z" fill="#1e293b" />
      {/* Front bumper */}
      <path d="M 27,162 L 45,162 L 45,130 L 37,135 Q 26,146 26,162 Z" fill="#334155" />
      <rect x="23" y="154" width="24" height="9" rx="3" fill="#6E7681" />
      {/* Cabin */}
      <path d="M 166,162 L 166,36 L 398,36 L 401,162 Z" fill="#1e293b" />
      {/* Trunk */}
      <path d="M 401,162 L 401,85 L 450,87 L 520,120 L 520,162 Z" fill="#1e293b" />
      {/* Rear bumper */}
      <path d="M 520,162 L 535,162 Q 537,153 532,144 L 520,132 Z" fill="#334155" />
      <rect x="520" y="154" width="20" height="9" rx="3" fill="#6E7681" />
      {/* Bottom sill */}
      <rect x="45" y="156" width="475" height="8" rx="2" fill="#0f172a" />

      {/* Windshield */}
      <path d="M 169,160 L 180,39 L 274,39 L 277,160 Z" fill="#38bdf8" opacity="0.22" />
      {/* A-pillar */}
      <rect x="274" y="36" width="9" height="126" fill="#1e293b" />
      {/* Front door window */}
      <rect x="284" y="39" width="84" height="121" rx="1" fill="#38bdf8" opacity="0.22" />
      {/* B-pillar */}
      <rect x="369" y="36" width="9" height="126" fill="#1e293b" />
      {/* Rear window */}
      <rect x="379" y="39" width="19" height="121" rx="1" fill="#38bdf8" opacity="0.22" />
      {/* Roof */}
      <rect x="166" y="33" width="235" height="6" rx="2.5" fill="#0f172a" />

      {/* Headlights */}
      <rect x="37" y="106" width="27" height="12" rx="3.5" fill="#fef08a" />
      <rect x="37" y="120" width="27" height="7" rx="2" fill="#fef9c3" opacity="0.4" />
      <rect x="44" y="144" width="18" height="8" rx="2.5" fill="#fed7aa" opacity="0.65" />
      {/* Taillights */}
      <rect x="508" y="124" width="16" height="24" rx="3" fill="#fca5a5" />

      {/* Front wheel arch */}
      <path d="M 86,162 Q 86,191 118,200 Q 150,209 180,200 Q 210,190 210,162 Z" fill="#0f172a" />
      <circle cx="146" cy="189" r="31" fill="#111827" />
      <circle cx="146" cy="189" r="21" fill="#374151" />
      <circle cx="146" cy="189" r="9"  fill="#6b7280" />
      <line x1="146" y1="168" x2="146" y2="210" stroke="#4b5563" strokeWidth="2" />
      <line x1="125" y1="189" x2="167" y2="189" stroke="#4b5563" strokeWidth="2" />
      <line x1="131" y1="174" x2="161" y2="204" stroke="#4b5563" strokeWidth="1.5" />
      <line x1="161" y1="174" x2="131" y2="204" stroke="#4b5563" strokeWidth="1.5" />

      {/* Rear wheel arch */}
      <path d="M 379,162 Q 379,191 411,200 Q 443,209 473,200 Q 502,190 502,162 Z" fill="#0f172a" />
      <circle cx="424" cy="189" r="31" fill="#111827" />
      <circle cx="424" cy="189" r="21" fill="#374151" />
      <circle cx="424" cy="189" r="9"  fill="#6b7280" />
      <line x1="424" y1="168" x2="424" y2="210" stroke="#4b5563" strokeWidth="2" />
      <line x1="403" y1="189" x2="445" y2="189" stroke="#4b5563" strokeWidth="2" />
      <line x1="409" y1="174" x2="439" y2="204" stroke="#4b5563" strokeWidth="1.5" />
      <line x1="439" y1="174" x2="409" y2="204" stroke="#4b5563" strokeWidth="1.5" />

      {/* Door handles */}
      <rect x="320" y="110" width="20" height="4" rx="2" fill="#6E7681" />
      <rect x="383" y="110" width="12" height="4" rx="2" fill="#6E7681" />
      {/* Exhaust */}
      <rect x="465" y="159" width="24" height="5" rx="2.5" fill="#6b7280" />

      {/* ── INTERACTIVE ZONES ── */}
      {/* Motor */}
      <path d="M 36,95 L 36,162 L 166,162 L 166,77 L 96,77 Z" rx="4" {...zp('motor')} />
      {/* Eléctrico (top cabin strip) */}
      <rect x="166" y="33" width="235" height="52" rx="4" {...zp('electrico')} />
      {/* Interior */}
      <rect x="166" y="85" width="235" height="73" rx="3" {...zp('interior')} />
      {/* Maletero */}
      <path d="M 401,85 L 401,162 L 520,162 L 520,118 L 450,85 Z" {...zp('maletero')} />
      {/* Suspensión delantera */}
      <ellipse cx="146" cy="179" rx="58" ry="30" {...zp('suspension-d')} />
      {/* Suspensión trasera */}
      <ellipse cx="424" cy="179" rx="58" ry="30" {...zp('suspension-t')} />
      {/* Transmisión */}
      <rect x="166" y="154" width="235" height="18" rx="2" {...zp('transmision')} />
      {/* Escape */}
      <rect x="362" y="154" width="158" height="18" rx="2" {...zp('escape')} />
      {/* Frenos (wheels) */}
      <circle cx="146" cy="189" r="23" {...zp('frenos')} />
      <circle cx="424" cy="189" r="23" {...zp('frenos')} />

      {/* Selected zone glow overlay */}
      {selectedZone === 'motor'        && <path d="M 36,95 L 36,162 L 166,162 L 166,77 L 96,77 Z" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'electrico'    && <rect x="166" y="33" width="235" height="52" rx="4" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'interior'     && <rect x="166" y="85" width="235" height="73" rx="3" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'maletero'     && <path d="M 401,85 L 401,162 L 520,162 L 520,118 L 450,85 Z" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'suspension-d' && <ellipse cx="146" cy="179" rx="58" ry="30" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'suspension-t' && <ellipse cx="424" cy="179" rx="58" ry="30" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'transmision'  && <rect x="166" y="154" width="235" height="18" rx="2" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'escape'       && <rect x="362" y="154" width="158" height="18" rx="2" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" />}
      {selectedZone === 'frenos'       && <><circle cx="146" cy="189" r="23" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" /><circle cx="424" cy="189" r="23" fill="none" stroke="#1A56DB" strokeWidth="2.5" opacity="0.6" filter="url(#glow)" /></>}

      {/* Zone labels */}
      {selectedZone === 'motor'        && <text x="96"  y="126" textAnchor="middle" fill="#79C0FF" fontSize="10" fontWeight="700">Motor</text>}
      {selectedZone === 'electrico'    && <text x="283" y="64"  textAnchor="middle" fill="#79C0FF" fontSize="10" fontWeight="700">Eléctrico</text>}
      {selectedZone === 'interior'     && <text x="283" y="125" textAnchor="middle" fill="#79C0FF" fontSize="10" fontWeight="700">Interior</text>}
      {selectedZone === 'maletero'     && <text x="460" y="130" textAnchor="middle" fill="#79C0FF" fontSize="10" fontWeight="700">Maletero</text>}
      {selectedZone === 'suspension-d' && <text x="146" y="177" textAnchor="middle" fill="#79C0FF" fontSize="9"  fontWeight="700">Susp. D</text>}
      {selectedZone === 'suspension-t' && <text x="424" y="177" textAnchor="middle" fill="#79C0FF" fontSize="9"  fontWeight="700">Susp. T</text>}
      {selectedZone === 'transmision'  && <text x="283" y="167" textAnchor="middle" fill="#79C0FF" fontSize="9"  fontWeight="700">Transmisión</text>}
      {selectedZone === 'escape'       && <text x="441" y="167" textAnchor="middle" fill="#79C0FF" fontSize="9"  fontWeight="700">Escape</text>}
      {selectedZone === 'frenos'       && <text x="146" y="187" textAnchor="middle" fill="#79C0FF" fontSize="8"  fontWeight="700">Frenos</text>}
    </svg>
  )
}
