require('dotenv').config();
const { Pool, types } = require('pg');

// Fix timezone-induced date shift:
// By default, node-postgres converts DATE columns (OID 1082) into JS Date objects
// at midnight in the local timezone. When that Date is later serialized with
// .toISOString().split('T')[0], the UTC conversion shifts it back one day for UTC+ timezones.
// Returning the raw 'YYYY-MM-DD' string avoids this entirely.
types.setTypeParser(1082, (val) => val);   // DATE  → 'YYYY-MM-DD'

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
