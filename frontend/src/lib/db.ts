import { Pool } from 'pg';

const globalAny: any = global;

let pool: Pool;

if (!globalAny.postgresPool) {
  globalAny.postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

pool = globalAny.postgresPool;

export default pool;