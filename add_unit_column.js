require('dotenv').config();
const db = require('./db');

const test = async () => {
  try {
    console.log("Adding unit column to grocery_items...");
    await db.query(`ALTER TABLE grocery_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'Pieces'`);
    console.log("Column 'unit' added successfully.");
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    process.exit(0);
  }
};

test();
