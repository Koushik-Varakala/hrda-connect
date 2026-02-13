
import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import fs from "fs";

async function analyzeSheet() {
    console.log("--- Analyzing Sheet for Duplicates & Missing Data ---");

    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id || !email || !key) {
        console.error("❌ Credentials missing in .env");
        process.exit(1);
    }

    try {
        // 1. Fetch DB Data (for duplicate checking)
        console.log("📥 Fetching existing registrations from DB...");
        const allRegs = await db.select({
            id: registrations.id,
            phone: registrations.phone,
            tgmcId: registrations.tgmcId,
            firstName: registrations.firstName,
            lastName: registrations.lastName
        }).from(registrations);

        const phoneSet = new Set(allRegs.map(r => r.phone));
        const tgmcSet = new Set(allRegs.map(r => r.tgmcId).filter(Boolean)); // Filter nulls

        console.log(`✅ Loaded ${allRegs.length} existing records.`);

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

        const report = {
            missingData: [] as any[],
            duplicates: [] as any[],
            summary: {
                totalRows: rows.length,
                missingCount: 0,
                duplicateCount: 0
            }
        };

        rows.forEach((row) => {
            const name = row.get("Name");
            const phone = row.get("ContactNumber");
            const tgmcId = row.get("MedicalCounselRegistration");
            const hrdaId = row.get("HRDAREGISTRATIONNUMBER");

            // Check Missing
            if (!name || !phone) {
                report.missingData.push({
                    row: row.rowNumber,
                    name: name || "[MISSING]",
                    phone: phone || "[MISSING]"
                });
                return; // Don't check duplicate if missing essential data
            }

            // Check Duplicate
            let isDuplicate = false;
            let reason = "";

            if (phoneSet.has(phone)) {
                isDuplicate = true;
                reason = `Phone matches: ${phone}`;
            } else if (tgmcId && tgmcSet.has(tgmcId)) {
                isDuplicate = true;
                reason = `TGMC ID matches: ${tgmcId}`;
            }

            if (isDuplicate) {
                report.duplicates.push({
                    row: row.rowNumber,
                    name,
                    phone,
                    tgmcId: tgmcId || "N/A",
                    reason
                });
            }
        });

        report.summary.missingCount = report.missingData.length;
        report.summary.duplicateCount = report.duplicates.length;

        console.log(`
--- Analysis Complete ---
❌ Missing Data: ${report.summary.missingCount} rows
Match Duplicates: ${report.summary.duplicateCount} rows
    `);

        fs.writeFileSync("sheet_analysis_report.json", JSON.stringify(report, null, 2));
        console.log("📝 Full report saved to 'sheet_analysis_report.json'");
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

analyzeSheet();
