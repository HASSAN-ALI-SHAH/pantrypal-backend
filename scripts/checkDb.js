const db = require('../db');

const checkDb = async () => {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ Database connected. Server time:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

if (require.main === module) {
  checkDb().then(() => db.pool.end());
}

module.exports = checkDb;
