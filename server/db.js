const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ple_project',
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  query,
  pool,
};
