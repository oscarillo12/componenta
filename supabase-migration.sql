-- =====================================================================
-- COMPONENTA — Migración completa
-- Ejecutar en Supabase → SQL Editor
-- =====================================================================

-- ── Chat ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  user_name  TEXT NOT NULL,
  avatar_url TEXT,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores por si ya existen (idempotente)
DROP POLICY IF EXISTS "chat_read_anon"     ON chat_messages;
DROP POLICY IF EXISTS "chat_insert_anon"   ON chat_messages;
DROP POLICY IF EXISTS "chat_service_role"  ON chat_messages;

-- Cualquiera puede leer mensajes del chat
CREATE POLICY "chat_read_anon"
  ON chat_messages FOR SELECT TO anon USING (true);

-- Cualquiera puede insertar mensajes (autenticado vía Clerk, no vía Supabase Auth)
CREATE POLICY "chat_insert_anon"
  ON chat_messages FOR INSERT TO anon WITH CHECK (true);

-- authenticated también puede (usuarios con token Supabase Auth si aplica)
CREATE POLICY "chat_read_auth"
  ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "chat_insert_auth"
  ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);

-- service_role tiene acceso total
CREATE POLICY "chat_service_role"
  ON chat_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ── Órdenes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      TEXT NOT NULL,
  pieza           TEXT NOT NULL,
  precio          INTEGER NOT NULL,
  envio_costo     INTEGER NOT NULL DEFAULT 0,
  buyer_id        TEXT NOT NULL,
  buyer_name      TEXT NOT NULL,
  buyer_email     TEXT NOT NULL,
  buyer_phone     TEXT,
  buyer_address   TEXT,
  seller_id       TEXT NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente',
  payment_status  TEXT NOT NULL DEFAULT 'pendiente',
  flow_token      TEXT,
  tracking_code   TEXT,
  imagen_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id    ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id   ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_flow_token  ON orders(flow_token);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_orders"
  ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Eventos de pedido (timeline) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  estado     TEXT NOT NULL,
  mensaje    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_events"
  ON order_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Notificaciones ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL,
  mensaje    TEXT NOT NULL,
  leida      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_leida   ON notifications(user_id, leida);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_notifs"
  ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Función updated_at ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Realtime ─────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_events;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── MercadoLibre ─────────────────────────────────────────────────────

-- Columnas ML en la tabla products (si no existen)
ALTER TABLE products ADD COLUMN IF NOT EXISTS ml_item_id   TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ml_permalink TEXT;

-- Tokens OAuth de MercadoLibre por usuario
CREATE TABLE IF NOT EXISTS ml_tokens (
  user_id       TEXT PRIMARY KEY,
  access_token  TEXT        NOT NULL,
  refresh_token TEXT        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  ml_user_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ml_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_ml_tokens" ON ml_tokens;
CREATE POLICY "service_role_ml_tokens"
  ON ml_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE TRIGGER ml_tokens_updated_at
  BEFORE UPDATE ON ml_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Listings externos (scraping agentes) ─────────────────────────
CREATE TABLE IF NOT EXISTS listings_externos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente          TEXT NOT NULL,
  titulo          TEXT,
  precio          INTEGER DEFAULT 0,
  imagen          TEXT,
  descripcion     TEXT,
  url_original    TEXT UNIQUE NOT NULL,
  categoria       TEXT,
  marca           TEXT,
  modelo          TEXT,
  vendedor_nombre TEXT,
  ubicacion       TEXT,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ext_fuente  ON listings_externos(fuente);
CREATE INDEX IF NOT EXISTS idx_ext_activo  ON listings_externos(activo);
CREATE INDEX IF NOT EXISTS idx_ext_titulo  ON listings_externos USING gin(to_tsvector('spanish', coalesce(titulo, '')));

ALTER TABLE listings_externos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ext_read_anon"      ON listings_externos;
DROP POLICY IF EXISTS "ext_service_role"   ON listings_externos;

CREATE POLICY "ext_read_anon"
  ON listings_externos FOR SELECT TO anon USING (activo = true);

CREATE POLICY "ext_service_role"
  ON listings_externos FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE TRIGGER ext_updated_at
  BEFORE UPDATE ON listings_externos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Solicitudes — email para alertas automáticas (2026-07-21) ─────────────
-- Agregar columna buyer_email a la tabla solicitudes existente
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS buyer_email TEXT;

-- Tabla solicitudes completa (referencia — ya debe existir):
-- CREATE TABLE IF NOT EXISTS solicitudes (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   pieza       TEXT NOT NULL,
--   marca       TEXT,
--   modelo      TEXT,
--   anio        TEXT,
--   descripcion TEXT,
--   buyer_name  TEXT NOT NULL,
--   buyer_phone TEXT,
--   buyer_email TEXT,
--   activa      BOOLEAN NOT NULL DEFAULT TRUE,
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );
