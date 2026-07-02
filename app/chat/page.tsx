'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabaseClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { Send, MessageCircle, Users, Loader2 } from 'lucide-react'

interface ChatMsg {
  id: string
  room_id: string
  user_id: string
  user_name: string
  avatar_url?: string
  content: string
  created_at: string
}

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const [msgs, setMsgs]     = useState<ChatMsg[]>([])
  const [input, setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const bottomRef           = useRef<HTMLDivElement>(null)
  const ROOM                = 'general'

  useEffect(() => {
    // Cargar mensajes anteriores
    supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('room_id', ROOM)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(
        ({ data }) => {
          if (data) setMsgs(data as ChatMsg[])
          setLoadingMsgs(false)
        },
        () => setLoadingMsgs(false)
      )

    // Suscripción en tiempo real
    const channel = supabaseClient
      .channel(`room-${ROOM}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${ROOM}` },
        payload => setMsgs(prev => [...prev, payload.new as ChatMsg])
      )
      .subscribe()

    return () => { supabaseClient.removeChannel(channel) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function sendMsg() {
    if (!input.trim() || sending || !user) return
    setSending(true)
    const content = input.trim()
    setInput('')

    await supabaseClient.from('chat_messages').insert({
      room_id:    ROOM,
      user_id:    user.id,
      user_name:  user.fullName ?? user.firstName ?? 'Usuario',
      avatar_url: user.imageUrl ?? null,
      content,
    })

    setSending(false)
  }

  function formatHora(iso: string) {
    return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  function colorFromId(id: string) {
    const colors = ['#388BFD','#6366f1','#8b5cf6','#db2777','#ea580c','#0891b2','#059669']
    let hash = 0
    for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
    return colors[hash]
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117', fontFamily: 'system-ui,sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: 64, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(1,4,9,0.96)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 32px', height: 56,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Chat Componenta</p>
            <p style={{ fontSize: 12, color: '#B1BAC4', margin: 0 }}>Sala general de la comunidad</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,139,253,0.15)', border: '1px solid rgba(56,139,253,0.4)', borderRadius: 20, padding: '4px 12px' }}>
            <Users size={13} color="#79C0FF" />
            <span style={{ fontSize: 12, color: '#A5D6FF', fontWeight: 600 }}>En línea</span>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 800, width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {loadingMsgs && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Loader2 size={24} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}

            {!loadingMsgs && msgs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageCircle size={28} color="#79C0FF" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', margin: '0 0 8px' }}>¡Sé el primero en escribir!</p>
                <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0 }}>Este es el chat general de la comunidad Componenta</p>
              </div>
            )}

            {msgs.map((m, i) => {
              const isOwn = user?.id === m.user_id
              const showAvatar = !isOwn && (i === 0 || msgs[i - 1].user_id !== m.user_id)
              const color = colorFromId(m.user_id)

              return (
                <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isOwn ? 'row-reverse' : 'row' }}>

                  {/* Avatar */}
                  {!isOwn && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, visibility: showAvatar ? 'visible' : 'hidden' }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt={m.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                            {m.user_name[0]?.toUpperCase()}
                          </div>
                      }
                    </div>
                  )}

                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    {showAvatar && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#B1BAC4', paddingLeft: 4 }}>{m.user_name}</span>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      background: isOwn ? 'linear-gradient(135deg,#388BFD,#1F6FEB)' : '#21262D',
                      color: '#E6EDF3',
                      fontSize: 14, lineHeight: 1.5,
                      boxShadow: '0 1px 8px rgba(0,0,0,0.2)',
                      border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}>
                      {m.content}
                    </div>
                    <span style={{ fontSize: 10, color: '#B1BAC4', paddingLeft: 4, paddingRight: 4 }}>{formatHora(m.created_at)}</span>
                  </div>
                </div>
              )
            })}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 0 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!isLoaded || !user ? (
              <div style={{ textAlign: 'center', padding: '12px', background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
                <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>Inicia sesión para participar en el chat</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {user.imageUrl
                    ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#388BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                        {(user.fullName ?? 'U')[0].toUpperCase()}
                      </div>
                  }
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                    placeholder="Escribe un mensaje..."
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 14,
                      border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14,
                      outline: 'none', color: '#E6EDF3', background: '#161B22',
                    }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = '#388BFD'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    onClick={sendMsg}
                    disabled={sending || !input.trim()}
                    style={{
                      width: 44, height: 44, borderRadius: 12, border: 'none',
                      background: sending || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#388BFD,#1F6FEB)',
                      cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    {sending
                      ? <Loader2 size={18} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
                      : <Send size={18} color={!input.trim() ? '#9ca3af' : '#fff'} />
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
