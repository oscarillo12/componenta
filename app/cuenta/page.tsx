import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SellerLayout from '@/components/SellerLayout'
import {
  User, Mail, Phone, Calendar,
  ShieldCheck, Package, CreditCard, ArrowRight,
  Star, Zap, Check
} from 'lucide-react'

const FREE_LIMIT = 5

export default async function CuentaPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const meta = user.publicMetadata as { productsCount?: number; plan?: string }
  const productsCount = meta.productsCount ?? 0
  const plan = meta.plan ?? 'free'
  const isPro = plan === 'pro'
  const usagePercent = Math.min((productsCount / FREE_LIMIT) * 100, 100)

  const nombre = user.fullName || user.firstName || 'Sin nombre'
  const email = user.emailAddresses[0]?.emailAddress ?? '—'
  const telefono = user.phoneNumbers[0]?.phoneNumber ?? 'No configurado'
  const fechaRegistro = new Date(user.createdAt).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <SellerLayout section="mi cuenta">
      <div style={{ maxWidth: 560 }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Mi cuenta</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Gestiona tu perfil, plan y datos de facturación</p>
        </div>

        {/* Perfil */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', padding: '20px 24px 52px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Perfil del vendedor</p>
          </div>
          <div style={{ padding: '0 24px 24px', marginTop: -36 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: '#eff6ff', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#1d4ed8' }}>
                {nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{nombre}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Vendedor en Componenta · Desde {fechaRegistro}</p>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: Mail,     label: 'Correo electrónico', value: email },
              { icon: Phone,    label: 'Teléfono',           value: telefono },
              { icon: Calendar, label: 'Miembro desde',      value: fechaRegistro },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={15} color="#6b7280" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={15} color="#1d4ed8" />
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0, flex: 1 }}>
              Cuenta verificada · {user.twoFactorEnabled ? '2FA activo' : '2FA no configurado'}
            </p>
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Editar <ArrowRight size={11} />
            </a>
          </div>
        </div>

        {/* Plan actual */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isPro ? '#eff6ff' : '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPro ? <Star size={17} color="#1d4ed8" /> : <Package size={17} color="#6b7280" />}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: '#111827', margin: 0 }}>
                  {isPro ? 'Plan Pro' : 'Prueba gratuita'}
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  {isPro ? 'Publicaciones ilimitadas · Página web incluida' : `${productsCount} de ${FREE_LIMIT} productos publicados`}
                </p>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: isPro ? '#eff6ff' : '#f3f4f6', color: isPro ? '#1d4ed8' : '#6b7280' }}>
              {isPro ? 'ACTIVO' : 'GRATIS'}
            </span>
          </div>

          {!isPro && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Productos publicados</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: usagePercent >= 100 ? '#b91c1c' : '#111827', margin: 0 }}>
                  {productsCount} / {FREE_LIMIT}
                </p>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${usagePercent}%`, background: usagePercent >= 100 ? '#ef4444' : usagePercent >= 80 ? '#f59e0b' : '#1d4ed8', transition: 'width 0.5s' }} />
              </div>
              {usagePercent >= 80 && (
                <p style={{ fontSize: 12, color: usagePercent >= 100 ? '#b91c1c' : '#b45309', margin: '8px 0 0' }}>
                  {usagePercent >= 100
                    ? 'Has alcanzado el límite gratuito. Sube a Pro para publicar más.'
                    : `Solo te quedan ${FREE_LIMIT - productsCount} publicaciones gratuitas.`}
                </p>
              )}
            </div>
          )}

          {!isPro && (
            <div style={{ padding: '16px 24px' }}>
              <Link href="/planes"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 12, background: '#1d4ed8', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                <Zap size={14} /> Subir a Plan Pro — USD $20/mes
              </Link>
            </div>
          )}

          {isPro && (
            <div style={{ padding: '14px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Piezas ilimitadas', 'Dashboard completo', 'Página web personalizada'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={13} color="#1d4ed8" />
                    <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Facturación */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={18} color="#6b7280" />
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Facturación</h3>
          </div>
          <div style={{ padding: '18px 24px' }}>
            {isPro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Plan', value: 'Pro — USD $20/mes' },
                  { label: 'Próximo cobro', value: 'No disponible aún' },
                  { label: 'Método de pago', value: 'No configurado' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px' }}>
                  Estás en la <strong style={{ color: '#111827' }}>prueba gratuita</strong>. Sin compromiso de pago.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Hasta 5 repuestos publicados',
                    'Identificación con IA incluida',
                    'Acceso al marketplace',
                    'Pedidos y WhatsApp integrado',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={13} color="#1d4ed8" />
                      <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zona peligrosa */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #fecaca', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#b91c1c', margin: '0 0 2px' }}>Eliminar cuenta</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Esta acción es permanente y no se puede deshacer</p>
            </div>
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c', textDecoration: 'none', padding: '8px 14px', border: '1.5px solid #fecaca', borderRadius: 10 }}
            >
              Gestionar →
            </a>
          </div>
        </div>

      </div>
    </SellerLayout>
  )
}
