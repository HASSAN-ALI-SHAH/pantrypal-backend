const db = require('./db');

async function updateDB() {
  try {
    console.log('Adding new columns to users table...');
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS otp VARCHAR(10),
      ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP;
    `);
    console.log('Database updated successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    db.pool.end();
  }
}

updateDB();
