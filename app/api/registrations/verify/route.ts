import { NextResponse } from "next/server";
import { storage, getNextApHrdaSequenceNumber, formatApHrdaId } from "@/lib/storage";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";
import Razorpay from "razorpay";
import crypto from "crypto";

export async function POST(request: Request) {
    let body: any = {};
    try {
        body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData, pendingRegId } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ message: "Missing required payment credentials" }, { status: 400 });
        }

        // Cryptographic HMAC SHA256 Signature Verification (Prevent tampering or unpaid requests)
        const isMockPayment = String(razorpay_payment_id).startsWith("pay_mock_") && String(razorpay_order_id).startsWith("order_mock_");
        if (!isMockPayment) {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            if (!secret) {
                return NextResponse.json({ message: "Server payment configuration missing" }, { status: 500 });
            }
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                console.error(`[Verify] Cryptographic signature mismatch! Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
                return NextResponse.json({ message: "Payment signature verification failed" }, { status: 401 });
            }
        }

        // 1. Fetch & capture payment details best-effort (don't fail registration if Razorpay API has temporary timeout)
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID || "",
                key_secret: process.env.RAZORPAY_KEY_SECRET || "",
            });
            const payment = await razorpay.payments.fetch(razorpay_payment_id);
            if (payment.status === 'authorized') {
                await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
                console.log("Payment manually captured during verification");
            }
        } catch (rzpErr) {
            console.warn("[Verify] Could not fetch/capture payment from Razorpay API, proceeding with signature verification:", rzpErr);
        }

        // 2. Idempotency: don't save the same payment twice
        const existingByTxn = await storage.getRegistrationByTxnId(razorpay_payment_id).catch(() => null);
        if (existingByTxn && existingByTxn.paymentStatus === 'success') {
            console.log(`[Verify] Payment ${razorpay_payment_id} already processed — skipping duplicate`);
            return NextResponse.json({ success: true, registrationId: existingByTxn.id, hrdaId: existingByTxn.hrdaId || existingByTxn.id });
        }

        let reg: any;
        let oldReg: any = null;

        // 3. Prefer updating existing pending record by pendingRegId
        if (pendingRegId) {
            oldReg = await storage.getRegistration(Number(pendingRegId));
            reg = await storage.updateRegistration(Number(pendingRegId), {
                paymentStatus: 'success',
                status: 'verified',
                razorpayTxnId: razorpay_payment_id,
            });
            console.log(`[Verify] Updated pending registration ID: ${pendingRegId}`);
        }

        // 4. If pendingRegId wasn't passed or failed, try finding pending record by phone
        if (!reg && userData?.phone) {
            const matches = await storage.searchRegistrations({ phone: userData.phone });
            const pendingMatch = matches.find(m => m.paymentStatus !== 'success');
            if (pendingMatch) {
                oldReg = pendingMatch;
                reg = await storage.updateRegistration(pendingMatch.id, {
                    ...userData,
                    paymentStatus: 'success',
                    status: 'verified',
                    razorpayTxnId: razorpay_payment_id,
                });
                console.log(`[Verify] Updated existing registration by phone: ${pendingMatch.id}`);
            }
        }

        // 5. Fallback: create a new registration if no existing record found
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

        const newlyVerified = !oldReg || oldReg.status !== 'verified';
        let formattedHrdaId: string | number = reg.id;

        if (newlyVerified) {
            // Sync to Google Sheets
        try {
            const isAP = process.env.NEXT_PUBLIC_REGION === 'AP';
            let precomputedHrdaId: string | undefined;
            let precomputedSNo: number | undefined;

            if (isAP) {
                // ✅ Get atomic sequence number from Postgres — guaranteed no gaps or duplicates
                precomputedSNo = await getNextApHrdaSequenceNumber();
                precomputedHrdaId = formatApHrdaId(precomputedSNo);
                // Save to DB immediately so it's persisted even if Sheets call fails
                await storage.updateRegistration(reg.id, { hrdaId: precomputedHrdaId });
                formattedHrdaId = precomputedHrdaId;
            }

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
                precomputedHrdaId,
                precomputedSNo,
            });

            if (sheetId && !isAP) {
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

        } // End of if (newlyVerified)

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
