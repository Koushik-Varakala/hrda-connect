import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws"; // Removed for Next.js edge/serverless compatibility
import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws; // Not needed for HTTP-based serverless driver

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
