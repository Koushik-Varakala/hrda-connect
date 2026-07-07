import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";

function getValue(row: any, possibleKeys: string[]): string {
    if (!row || typeof row !== 'object') return "";
    for (const key of Object.keys(row)) {
        const cleanKey = key.trim().toLowerCase();
        for (const possible of possibleKeys) {
            if (cleanKey === possible.toLowerCase() || cleanKey.includes(possible.toLowerCase())) {
                const val = row[key];
                if (val !== undefined && val !== null) {
                    return String(val).trim();
                }
            }
        }
    }
    return "";
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, rows } = body;

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ message: "Invalid rows data provided" }, { status: 400 });
        }

        if (action === "preview") {
            const allRegs = await storage.getRegistrations();
            
            const existingPhones = new Set(allRegs.map(r => r.phone?.trim()).filter(Boolean));
            const existingEmails = new Set(allRegs.map(r => r.email?.trim().toLowerCase()).filter(Boolean));
            const existingTgmc = new Set(allRegs.map(r => r.tgmcId?.trim().toLowerCase()).filter(Boolean));
            const existingHrda = new Set(allRegs.map(r => r.hrdaId?.trim().toLowerCase()).filter(Boolean));

            const toAdd: any[] = [];
            const toSkip: any[] = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const name = getValue(row, ["name", "doctor name", "full name", "member name"]);
                let phone = getValue(row, ["contact number", "contact", "phone", "mobile", "contact_number"]);
                const email = getValue(row, ["mailid", "mail id", "email", "mail", "email_id"]);
                let tgmcId = getValue(row, ["medical counsel registration", "medical council", "counsel registration", "council registration", "tgmc", "apmc", "registration no", "medical_counsel"]);
                const hrdaId = getValue(row, ["hrda registration number", "hrda number", "hrda id", "membership number", "hrda_id"]);
                const district = getValue(row, ["final district", "district"]);
                const address = getValue(row, ["address"]);

                // Skip empty lines
                if (!name && !phone && !email && !hrdaId) {
                    continue;
                }

                // Check duplicates against database and previously processed sheet rows
                if (phone && existingPhones.has(phone)) {
                    toSkip.push({ rowNumber: i + 1, name: name || "Unknown", hrdaId, reason: `Phone number (${phone}) already exists in database` });
                    continue;
                }
                if (email && existingEmails.has(email.toLowerCase())) {
                    toSkip.push({ rowNumber: i + 1, name: name || "Unknown", hrdaId, reason: `Email (${email}) already exists in database` });
                    continue;
                }
                if (tgmcId && tgmcId !== "0" && tgmcId !== "-" && existingTgmc.has(tgmcId.toLowerCase())) {
                    toSkip.push({ rowNumber: i + 1, name: name || "Unknown", hrdaId, reason: `Medical Council ID (${tgmcId}) already exists in database` });
                    continue;
                }
                if (hrdaId && existingHrda.has(hrdaId.toLowerCase())) {
                    toSkip.push({ rowNumber: i + 1, name: name || "Unknown", hrdaId, reason: `HRDA Registration Number (${hrdaId}) already exists in database` });
                    continue;
                }

                // Parse Name into firstName and lastName
                const cleanName = name || (hrdaId ? `Doctor ${hrdaId}` : "Doctor Member");
                const parts = cleanName.trim().split(/\s+/);
                const firstName = parts[0] || "Doctor";
                const lastName = parts.slice(1).join(" ") || "."; // Ensure notNull constraint is satisfied

                // Handle missing phone (required by database schema)
                if (!phone || phone === "0" || phone === "-" || phone === "N/A") {
                    phone = hrdaId ? `0000-${hrdaId}` : "0000000000";
                }

                if (tgmcId === "0" || tgmcId === "-" || tgmcId === "N/A") {
                    tgmcId = "";
                }

                const newRecord = {
                    firstName,
                    lastName,
                    phone,
                    email: email || null,
                    tgmcId: tgmcId || null,
                    hrdaId: hrdaId || null,
                    district: district || null,
                    address: address || null,
                    membershipType: "single",
                    paymentStatus: "success",
                    status: "verified",
                    registrationSource: "excel_import"
                };

                toAdd.push(newRecord);

                // Add to lookup sets so duplicate rows inside the same spreadsheet are also skipped
                if (phone) existingPhones.add(phone);
                if (email) existingEmails.add(email.toLowerCase());
                if (tgmcId && tgmcId !== "0") existingTgmc.add(tgmcId.toLowerCase());
                if (hrdaId) existingHrda.add(hrdaId.toLowerCase());
            }

            return NextResponse.json({
                toAdd,
                toSkip,
                summary: {
                    totalRows: rows.length,
                    newCount: toAdd.length,
                    skipCount: toSkip.length
                }
            });
        } else if (action === "execute") {
            let insertedCount = 0;
            for (const item of rows) {
                await storage.createRegistration(item);
                insertedCount++;
            }
            return NextResponse.json({ success: true, count: insertedCount });
        } else {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }
    } catch (err) {
        console.error("Admin Registrations Import API Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
