
import { db, pool } from "../lib/db";
import { registrations } from "../shared/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting registration data cleanup...");
    try {
        // Check current count
        const countResult = await db.select({ count: sql<number>`count(*)` }).from(registrations);
        console.log(`Current registration count: ${countResult[0]?.count}`);

        if (Number(countResult[0]?.count) > 0) {
            console.log("Deleting all registrations...");
            await db.delete(registrations);
            console.log("Deletion executed.");

            // Verify
            const newCountResult = await db.select({ count: sql<number>`count(*)` }).from(registrations);
            console.log(`New registration count: ${newCountResult[0]?.count}`);
        } else {
            console.log("No registrations to delete.");
        }

    } catch (error) {
        console.error("Error clearing registrations:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
