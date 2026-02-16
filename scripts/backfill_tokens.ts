
import "dotenv/config";
import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { isNull, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

async function backfillTokens() {
    console.log("Checking for registrations without verification tokens...");

    // @ts-ignore
    const pending = await db.select().from(registrations).where(isNull(registrations.verificationToken));

    console.log(`Found ${pending.length} registrations to update.`);

    for (const reg of pending) {
        const token = randomUUID();
        // @ts-ignore
        await db.update(registrations)
            .set({ verificationToken: token })
            .where(eq(registrations.id, reg.id));
        console.log(`Updated registration ${reg.id} with token ${token}`);
    }

    console.log("Backfill complete.");
    process.exit(0);
}

backfillTokens().catch(console.error);
