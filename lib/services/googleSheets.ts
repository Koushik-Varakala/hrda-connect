import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

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
            console.log("Google Sheets credentials missing. Running in mock mode.");
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
            console.log(`Connected to Google Sheet: ${this.doc.title}`);
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

    async appendRegistration(data: SheetRegistration): Promise<string | null> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            const hrdaId = `HRDA-MOCK-${data.id}`;
            console.log(`[Mock] Appending registration to sheet: ${data.firstName} ${data.lastName} (${data.tgmcId}) - Generated ID: ${hrdaId}`);
            return hrdaId;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];

            // 1. Fetch existing rows to calculate new ID
            const rows = await sheet.getRows();
            let lastSNo = 0;

            if (rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const sno = parseInt(lastRow.get('S.No') || '0');
                if (!isNaN(sno)) lastSNo = sno;
            }

            const newSNo = lastSNo + 1;

            // 2. Generate HRDA ID
            const date = new Date();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const sequenceStr = String(newSNo).padStart(4, '0');
            const hrdaId = `HRDA${month}${year}-${sequenceStr}`;

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
            console.log(`Successfully appended row for ${data.firstName} with ID ${hrdaId}`);

            return hrdaId;
        } catch (error: any) {
            console.error("Failed to append row to Google Sheet DETAILS:", error);
            if (error.response) {
                console.error("API Error Response:", error.response.data);
            }
            return null;
        }
    }

    async findRegistrationByTGMC(tgmcId: string): Promise<any | null> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            console.log(`[Mock] Finding registration by TGMC: ${tgmcId}`);
            return null;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            const row = rows.reverse().find(r => r.get("MedicalCounselRegistration") === tgmcId);

            if (!row) return null;

            return {
                id: row.get("S.No"),
                hrdaId: row.get("HRDAREGISTRATIONNUMBER"),
                tgmcId: row.get("MedicalCounselRegistration"),
                firstName: row.get("Name"),
                lastName: "",
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

    async findRegistrationByPhone(phone: string): Promise<any | null> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            console.log(`[Mock] Finding registration by Phone: ${phone}`);
            return null;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            const row = rows.reverse().find(r => r.get("ContactNumber") === phone);

            if (!row) return null;

            return {
                id: row.get("S.No"),
                hrdaId: row.get("HRDAREGISTRATIONNUMBER"),
                tgmcId: row.get("MedicalCounselRegistration"),
                firstName: row.get("Name"),
                phone: row.get("ContactNumber"),
                email: row.get("MailID"),
                address: row.get("Address"),
                district: row.get("District")
            };
        } catch (error) {
            console.error("Error searching Google Sheet by Phone:", error);
            return null;
        }
    }

    async updateRegistration(tgmcId: string, newData: Partial<SheetRegistration>): Promise<boolean> {
        await this.initPromise;

        if (!this.isConnected || !this.doc) {
            console.log(`[Mock] Updating registration for TGMC: ${tgmcId}`);
            return true;
        }

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            const row = rows.find(r => r.get("MedicalCounselRegistration") === tgmcId);

            if (row) {
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
