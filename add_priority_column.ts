
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking for 'priority' column in 'panels' table...");
    try {
        // Check if column exists
        const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'panels' AND column_name = 'priority';
    `);

        if (checkResult.rowCount === 0) {
            console.log("'priority' column not found. Adding it now...");
            await db.execute(sql`
        ALTER TABLE panels ADD COLUMN priority integer DEFAULT 99;
      `);
            console.log("Successfully added 'priority' column.");
        } else {
            console.log("'priority' column already exists.");
        }
    } catch (error) {
        console.error("Error modifying database:", error);
    }
    process.exit(0);
}

main();
