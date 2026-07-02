const { Pool } = require('pg');

// Configure connection credentials. Defaults to standard local Postgres setup.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kshetrax';

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('🐘 Connected to PostgreSQL database pool');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
