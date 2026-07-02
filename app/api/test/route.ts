import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  // Verificar tabla products
  const { error: dbError } = await supabaseAdmin
    .from('products')
    .select('id')
    .limit(1)

  // Verificar Storage: intentar listar buckets
  const { data: buckets, error: storageError } = await supabaseAdmin
    .storage
    .listBuckets()

  const productImagesBucket = buckets?.find(b => b.name === 'product-images')

  // Intentar crear el bucket si no existe
  let bucketCreated = null
  if (!productImagesBucket) {
    const { error: createError } = await supabaseAdmin.storage
      .createBucket('product-images', { public: true, fileSizeLimit: 10 * 1024 * 1024 })
    bucketCreated = createError ? `âŒ ${createError.message}` : 'âœ… creado ahora'
  }

  return NextResponse.json({
    auth:           userId ? 'âœ… ok' : 'âŒ no autenticado',
    userId:         userId ?? null,
    supabase:       dbError ? `âŒ ${dbError.message}` : 'âœ… tabla products OK',
    storage:        storageError ? `âŒ ${storageError.message}` : 'âœ… storage accesible',
    bucket:         productImagesBucket
      ? 'âœ… bucket product-images existe'
      : bucketCreated ?? 'âš ï¸ bucket no existe',
    allBuckets:     buckets?.map(b => b.name) ?? [],
    timestamp:      new Date().toISOString(),
  })
}

