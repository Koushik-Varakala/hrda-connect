import "dotenv/config";
import pg from "pg";

const { Client } = pg;

async function run() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is missing in .env");
        process.exit(1);
    }

    console.log("Connecting to database...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected.");

        const query = `
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);

      ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `;

        console.log("Creating 'session' table...");
        await client.query(query);
        console.log("Session table created successfully!");

    } catch (err: any) {
        if (err.message?.includes('already exists')) {
            console.log("Table already exists (that is good).");
        } else {
            console.error("Error creating table:", err);
        }
    } finally {
        await client.end();
    }
}

run();
