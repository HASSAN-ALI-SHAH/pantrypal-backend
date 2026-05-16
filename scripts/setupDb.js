const db = require('../db');
const migrate = require('../migrate');

const setupDb = async () => {
  try {
    console.log('Running database setup...');
    await migrate();
    console.log('Database setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

if (require.main === module) {
  setupDb().then(() => db.pool.end());
}

module.exports = setupDb;
