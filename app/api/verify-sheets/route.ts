import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function GET() {
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;

    // Check env vars present
    if (!sheetsId || !email || !rawKey) {
        return NextResponse.json({
            status: "error",
            message: "Missing environment variables",
            present: {
                GOOGLE_SHEETS_ID: !!sheetsId,
                GOOGLE_SERVICE_ACCOUNT_EMAIL: !!email,
                GOOGLE_PRIVATE_KEY: !!rawKey,
            }
        }, { status: 500 });
    }

    // Normalize key
    const privateKey = rawKey
        .replace(/\\\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .trim();

    const keyPreview = `${privateKey.slice(0, 40)}...${privateKey.slice(-20)}`;

    try {
        const jwt = new JWT({
            email,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetsId, jwt);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows({ limit: 1 });

        return NextResponse.json({
            status: "ok",
            sheetTitle: doc.title,
            firstSheetTitle: sheet.title,
            rowCount: sheet.rowCount,
            keyPreview,
            email,
            sheetsId,
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error?.message || String(error),
            apiDetail: error?.response?.data || null,
            keyPreview,
            email,
            sheetsId,
        }, { status: 500 });
    }
}
