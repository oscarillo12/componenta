import SellerLayout from '@/components/SellerLayout'
import { Check, Zap, Star, Shield, BarChart3, Globe } from 'lucide-react'

const features: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: 'Publicación de repuestos',        free: '5 piezas',    pro: 'Ilimitadas'       },
  { label: 'Identificación con IA',           free: true,          pro: true               },
  { label: 'Visibilidad en Componenta.cl',    free: 'Básica',      pro: 'Destacada'        },
  { label: 'Dashboard de ventas y métricas',  free: 'Acotado',     pro: 'Completo'         },
  { label: 'Pedidos online con envío',        free: true,          pro: true               },
  { label: 'Página web personalizada',        free: false,         pro: true               },
  { label: 'Catalogación presencial IA',      free: false,         pro: 'Incluido'         },
  { label: 'Publicidad en Facebook Marketplace', free: false,      pro: 'Addon +$10 USD'  },
  { label: 'Soporte prioritario',             free: false,         pro: true               },
]

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === false) return <span style={{ fontSize: 14, color: '#d1d5db' }}>—</span>
  if (value === true)  return <Check size={15} color="#1d4ed8" style={{ display: 'block', margin: '0 auto' }} />
  return <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{value}</span>
}

export default function PlanesPage() {
  return (
    <SellerLayout section="planes">

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Planes</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Elige el plan que mejor se adapta a tu negocio</p>
      </div>

      <div style={{ maxWidth: 720 }}>

        {/* Cards de planes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 24 }}>

          {/* Gratuito */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 8px' }}>Gratuito</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: '#111827', lineHeight: 1 }}>$0</span>
              <span style={{ fontSize: 13, color: '#9ca3af', paddingBottom: 4 }}>/mes</span>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px' }}>Para probar la plataforma</p>
            <div style={{ height: 1, background: '#f3f4f6', marginBottom: 18 }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Hasta 5 repuestos publicados', 'Identificación con IA incluida', 'Recibe pedidos online'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#374151' }}>
                  <Check size={14} color="#1d4ed8" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
              Plan actual
            </div>
          </div>

          {/* Pro */}
          <div style={{ background: 'linear-gradient(160deg,#1d4ed8,#2563eb)', borderRadius: 20, padding: 24, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(29,78,216,0.35)' }}>
            <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
              <Star size={11} /> Recomendado
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6, margin: '0 0 8px' }}>Pro</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>USD $20</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingBottom: 4 }}>/mes</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>Para desarmadurías activas</p>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 18 }} />
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Repuestos ilimitados',
                'Visibilidad destacada en buscador',
                'Página web en componenta.cl',
                'Dashboard completo con métricas',
                'Catalogación presencial incluida',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                  <Check size={14} color="#fff" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <button style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: '#fff', color: '#1d4ed8', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Zap size={14} /> Contratar Plan Pro
            </button>
          </div>
        </div>

        {/* Tabla comparativa */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '12px 20px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Funcionalidad</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Gratuito</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Pro</span>
          </div>
          {features.map((f, i) => (
            <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '11px 20px', borderTop: i > 0 ? '1px solid #f9fafb' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>{f.label}</span>
              <div style={{ textAlign: 'center' }}><FeatureValue value={f.free} /></div>
              <div style={{ textAlign: 'center' }}><FeatureValue value={f.pro} /></div>
            </div>
          ))}
        </div>

        {/* Info adicional */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginTop: 16 }}>
          {[
            { icon: Shield, label: 'Sin permanencia', sub: 'Cancela cuando quieras' },
            { icon: BarChart3, label: 'Analytics completo', sub: 'Vistas, región y conversión' },
            { icon: Globe, label: 'Multi-canal', sub: 'ML, WhatsApp y Componenta' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#1d4ed8" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
          Catalogación presencial disponible en Temuco · Addon Facebook Marketplace: +USD $10/mes
        </p>
      </div>
    </SellerLayout>
  )
}
