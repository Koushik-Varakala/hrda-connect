
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
    console.log("--- Google Sheets Diagnostic ---");
    console.log("1. Checking Environment Variables...");

    const id = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (!id) { console.error("❌ GOOGLE_SHEETS_ID is missing."); return; }
    if (!email) { console.error("❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is missing."); return; }
    if (!key) { console.error("❌ GOOGLE_PRIVATE_KEY is missing."); return; }

    console.log("✅ Credentials found.");
    console.log(`   ID: ${id}`);
    console.log(`   Email: ${email}`);

    console.log("\n2. Processing Private Key...");
    try {
        key = key.replace(/\\n/g, '\n');
        console.log("✅ Private key format processed.");
    } catch (e) {
        console.error("❌ Failed to process private key.", e);
        return;
    }

    console.log("\n3. Connecting to Google API...");
    try {
        const jwt = new JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(id, jwt);
        await doc.loadInfo();
        console.log(`✅ Connected! Sheet Title: "${doc.title}"`);

        console.log("\n4. Checking Permissions...");
        const sheet = doc.sheetsByIndex[0];
        console.log(`   Found Sheet[0]: "${sheet.title}"`);

        console.log("\n5. Attempting to Append Row...");
        const testRow = {
            "S.No": 9999,
            "Name": "Diagnostic Test",
            "DateofRegistration": new Date().toISOString()
        };

        await sheet.addRow(testRow);
        console.log("✅ Row added successfully! Please check your sheet.");

    } catch (error: any) {
        console.error("\n❌ FAILED:");
        console.error(error.message);
        if (error.response) {
            console.error("API Response:", JSON.stringify(error.response.data, null, 2));
        }

        if (error.message.includes("403")) {
            console.log("\n💡 HINT: This is a PERMISSION error. Did you share the sheet with the service account email?");
            console.log(`   Share with: ${email}`);
        }
    }
}

runTest();
