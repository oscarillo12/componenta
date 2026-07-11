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

        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#E6EDF3', margin: '0 0 8px' }}>Política de Privacidad</h1>
        <p style={{ fontSize: 13, color: '#6E7681', margin: '0 0 40px' }}>Última actualización: julio 2025 · Ley N° 19.628 sobre Protección de la Vida Privada</p>

        {[
          {
            title: '1. Responsable del tratamiento',
            content: 'Componenta SpA, con domicilio en Temuco, Región de La Araucanía, Chile, es responsable del tratamiento de los datos personales recopilados a través de la Plataforma (componenta.vercel.app). Contacto: soporte@componenta.cl',
          },
          {
            title: '2. Datos que recopilamos',
            content: 'Recopilamos: (a) Datos de registro: nombre, correo electrónico, número de teléfono; (b) Datos de uso: interacciones con la plataforma, piezas publicadas, pedidos realizados; (c) Datos de pago: procesados directamente por Flow — Componenta no almacena datos de tarjetas; (d) Datos técnicos: dirección IP, tipo de navegador, páginas visitadas; (e) Datos de geolocalización aproximada derivados de la IP para analytics de región.',
          },
          {
            title: '3. Finalidad del tratamiento',
            content: 'Usamos tus datos para: (a) Proveer y mejorar los servicios de la Plataforma; (b) Procesar transacciones y enviar confirmaciones; (c) Enviar notificaciones operativas por WhatsApp (pedidos, estados); (d) Mostrar analíticas de visitas a los vendedores; (e) Cumplir obligaciones legales; (f) Prevenir fraudes y usos no autorizados.',
          },
          {
            title: '4. Base legal del tratamiento',
            content: 'El tratamiento de datos se realiza con base en: (a) La ejecución del contrato de servicios aceptado al registrarte; (b) Tu consentimiento para comunicaciones de marketing (siempre revocable); (c) El cumplimiento de obligaciones legales aplicables en Chile.',
          },
          {
            title: '5. Compartición de datos',
            content: 'No vendemos tus datos personales. Podemos compartirlos con: (a) Flow, para procesar pagos; (b) Twilio, para enviar notificaciones por WhatsApp; (c) Supabase, como proveedor de base de datos; (d) Clerk, para autenticación; (e) MercadoLibre, cuando el vendedor autoriza publicación en esa plataforma. Todos los proveedores están sujetos a acuerdos de confidencialidad.',
          },
          {
            title: '6. Transferencias internacionales',
            content: 'Algunos proveedores de servicios operan fuera de Chile (EE.UU.). En esos casos, adoptamos medidas contractuales adecuadas para proteger tus datos conforme a la Ley N° 19.628.',
          },
          {
            title: '7. Retención de datos',
            content: 'Conservamos tus datos mientras mantengas una cuenta activa y por el período adicional exigido por la ley (mínimo 6 años para registros comerciales). Los datos de analytics se conservan por 12 meses.',
          },
          {
            title: '8. Tus derechos',
            content: 'Conforme a la Ley N° 19.628 tienes derecho a: (a) Acceder a tus datos personales; (b) Rectificar datos inexactos; (c) Cancelar o eliminar tus datos; (d) Oponerte al tratamiento. Para ejercer estos derechos escríbenos a soporte@componenta.cl con asunto "Derechos ARCO". Responderemos en un plazo máximo de 10 días hábiles.',
          },
          {
            title: '9. Cookies y tecnologías similares',
            content: 'Usamos cookies esenciales para la autenticación y el funcionamiento de la Plataforma. No usamos cookies de rastreo publicitario de terceros. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad.',
          },
          {
            title: '10. Seguridad',
            content: 'Implementamos medidas técnicas y organizativas razonables para proteger tus datos: cifrado en tránsito (HTTPS), control de acceso basado en roles y auditoría de accesos. Sin embargo, ningún sistema es 100% seguro.',
          },
          {
            title: '11. Menores de edad',
            content: 'La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores.',
          },
          {
            title: '12. Cambios a esta política',
            content: 'Podemos actualizar esta Política. Te notificaremos por email con al menos 15 días de anticipación ante cambios sustanciales. La versión vigente siempre estará disponible en componenta.vercel.app/privacidad.',
          },
          {
            title: '13. Contacto',
            content: 'Para consultas sobre privacidad o para ejercer tus derechos: soporte@componenta.cl',
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>{title}</h2>
            <p style={{ fontSize: 14, color: '#8B949E', margin: 0, lineHeight: 1.75 }}>{content}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 20 }}>
          <Link href="/terminos" style={{ fontSize: 13, color: '#388BFD', textDecoration: 'none' }}>Términos de Servicio</Link>
          <Link href="/marketplace" style={{ fontSize: 13, color: '#388BFD', textDecoration: 'none' }}>Marketplace</Link>
        </div>
      </div>
    </div>
  )
}
