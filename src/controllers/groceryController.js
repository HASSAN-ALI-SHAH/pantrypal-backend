const db = require('../../db');

// Timezone-safe "today" for INSERT defaults
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// GET /api/grocery — Get all grocery items for user
const getAllGrocery = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM grocery_items WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    const items = result.rows.map(mapGroceryToFrontend);
    res.json({ success: true, items });
  } catch (error) {
    console.error('Get grocery items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/grocery — Add a grocery item
const addGrocery = async (req, res) => {
  try {
    const { itemName, category, suggestedQuantity, unit, triggeredBy, minQuantity, pantryItemId } = req.body;

    if (!itemName) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    // Check if already exists (not purchased)
    const existing = await db.query(
      `SELECT id FROM grocery_items
       WHERE user_id = $1 AND item_name = $2 AND is_purchased = false`,
      [req.user.id, itemName]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Item already in grocery list' });
    }

    const result = await db.query(
      `INSERT INTO grocery_items
        (user_id, item_name, category, suggested_quantity, unit, triggered_by, min_quantity, pantry_item_id, is_purchased)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
       RETURNING *`,
      [req.user.id, itemName, category || 'Other', suggestedQuantity || 1,
       unit || 'Pieces', triggeredBy || 'manual', minQuantity || null, pantryItemId || null]
    );

    res.status(201).json({ success: true, item: mapGroceryToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Add grocery item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/grocery/:id/toggle — Toggle purchased status
const togglePurchased = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE grocery_items SET
        is_purchased = NOT is_purchased,
        purchased_at = CASE WHEN is_purchased THEN NULL ELSE NOW() END
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item: mapGroceryToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Toggle purchased error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/grocery/:id/restore — Restore a purchased item
const restoreGrocery = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE grocery_items SET is_purchased = false, purchased_at = NULL
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item: mapGroceryToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Restore grocery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/grocery/:id — Remove a grocery item
const removeGrocery = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM grocery_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    console.error('Remove grocery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/grocery/purchased — Clear all purchased history
const clearPurchased = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM grocery_items WHERE user_id = $1 AND is_purchased = true',
      [req.user.id]
    );

    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Clear purchased error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/grocery/bulk-purchase — Bulk mark as purchased
const bulkPurchase = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No item IDs provided' });
    }

    const result = await db.query(
      `UPDATE grocery_items SET is_purchased = true, purchased_at = NOW()
       WHERE id = ANY($1::int[]) AND user_id = $2`,
      [ids, req.user.id]
    );

    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Bulk purchase error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/grocery/bulk-delete — Bulk delete
const bulkDeleteGrocery = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No item IDs provided' });
    }

    const result = await db.query(
      'DELETE FROM grocery_items WHERE id = ANY($1::int[]) AND user_id = $2',
      [ids, req.user.id]
    );

    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Bulk delete grocery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/grocery/:id/purchase — Log purchase: create batch + mark purchased
const purchaseGrocery = async (req, res) => {
  try {
    const { quantity, entryDate, expiryDate } = req.body;

    // Sanitize quantity: parseFloat handles leading zeros ("01" → 1, "002" → 2)
    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }
    if (qty > 99999) {
      return res.status(400).json({ success: false, message: 'Quantity is unreasonably large' });
    }

    // Get the grocery item
    const groceryResult = await db.query(
      'SELECT * FROM grocery_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (groceryResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Grocery item not found' });
    }
    const groceryItem = groceryResult.rows[0];

    // Find linked pantry item — by pantry_item_id if available, otherwise by name
    let pantryItem = null;
    if (groceryItem.pantry_item_id) {
      const r = await db.query(
        'SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2',
        [groceryItem.pantry_item_id, req.user.id]
      );
      if (r.rows.length > 0) pantryItem = r.rows[0];
    }
    if (!pantryItem) {
      const r = await db.query(
        `SELECT * FROM pantry_items WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND status = 'active' LIMIT 1`,
        [req.user.id, groceryItem.item_name]
      );
      if (r.rows.length > 0) pantryItem = r.rows[0];
    }

    let updatedPantryItem = null;
    if (pantryItem) {
      // Insert batch record
      await db.query(
        `INSERT INTO pantry_purchase_batches
           (pantry_item_id, user_id, quantity, unit, entry_date, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          pantryItem.id, req.user.id, qty, pantryItem.unit,
          entryDate || localToday(),
          expiryDate || null
        ]
      );

      // INCREMENT the pantry item's stock by the purchased amount
      // (not SUM of batches, since the item may have had pre-batch stock)
      const updated = await db.query(
        `UPDATE pantry_items
         SET current_quantity = COALESCE(current_quantity, quantity, 0) + $1,
             quantity = COALESCE(quantity, 0) + $1,
             expiry_date = COALESCE($2, expiry_date)
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [qty, expiryDate || null, pantryItem.id, req.user.id]
      );
      updatedPantryItem = updated.rows[0];
    }

    // Mark grocery item as purchased
    const purchasedResult = await db.query(
      `UPDATE grocery_items SET is_purchased = true, purchased_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      groceryItem: mapGroceryToFrontend(purchasedResult.rows[0]),
      pantryItem: updatedPantryItem ? mapPantryItemToFrontend(updatedPantryItem) : null,
    });
  } catch (error) {
    console.error('Purchase grocery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: minimal pantry item mapper for inline use
function mapPantryItemToFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    quantity: parseFloat(row.quantity) || 0,
    currentQuantity: row.current_quantity ? parseFloat(row.current_quantity) : undefined,
    expiryDate: row.expiry_date || null,
    unit: row.unit,
    category: row.category,
    status: row.status || 'active',
    notes: row.notes || '',
    imageUrl: row.image_url || '',
    entryDate: row.entry_date || null,
    autoAddToGrocery: row.auto_add_to_grocery || false,
    minQuantity: row.min_quantity ? parseFloat(row.min_quantity) : undefined,
    addedDate: row.added_date,
  };
}

// Helper: map DB grocery row to frontend camelCase
function mapGroceryToFrontend(row) {
  return {
    id: row.id,
    itemName: row.item_name,
    category: row.category,
    quantity: parseFloat(row.quantity) || 1,
    suggestedQuantity: parseFloat(row.suggested_quantity) || 1,
    unit: row.unit,
    purchased: row.is_purchased || false,
    purchasedAt: row.purchased_at ? row.purchased_at.toISOString() : null,
    addedAt: row.created_at ? row.created_at.toISOString() : null,
    triggeredBy: row.triggered_by || 'manual',
    minQuantity: row.min_quantity ? parseFloat(row.min_quantity) : null,
    pantryItemId: row.pantry_item_id || null,
  };
}

module.exports = {
  getAllGrocery, addGrocery, togglePurchased, restoreGrocery,
  removeGrocery, clearPurchased, bulkPurchase, bulkDeleteGrocery,
  purchaseGrocery,
};
