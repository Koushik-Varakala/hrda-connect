
import "dotenv/config";
import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { desc, sql } from "drizzle-orm";

async function getLatest() {
    console.log("--- Checking Latest HRDA ID ---");

    // 1. Get the most recently created registration
    const [latestCreated] = await db.select()
        .from(registrations)
        .orderBy(desc(registrations.createdAt))
        .limit(1);

    console.log("\nRecent by Creation Time:");
    console.log(latestCreated ? `${latestCreated.firstName} ${latestCreated.lastName} - HRDA: ${latestCreated.hrdaId}` : "No records found");

    // 2. Get the one with highest HRDA ID (assuming format HRDA000...)
    // We'll try to sort by the numeric part if possible, or just string desc
    // Since SQL numeric extraction varies, we'll fetch a few top ones by string desc

    const topHrda = await db.select()
        .from(registrations)
        .orderBy(desc(registrations.hrdaId))
        .limit(5);

    console.log("\nHighest by HRDA ID (String Sort):");
    topHrda.forEach(r => {
        console.log(`${r.firstName} ${r.lastName} - HRDA: ${r.hrdaId}`);
    });

    // Try to find max numeric ID if they are just numbers
    // This is a rough check

    process.exit(0);
}

getLatest();
