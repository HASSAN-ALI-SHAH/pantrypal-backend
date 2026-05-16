-- Migration: 002_purchase_batches
-- Creates the purchase batch history table for pantry items

CREATE TABLE IF NOT EXISTS pantry_purchase_batches (
  id              SERIAL PRIMARY KEY,
  pantry_item_id  INTEGER NOT NULL REFERENCES pantry_items(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity        NUMERIC NOT NULL,
  unit            VARCHAR(50),
  entry_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date     DATE,
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Also store pantry_item_id in grocery_items for linking
ALTER TABLE grocery_items
  ADD COLUMN IF NOT EXISTS pantry_item_id INTEGER REFERENCES pantry_items(id) ON DELETE SET NULL;
