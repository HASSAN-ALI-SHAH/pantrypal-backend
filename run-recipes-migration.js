// Run the rich recipes migration (005 series)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function run() {
  const files = [
    'migrations/005_rich_recipes.sql',
    'migrations/005b_more_recipes.sql',
    'migrations/005c_recipe_ingredients.sql'
  ];

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      console.log(`⏳ Running ${file}...`);
      await db.query(sql);
      console.log(`✅ ${file} completed`);
    }
    console.log('\n🎉 All recipe data seeded successfully!');

    // Verify
    const count = await db.query('SELECT COUNT(*) FROM recipe_catalog');
    const ingCount = await db.query('SELECT COUNT(*) FROM recipe_catalog_ingredients');
    console.log(`   📊 ${count.rows[0].count} recipes with ${ingCount.rows[0].count} total ingredients`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
