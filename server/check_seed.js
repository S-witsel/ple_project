const { query, pool } = require('./db');

async function check() {
  try {
    const tables = ['users','teams','team_members','projects','tasklists','tasks','characters','team_invites'];
    for (const t of tables) {
      const cnt = await query(`SELECT count(*) AS c FROM ${t}`);
      console.log(`${t}: ${cnt.rows[0].c}`);
      const sample = await query(`SELECT * FROM ${t} LIMIT 5`);
      console.log(JSON.stringify(sample.rows, null, 2));
    }
  } catch (err) {
    console.error('Error checking seed', err);
  } finally {
    await pool.end();
  }
}

check();
