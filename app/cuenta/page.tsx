import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SellerLayout from '@/components/SellerLayout'
import {
  User, EnvelopeSimple, Phone, CalendarBlank,
  ShieldCheck, Package, CreditCard, ArrowRight,
  Star, Lightning, Check
} from '@phosphor-icons/react/dist/ssr'

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
      <div className="max-w-2xl">

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-100">Mi cuenta</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona tu perfil, plan y datos de facturación</p>
        </div>

        {/* ── Perfil ── */}
        <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1A56DB, #166534)', padding: '24px 24px 56px', position: 'relative' }}>
            <p style={{ color: '#79C0FF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Perfil del vendedor</p>
          </div>
          {/* Avatar */}
          <div style={{ padding: '0 24px 24px', marginTop: -36 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(56,139,253,0.15)', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#A5D6FF' }}>
                {nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#E6EDF3', margin: '0 0 4px' }}>{nombre}</h2>
            <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0 }}>Vendedor en Componenta · Registrado el {fechaRegistro}</p>
          </div>

          {/* Datos */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: <EnvelopeSimple size={16} weight="fill" color="#6E7681" />, label: 'Correo electrónico', value: email },
              { icon: <Phone size={16} weight="fill" color="#6E7681" />, label: 'Teléfono', value: telefono },
              { icon: <CalendarBlank size={16} weight="fill" color="#6E7681" />, label: 'Miembro desde', value: fechaRegistro },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#B1BAC4', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#E6EDF3', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Seguridad */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} weight="fill" color="#79C0FF" />
            <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0, flex: 1 }}>
              Cuenta verificada · {user.twoFactorEnabled ? 'Verificación en 2 pasos activa' : 'Verificación en 2 pasos no configurada'}
            </p>
            <a
              href="https://accounts.clerk.dev/user"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#79C0FF', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Editar <ArrowRight size={12} />
            </a>
          </div>
        </div>

        {/* ── Plan actual ── */}
        <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isPro ? '#eff6ff' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPro ? <Star size={18} weight="fill" color="#79C0FF" /> : <Package size={18} weight="fill" color="#6E7681" />}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: '#E6EDF3', margin: 0 }}>
                  {isPro ? 'Plan Pro' : 'Prueba gratuita'}
                </p>
                <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>
                  {isPro ? 'Publicaciones ilimitadas · Página web incluida' : `${productsCount} de ${FREE_LIMIT} productos publicados`}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              background: isPro ? '#dbeafe' : '#f3f4f6',
              color: isPro ? '#1A56DB' : '#6b7280',
            }}>
              {isPro ? 'ACTIVO' : 'GRATIS'}
            </span>
          </div>

          {/* Barra de uso */}
          {!isPro && (
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3', margin: 0 }}>Productos publicados</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: usagePercent >= 100 ? '#b91c1c' : '#111827', margin: 0 }}>
                  {productsCount} / {FREE_LIMIT}
                </p>
              </div>
              <div style={{ height: 8, background: '#21262D', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${usagePercent}%`,
                  background: usagePercent >= 100 ? '#ef4444' : usagePercent >= 80 ? '#f59e0b' : '#1A56DB',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              {usagePercent >= 80 && (
                <p style={{ fontSize: 12, color: usagePercent >= 100 ? '#b91c1c' : '#b45309', margin: '8px 0 0' }}>
                  {usagePercent >= 100
                    ? '⚠️ Has alcanzado el límite gratuito. Sube a Pro para publicar más.'
                    : `⚡ Solo te quedan ${FREE_LIMIT - productsCount} publicaciones gratuitas.`}
                </p>
              )}
            </div>
          )}

          {/* Upgrade CTA */}
          {!isPro && (
            <div style={{ padding: '16px 24px' }}>
              <Link href="/planes"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: '#388BFD', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                <Lightning size={16} weight="fill" /> Subir a Plan Pro — USD $20/mes
              </Link>
            </div>
          )}
        </div>

        {/* ── Facturación ── */}
        <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.1)', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={20} weight="fill" color="#8B949E" />
            <h3 style={{ fontWeight: 700, fontSize: 15, color: '#E6EDF3', margin: 0 }}>Facturación</h3>
          </div>
          <div style={{ padding: '20px 24px' }}>
            {isPro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Plan', value: 'Pro — USD $20/mes' },
                  { label: 'Próximo cobro', value: 'No disponible aún' },
                  { label: 'Método de pago', value: 'No configurado' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#B1BAC4' }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E6EDF3' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: '#B1BAC4', margin: '0 0 16px' }}>
                  Estás en la <strong>prueba gratuita</strong>. Sin compromiso de pago.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Hasta 5 repuestos publicados',
                    'Identificación con IA incluida',
                    'Acceso al marketplace',
                    'Pedidos y WhatsApp integrado',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={14} weight="bold" color="#79C0FF" />
                      <span style={{ fontSize: 13, color: '#E6EDF3' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Zona peligrosa ── */}
        <div style={{ background: '#161B22', borderRadius: 20, border: '1.5px solid #fecaca', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#b91c1c', margin: '0 0 2px' }}>Eliminar cuenta</p>
              <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>Esta acción es permanente y no se puede deshacer</p>
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
