import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Falling back to memory storage.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db" });
export const db = drizzle(pool, { schema });
