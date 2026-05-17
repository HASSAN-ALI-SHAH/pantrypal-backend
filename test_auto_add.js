require('dotenv').config();
const db = require('./db');

const test = async () => {
  try {
    console.log("Checking DB connection...");
    const res = await db.query('SELECT NOW()');
    console.log("DB Time:", res.rows[0].now);

    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log("No users found.");
      return;
    }
    const user_id = userRes.rows[0].id;
    console.log("Using user_id:", user_id);

    const item = {
      name: 'Test Auto Add Item ' + Date.now(),
      category: 'Other',
      quantity: 1,
      current_quantity: 0,
      unit: 'Pieces',
      min_quantity: 1,
      auto_add_to_grocery: true,
      status: 'active'
    };

    console.log("Simulating handleAutoAddToGrocery...");
    const isConsumed = item.status === 'consumed';
    const currentQty = parseFloat(item.current_quantity ?? item.quantity) || 0;
    const minQty = parseFloat(item.min_quantity);
    
    const isBelowMin = !isNaN(minQty) && currentQty <= minQty;
    const isZero = currentQty === 0;

    console.log({ isConsumed, currentQty, minQty, isBelowMin, isZero });

    if (isConsumed || isBelowMin || isZero) {
      const existing = await db.query(
        `SELECT id FROM grocery_items WHERE user_id = $1 AND item_name = $2 AND is_purchased = false`,
        [user_id, item.name]
      );
      if (existing.rows.length === 0) {
        const suggestedQty = (!isNaN(minQty) && minQty > 0) ? minQty : 1;
        console.log("Inserting into grocery_items...");
        const insertRes = await db.query(
          `INSERT INTO grocery_items
            (user_id, item_name, category, suggested_quantity, unit, triggered_by, min_quantity, pantry_item_id, is_purchased)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
          [
            user_id, item.name, item.category || 'Other', suggestedQty, item.unit || 'Pieces',
            isBelowMin && !isConsumed && !isZero ? 'low_stock' : 'consumed', 
            item.min_quantity || null, 99999
          ]
        );
        console.log("Insert Success:", insertRes.rows[0]);
      } else {
        console.log("Item already exists.");
      }
    }
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    process.exit(0);
  }
};

test();
