import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2a1a 0%, #1A56DB 60%, #166534 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, background: '#161B22', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <span style={{ fontWeight: 900, fontSize: 28, color: '#A5D6FF' }}>C</span>
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>Componenta</h1>
        <p style={{ color: '#79C0FF', fontSize: 14, margin: 0 }}>Registra tu desarmaduria</p>
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-sm',
            card: 'rounded-2xl shadow-2xl border-0',
            headerTitle: 'text-slate-100 font-bold',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'border border-white/10 rounded-xl font-medium hover:bg-[#21262D]/50',
            formButtonPrimary: 'bg-blue-700 hover:bg-blue-800 rounded-xl font-semibold py-2.5',
            formFieldInput: 'rounded-xl border-white/10 focus:border-blue-600 focus:ring-blue-600',
            footerActionLink: 'text-blue-700 font-semibold hover:text-blue-800',
          },
          variables: {
            colorPrimary: '#1A56DB',
            borderRadius: '12px',
          },
        }}
      />

      <p style={{ color: '#79C0FF', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        ¿Eres comprador? <a href="/marketplace" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Ir al marketplace →</a>
      </p>
    </div>
  )
}
