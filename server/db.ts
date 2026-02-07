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
  max: 4, // Reduce pool size to minimize connection overhead
  connectionTimeoutMillis: 5000, // Fail fast if connection cannot be established
  idleTimeoutMillis: 5000, // Close idle connections quickly to ensure freshness
  keepAlive: true,
  retryDelay: 1000 // Custom retry delay (not standard pg, but good for documentation)
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
export const db = drizzle(pool, { schema });
