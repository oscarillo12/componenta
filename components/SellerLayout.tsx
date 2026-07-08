import { Bell } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import Sidebar from './Sidebar'

interface SellerLayoutProps {
  children: React.ReactNode
  section: string
}

export default function SellerLayout({ children, section }: SellerLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6f7', overflowX: 'hidden' }}>
      <Sidebar />
      <div className="flex-1 sm:ml-16 pb-16 sm:pb-0" style={{ minWidth: 0, overflowX: 'hidden' }}>
        <header className="page-header" style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>C</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Componenta</span>
            <span style={{ color: '#e5e7eb' }}>·</span>
            <span style={{ fontSize: 14, color: '#9ca3af', textTransform: 'capitalize' }}>{section}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Bell size={15} />
            </button>
            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </div>
        </header>
        <main style={{ padding: '20px 20px 80px', maxWidth: 1200, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  )
}
