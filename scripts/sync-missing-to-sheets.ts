/**
 * Script to:
 * 1. Insert tangelladr@gmail.com / 8639323324 (was falsely skipped)
 * 2. Sync all 9 missing registrations to Google Sheets
 *
 * Run: npx dotenv-cli -e .env -- npx tsx scripts/sync-missing-to-sheets.ts
 */

import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { eq, or, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const missingPhones = [
    "6301812004",
    "9848471756",
    "9849299988",
    "9959955440",
    "9849998342",
    "9000863505",
    "8639323324", // tangelladr — the falsely skipped one
    "9866554636",
    "9177595787",
];

const tangellaEntry = {
    email: "tangelladr@gmail.com",
    phone: "8639323324",
};

function formatDate(d: Date) {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

async function run() {
    // ── 1. Insert tangelladr if not already present ────────────────────────
    const existing = await db
        .select()
        .from(registrations)
        .where(or(
            eq(registrations.phone, tangellaEntry.phone),
            eq(registrations.email, tangellaEntry.email)
        ))
        .limit(1);

    if (existing.length > 0) {
        console.log(`⚠️  tangelladr already in DB (ID: ${existing[0].id}) — skipping insert`);
    } else {
        const [inserted] = await db.insert(registrations).values({
            firstName: "NA",
            lastName: "NA",
            tgmcId: "NA",
            phone: tangellaEntry.phone,
            email: tangellaEntry.email,
            address: "NA",
            district: "NA",
            membershipType: "single",
            paymentStatus: "success",
            status: "verified",
            razorpayTxnId: `manual_${tangellaEntry.phone}_${Date.now()}`,
            verificationToken: randomUUID(),
        }).returning();
        console.log(`✅ Inserted tangelladr → DB ID: ${inserted.id}`);
    }

    // ── 2. Fetch all 9 records from DB ─────────────────────────────────────
    const rows = await db
        .select()
        .from(registrations)
        .where(inArray(registrations.phone, missingPhones));

    console.log(`\nFound ${rows.length} records in DB to sync to Sheets.\n`);

    // ── 3. Connect to Google Sheets ────────────────────────────────────────
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const privateKey = rawKey.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n").trim();

    const jwt = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID!, jwt);
    await doc.loadInfo();
    console.log(`Connected to sheet: "${doc.title}"\n`);

    const sheet = doc.sheetsByIndex[0];
    const existingRows = await sheet.getRows();
    let lastSNo = 0;
    if (existingRows.length > 0) {
        const sno = parseInt(existingRows[existingRows.length - 1].get("S.No") || "0");
        if (!isNaN(sno)) lastSNo = sno;
    }

    // ── 4. Append each record ──────────────────────────────────────────────
    let synced = 0;
    for (const reg of rows) {
        const newSNo = lastSNo + 1;
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hrdaId = `HRDA${month}${year}-${String(newSNo).padStart(4, "0")}`;

        await sheet.addRow({
            "S.No": newSNo,
            "Name": `${reg.firstName} ${reg.lastName}`,
            "DateofRegistration": formatDate(date),
            "ContactNumber": reg.phone,
            "MailID": reg.email || "",
            "MedicalCounselRegistration": reg.tgmcId || "NA",
            "HRDAREGISTRATIONNUMBER": hrdaId,
            "PaymentStatus": "success",
            "Address": reg.address || "NA",
            "District": reg.district || "NA",
            "AnotherMobileNumber": "",
        });

        // Update hrdaId in DB too
        await db.update(registrations)
            .set({ hrdaId })
            .where(eq(registrations.id, reg.id));

        console.log(`✅ ${reg.email} / ${reg.phone} → Sheet row ${newSNo}, HRDA ID: ${hrdaId}`);
        lastSNo = newSNo;
        synced++;

        await new Promise(r => setTimeout(r, 200)); // avoid rate limits
    }

    console.log(`\nDone. ${synced} records synced to Google Sheets.`);
    process.exit(0);
}

run().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});
