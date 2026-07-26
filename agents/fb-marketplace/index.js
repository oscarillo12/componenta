import { chromium } from 'playwright'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_URL     = process.env.COMPONENTA_API_URL ?? 'https://componenta.vercel.app'
const SESSION_DIR = process.env.SESSION_DIR ?? join(__dirname, 'fb-session')
const DELAY       = parseInt(process.env.DELAY_ENTRE_PIEZAS ?? '45000')
const DRY_RUN     = process.argv.includes('--dry-run')
const LOGIN_MODE  = process.argv.includes('--login')
const POSTED_FILE = join(__dirname, 'posted.json')

// ── Helpers ────────────────────────────────────────────────────────────────

function loadPosted() {
  if (!existsSync(POSTED_FILE)) return new Set()
  return new Set(JSON.parse(readFileSync(POSTED_FILE, 'utf8')))
}

function savePosted(set) {
  writeFileSync(POSTED_FILE, JSON.stringify([...set], null, 2))
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function randomDelay(min = 1500, max = 4000) {
  return sleep(min + Math.random() * (max - min))
}

async function humanType(page, selector, text) {
  await page.click(selector)
  await randomDelay(300, 800)
  for (const char of text) {
    await page.keyboard.type(char, { delay: 40 + Math.random() * 80 })
  }
  await randomDelay(300, 600)
}

// ── Fetch productos de Componenta ──────────────────────────────────────────

async function fetchProductos() {
  const res = await fetch(`${API_URL}/api/merchant-feed`)
  const xml = await res.text()

  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag) => {
      const m = block.match(new RegExp(`<g:${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/g:${tag}>`))
        ?? block.match(new RegExp(`<g:${tag}>([^<]*)<\\/g:${tag}>`))
      return m ? m[1].trim() : null
    }

    items.push({
      id:          get('id'),
      title:       get('title'),
      description: get('description'),
      price:       get('price'),
      image:       get('image_link'),
      link:        get('link'),
      condition:   get('condition'),
    })
  }

  return items.filter(p => p.id && p.title && p.price)
}

// ── Publicar en Facebook Marketplace ──────────────────────────────────────

async function publicarEnMarketplace(page, producto) {
  console.log(`\n📦 Publicando: ${producto.title}`)

  await page.goto('https://www.facebook.com/marketplace/create/item', {
    waitUntil: 'domcontentloaded',
  })
  await randomDelay(2000, 4000)

  // ── Foto ──
  if (producto.image) {
    try {
      const photoInput = page.locator('input[type="file"]').first()
      const response   = await fetch(producto.image)
      const buffer     = await response.arrayBuffer()
      const tmpPath    = join(__dirname, `tmp_${Date.now()}.jpg`)
      writeFileSync(tmpPath, Buffer.from(buffer))
      await photoInput.setInputFiles(tmpPath)
      await randomDelay(2000, 4000)
      const { unlinkSync } = await import('fs')
      try { unlinkSync(tmpPath) } catch {}
      console.log('  ✓ Foto subida')
    } catch (e) {
      console.log('  ⚠ No se pudo subir foto:', e.message)
    }
  }

  // ── Título ──
  const titleInput = page.getByLabel(/título/i).or(page.locator('input[placeholder*="título" i]')).first()
  await titleInput.waitFor({ timeout: 10000 })
  await titleInput.click()
  await randomDelay()
  await page.keyboard.type(producto.title.slice(0, 99), { delay: 50 + Math.random() * 60 })
  await randomDelay()

  // ── Precio ──
  const precioNum = parseInt(producto.price.replace(/[^\d]/g, ''))
  const priceInput = page.getByLabel(/precio/i).or(page.locator('input[placeholder*="precio" i]')).first()
  await priceInput.click()
  await randomDelay()
  await page.keyboard.type(String(precioNum), { delay: 50 })
  await randomDelay()

  // ── Categoría ──
  try {
    const catBtn = page.getByLabel(/categoría/i).or(page.locator('text=Seleccionar categoría')).first()
    await catBtn.click()
    await randomDelay(1000, 2000)
    // Buscar "Piezas" o "Automóviles"
    const catSearch = page.locator('input[placeholder*="Buscar" i]').first()
    if (await catSearch.isVisible()) {
      await catSearch.type('Piezas', { delay: 80 })
      await randomDelay(1000, 1500)
      const opt = page.locator('text=Piezas de automóvil').or(page.locator('text=Piezas y accesorios')).first()
      if (await opt.isVisible()) {
        await opt.click()
        console.log('  ✓ Categoría seleccionada')
      }
    }
  } catch {
    console.log('  ⚠ Categoría no seleccionada — continúa')
  }

  // ── Condición ──
  try {
    const condBtn = page.getByLabel(/condición/i).or(page.locator('text=Condición')).first()
    await condBtn.click()
    await randomDelay(800, 1500)
    const usedOpt = page.locator('text=Usado - Buen estado').or(page.locator('text=Used - Good')).first()
    await usedOpt.click()
    await randomDelay()
  } catch {
    console.log('  ⚠ Condición no seleccionada — continúa')
  }

  // ── Descripción ──
  try {
    const desc = (producto.description ?? '').slice(0, 1000)
      + `\n\nVer más info y fotos: ${producto.link}`
    const descInput = page.getByLabel(/descripción/i).or(page.locator('textarea[placeholder*="descripción" i]')).first()
    await descInput.click()
    await randomDelay()
    await page.keyboard.type(desc, { delay: 20 + Math.random() * 30 })
    await randomDelay()
  } catch {
    console.log('  ⚠ Descripción no ingresada')
  }

  if (DRY_RUN) {
    console.log('  🔍 DRY RUN — no se publicó')
    await page.screenshot({ path: join(__dirname, `dry_run_${producto.id}.png`) })
    return null
  }

  // ── Publicar ──
  await randomDelay(1000, 2000)
  const publishBtn = page.getByRole('button', { name: /publicar/i }).or(page.getByRole('button', { name: /next/i })).last()
  await publishBtn.click()
  await randomDelay(3000, 6000)

  console.log(`  ✓ Publicado`)
  return `https://www.facebook.com/marketplace`
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true })

  const browser = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  })

  const page = await browser.newPage()

  // Ocultar navigator.webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    window.chrome = { runtime: {} }
  })

  // ── Modo login: el usuario se loguea manualmente ──
  if (LOGIN_MODE) {
    console.log('🔐 Abre Facebook e inicia sesión manualmente. Cierra el navegador cuando estés listo.')
    await page.goto('https://www.facebook.com')
    await page.waitForEvent('close', { timeout: 300000 }).catch(() => {})
    await browser.close()
    console.log('✓ Sesión guardada en', SESSION_DIR)
    return
  }

  // ── Verificar sesión activa ──
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' })
  await randomDelay(2000, 3000)

  const loggedIn = await page.locator('[aria-label="Facebook"]').isVisible().catch(() => false)
    || await page.locator('a[href*="/marketplace"]').isVisible().catch(() => false)

  if (!loggedIn) {
    console.log('⚠ No hay sesión activa. Ejecuta primero: npm run login')
    await browser.close()
    return
  }

  console.log('✓ Sesión de Facebook activa')

  // ── Cargar productos ──
  const posted   = loadPosted()
  const productos = await fetchProductos()
  const nuevos   = productos.filter(p => !posted.has(p.id))

  console.log(`\n📋 ${productos.length} productos en Componenta — ${nuevos.length} sin publicar en Marketplace`)

  if (nuevos.length === 0) {
    console.log('✓ Todo está publicado. Nada que hacer.')
    await browser.close()
    return
  }

  for (const producto of nuevos) {
    try {
      const url = await publicarEnMarketplace(page, producto)
      if (url !== null) {
        posted.add(producto.id)
        savePosted(posted)
      }
    } catch (err) {
      console.error(`  ✗ Error con ${producto.title}:`, err.message)
    }

    if (nuevos.indexOf(producto) < nuevos.length - 1) {
      const delay = DELAY + (Math.random() - 0.5) * 10000
      console.log(`  ⏳ Esperando ${Math.round(delay / 1000)}s antes del siguiente...`)
      await sleep(delay)
    }
  }

  console.log('\n✅ Agente finalizado')
  await browser.close()
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
