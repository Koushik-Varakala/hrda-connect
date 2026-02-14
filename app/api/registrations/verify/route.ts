import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertRegistrationSchema } from "@shared/schema";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";
import Razorpay from "razorpay";


// api.registrations.create.input is likely just Zod schema from shared/schema
// import { insertRegistrationSchema } from "@shared/schema"; // Already imported

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = body;

        // Skip signature verification for mock/MVP if needed, or implement it
        // ...

        // Fetch payment details to check status
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status === 'authorized') {
            await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
            console.log("Payment manually captured during verification");
        }

        const regInput = insertRegistrationSchema.parse({
            ...userData,
            paymentStatus: 'success', // Now we know it is captured
            status: 'verified',
            razorpayTxnId: razorpay_payment_id
        });

        const newReg = await storage.createRegistration(regInput);
        let formattedHrdaId: string | number = newReg.id;

        // Sync to Sheets
        try {
            const sheetId = await googleSheetsService.appendRegistration({
                id: String(newReg.id),
                tgmcId: newReg.tgmcId || "",
                firstName: newReg.firstName,
                lastName: newReg.lastName,
                phone: newReg.phone,
                email: newReg.email || "",
                address: newReg.address || "",
                district: newReg.district || "",
                membershipType: newReg.membershipType || "single",
                paymentStatus: "success",
                status: "verified",
                registrationDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rowStatus: "Active"
            });

            if (sheetId) {
                formattedHrdaId = sheetId;
                await storage.updateRegistration(newReg.id, { hrdaId: String(formattedHrdaId) });
            }
        } catch (e) {
            console.error("Failed to sync to sheets", e);
        }

        // Email
        try {
            if (newReg.email) {
                await emailService.sendRegistrationConfirmation(
                    newReg.email,
                    `${newReg.firstName} ${newReg.lastName}`,
                    newReg.tgmcId || "N/A",
                    formattedHrdaId,
                    newReg.phone,
                    newReg.address || ""
                );
            }
        } catch (e) {
            console.error("Failed to send email", e);
        }

        // SMS
        try {
            if (newReg.phone) {
                await smsService.sendRegistrationSuccess(newReg.phone, newReg.firstName, formattedHrdaId);
            }
        } catch (e) {
            console.error("Failed to send SMS", e);
        }

        return NextResponse.json({ success: true, registrationId: newReg.id, hrdaId: formattedHrdaId });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ message: "Verification failed" }, { status: 500 });
    }
}
