const db = require('../../db');

// Timezone-safe "today" for INSERT defaults
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// Helper: automatically add item to grocery list if conditions are met
const handleAutoAddToGrocery = async (user_id, item) => {
  if (!item.auto_add_to_grocery) return;

  const isConsumed = item.status === 'consumed';
  const currentQty = parseFloat(item.current_quantity ?? item.quantity) || 0;
  const minQty = parseFloat(item.min_quantity);
  
  const isBelowMin = !isNaN(minQty) && currentQty <= minQty;
  const isZero = currentQty === 0;

  if (isConsumed || isBelowMin || isZero) {
    const existing = await db.query(
      `SELECT id FROM grocery_items WHERE user_id = $1 AND item_name = $2 AND is_purchased = false`,
      [user_id, item.name]
    );
    if (existing.rows.length === 0) {
      const suggestedQty = (!isNaN(minQty) && minQty > 0) ? minQty : 1;
      await db.query(
        `INSERT INTO grocery_items
          (user_id, item_name, category, suggested_quantity, unit, triggered_by, min_quantity, pantry_item_id, is_purchased)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)`,
        [
          user_id, item.name, item.category || 'Other', suggestedQty, item.unit || 'Pieces',
          isBelowMin && !isConsumed && !isZero ? 'low_stock' : 'consumed', 
          item.min_quantity || null, item.id
        ]
      );
    }
  }
};

// GET /api/pantry — Get all pantry items for the logged-in user
const getAllItems = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, category, quantity, unit, expiry_date, added_date,
              status, notes, image_url, entry_date, auto_add_to_grocery,
              current_quantity, min_quantity
       FROM pantry_items
       WHERE user_id = $1
       ORDER BY added_date DESC`,
      [req.user.id]
    );

    // Map DB snake_case to frontend camelCase
    const items = result.rows.map(mapItemToFrontend);

    res.json({ success: true, items });
  } catch (error) {
    console.error('Get pantry items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/pantry/:id — Get a single pantry item
const getItem = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, item: mapItemToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Get pantry item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/pantry — Add a new pantry item
const addItem = async (req, res) => {
  try {
    const {
      name, category, quantity, unit, expiryDate, notes,
      entryDate, imageUrl, autoAddToGrocery, currentQuantity, minQuantity
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const result = await db.query(
      `INSERT INTO pantry_items
        (user_id, name, category, quantity, unit, expiry_date, notes,
         entry_date, image_url, auto_add_to_grocery, current_quantity, min_quantity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
       RETURNING *`,
      [
        req.user.id, name, category || 'Other', quantity || 1, unit || 'Pieces',
        expiryDate || null, notes || '', entryDate || localToday(),
        imageUrl || '', autoAddToGrocery || false, currentQuantity || null, minQuantity || null
      ]
    );

    await handleAutoAddToGrocery(req.user.id, result.rows[0]);

    res.status(201).json({ success: true, item: mapItemToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Add pantry item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/pantry/:id — Update a pantry item
const updateItem = async (req, res) => {
  try {
    const {
      name, category, quantity, unit, expiryDate, notes,
      imageUrl, autoAddToGrocery, currentQuantity, minQuantity
    } = req.body;

    // First check ownership
    const check = await db.query(
      'SELECT id FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const result = await db.query(
      `UPDATE pantry_items SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        quantity = COALESCE($3, quantity),
        unit = COALESCE($4, unit),
        expiry_date = COALESCE($5, expiry_date),
        notes = COALESCE($6, notes),
        image_url = COALESCE($7, image_url),
        auto_add_to_grocery = COALESCE($8, auto_add_to_grocery),
        current_quantity = COALESCE($9, current_quantity),
        min_quantity = COALESCE($10, min_quantity)
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        name, category, quantity, unit, expiryDate, notes,
        imageUrl, autoAddToGrocery, currentQuantity, minQuantity,
        req.params.id, req.user.id
      ]
    );

    await handleAutoAddToGrocery(req.user.id, result.rows[0]);

    res.json({ success: true, item: mapItemToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Update pantry item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/pantry/:id — Delete a pantry item
const deleteItem = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Delete pantry item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/pantry/:id/status — Mark as consumed or discarded
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['consumed', 'discarded', 'active'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await db.query(
      'UPDATE pantry_items SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await handleAutoAddToGrocery(req.user.id, result.rows[0]);

    res.json({ success: true, item: mapItemToFrontend(result.rows[0]) });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/pantry/bulk-consume — Bulk mark consumed
const bulkConsume = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No item IDs provided' });
    }

    const result = await db.query(
      `UPDATE pantry_items SET status = 'consumed'
       WHERE id = ANY($1::int[]) AND user_id = $2
       RETURNING *`,
      [ids, req.user.id]
    );

    for (const item of result.rows) {
      await handleAutoAddToGrocery(req.user.id, item);
    }

    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Bulk consume error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/pantry/bulk-delete — Bulk delete
const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No item IDs provided' });
    }

    const result = await db.query(
      'DELETE FROM pantry_items WHERE id = ANY($1::int[]) AND user_id = $2',
      [ids, req.user.id]
    );

    res.json({ success: true, count: result.rowCount });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/pantry/stats — Dashboard stats
const getStats = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS total,
        COUNT(*) FILTER (WHERE status = 'active' AND expiry_date < CURRENT_DATE) AS expired,
        COUNT(*) FILTER (WHERE status = 'active' AND expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '5 days') AS expiring,
        COUNT(*) FILTER (WHERE status = 'active' AND expiry_date > CURRENT_DATE + INTERVAL '5 days') AS fresh,
        COUNT(*) FILTER (WHERE status = 'consumed') AS consumed,
        COUNT(*) FILTER (WHERE status = 'discarded') AS discarded,
        COUNT(*) AS total_all
       FROM pantry_items
       WHERE user_id = $1`,
      [req.user.id]
    );

    const s = result.rows[0];
    const total_all = parseInt(s.total_all) || 0;
    const consumed = parseInt(s.consumed) || 0;
    const wasteReduction = total_all > 0 ? Math.round((consumed / total_all) * 100) : 0;

    // Count items needing restocking
    const restockResult = await db.query(
      `SELECT COUNT(*) AS count FROM pantry_items
       WHERE user_id = $1 AND status = 'active'
         AND auto_add_to_grocery = true
         AND current_quantity IS NOT NULL
         AND min_quantity IS NOT NULL
         AND current_quantity <= min_quantity`,
      [req.user.id]
    );

    res.json({
      success: true,
      stats: {
        total: parseInt(s.total) || 0,
        expired: parseInt(s.expired) || 0,
        expiring: parseInt(s.expiring) || 0,
        fresh: parseInt(s.fresh) || 0,
        consumed,
        discarded: parseInt(s.discarded) || 0,
        total_all,
        wasteReduction,
        needsRestocking: parseInt(restockResult.rows[0].count) || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// GET /api/pantry/:id/batches — Get all purchase batches for an item
const getBatches = async (req, res) => {
  try {
    // Verify ownership
    const check = await db.query(
      'SELECT id FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const result = await db.query(
      `SELECT id, pantry_item_id, quantity, unit, entry_date, expiry_date, notes, created_at
       FROM pantry_purchase_batches
       WHERE pantry_item_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [req.params.id, req.user.id]
    );

    const batches = result.rows.map(mapBatchToFrontend);
    res.json({ success: true, batches });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/pantry/:id/batches — Add a purchase batch and update total quantity
const addBatch = async (req, res) => {
  try {
    const { quantity, entryDate, expiryDate, notes, unit } = req.body;

    // Sanitize quantity: parseFloat handles leading zeros ("01" → 1, "002" → 2)
    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }
    if (qty > 99999) {
      return res.status(400).json({ success: false, message: 'Quantity is unreasonably large' });
    }

    // Verify ownership and get current item
    const check = await db.query(
      'SELECT id, current_quantity, unit FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = check.rows[0];
    const itemUnit = unit || item.unit;

    // Insert the batch
    const batchResult = await db.query(
      `INSERT INTO pantry_purchase_batches
         (pantry_item_id, user_id, quantity, unit, entry_date, expiry_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.params.id, req.user.id, qty, itemUnit,
        entryDate || localToday(),
        expiryDate || null,
        notes || ''
      ]
    );

    // INCREMENT the pantry item's stock by the purchased amount
    // (not SUM of batches, since the item may have had pre-batch stock)
    const updatedItem = await db.query(
      `UPDATE pantry_items
       SET current_quantity = COALESCE(current_quantity, quantity, 0) + $1,
           quantity = COALESCE(quantity, 0) + $1,
           expiry_date = COALESCE($2, expiry_date)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [qty, expiryDate || null, req.params.id, req.user.id]
    );

    res.status(201).json({
      success: true,
      batch: mapBatchToFrontend(batchResult.rows[0]),
      item: mapItemToFrontend(updatedItem.rows[0]),
    });
  } catch (error) {
    console.error('Add batch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: map batch DB row to frontend
function mapBatchToFrontend(row) {
  return {
    id: row.id,
    pantryItemId: row.pantry_item_id,
    quantity: parseFloat(row.quantity),
    unit: row.unit,
    entryDate: row.entry_date || null,
    expiryDate: row.expiry_date || null,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}


// POST /api/pantry/:id/consume-qty — Log a consumption event and subtract from stock
const logConsumption = async (req, res) => {
  try {
    const { quantity, notes, consumedAt } = req.body;

    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    // Verify ownership and get current item
    const check = await db.query(
      'SELECT id, current_quantity, quantity, unit FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    const item = check.rows[0];
    const currentQty = parseFloat(item.current_quantity ?? item.quantity) || 0;

    if (qty > currentQty) {
      return res.status(400).json({
        success: false,
        message: `Cannot consume ${qty} — only ${currentQty} in stock`
      });
    }

    const newQty = Math.max(0, currentQty - qty);

    // Insert consumption log
    const logResult = await db.query(
      `INSERT INTO consumption_logs (pantry_item_id, user_id, quantity, unit, consumed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.params.id, req.user.id, qty, item.unit,
        consumedAt || localToday(),
        notes || ''
      ]
    );

    // Update pantry item quantity
    const updatedItem = await db.query(
      `UPDATE pantry_items SET current_quantity = $1, quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [newQty, req.params.id, req.user.id]
    );

    await handleAutoAddToGrocery(req.user.id, updatedItem.rows[0]);

    res.status(201).json({
      success: true,
      log: mapConsumptionLogToFrontend(logResult.rows[0]),
      item: mapItemToFrontend(updatedItem.rows[0]),
    });
  } catch (error) {
    console.error('Log consumption error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/pantry/:id/consumption — Get all consumption logs for an item
const getConsumptionLog = async (req, res) => {
  try {
    const check = await db.query(
      'SELECT id FROM pantry_items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const result = await db.query(
      `SELECT id, pantry_item_id, quantity, unit, consumed_at, notes, created_at
       FROM consumption_logs
       WHERE pantry_item_id = $1 AND user_id = $2
       ORDER BY consumed_at DESC, created_at DESC`,
      [req.params.id, req.user.id]
    );

    // Also return total consumed
    const totalResult = await db.query(
      'SELECT COALESCE(SUM(quantity), 0) AS total FROM consumption_logs WHERE pantry_item_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      logs: result.rows.map(mapConsumptionLogToFrontend),
      totalConsumed: parseFloat(totalResult.rows[0].total),
    });
  } catch (error) {
    console.error('Get consumption log error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: map consumption log row to frontend
function mapConsumptionLogToFrontend(row) {
  return {
    id: row.id,
    pantryItemId: row.pantry_item_id,
    quantity: parseFloat(row.quantity),
    unit: row.unit,
    consumedAt: row.consumed_at || null,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

// Helper: map DB row to frontend camelCase
function mapItemToFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: parseFloat(row.quantity) || 0,
    unit: row.unit,
    expiryDate: row.expiry_date || null,
    addedDate: row.added_date,
    status: row.status || 'active',
    notes: row.notes || '',
    imageUrl: row.image_url || '',
    entryDate: row.entry_date || null,
    autoAddToGrocery: row.auto_add_to_grocery || false,
    currentQuantity: row.current_quantity !== null && row.current_quantity !== undefined ? parseFloat(row.current_quantity) : undefined,
    minQuantity: row.min_quantity !== null && row.min_quantity !== undefined ? parseFloat(row.min_quantity) : undefined,
  };
}

module.exports = {
  getAllItems, getItem, addItem, updateItem, deleteItem,
  updateStatus, bulkConsume, bulkDelete, getStats,
  getBatches, addBatch,
  logConsumption, getConsumptionLog,
};
