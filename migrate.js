const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigrations() {
  try {
    // 1. Ensure schema_migrations table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Get list of all migration files sorted
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // 3. Get applied migrations
    const appliedRes = await db.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(appliedRes.rows.map(r => r.filename));

    // 4. Run unapplied migrations
    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`🔄 Running migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await db.query(sql);
        await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        console.log(`✅ Migration ${file} applied successfully!`);
      } else {
        console.log(`⏩ Skipping ${file} (already applied)`);
      }
    }
    
    console.log('🎉 All database migrations are up to date!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    return false;
  }
}

if (require.main === module) {
  runMigrations().then(() => db.pool.end());
}

module.exports = runMigrations;
