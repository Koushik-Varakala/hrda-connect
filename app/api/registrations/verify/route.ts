import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";
import Razorpay from "razorpay";

export async function POST(request: Request) {
    let body: any = {};
    try {
        body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData, pendingRegId } = body;

        // Fetch payment details to verify status
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status === 'authorized') {
            await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
            console.log("Payment manually captured during verification");
        }

        // Idempotency: don't save the same payment twice
        const existingByTxn = await storage.getRegistrationByTxnId(razorpay_payment_id).catch(() => null);
        if (existingByTxn && existingByTxn.paymentStatus === 'success') {
            console.log(`[Verify] Payment ${razorpay_payment_id} already processed — skipping duplicate`);
            return NextResponse.json({ success: true, registrationId: existingByTxn.id, hrdaId: existingByTxn.hrdaId || existingByTxn.id });
        }

        let reg: any;

        // Prefer updating the existing pending record (avoids duplicates)
        if (pendingRegId) {
            reg = await storage.updateRegistration(Number(pendingRegId), {
                paymentStatus: 'success',
                status: 'verified',
                razorpayTxnId: razorpay_payment_id,
            });
            console.log(`[Verify] Updated pending registration ID: ${pendingRegId}`);
        }

        // Fallback: create a new registration if pendingRegId wasn't passed
        if (!reg) {
            const { insertRegistrationSchema } = await import("@shared/schema");
            const regInput = insertRegistrationSchema.parse({
                ...userData,
                paymentStatus: 'success',
                status: 'verified',
                razorpayTxnId: razorpay_payment_id,
            });
            reg = await storage.createRegistration(regInput);
            console.log(`[Verify] Created new registration ID: ${reg.id}`);
        }

        let formattedHrdaId: string | number = reg.id;

        // Sync to Google Sheets
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
                membershipType: reg.membershipType || "single",
                paymentStatus: "success",
                status: "verified",
                registrationDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rowStatus: "Active",
            });

            if (sheetId) {
                formattedHrdaId = sheetId;
                await storage.updateRegistration(reg.id, { hrdaId: String(formattedHrdaId) });
            }
        } catch (e: any) {
            console.error(JSON.stringify({
                step: "Verify Sync to Sheets",
                error: e.message || e,
                stack: e.stack,
                regId: reg?.id
            }, null, 2));
        }

        // Email
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
            console.error(JSON.stringify({
                step: "Verify Send Email",
                error: e.message || e,
                stack: e.stack,
                regId: reg?.id
            }, null, 2));
        }

        // SMS
        try {
            if (reg.phone) {
                await smsService.sendRegistrationSuccess(reg.phone, reg.firstName, formattedHrdaId, reg.tgmcId || "N/A");
            }
        } catch (e: any) {
            console.error(JSON.stringify({
                step: "Verify Send SMS",
                error: e.message || e,
                stack: e.stack,
                regId: reg?.id
            }, null, 2));
        }

        return NextResponse.json({ success: true, registrationId: reg.id, hrdaId: formattedHrdaId });

    } catch (error: any) {
        console.error(JSON.stringify({
            step: "Verification Flow Catch All",
            error: error.message || error,
            stack: error.stack,
            body
        }, null, 2));
        return NextResponse.json({ message: "Verification failed", error: error.message }, { status: 500 });
    }
}
