'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ChevronRight, Package } from 'lucide-react'
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

  useEffect(() => {
    const roomIds = new Set(conversations.map(c => c.roomId))

    // Supabase Realtime: actualiza inbox cuando llega mensaje nuevo
    const channel = supabaseClient
      .channel('inbox-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          if (roomIds.has(payload.new.room_id as string)) {
            router.refresh()
          }
        }
      )
      .subscribe()

    // Polling cada 30s como respaldo
    const poll = setInterval(() => router.refresh(), 30_000)

    return () => {
      supabaseClient.removeChannel(channel)
      clearInterval(poll)
    }
  }, [router, conversations])

  function formatFecha(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  if (conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <MessageCircle size={28} color="#79C0FF" />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>Sin mensajes aún</p>
        <p style={{ fontSize: 14, color: '#8B949E', margin: 0 }}>
          Cuando alguien consulte por una de tus piezas en el marketplace, la conversación aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#E6EDF3', margin: '0 0 4px' }}>Mensajes</h1>
        <p style={{ fontSize: 13, color: '#8B949E', margin: 0 }}>
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''} activa{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {conversations.map(conv => {
          const isFromBuyer = conv.lastMsg && conv.lastMsg.user_id !== sellerId
          const chatUrl = `/chat/directo?room=${conv.roomId}&pieza=${encodeURIComponent(conv.pieza)}&vendedor=Mi+tienda`

          return (
            <Link
              key={conv.productId}
              href={chatUrl}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: '#161B22', border: '1.5px solid rgba(255,255,255,0.07)', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,139,253,0.4)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              {/* Imagen o icono */}
              <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', background: '#21262D', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {conv.imagen_url
                  ? <img src={conv.imagen_url} alt={conv.pieza} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={22} color="#6E7681" />
                }
                {isFromBuyer && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#388BFD', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    !
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 70px)' }}>
                    {conv.pieza}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    {conv.lastMsg && (
                      <span style={{ fontSize: 11, color: '#6E7681' }}>{formatFecha(conv.lastMsg.created_at)}</span>
                    )}
                    <span style={{ fontSize: 10, color: conv.disponible ? '#3FB950' : '#8B949E', fontWeight: 600, background: conv.disponible ? 'rgba(63,185,80,0.12)' : '#21262D', padding: '1px 6px', borderRadius: 10 }}>
                      {conv.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 12, color: isFromBuyer ? '#A5D6FF' : '#8B949E', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: isFromBuyer ? 600 : 400 }}>
                    {conv.lastMsg
                      ? `${conv.lastMsg.user_id === sellerId ? 'Tú: ' : conv.lastMsg.user_name + ': '}${conv.lastMsg.content}`
                      : 'Sin mensajes'}
                  </p>
                  <span style={{ fontSize: 11, color: '#6E7681', flexShrink: 0 }}>{conv.msgCount} msg</span>
                </div>

                <p style={{ fontSize: 11, color: '#6E7681', margin: '3px 0 0' }}>
                  ${conv.precio.toLocaleString('es-CL')}
                </p>
              </div>

              <ChevronRight size={16} color="#6E7681" style={{ flexShrink: 0 }} />
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(56,139,253,0.08)', borderRadius: 12, border: '1px solid rgba(56,139,253,0.2)' }}>
        <p style={{ fontSize: 12, color: '#79C0FF', margin: 0 }}>
          💡 <strong>Tip:</strong> Los mensajes marcados con <span style={{ color: '#388BFD', fontWeight: 700 }}>!</span> son consultas nuevas de compradores. Responde rápido para aumentar tus ventas.
        </p>
      </div>
    </div>
  )
}
