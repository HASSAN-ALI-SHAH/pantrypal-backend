-- ============================================================
-- PantryPal Migration 004: Performance Indexes
-- Adds missing indexes without re-creating tables
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- pantry_items
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiry_date ON pantry_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_pantry_items_category ON pantry_items(category);
CREATE INDEX IF NOT EXISTS idx_pantry_items_status ON pantry_items(status);

-- grocery_items
CREATE INDEX IF NOT EXISTS idx_grocery_items_user_id ON grocery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_items_category ON grocery_items(category);

-- alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_item_id ON alerts(item_id);

-- pantry_purchase_batches
CREATE INDEX IF NOT EXISTS idx_pantry_purchase_batches_pantry_item_id ON pantry_purchase_batches(pantry_item_id);

-- consumption_logs
CREATE INDEX IF NOT EXISTS idx_consumption_logs_pantry_item_id ON consumption_logs(pantry_item_id);
