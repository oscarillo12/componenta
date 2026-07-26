# Agente Facebook Marketplace — Componenta

Publica automáticamente los productos de Componenta en Facebook Marketplace.

## Instalación

```bash
cd agents/fb-marketplace
npm install
npx playwright install chromium
cp .env.example .env
```

## Uso

### 1. Login (solo la primera vez)
```bash
npm run login
```
Se abre el navegador → inicia sesión en Facebook manualmente → cierra el navegador. La sesión queda guardada.

### 2. Publicar productos nuevos
```bash
npm run run
```
Toma todos los productos de Componenta que aún no están en Marketplace y los publica uno por uno con pausas aleatorias.

### 3. Modo prueba (no publica, toma screenshots)
```bash
npm test
```

## Configuración (.env)

| Variable | Descripción |
|---|---|
| `COMPONENTA_API_URL` | URL de tu Componenta (default: https://componenta.vercel.app) |
| `DELAY_ENTRE_PIEZAS` | Pausa entre publicaciones en ms (recomendado: 45000–120000) |
| `SESSION_DIR` | Carpeta donde se guarda la sesión de Facebook |

## En Oracle Cloud (Linux)

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Dependencias del browser
sudo npx playwright install-deps chromium

# Clonar y configurar
git clone <tu-repo>
cd agents/fb-marketplace
npm install
npx playwright install chromium

# Login (requiere display — usar VNC o xvfb)
export DISPLAY=:1
npm run login

# Automatizar con cron (cada día a las 9am)
crontab -e
# 0 9 * * * cd /home/ubuntu/componenta/agents/fb-marketplace && npm run run >> /var/log/fb-agent.log 2>&1
```

## posted.json
Lleva registro de qué productos ya fueron publicados para no duplicar. No elimines este archivo.
