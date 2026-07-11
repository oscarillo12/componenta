'use client'

import { Bell } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

interface SellerLayoutProps {
  children: React.ReactNode
  section: string
}

export default function SellerLayout({ children, section }: SellerLayoutProps) {
  const { user } = useUser()
  const [unread, setUnread] = useState(0)
  const [bellHover, setBellHover] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    function loadUnread() {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => setUnread((d.notifications ?? []).filter((n: { leida: boolean }) => !n.leida).length))
        .catch(() => {})
    }
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

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
            <Link
              href="/pedidos"
              title="Notificaciones"
              onMouseEnter={() => setBellHover(true)}
              onMouseLeave={() => setBellHover(false)}
              style={{
                width: 32, height: 32, borderRadius: 8, position: 'relative',
                background: bellHover ? '#eff6ff' : '#f3f4f6',
                border: `1px solid ${bellHover ? '#bfdbfe' : '#e5e7eb'}`,
                color: bellHover ? '#1d4ed8' : '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <Bell size={15} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3, minWidth: 15, height: 15, padding: '0 3px',
                  borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </div>
        </header>
        <main style={{ padding: '20px 20px 80px', maxWidth: 1200, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>{children}</main>
      </div>
    </div>
  )
}
