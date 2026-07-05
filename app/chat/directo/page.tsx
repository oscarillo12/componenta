'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { Send, ArrowLeft, MessageCircle, Loader2, Phone, Store } from 'lucide-react'

interface ChatMsg {
  id: string
  room_id: string
  user_id: string
  user_name: string
  avatar_url?: string
  content: string
  created_at: string
}

function DirectChat() {
  const params   = useSearchParams()
  const room     = params.get('room') ?? 'general'
  const pieza    = params.get('pieza') ?? 'Consulta'
  const vendedor = params.get('vendedor') ?? 'Vendedor'
  const waLink   = params.get('wa') ?? null

  const { user, isLoaded } = useUser()
  const [msgs, setMsgs]             = useState<ChatMsg[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const [sendError, setSendError]   = useState('')
  const [loadingMsgs, setLoading]   = useState(true)
  const [chatError, setChatError]   = useState('')
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const inputRef                    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('room_id', room)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data, error }) => {
        if (error) setChatError('No se pudo cargar el chat.')
        if (data) setMsgs(data as ChatMsg[])
        setLoading(false)
      })

    const channel = supabaseClient
      .channel(`room-${room}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room}` },
        payload => setMsgs(prev => [...prev, payload.new as ChatMsg])
      )
      .subscribe()

    return () => { supabaseClient.removeChannel(channel) }
  }, [room])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function sendMsg() {
    if (!input.trim() || sending || !user) return
    setSending(true)
    setSendError('')
    const content = input.trim()
    setInput('')

    const { error } = await supabaseClient.from('chat_messages').insert({
      room_id:    room,
      user_id:    user.id,
      user_name:  user.fullName ?? user.firstName ?? 'Usuario',
      avatar_url: user.imageUrl ?? null,
      content,
    })

    if (error) {
      setSendError('No se pudo enviar el mensaje.')
      setInput(content)
    }
    setSending(false)
  }

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

  function colorFromId(id: string) {
    const colors = ['#388BFD','#6366f1','#8b5cf6','#db2777','#ea580c','#0891b2','#059669']
    let hash = 0
    for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
    return colors[hash]
  }

  return (
    <div className="chat-buyer-wrap" style={{ fontFamily: 'system-ui,sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'rgba(1,4,9,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 16px', height: 60, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, background: '#21262D', textDecoration: 'none', flexShrink: 0 }}>
          <ArrowLeft size={16} color="#8B949E" />
        </Link>

        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{vendedor[0]?.toUpperCase()}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Store size={12} color="#B1BAC4" />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{vendedor}</p>
          </div>
          <p style={{ fontSize: 11, color: '#B1BAC4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Pieza: {pieza}
          </p>
        </div>

        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: '#25d366', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            <Phone size={13} /> WA
          </a>
        )}
      </header>

      {/* Info pieza */}
      <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
        <div style={{ background: 'rgba(56,139,253,0.12)', border: '1.5px solid rgba(56,139,253,0.35)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={14} color="#79C0FF" />
          <p style={{ fontSize: 12, color: '#A5D6FF', fontWeight: 600, margin: 0 }}>
            Consulta sobre: <span style={{ fontWeight: 400, color: '#79C0FF' }}>{pieza}</span>
          </p>
        </div>
      </div>

      {/* ── Mensajes ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {chatError && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}>{chatError}</p>
          </div>
        )}

        {loadingMsgs && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Loader2 size={24} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loadingMsgs && !chatError && msgs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(56,139,253,0.15)', border: '1.5px solid rgba(56,139,253,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <MessageCircle size={24} color="#79C0FF" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: '0 0 6px' }}>Inicia la conversación</p>
            <p style={{ fontSize: 13, color: '#B1BAC4', margin: 0 }}>Escribe tu consulta sobre esta pieza</p>
          </div>
        )}

        {msgs.map((m, i) => {
          const isOwn   = user?.id === m.user_id
          const showName = i === 0 || msgs[i - 1].user_id !== m.user_id
          const color   = colorFromId(m.user_id)

          return (
            <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
              {!isOwn && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, visibility: showName ? 'visible' : 'hidden' }}>
                  {m.avatar_url
                    ? <img src={m.avatar_url} alt={m.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                        {m.user_name[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              )}

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                {showName && !isOwn && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#B1BAC4', paddingLeft: 2 }}>{m.user_name}</span>
                )}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: isOwn ? 'linear-gradient(135deg,#388BFD,#1F6FEB)' : '#21262D',
                  color: '#E6EDF3', fontSize: 14, lineHeight: 1.5,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
                  border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
                <span style={{ fontSize: 10, color: '#6E7681' }}>{formatHora(m.created_at)}</span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ── */}
      <div style={{ padding: '10px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, background: '#0D1117' }}>
        {!isLoaded || !user ? (
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(252,211,77,0.1)', borderRadius: 12, border: '1px solid rgba(252,211,77,0.3)' }}>
            <p style={{ fontSize: 13, color: '#fcd34d', margin: 0 }}>Inicia sesión para chatear con el vendedor</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {sendError && <p style={{ fontSize: 11, color: '#fca5a5', margin: 0 }}>{sendError}</p>}
            <input
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); setSendError('') }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
              placeholder={`Escribe a ${vendedor}…`}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 14, fontSize: 14,
                border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none',
                color: '#E6EDF3', background: '#161B22',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#388BFD')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              onClick={sendMsg}
              disabled={sending || !input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
                background: sending || !input.trim() ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#388BFD,#1F6FEB)',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {sending
                ? <Loader2 size={16} color="#6E7681" style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={16} color={!input.trim() ? '#6E7681' : '#fff'} />
              }
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function DirectChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0D1117' }}>
        <Loader2 size={32} color="#388BFD" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <DirectChat />
    </Suspense>
  )
}
