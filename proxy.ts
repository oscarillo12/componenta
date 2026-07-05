import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rutas del panel vendedor — requieren sesión iniciada
const isSellerRoute = createRouteMatcher([
  '/',
  '/inventario(.*)',
  '/pedidos(.*)',
  '/dashboard(.*)',
  '/planes(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isSellerRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
