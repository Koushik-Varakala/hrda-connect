/**
 * Script to check how older/legacy phone numbers are being registered.
 * We want to see how their paymentStatus is marked to understand why the existing
 * logic in the order route is failing for them.
 */

import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { eq, or, inArray } from "drizzle-orm";

async function run() {
    const phonesToTest = [
        "9849299988", // From yesterday's load
        "6301812004", // ...
        "9959955440"
    ];

    const results = await db
        .select()
        .from(registrations)
        .where(inArray(registrations.phone, phonesToTest));

    console.log(`Found ${results.length} results:`);
    for (const res of results) {
        console.log(`- ID: ${res.id}, Phone: ${res.phone}, PaymentStatus: ${res.paymentStatus}, Status: ${res.status}`);
    }

    process.exit(0);
}

run();
