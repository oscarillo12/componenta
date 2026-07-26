import { redirect } from 'next/navigation'

// Redirect permanente: /marketplace/[id] → /p/[id]
// Las URLs indexadas por Google antes del cambio siguen funcionando.
export default async function MarketplaceProductRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/p/${id}`)
}
