-- Migration: 003_consumption_logs
-- Tracks partial consumption events for pantry items

CREATE TABLE IF NOT EXISTS consumption_logs (
  id              SERIAL PRIMARY KEY,
  pantry_item_id  INTEGER NOT NULL REFERENCES pantry_items(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity        NUMERIC NOT NULL,
  unit            VARCHAR(50),
  consumed_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
