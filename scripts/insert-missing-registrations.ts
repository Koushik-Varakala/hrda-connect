/**
 * Script to manually insert missing registrations where payment was captured
 * but data was not saved to the DB.
 *
 * Run with: npx tsx scripts/insert-missing-registrations.ts
 */

import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { eq, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const missingRegistrations = [
    { email: "karnatishashirekha@gmail.com", phone: "6301812004" },
    { email: "drvpatwari@gmail.com", phone: "9848471756" },
    { email: "drpvrk55@gmail.com", phone: "9849299988" },
    { email: "dr.rajeshwar52829@gmail.com", phone: "9959955440" },
    { email: "ragz0000@gmail.com", phone: "9849998342" },
    { email: "shravs8890@gmail.com", phone: "9000863505" },
    { email: "tangelladr@gmail.com", phone: "8639323324" },
    { email: "ajayperala@gamil.com", phone: "9866554636" }, // typo in original (gamil)
    { email: "dr.sravanthiyerragolla@gmail.com", phone: "9177595787" },
];

async function insertMissing() {
    console.log(`Inserting ${missingRegistrations.length} missing registrations...\n`);

    let success = 0;
    let skipped = 0;

    for (const entry of missingRegistrations) {
        try {
            // Skip if phone or email already exists
            const existing = await db
                .select()
                .from(registrations)
                .where(or(
                    eq(registrations.phone, entry.phone),
                    eq(registrations.email, entry.email)
                ))
                .limit(1);

            if (existing.length > 0) {
                console.log(`⚠️  SKIPPED (already exists): ${entry.email} / ${entry.phone}`);
                skipped++;
                continue;
            }

            const [inserted] = await db.insert(registrations).values({
                firstName: "NA",
                lastName: "NA",
                tgmcId: "NA",
                phone: entry.phone,
                email: entry.email,
                address: "NA",
                district: "NA",
                membershipType: "single",
                paymentStatus: "success",
                status: "verified",
                razorpayTxnId: `manual_${entry.phone}_${Date.now()}`,
                verificationToken: randomUUID(),
            }).returning();

            console.log(`✅ Inserted: ${entry.email} / ${entry.phone} → DB ID: ${inserted.id}`);
            success++;

            await new Promise(r => setTimeout(r, 30)); // avoid txnId collision
        } catch (err: any) {
            console.error(`❌ FAILED: ${entry.email} / ${entry.phone} →`, err.message);
        }
    }

    console.log(`\nDone. ${success} inserted, ${skipped} skipped.`);
    process.exit(0);
}

insertMissing();
