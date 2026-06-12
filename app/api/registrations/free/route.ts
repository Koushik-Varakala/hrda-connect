import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";
import { insertRegistrationSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Security Check: Only allow if region is AP and membershipType is free
        const isAP = process.env.NEXT_PUBLIC_REGION === 'AP';
        if (!isAP) {
            return NextResponse.json({ message: "Free registrations are only available in the AP region." }, { status: 400 });
        }

        const freeTypes = ["Student", "Contributory", "Founders"];
        if (!freeTypes.includes(body.membershipType)) {
            return NextResponse.json({ message: "Invalid or paid membership type requested on free registration endpoint." }, { status: 400 });
        }

        // 0. Pre-check: Ensure phone number doesn't already have a SUCCESSFUL registration
        if (body.phone) {
            const normalizedPhone = body.phone.replace(/\D/g, '').slice(-10);
            const existingRegistrations = await storage.searchRegistrations({ phone: normalizedPhone });
            const hasSuccessfulPayment = existingRegistrations.some(reg => reg.paymentStatus === 'success' || reg.paymentStatus === 'free');

            if (hasSuccessfulPayment) {
                return NextResponse.json({ message: "A successful registration with this phone number already exists." }, { status: 400 });
            }

            // Check Google Sheets
            try {
                const legacyUser = await googleSheetsService.findRegistrationByPhone(normalizedPhone);
                if (legacyUser && legacyUser.hrdaId) {
                    return NextResponse.json({ message: "A legacy registration with this phone number already exists." }, { status: 400 });
                }
            } catch (e: any) {
                console.error("[Free Reg API] Sheets legacy check error:", e);
            }
        }

        // 2. Parse and Create DB Registration
        const regInput = insertRegistrationSchema.parse({
            ...body,
            paymentStatus: "free",
            status: body.membershipType === "Contributory" ? "pending_verification" : "verified",
            razorpayTxnId: "FREE_MEMBERSHIP",
        });
        const reg = await storage.createRegistration(regInput);
        console.log(`[Free Reg API] Created free registration ID: ${reg.id}`);

        let formattedHrdaId: string | number = reg.id;

        // 3. Sync to Google Sheets
        try {
            const sheetId = await googleSheetsService.appendRegistration({
                id: String(reg.id),
                tgmcId: reg.tgmcId || "",
                firstName: reg.firstName,
                lastName: reg.lastName,
                phone: reg.phone,
                email: reg.email || "",
                address: reg.address || "",
                district: reg.district || "",
                membershipType: reg.membershipType || "Student",
                paymentStatus: "free",
                status: reg.status || "verified",
                registrationDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rowStatus: "Active",
            });

            if (sheetId) {
                formattedHrdaId = sheetId;
                await storage.updateRegistration(reg.id, { hrdaId: String(formattedHrdaId) });
            }
        } catch (e: any) {
            console.error("[Free Reg API] Sheets sync error:", e);
        }

        // 4. Send Confirmation Email
        try {
            if (reg.email) {
                await emailService.sendRegistrationConfirmation(
                    reg.email,
                    `${reg.firstName} ${reg.lastName}`,
                    reg.tgmcId || "N/A",
                    formattedHrdaId,
                    reg.phone,
                    reg.address || ""
                );
            }
        } catch (e: any) {
            console.error("[Free Reg API] Email send error:", e);
        }

        // 5. Send Confirmation SMS
        try {
            if (reg.phone) {
                await smsService.sendRegistrationSuccess(reg.phone, reg.firstName, formattedHrdaId, reg.tgmcId || "N/A");
            }
        } catch (e: any) {
            console.error("[Free Reg API] SMS send error:", e);
        }

        return NextResponse.json({ success: true, registrationId: reg.id, hrdaId: formattedHrdaId });
    } catch (err: any) {
        console.error("[Free Reg API] Catch-all error:", err);
        return NextResponse.json({ message: "Failed to complete free registration", error: err.message }, { status: 500 });
    }
}
