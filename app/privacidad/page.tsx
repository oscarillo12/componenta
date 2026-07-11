import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Componenta',
}

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif', color: '#CDD9E5' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        <Link href="/" style={{ fontSize: 13, color: '#388BFD', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← Volver
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#E6EDF3', margin: '0 0 10px', letterSpacing: -0.5 }}>Política de Privacidad</h1>
        <p style={{ fontSize: 13, color: '#6E7681', margin: '0 0 32px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FB950', display: 'inline-block' }} />
          Última actualización: julio 2025 · Ley N° 19.628 sobre Protección de la Vida Privada
        </p>

        <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: '#8B949E', margin: 0, lineHeight: 1.65 }}>
            Aquí explicamos qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos. No vendemos tu información a terceros.
          </p>
        </div>

        {[
          {
            title: 'Responsable del tratamiento',
            content: 'Componenta SpA, con domicilio en Temuco, Región de La Araucanía, Chile, es responsable del tratamiento de los datos personales recopilados a través de la Plataforma (componenta.vercel.app). Contacto: soporte@componenta.cl',
          },
          {
            title: 'Datos que recopilamos',
            content: 'Recopilamos: (a) Datos de registro: nombre, correo electrónico, número de teléfono; (b) Datos de uso: interacciones con la plataforma, piezas publicadas, pedidos realizados; (c) Datos de pago: procesados directamente por Flow — Componenta no almacena datos de tarjetas; (d) Datos técnicos: dirección IP, tipo de navegador, páginas visitadas; (e) Datos de geolocalización aproximada derivados de la IP para analytics de región.',
          },
          {
            title: 'Finalidad del tratamiento',
            content: 'Usamos tus datos para: (a) Proveer y mejorar los servicios de la Plataforma; (b) Procesar transacciones y enviar confirmaciones; (c) Enviar notificaciones operativas por WhatsApp (pedidos, estados); (d) Mostrar analíticas de visitas a los vendedores; (e) Cumplir obligaciones legales; (f) Prevenir fraudes y usos no autorizados.',
          },
          {
            title: 'Base legal del tratamiento',
            content: 'El tratamiento de datos se realiza con base en: (a) La ejecución del contrato de servicios aceptado al registrarte; (b) Tu consentimiento para comunicaciones de marketing (siempre revocable); (c) El cumplimiento de obligaciones legales aplicables en Chile.',
          },
          {
            title: 'Compartición de datos',
            content: 'No vendemos tus datos personales. Podemos compartirlos con: (a) Flow, para procesar pagos; (b) Twilio, para enviar notificaciones por WhatsApp; (c) Supabase, como proveedor de base de datos; (d) Clerk, para autenticación; (e) MercadoLibre, cuando el vendedor autoriza publicación en esa plataforma. Todos los proveedores están sujetos a acuerdos de confidencialidad.',
          },
          {
            title: 'Transferencias internacionales',
            content: 'Algunos proveedores de servicios operan fuera de Chile (EE.UU.). En esos casos, adoptamos medidas contractuales adecuadas para proteger tus datos conforme a la Ley N° 19.628.',
          },
          {
            title: 'Retención de datos',
            content: 'Conservamos tus datos mientras mantengas una cuenta activa y por el período adicional exigido por la ley (mínimo 6 años para registros comerciales). Los datos de analytics se conservan por 12 meses.',
          },
          {
            title: 'Tus derechos',
            content: 'Conforme a la Ley N° 19.628 tienes derecho a: (a) Acceder a tus datos personales; (b) Rectificar datos inexactos; (c) Cancelar o eliminar tus datos; (d) Oponerte al tratamiento. Para ejercer estos derechos escríbenos a soporte@componenta.cl con asunto "Derechos ARCO". Responderemos en un plazo máximo de 10 días hábiles.',
          },
          {
            title: 'Cookies y tecnologías similares',
            content: 'Usamos cookies esenciales para la autenticación y el funcionamiento de la Plataforma. No usamos cookies de rastreo publicitario de terceros. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad.',
          },
          {
            title: 'Seguridad',
            content: 'Implementamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado en tránsito (HTTPS), control de acceso basado en roles y auditoría de accesos. Sin embargo, ningún sistema es 100% seguro.',
          },
          {
            title: 'Menores de edad',
            content: 'La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores.',
          },
          {
            title: 'Cambios a esta política',
            content: 'Podemos actualizar esta Política. Te notificaremos por email con al menos 15 días de anticipación ante cambios sustanciales. La versión vigente siempre estará disponible en componenta.vercel.app/privacidad.',
          },
          {
            title: 'Contacto',
            content: 'Para consultas sobre privacidad o para ejercer tus derechos: soporte@componenta.cl',
          },
        ].map(({ title, content }, i) => (
          <div key={title} style={{ display: 'flex', gap: 18, padding: '22px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, background: 'rgba(56,139,253,0.12)', border: '1px solid rgba(56,139,253,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
              fontSize: 13, fontWeight: 800, color: '#79C0FF', fontVariantNumeric: 'tabular-nums',
            }}>
              {i + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px', letterSpacing: -0.2 }}>{title}</h2>
              <p style={{ fontSize: 14.5, color: '#9BA6B2', margin: 0, lineHeight: 1.75 }}>{content}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/terminos" style={{ fontSize: 13, fontWeight: 600, color: '#79C0FF', textDecoration: 'none', background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.2)', padding: '9px 16px', borderRadius: 10 }}>Términos de Servicio →</Link>
          <Link href="/marketplace" style={{ fontSize: 13, fontWeight: 600, color: '#8B949E', textDecoration: 'none', background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 16px', borderRadius: 10 }}>Marketplace →</Link>
        </div>
      </div>
    </div>
  )
}
