
import { pool } from "./db";

async function main() {
    console.log("Fixing session table...");
    const client = await pool.connect();
    try {
        // Drop if exists to be clean or just create if not exists?
        // Let's create if not exists to be safe.

        await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
        console.log("Created table 'session'.");

        await client.query(`
      ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
    `);

        await client.query(`
      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    `);
        console.log("Added PK constraint.");

        await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
        console.log("Created index 'IDX_session_expire'.");

        console.log("Session table fixed successfully.");
    } catch (err) {
        console.error("Error fixing session table:", err);
    } finally {
        client.release();
        pool.end();
    }
}

main();
