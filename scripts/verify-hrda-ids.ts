
import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { db } from "../server/db";
import { registrations } from "../shared/schema";
import { isNull, desc } from "drizzle-orm";

async function verifyIds() {
    console.log("--- Verifying HRDA IDs ---");

    // 1. Check DB for NULL HRDA IDs
    const nullHrda = await db.select().from(registrations).where(isNull(registrations.hrdaId));
    console.log(`\n❌ Database Records with NULL HRDA ID: ${nullHrda.length}`);

    // 2. Check for any ID resembling '022026'
    const febIds = await db.select().from(registrations).where(sql`"hrda_id" LIKE '%022026%'`);
    console.log(`📅 Records with '022026' in ID: ${febIds.length}`);
    if (febIds.length > 0) {
        console.log(`Sample: ${febIds[0].hrdaId}`);
    }

    // 3. Check Sheet Last Row
    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id || !email || !key) return;

    key = key.replace(/\\n/g, '\n');
    const jwt = new JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const doc = new GoogleSpreadsheet(id, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const lastRow = rows[rows.length - 1];
    console.log(`\n📊 Sheet Total Rows: ${rows.length}`);
    console.log(`Last Row Index: ${lastRow.rowNumber}`);
    console.log(`Last Row Name: ${lastRow.get("Name")}`);
    console.log(`Last Row HRDA ID (in sheet): '${lastRow.get("HRDAREGISTRATIONNUMBER")}'`);

    process.exit(0);
}

// Helper for SQL like
import { sql } from "drizzle-orm";

verifyIds();
