import { Bell } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import Sidebar from './Sidebar'

interface SellerLayoutProps {
  children: React.ReactNode
  section: string
}

export default function SellerLayout({ children, section }: SellerLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117' }}>
      <Sidebar />
      {/* sm:ml-16 = espacio para sidebar desktop; pb-16 = espacio para nav inferior móvil */}
      <div className="flex-1 sm:ml-16 pb-16 sm:pb-0">
        <header style={{
          background: 'rgba(1,4,9,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3' }}>Componenta</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontSize: 14, color: '#8B949E', textTransform: 'capitalize' }}>{section}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8B949E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Bell size={15} />
            </button>
            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </div>
        </header>
        <main style={{ padding: '24px 24px 60px', maxWidth: 1200 }}>{children}</main>
      </div>
    </div>
  )
}
