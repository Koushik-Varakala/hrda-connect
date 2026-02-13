
import "dotenv/config";
import { db } from "../server/db";
import { registrations } from "../shared/schema";
import { eq } from "drizzle-orm";

async function checkSpecificId() {
    const targetId = "HRDA022026-2418";
    console.log(`Checking for ${targetId}...`);

    const record = await db.select().from(registrations).where(eq(registrations.hrdaId, targetId));

    if (record.length > 0) {
        console.log(`✅ Found: ${record[0].firstName} ${record[0].lastName} - ${record[0].hrdaId}`);
    } else {
        console.log("❌ Not found in database.");
    }
    process.exit(0);
}

checkSpecificId();
