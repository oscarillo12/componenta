'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from 'lucide-react'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const SUGERENCIAS = [
  '¿Cómo publico una pieza?',
  '¿Cómo busco un repuesto?',
  '¿Cómo contacto a un vendedor?',
  '¿Qué planes existen?',
]

export default function SupportAgent() {
  const [open, setOpen]       = useState(false)
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const newMsgs: Msg[] = [...msgs, { role: 'user', content }]
    setMsgs(newMsgs)
    setInput('')
    setLoading(true)

    const assistantMsg: Msg = { role: 'assistant', content: '' }
    setMsgs(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      })

      if (!res.ok || !res.body) throw new Error('Error en respuesta')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMsgs(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMsgs(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Hubo un problema al conectar. Intenta de nuevo.' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 999,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg,#388BFD,#1F6FEB)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          title="Soporte Componenta"
        >
          <Bot size={24} color="#fff" />
        </button>
      )}

      {/* Panel del chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          width: 360, height: 520,
          background: '#161B22', borderRadius: 20,
          boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#388BFD,#1F6FEB)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Soporte Componenta</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>IA · responde al instante</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'rgba(255,255,255,0.8)' }}>
              <ChevronDown size={20} color="rgba(255,255,255,0.8)" />
            </button>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Bienvenida */}
            {msgs.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="#fff" />
                  </div>
                  <div style={{ background: '#21262D', borderRadius: '4px 14px 14px 14px', padding: '10px 12px', maxWidth: '85%' }}>
                    <p style={{ fontSize: 13, color: '#E6EDF3', margin: 0, lineHeight: 1.5 }}>
                      Hola! Soy el asistente de <strong>Componenta</strong>. ¿En qué te puedo ayudar hoy?
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 36 }}>
                  {SUGERENCIAS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      style={{
                        textAlign: 'left', padding: '7px 12px',
                        borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)',
                        background: '#161B22', fontSize: 12, color: '#E6EDF3',
                        cursor: 'pointer', fontWeight: 500,
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A56DB'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#388BFD,#1F6FEB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} color="#fff" />
                  </div>
                )}
                <div style={{
                  background: m.role === 'user' ? 'linear-gradient(135deg,#388BFD,#1F6FEB)' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#111827',
                  borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  padding: '9px 12px',
                  maxWidth: '82%',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  {m.content || (m.role === 'assistant' && loading && i === msgs.length - 1
                    ? <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    : m.content
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 13,
                outline: 'none', color: '#E6EDF3',
                background: loading ? '#f9fafb' : '#fff',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none',
                background: loading || !input.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#388BFD,#1F6FEB)',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <Send size={15} color={loading || !input.trim() ? '#9ca3af' : '#fff'} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
