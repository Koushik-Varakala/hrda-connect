import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Falling back to memory storage.",
  );
}

const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

console.log("Initializing DB Pool with URL length:", connectionString.length);

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10, // Limit pool size for serverless
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
export const db = drizzle(pool, { schema });
