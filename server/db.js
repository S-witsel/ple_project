const { Pool } = require('pg');

const pool = new Pool({
  // Prefer DATABASE_URL env var. Default to local PLEdb if not set.
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/PLEdb',
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  query,
  pool,
};
