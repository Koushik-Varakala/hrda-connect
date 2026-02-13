
import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import fs from "fs";

async function auditSheet() {
    console.log("--- Auditing Google Sheet for Missing Data ---");

    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id || !email || !key) {
        console.error("❌ Credentials missing in .env");
        return;
    }

    try {
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

        const missingRecords: any[] = [];

        rows.forEach((row) => {
            const name = row.get("Name");
            const phone = row.get("ContactNumber");

            if (!name || !phone) {
                missingRecords.push({
                    rowNumber: row.rowNumber,
                    missing: !name && !phone ? "Name & Phone" : !name ? "Name" : "Phone",
                    data: {
                        name: name || "[MISSING]",
                        phone: phone || "[MISSING]",
                        tgmcId: row.get("MedicalCounselRegistration") || "",
                        hrdaId: row.get("HRDAREGISTRATIONNUMBER") || ""
                    }
                });
            }
        });

        console.log(`Found ${missingRecords.length} rows with missing data.`);

        const report = JSON.stringify(missingRecords, null, 2);
        fs.writeFileSync("skipped_rows_report.json", report);
        console.log("📝 Report saved to skipped_rows_report.json");

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

auditSheet();
