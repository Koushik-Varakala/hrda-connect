import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { log } from "../index";

// Update SheetRegistration interface to match new schema roughly
// Note: We'll construct the specific row array manually to match the order
export interface SheetRegistration {
    id: string; // Used for tracking locally
    tgmcId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    membershipType: string;
    paymentStatus: string;
    status: string;
    registrationDate: string;
    updatedAt: string;
    rowStatus: 'Active' | 'Updated';
    district?: string;
    anotherMobile?: string;
}

export class GoogleSheetsService {
    private doc: GoogleSpreadsheet | null = null;
    private isConnected = false;
    private initPromise: Promise<void>;

    constructor() {
        this.initPromise = this.initialize();
        this.initPromise.catch(err => {
            console.error("Failed to initialize Google Sheets service:", err.message);
        });
    }

    private async initialize() {
        if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            log("Google Sheets credentials missing. Running in mock mode.");
            return;
        }

        try {
            const jwt = new JWT({
                email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, jwt);
            await this.doc.loadInfo();
            this.isConnected = true;
            log(`Connected to Google Sheet: ${this.doc.title}`);
        } catch (error: any) {
            console.error("Google Sheets connection error DETAILS:", error);
            if (error.response) {
                console.error("API Error Response:", error.response.data);
            }
        }
    }

    private formatDate(isoString: string): string {
        try {
            const date = new Date(isoString);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        } catch {
            return isoString;
        }
    }

    async appendRegistration(data: SheetRegistration): Promise<boolean> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            log(`[Mock] Appending registration to sheet: ${data.firstName} ${data.lastName} (${data.tgmcId})`);
            return true;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];

            // 1. Fetch existing rows to calculate new ID
            const rows = await sheet.getRows();
            let lastSNo = 0;

            if (rows.length > 0) {
                // Determine last S.No. Try to parse the last row's S.No.
                // Assuming sequential, but let's check the last valid one.
                const lastRow = rows[rows.length - 1];
                const sno = parseInt(lastRow.get('S.No') || '0');
                if (!isNaN(sno)) lastSNo = sno;
            }

            const newSNo = lastSNo + 1;

            // 2. Generate HRDA ID
            // Format: HRDA(month)(year)-(sequence)
            // Sequence is basically the new S.No
            const date = new Date();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            // The prompt implies the suffix matches the S.No directly (e.g. 1775)
            // "if user1 has 0001 then user2 has 0002" -> suggests padding to 4 digits for small numbers?
            // "1775" is 4 digits. Let's pad to at least 4 digits.
            const sequenceStr = String(newSNo).padStart(4, '0');
            const hrdaId = `HRDA${month}${year}-${sequenceStr}`;

            // 3. Prepare Row Data
            // S.No | Name | DateofRegistration | ContactNumber | MailID | MedicalCounselRegistration | HRDAREGISTRATIONNUMBER | PaymentStatus | Address | District | AnotherMobileNumber

            await sheet.addRow({
                "S.No": newSNo,
                "Name": `${data.firstName} ${data.lastName}`,
                "DateofRegistration": this.formatDate(data.registrationDate),
                "ContactNumber": data.phone,
                "MailID": data.email,
                "MedicalCounselRegistration": data.tgmcId,
                "HRDAREGISTRATIONNUMBER": hrdaId,
                "PaymentStatus": data.paymentStatus,
                "Address": data.address,
                "District": data.district || "",
                "AnotherMobileNumber": data.anotherMobile || ""
            });
            log(`Successfully appended row for ${data.firstName} with ID ${hrdaId}`);

            return true;
        } catch (error: any) {
            console.error("Failed to append row to Google Sheet DETAILS:", error);
            if (error.response) {
                console.error("API Error Response:", error.response.data);
            }
            return false;
        }
    }

    async findRegistrationByTGMC(tgmcId: string): Promise<any | null> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            log(`[Mock] Finding registration by TGMC: ${tgmcId}`);
            return null;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            // Search by "MedicalCounselRegistration" (TSMC ID)
            const row = rows.reverse().find(r => r.get("MedicalCounselRegistration") === tgmcId);

            if (!row) return null;

            // Map back to our internal structure used by search page
            return {
                id: row.get("S.No"), // Use S.No as ID
                tgmcId: row.get("MedicalCounselRegistration"),
                firstName: row.get("Name"), // We'll have to return full name as first name or split logic
                lastName: "", // handled by consumer or split
                phone: row.get("ContactNumber"),
                email: row.get("MailID"),
                address: row.get("Address"),
                district: row.get("District")
            };
        } catch (error) {
            console.error("Error searching Google Sheet:", error);
            return null;
        }
    }

    async updateRegistration(tgmcId: string, newData: Partial<SheetRegistration>): Promise<boolean> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            log(`[Mock] Updating registration for TGMC: ${tgmcId}`);
            return true;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            const row = rows.find(r => r.get("MedicalCounselRegistration") === tgmcId);

            if (row) {
                // Update editable fields
                if (newData.phone) row.set("ContactNumber", newData.phone);
                if (newData.email) row.set("MailID", newData.email);
                if (newData.address) row.set("Address", newData.address);
                if (newData.district) row.set("District", newData.district);
                if (newData.anotherMobile) row.set("AnotherMobileNumber", newData.anotherMobile);

                await row.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error updating Google Sheet:", error);
            return false;
        }
    }
}

export const googleSheetsService = new GoogleSheetsService();
