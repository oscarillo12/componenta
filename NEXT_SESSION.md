# Componenta — Estado del proyecto para próxima sesión

> Documento de handoff. Leer completo antes de tocar código.

---

## ¿Qué es Componenta?

Marketplace de repuestos usados para **Desarmaduria San Pablo, Temuco**.
- **Vitrina pública** (`/`): compradores buscan repuestos scrapeados de MercadoLibre + listings de vendedores
- **Panel vendedor** (`/inventario`, `/publicar`, `/dashboard`): desarmadurías publican con IA (foto → identificación → publicación multicanal)

**URL producción:** https://componenta.vercel.app  
**Stack:** Next.js 16 + TypeScript + Supabase + Clerk v7 + Gemini AI + Vercel

---

## Dos proyectos separados

| Proyecto | Ruta local | Repo GitHub | Propósito |
|----------|-----------|-------------|-----------|
| Frontend | `C:\Users\user\Desktop\COMPONENTA\componenta` | `github.com/oscarillo12/componenta` | App Next.js → Vercel |
| Agentes | `C:\Users\user\Downloads\COMPONENTA\componenta` | `github.com/oscarillo12/componenta-agentes` | Scrapers Node.js → GitHub Actions |

---

## Estado actual — sesión 2026-07-25

### ✅ Completado hoy

**Fix imágenes scraper (CRÍTICO):**
- **Causa raíz:** URLs de `scontent-*.fbcdn.net` (Facebook CDN) expiran en 24-48h. El scraper guardaba la URL directa → imagen en gris al día siguiente.
- **Fix:** `supabase-client.js` → nueva función `subirImagenAStorage()` que descarga la imagen y la sube a Supabase Storage (URL permanente). También `procesarImagenesItems()` para procesar en lotes de 5.
- `facebook.js` → ahora llama `procesarImagenesItems()` antes de guardar en DB.
- **PREREQUISITO:** Crear bucket `listing-images` en Supabase Storage con acceso **público** (Supabase → Storage → New bucket → "listing-images" → Public).

**Nuevo scraper MeLi para vitrina (`meli-scraper.js`):**
- Usa la API pública de MercadoLibre (`api.mercadolibre.com/sites/MLC/search`) — sin login ni browser.
- Las imágenes de `mlstatic.com` son permanentes (no expiran) → no necesitan subirse a Storage.
- 30 búsquedas de repuestos usados → deduplica por URL → guarda en `listings_externos` con `fuente = 'mercadolibre'`.
- `scheduler.js` actualizado → corre MeLi Scraper 4x/día y Facebook 3x/día.
- `.github/workflows/scraper.yml` creado → GitHub Actions corre `meli-scraper.js` 4x/día (sin browser, sin cookies).

**Fix middleware (`middleware.ts`):**
- El archivo se llamaba `proxy.ts` — Next.js ignora archivos con ese nombre como middleware → en Vercel NO se ejecutaba ninguna protección de rutas.
- Creado `middleware.ts` correcto. Ahora `/marketing` y `/chat` también están protegidos (redirigen a login si no hay sesión).
- `proxy.ts` puede eliminarse (ya es ignorado por Next.js).

---

## Pendiente próxima sesión (en orden de prioridad)

### 1. Crear bucket en Supabase Storage (BLOQUEANTE para imágenes FB)
```
Supabase Dashboard → Storage → New bucket
Nombre: listing-images
Acceso: Public
```
Sin este bucket, las imágenes de Facebook seguirán siendo URLs temporales.

### 2. Deploy a Vercel
```powershell
cd "C:\Users\user\Desktop\COMPONENTA\componenta"
vercel --prod
```
Necesario para que `middleware.ts` entre en efecto y el panel de marketing aparezca en producción.

### 3. Push agentes a GitHub (para que Actions corra meli-scraper)
```powershell
cd "C:\Users\user\Downloads\COMPONENTA\componenta"
git add agentes/meli-scraper.js agentes/supabase-client.js agentes/facebook.js agentes/scheduler.js .github/workflows/scraper.yml
git commit -m "feat: meli scraper vitrina + imágenes permanentes Supabase Storage"
git push
```
Luego en GitHub → Actions → MeLi Scraper Vitrina → Run workflow para poblar DB inmediatamente.

### 4. Bug precios MercadoLibre (MEDIA)
El selector `.andes-money-amount__fraction` puede traer el precio de cuotas en vez del total.
(Este bug aplica solo al scraper de MeLi de la vitrina cuando se raspaba la página web — ya no aplica porque ahora usamos la API que devuelve el precio real directamente.)
**✅ Bug resuelto como efecto secundario del fix de imágenes.**

### 5. Verificar dominio componenta.cl en Resend (cuando Oscar tenga el dominio)
- `RESEND_API_KEY` ✅ en Vercel
- `RESEND_FROM_EMAIL` = `Componenta <hola@componenta.cl>` ✅ en Vercel
- **Falta:** verificar el dominio en Resend → hasta entonces los emails no se entregan

### 6. Facebook Marketplace/Grupos automatizado (FUTURA)
Requiere VPS con IP residencial. Oscar no tiene tarjeta actualmente.
Opciones cuando tenga tarjeta: Hetzner ($4/mes), DigitalOcean ($6/mes), Oracle Cloud Free Tier.

### 7. Video Higgsfield (PENDIENTE DE OSCAR)
Oscar tiene el prompt, lo ejecuta en Higgsfield y evalúa el resultado.

---

## Cómo deployar

```powershell
# Frontend → Vercel
cd "C:\Users\user\Desktop\COMPONENTA\componenta"
vercel --prod

# Agentes → GitHub Actions (automático vía scraper.yml)
# También se puede correr manualmente:
# github.com/oscarillo12/componenta-agentes → Actions → MeLi Scraper Vitrina → Run workflow
```

## Cómo correr localmente

```powershell
cd "C:\Users\user\Desktop\COMPONENTA\componenta"
npm run dev
# → http://localhost:3000
```

---

## Variables de entorno clave (en Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
GEMINI_API_KEY
ML_APP_ID / ML_SECRET_KEY / ML_REDIRECT_URI
RESEND_API_KEY
RESEND_FROM_EMAIL
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM
NEXT_PUBLIC_APP_URL = https://componenta.vercel.app
```

---

## Tablas Supabase clave

| Tabla | Propósito |
|-------|-----------|
| `products` | Catálogo propio del vendedor |
| `listings_externos` | Repuestos scrapeados de MeLi y Facebook |
| `solicitudes` | Compradores piden piezas (tiene `buyer_email` ✅) |
| `ml_tokens` | OAuth MercadoLibre |
| `seller_profiles` | Perfil Mi Tienda del vendedor |

## Supabase Storage

| Bucket | Propósito | Acceso |
|--------|-----------|--------|
| `listing-images` | Imágenes de Facebook scrapeadas (permanentes) | **Público** |

---

## Deuda técnica conocida

- `proxy.ts` ya puede eliminarse (reemplazado por `middleware.ts`)
- `app/solicitudes/page.tsx` line 365 tenía `href="/marketplace"` (ruta eliminada) — revisar si quedó
