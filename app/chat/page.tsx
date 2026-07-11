import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import SellerLayout from '@/components/SellerLayout'
import ChatInboxClient from './ChatInboxClient'
import { MessageCircle } from 'lucide-react'

export default async function ChatPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Obtener todos los productos del vendedor
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, pieza, imagen_url, disponible, precio')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!products || products.length === 0) {
    return (
      <SellerLayout section="mensajes">
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#eff6ff', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle size={28} color="#1d4ed8" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Sin conversaciones aún</p>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Cuando alguien pregunte por una de tus piezas, la conversación aparecerá aquí.</p>
          <a href="/marketplace" style={{ display: 'inline-block', padding: '10px 24px', background: '#1d4ed8', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Ver marketplace
          </a>
        </div>
      </SellerLayout>
    )
  }

  // Obtener últimos mensajes de cada sala (pieza-{id})
  const roomIds = products.map(p => `pieza-${p.id}`)
  const { data: allMessages } = await supabaseAdmin
    .from('chat_messages')
    .select('room_id, content, user_name, created_at, user_id')
    .in('room_id', roomIds)
    .order('created_at', { ascending: false })

  // Agrupar: último mensaje por room_id
  const latestByRoom: Record<string, { content: string; user_name: string; created_at: string; user_id: string }> = {}
  for (const msg of (allMessages ?? [])) {
    if (!latestByRoom[msg.room_id]) {
      latestByRoom[msg.room_id] = msg
    }
  }

  // Contar mensajes totales por room
  const countByRoom: Record<string, number> = {}
  for (const msg of (allMessages ?? [])) {
    countByRoom[msg.room_id] = (countByRoom[msg.room_id] ?? 0) + 1
  }

  const conversations = products
    .map(p => ({
      productId:  p.id,
      pieza:      p.pieza,
      imagen_url: p.imagen_url as string | null,
      disponible: p.disponible as boolean,
      precio:     p.precio as number,
      roomId:     `pieza-${p.id}`,
      lastMsg:    latestByRoom[`pieza-${p.id}`] ?? null,
      msgCount:   countByRoom[`pieza-${p.id}`] ?? 0,
    }))
    .filter(c => c.msgCount > 0)
    .sort((a, b) => {
      if (!a.lastMsg) return 1
      if (!b.lastMsg) return -1
      return new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime()
    })

  return (
    <SellerLayout section="mensajes">
      <ChatInboxClient conversations={conversations} sellerId={userId} />
    </SellerLayout>
  )
}
