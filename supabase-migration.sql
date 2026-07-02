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
