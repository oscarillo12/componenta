import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { imageData } = await req.json()
  if (!imageData?.startsWith('data:image')) {
    return NextResponse.json({ error: 'Imagen invÃ¡lida' }, { status: 400 })
  }

  const isPng   = imageData.includes('image/png')
  const base64  = imageData.replace(/^data:image\/\w+;base64,/, '')
  const buffer  = Buffer.from(base64, 'base64')

  // Hash SHA-256 para detectar fotos duplicadas
  const imageHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 32)

  // Verificar si este usuario ya subiÃ³ esta misma foto
  const { data: existingWithHash } = await supabaseAdmin
    .from('products')
    .select('id, pieza')
    .eq('user_id', userId)
    .eq('image_hash', imageHash)
    .limit(1)
    .maybeSingle()

  if (existingWithHash) {
    return NextResponse.json(
      {
        error: 'duplicate_image',
        detail: `Esta foto ya estÃ¡ usada en la pieza "${existingWithHash.pieza}". Usa una foto diferente.`,
        productId: existingWithHash.id,
      },
      { status: 409 },
    )
  }

  const filename    = `${userId}/${Date.now()}.${isPng ? 'png' : 'jpg'}`
  const contentType = isPng ? 'image/png' : 'image/jpeg'

  await supabaseAdmin.storage
    .createBucket('product-images', { public: true, fileSizeLimit: 10485760 })
    .catch(() => {})

  const { error: uploadError } = await supabaseAdmin.storage
    .from('product-images')
    .upload(filename, buffer, { contentType, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl, imageHash })
}

