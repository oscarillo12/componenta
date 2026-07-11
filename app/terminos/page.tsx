import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Componenta',
}

export default function TerminosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif', color: '#CDD9E5' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        <Link href="/" style={{ fontSize: 13, color: '#388BFD', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← Volver
        </Link>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#E6EDF3', margin: '0 0 10px', letterSpacing: -0.5 }}>Términos de Servicio</h1>
        <p style={{ fontSize: 13, color: '#6E7681', margin: '0 0 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FB950', display: 'inline-block' }} />
          Última actualización: julio 2025
        </p>

        <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', marginBottom: 40 }}>
          <p style={{ fontSize: 13, color: '#8B949E', margin: 0, lineHeight: 1.65 }}>
            Este documento describe las reglas de uso de la plataforma Componenta, aplicables a vendedores y compradores. Léelo con atención antes de publicar o comprar repuestos.
          </p>
        </div>

        {[
          {
            title: 'Aceptación de los términos',
            content: 'Al acceder o usar la plataforma Componenta ("la Plataforma"), operada por Componenta SpA, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no puedes usar la Plataforma.',
          },
          {
            title: 'Descripción del servicio',
            content: 'Componenta es un marketplace digital que conecta desarmadurías y vendedores de repuestos automotrices usados con compradores en Chile. La Plataforma proporciona herramientas para publicar, buscar y adquirir repuestos, incluyendo integración con sistemas de pago, notificaciones por WhatsApp y publicación en canales externos.',
          },
          {
            title: 'Registro y cuenta',
            content: 'Para usar ciertas funcionalidades debes crear una cuenta con información veraz y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente ante cualquier uso no autorizado.',
          },
          {
            title: 'Responsabilidades del vendedor',
            content: 'Los vendedores se comprometen a: (a) publicar solo repuestos de los que sean propietarios legítimos; (b) describir con exactitud el estado y las características de cada pieza; (c) cumplir con la Ley del Consumidor chilena (Ley N° 19.496); (d) procesar y despachar los pedidos en los plazos acordados; (e) mantener actualizado su inventario.',
          },
          {
            title: 'Comisiones y pagos',
            content: 'Componenta cobra una comisión del 6% sobre el valor total de cada transacción completada (pieza + envío). Los pagos son procesados por Flow, plataforma de pagos autorizada en Chile. Componenta no almacena datos de tarjetas de crédito.',
          },
          {
            title: 'Plan gratuito y plan Pro',
            content: 'El plan gratuito permite publicar hasta 5 repuestos simultáneamente. El plan Pro ofrece publicaciones ilimitadas y funciones adicionales. Los precios y beneficios pueden modificarse con 30 días de aviso previo.',
          },
          {
            title: 'Conducta prohibida',
            content: 'Está prohibido: (a) publicar repuestos robados o de procedencia ilícita; (b) realizar transacciones fuera de la plataforma para evadir comisiones; (c) manipular precios o reseñas; (d) usar la Plataforma para actividades ilegales; (e) hacer scraping o uso automatizado sin autorización.',
          },
          {
            title: 'Limitación de responsabilidad',
            content: 'Componenta actúa como intermediario y no es parte de las transacciones entre compradores y vendedores. No garantizamos la calidad, seguridad o legalidad de los repuestos publicados. En ningún caso nuestra responsabilidad total superará el monto de la última transacción involucrada.',
          },
          {
            title: 'Modificaciones',
            content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones significativas serán notificadas con al menos 15 días de anticipación por email. El uso continuo de la Plataforma constituye aceptación de los términos modificados.',
          },
          {
            title: 'Ley aplicable',
            content: 'Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será sometida a los tribunales ordinarios de justicia de la ciudad de Temuco, Región de La Araucanía.',
          },
          {
            title: 'Contacto',
            content: 'Para consultas sobre estos términos, contáctanos en soporte@componenta.cl',
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
          <Link href="/privacidad" style={{ fontSize: 13, fontWeight: 600, color: '#79C0FF', textDecoration: 'none', background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.2)', padding: '9px 16px', borderRadius: 10 }}>Política de Privacidad →</Link>
          <Link href="/marketplace" style={{ fontSize: 13, fontWeight: 600, color: '#8B949E', textDecoration: 'none', background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 16px', borderRadius: 10 }}>Marketplace →</Link>
        </div>
      </div>
    </div>
  )
}
