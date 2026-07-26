'use client'

type LogoProps = {
  variant?: 'icon' | 'full'
  size?: 'sm' | 'md' | 'lg'
  bg?: string
}

export function CompLogo({ variant = 'full', size = 'md', bg = '#fff' }: LogoProps) {
  const textSize  = size === 'sm' ? 13 : size === 'md' ? 16 : 19
  const circSize  = size === 'sm' ? 10 : size === 'md' ? 13 : 15
  const dotSize   = size === 'sm' ? 3.5 : size === 'md' ? 4.5 : 5

  if (variant === 'icon') {
    const box   = size === 'sm' ? 28 : size === 'md' ? 36 : 42
    const ring  = size === 'sm' ? 13 : size === 'md' ? 17 : 21
    const dot   = size === 'sm' ? 5  : size === 'md' ? 6.5 : 8
    return (
      <div style={{
        width: box, height: box, flexShrink: 0,
        background: '#16181d', borderRadius: Math.round(box * 0.28),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'relative', width: ring, height: ring, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: dot, height: dot, borderRadius: '50%', background: '#16181d', transform: 'translate(-50%,-50%)' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 900, fontSize: textSize, color: '#16181d', letterSpacing: -0.5, lineHeight: 1 }}>comp</span>
      <span style={{ position: 'relative', display: 'inline-flex', width: circSize, height: circSize, margin: '0 1px', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }} />
        <span style={{ position: 'relative', width: dotSize, height: dotSize, borderRadius: '50%', background: bg, flexShrink: 0 }} />
      </span>
      <span style={{ fontWeight: 900, fontSize: textSize, color: '#16181d', letterSpacing: -0.5, lineHeight: 1 }}>nenta</span>
    </div>
  )
}
