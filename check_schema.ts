
import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'panels';
    `);
        console.log("Columns in 'panels' table:");
        console.table(result.rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

checkSchema();
