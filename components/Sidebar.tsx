'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, BarChart2, Package, CreditCard, ShoppingBag, UserCircle, Store, MessageCircle } from 'lucide-react'

const navItems = [
  { icon: Plus,          href: '/',           label: 'Nuevo ingreso' },
  { icon: LayoutGrid,    href: '/inventario', label: 'Inventario' },
  { icon: Package,       href: '/pedidos',    label: 'Pedidos' },
  { icon: BarChart2,     href: '/dashboard',  label: 'Dashboard' },
  { icon: MessageCircle, href: '/chat',       label: 'Chat' },
  { icon: CreditCard,    href: '/planes',     label: 'Planes' },
  { icon: UserCircle,    href: '/cuenta',     label: 'Mi cuenta' },
  { icon: Store,         href: '/mi-tienda',  label: 'Mi tienda' },
]

const bottomItems = [
  { icon: ShoppingBag, href: '/marketplace', label: 'Marketplace' },
]

const mobileItems = [
  { icon: Plus,          href: '/',            label: 'Nuevo' },
  { icon: LayoutGrid,    href: '/inventario',  label: 'Inventario' },
  { icon: Package,       href: '/pedidos',     label: 'Pedidos' },
  { icon: MessageCircle, href: '/chat',        label: 'Chat' },
  { icon: ShoppingBag,   href: '/marketplace', label: 'Market' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [unread, setUnread] = useState(0)

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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside
        style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}
        className="hidden sm:flex w-16 min-h-screen flex-col items-center pt-4 pb-6 fixed left-0 top-0 z-50"
      >
        <Link
          href="/"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
        >
          C
        </Link>

        <nav className="flex flex-col items-center gap-1 mt-6 flex-1">
          {navItems.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              href={href}
              title={label}
              style={isActive(href)
                ? { background: '#eff6ff', color: '#1d4ed8' }
                : { color: '#9ca3af' }}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all relative hover:bg-gray-100 hover:text-gray-600"
            >
              <Icon size={18} />
              {href === '/pedidos' && unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-1">
          {bottomItems.map(({ icon: Icon, href, label }) => (
            <Link
              key={href}
              href={href}
              title={label}
              style={isActive(href)
                ? { background: '#eff6ff', color: '#1d4ed8' }
                : { color: '#9ca3af' }}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
            >
              <Icon size={18} />
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Barra inferior móvil ── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
        style={{ background: '#fff', borderTop: '1px solid #e5e7eb', height: 64 }}
      >
        {mobileItems.map(({ icon: Icon, href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
            style={{ color: isActive(href) ? '#1d4ed8' : '#9ca3af', textDecoration: 'none' }}
          >
            <Icon size={22} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
            {href === '/pedidos' && unread > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  )
}
