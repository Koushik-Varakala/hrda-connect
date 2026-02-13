import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { db } from "../lib/db";
import { registrations } from "../shared/schema";
import { eq, or } from "drizzle-orm";

async function importRegistrations() {
    console.log("--- Starting Registration Import from Google Sheets ---");

    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id || !email || !key) {
        console.error("❌ Credentials missing in .env");
        process.exit(1);
    }

    try {
        // 1. Connect to Sheet
        key = key.replace(/\\n/g, '\n');
        const jwt = new JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(id, jwt);
        await doc.loadInfo();
        console.log(`✅ Connected to Sheet: "${doc.title}"`);

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        console.log(`📊 Found ${rows.length} rows to process.`);

        let added = 0;
        let skipped = 0;
        let errors = 0;

        for (const row of rows) {
            const name = row.get("Name");
            const phone = row.get("ContactNumber");
            const email = row.get("MailID");
            const tgmcId = row.get("MedicalCounselRegistration");
            const hrdaId = row.get("HRDAREGISTRATIONNUMBER");
            const paymentStatus = row.get("PaymentStatus"); // 'Paid' or 'Unpaid' usually
            const address = row.get("Address");
            const district = row.get("District");
            const regDateRaw = row.get("DateofRegistration");
            // const anotherMobile = row.get("AnotherMobileNumber");

            if (!name || !phone) {
                console.warn(`⚠️ Skipping row with missing Name or Phone (Row: ${row.rowNumber})`);
                errors++;
                continue;
            }

            // 2. Check overlap
            // We check by Phone OR TGMC ID (if exists)
            const existing = await db.select().from(registrations).where(
                or(
                    eq(registrations.phone, phone),
                    tgmcId ? eq(registrations.tgmcId, tgmcId) : undefined
                )
            );

            if (existing.length > 0) {
                // console.log(`⏭️ Skipping duplicate: ${name} (${phone})`);
                skipped++;
                continue;
            }

            // 3. Map Data
            // Split Name into First/Last
            const nameParts = name.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ") || "."; // Postgres non-null constraint

            // Parse Date (Assuming DD/MM/YYYY or similar, or just relying on text/null if malformed)
            // If date parsing fails, default to now or null?
            // Let's try simple Date parse
            let createdAt = new Date();
            if (regDateRaw) {
                const parsedDate = new Date(regDateRaw);
                if (!isNaN(parsedDate.getTime())) {
                    createdAt = parsedDate;
                }
            }

            // Map Payment Status
            let dbPaymentStatus = 'pending';
            if (paymentStatus && paymentStatus.toLowerCase().includes('paid')) {
                dbPaymentStatus = 'success';
            }

            // 4. Insert
            try {
                await db.insert(registrations).values({
                    firstName,
                    lastName,
                    email: email || null,
                    phone,
                    address: address || null,
                    district: district || null,
                    tgmcId: tgmcId || null,
                    hrdaId: hrdaId || null,
                    paymentStatus: dbPaymentStatus,
                    status: 'verified', // Assume imported data is verified? Or 'pending_verification'? Let's say 'verified' if they have HRDA ID.
                    registrationSource: 'google_sheet_import',
                    createdAt,
                    updatedAt: new Date(),
                    otpAttempts: 0
                });
                added++;
                // console.log(`✅ Added: ${firstName} ${lastName}`);
            } catch (err: any) {
                console.error(`❌ Failed to insert ${name}:`, err.message);
                errors++;
            }
        }

        console.log("\n--- Import Summary ---");
        console.log(`✅ Added: ${added}`);
        console.log(`⏭️ Skipped (Duplicate): ${skipped}`);
        console.log(`❌ Errors/Missing Data: ${errors}`);
        console.log("----------------------");

    } catch (error: any) {
        console.error("❌ Fatal Error:", error);
        if (error.response) console.error("Response:", error.response.data);
        process.exit(1);
    }
}

importRegistrations();
