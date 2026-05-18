import { Pool } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Prevent multiple pools during development hot reloading
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  pool = (global as any).pgPool;
}

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}

export default pool;
