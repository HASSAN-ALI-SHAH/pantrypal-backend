const db = require('./db');
async function run() {
  const res = await db.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'`);
  console.log(JSON.stringify(res.rows, null, 2));
}
run().then(() => db.pool.end());
