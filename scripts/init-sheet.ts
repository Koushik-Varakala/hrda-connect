
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

async function initSheet() {
    console.log("--- Initializing Google Sheet Headers ---");

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
        console.log(`✅ Connected to "${doc.title}"`);

        const sheet = doc.sheetsByIndex[0];
        await sheet.loadHeaderRow().catch(() => {
            // Prepare to ignore error if headers don't exist yet
        });

        console.log("📝 Writing Headers...");

        // The exact headers used in our code
        const headers = [
            "S.No",
            "Name",
            "DateofRegistration",
            "ContactNumber",
            "MailID",
            "MedicalCounselRegistration",
            "HRDAREGISTRATIONNUMBER",
            "PaymentStatus",
            "Address",
            "District",
            "AnotherMobileNumber"
        ];

        await sheet.setHeaderRow(headers);
        console.log("✅ Headers written successfully!");
        console.log("   Columns: " + headers.join(", "));
        console.log("\n🚀 Your sheet is now ready for data sync.");

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

initSheet();
