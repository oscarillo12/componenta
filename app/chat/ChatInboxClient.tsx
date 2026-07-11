'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ChevronRight, Package, RefreshCw } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase'

interface Conversation {
  productId:  string
  pieza:      string
  imagen_url: string | null
  disponible: boolean
  precio:     number
  roomId:     string
  lastMsg:    { content: string; user_name: string; created_at: string; user_id: string } | null
  msgCount:   number
}

export default function ChatInboxClient({ conversations, sellerId }: { conversations: Conversation[]; sellerId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justUpdated, setJustUpdated] = useState(false)

  function refresh() {
    startTransition(() => router.refresh())
    setJustUpdated(true)
    setTimeout(() => setJustUpdated(false), 1800)
  }

  useEffect(() => {
    const roomIds = new Set(conversations.map(c => c.roomId))

    const channel = supabaseClient
      .channel('inbox-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          if (roomIds.has(payload.new.room_id as string)) refresh()
        }
      )
      .subscribe()

    const poll = setInterval(refresh, 30_000)

    return () => {
      supabaseClient.removeChannel(channel)
      clearInterval(poll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, conversations])

  function formatFecha(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diffMin < 60)  return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24)    return `${diffH}h`
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  if (conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#eff6ff', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <MessageCircle size={28} color="#1d4ed8" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Sin mensajes aún</p>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          Cuando alguien consulte por una de tus piezas en el marketplace, la conversación aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Mensajes</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''} activa{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 20,
          color: justUpdated ? '#15803d' : '#9ca3af',
          background: justUpdated ? '#eefbf2' : 'transparent',
          border: `1px solid ${justUpdated ? '#a7f3d0' : 'transparent'}`,
          transition: 'all 0.2s', whiteSpace: 'nowrap', marginTop: 2,
        }}>
          <RefreshCw size={12} style={isPending ? { animation: 'spin 0.8s linear infinite' } : undefined} />
          {isPending ? 'Actualizando…' : justUpdated ? 'Al día' : 'En vivo'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {conversations.map(conv => {
          const isFromBuyer = conv.lastMsg && conv.lastMsg.user_id !== sellerId
          const chatUrl = `/chat/directo?room=${conv.roomId}&pieza=${encodeURIComponent(conv.pieza)}&vendedor=Mi+tienda`

          return (
            <Link
              key={conv.productId}
              href={chatUrl}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: '#fff', border: `1.5px solid ${isFromBuyer ? '#bfdbfe' : '#e5e7eb'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1d4ed8'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(29,78,216,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isFromBuyer ? '#bfdbfe' : '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {conv.imagen_url
                  ? <img src={conv.imagen_url} alt={conv.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={20} color="#9ca3af" />
                }
                {isFromBuyer && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#1d4ed8', color: '#fff', fontSize: 9, fontWeight: 800, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
                    !
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 80px)' }}>
                    {conv.pieza}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    {conv.lastMsg && (
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatFecha(conv.lastMsg.created_at)}</span>
                    )}
                    <span style={{ fontSize: 10, color: conv.disponible ? '#15803d' : '#9ca3af', fontWeight: 600, background: conv.disponible ? '#eefbf2' : '#f3f4f6', padding: '1px 7px', borderRadius: 10 }}>
                      {conv.disponible ? 'Disponible' : 'Vendida'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 12, color: isFromBuyer ? '#1d4ed8' : '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: isFromBuyer ? 600 : 400 }}>
                    {conv.lastMsg
                      ? `${conv.lastMsg.user_id === sellerId ? 'Tú: ' : conv.lastMsg.user_name + ': '}${conv.lastMsg.content}`
                      : 'Sin mensajes'}
                  </p>
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{conv.msgCount} msg</span>
                </div>

                <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0', fontWeight: 500 }}>
                  ${conv.precio.toLocaleString('es-CL')}
                </p>
              </div>

              <ChevronRight size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 14, padding: '12px 16px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
        <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>
          💡 <strong>Tip:</strong> Los mensajes marcados con <strong>!</strong> son consultas nuevas de compradores. Responde rápido para aumentar tus ventas.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
