
import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { lt } from "drizzle-orm";
import fs from "fs";

async function findOriginalDuplicates() {
    console.log("--- Identifying Original Pre-existing Duplicates ---");

    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id || !email || !key) {
        console.error("❌ Credentials missing in .env");
        process.exit(1);
    }

    try {
        // 1. Fetch DB Data created BEFORE the import (approximate time)
        // The import happened today (Feb 13, 2026). 
        // Let's filter for records created BEFORE 11:45 AM today.

        console.log("📥 Fetching pre-existing registrations from DB...");
        const allRegs = await db.select().from(registrations);

        // Filter: Created BEFORE 11:45 AM today (local time approx)
        // This is safe because the bulk import started after 11:45 AM.
        // We use a timestamp slightly before the import started.
        // Assuming user is in IST (GMT+5:30) as per logs.
        const importStartTime = new Date("2026-02-13T11:45:00+05:30");

        const preExisting = allRegs.filter(r => {
            // Also include records that don't have createdAt (legacy)
            if (!r.createdAt) return true;
            return new Date(r.createdAt) < importStartTime;
        });

        const phoneSet = new Set(preExisting.map(r => r.phone));
        const tgmcSet = new Set(preExisting.map(r => r.tgmcId).filter(Boolean));

        console.log(`✅ Found ${preExisting.length} pre-existing records (not from bulk import).`);

        // 2. Fetch Sheet Data
        key = key.replace(/\\n/g, '\n');
        const jwt = new JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(id, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        console.log(`📊 Scanning ${rows.length} rows...`);

        const skippedRecords: any[] = [];

        rows.forEach((row) => {
            const name = row.get("Name");
            const phone = row.get("ContactNumber");
            const tgmcId = row.get("MedicalCounselRegistration");

            if (!name || !phone) return;

            let isDuplicate = false;
            let reason = "";

            if (phoneSet.has(phone)) {
                isDuplicate = true;
                reason = `Phone match: ${phone}`;
            } else if (tgmcId && tgmcSet.has(tgmcId)) {
                isDuplicate = true;
                reason = `TGMC ID match: ${tgmcId}`;
            }

            if (isDuplicate) {
                skippedRecords.push({
                    row: row.rowNumber,
                    name,
                    phone,
                    tgmcId: tgmcId || "N/A",
                    reason
                });
            }
        });

        console.log(`
--- Result ---
🔍 Found ${skippedRecords.length} records that were skipped (already existed).
    `);

        fs.writeFileSync("skipped_records_details.json", JSON.stringify(skippedRecords, null, 2));
        console.log("📝 Details saved to 'skipped_records_details.json'");
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

findOriginalDuplicates();
