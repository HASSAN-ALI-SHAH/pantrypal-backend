require('dotenv').config();
const db = require('./db');

const test = async () => {
  try {
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    if (userRes.rows.length === 0) return;
    const user_id = userRes.rows[0].id;

    // 1. Create a pantry item with 2 kg
    const itemRes = await db.query(`
      INSERT INTO pantry_items (user_id, name, quantity, current_quantity, unit, status)
      VALUES ($1, 'Test Item Purchase', 2, 2, 'kg', 'active') RETURNING *
    `, [user_id]);
    const item = itemRes.rows[0];
    console.log("Created Item:", item.id, item.name, item.current_quantity);

    // 2. Create a grocery item linked to it
    const groceryRes = await db.query(`
      INSERT INTO grocery_items (user_id, item_name, pantry_item_id, is_purchased)
      VALUES ($1, 'Test Item Purchase', $2, false) RETURNING *
    `, [user_id, item.id]);
    const groceryItem = groceryRes.rows[0];
    console.log("Created Grocery Item:", groceryItem.id);

    // 3. Purchase 10 kg
    const qty = 10;
    const updated = await db.query(
      `UPDATE pantry_items
       SET current_quantity = COALESCE(current_quantity, quantity, 0) + $1,
           quantity = COALESCE(quantity, 0) + $1,
           status = 'active'
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [qty, item.id, user_id]
    );
    console.log("Updated Pantry Item:", updated.rows[0].id, updated.rows[0].current_quantity);

  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    process.exit(0);
  }
};

test();
