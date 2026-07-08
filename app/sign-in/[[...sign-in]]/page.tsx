import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="signin-grid" style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 460px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Panel de marca */}
      <div className="signin-brand" style={{
        background: '#16181d',
        padding: '52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,95,219,.25) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
            <div style={{ width: 36, height: 36, background: '#2f5fdb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>C</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Componenta</span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 32, lineHeight: 1.3, color: '#fff', margin: '0 0 16px', letterSpacing: -0.5 }}>
            Repuestos usados,<br />verificados y a un<br />clic de distancia
          </h1>
          <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.55)', margin: 0, maxWidth: 360 }}>
            Gestiona tu inventario, publica piezas en segundos con IA, y llega a compradores en toda La Araucanía.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z', text: 'Publica una pieza en 30 segundos con IA' },
            { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: 'Vendedores verificados por Componenta' },
            { d: null, text: '843+ piezas vendidas este mes' },
          ].map(({ d, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(47,95,219,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7fa2f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {d ? <path d={d} /> : <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>}
                </svg>
              </div>
              <span style={{ fontWeight: 500, fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#16181d', margin: '0 0 4px', textAlign: 'center' }}>Inicia sesión</h2>
          <p style={{ fontWeight: 500, fontSize: 13, color: '#9aa0aa', margin: '0 0 26px', textAlign: 'center' }}>Panel de vendedor Componenta</p>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 p-0 w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-[#ececea] rounded-[11px] font-semibold py-3 hover:bg-[#fafafa]',
                dividerText: 'text-[#9aa0aa]',
                dividerLine: 'bg-[#ececea]',
                formFieldLabel: 'text-[#374151] font-bold text-[11.5px]',
                formFieldInput: 'rounded-[9px] border-[#ececea] bg-[#fafafa] text-[#16181d] focus:border-[#2f5fdb] focus:ring-[#2f5fdb]',
                formButtonPrimary: 'bg-[#2f5fdb] hover:bg-[#264dc0] rounded-[11px] font-bold py-3 text-[13.5px] normal-case',
                footerActionLink: 'text-[#2f5fdb] font-bold hover:text-[#264dc0]',
                footerActionText: 'text-[#9aa0aa]',
                identityPreviewEditButton: 'text-[#2f5fdb]',
              },
              variables: {
                colorPrimary: '#2f5fdb',
                borderRadius: '9px',
                fontFamily: "'Inter', system-ui, sans-serif",
              },
            }}
          />

          <p style={{ textAlign: 'center', fontWeight: 500, fontSize: 12, color: '#9aa0aa', marginTop: 18 }}>
            ¿Eres comprador? <a href="/marketplace" style={{ color: '#16181d', fontWeight: 700, textDecoration: 'none' }}>Ir al marketplace →</a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .signin-grid { grid-template-columns: 1fr !important; }
          .signin-brand { display: none !important; }
        }
      `}</style>
    </div>
  )
}
