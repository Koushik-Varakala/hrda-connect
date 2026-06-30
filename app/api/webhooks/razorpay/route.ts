import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";

/**
 * Razorpay Webhook Handler
 *
 * This runs server-to-server — completely independent of what happens in the user's
 * browser. Even if the user closes the tab right after payment, this fires and saves
 * the registration to the DB and Google Sheets.
 *
 * Setup in Razorpay Dashboard:
 *   Settings → Webhooks → Add Webhook
 *   URL: https://hrda-india.org/api/webhooks/razorpay
 *   Secret: set RAZORPAY_WEBHOOK_SECRET in env
 *   Events: payment.captured
 */
export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // 1. Verify webhook signature (skip if no secret configured — for initial testing)
    if (webhookSecret) {
        const expectedSig = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (expectedSig !== signature) {
            console.error("[Webhook] Invalid signature — rejecting request");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    } else {
        console.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping signature check");
    }

    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = event.event;
    console.log(`[Webhook] Received event: ${eventType}`);

    // Only handle payment.captured
    if (eventType !== "payment.captured") {
        return NextResponse.json({ status: "ignored", event: eventType });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
        return NextResponse.json({ error: "Missing payment entity" }, { status: 400 });
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;
    const notes = payment.notes || {};

    console.log(`[Webhook] Processing payment: ${paymentId}, order: ${orderId}`);

    // 2. Idempotency check — don't save the same payment twice
    try {
        const existing = await storage.getRegistrationByTxnId(paymentId);
        if (existing) {
            console.log(`[Webhook] Payment ${paymentId} already processed — skipping`);
            return NextResponse.json({ status: "already_processed" });
        }
    } catch (e) {
        // If the method doesn't exist yet, we'll just proceed
        console.warn("[Webhook] Could not check for existing registration:", e);
    }

    // 3. Extract userData from Razorpay order notes
    const userData = {
        firstName: notes.firstName || "Unknown",
        lastName: notes.lastName || "",
        tgmcId: notes.tgmcId || "",
        phone: notes.phone || "",
        email: notes.email || "",
        district: notes.district || "",
        address: notes.address || "",
        membershipType: notes.membershipType || "single",
    };

    if (!userData.phone && !userData.email) {
        console.error(`[Webhook] No userData in order notes for payment ${paymentId}. Notes:`, notes);
        // Still return 200 so Razorpay doesn't retry — but log it
        return NextResponse.json({ status: "no_user_data", paymentId });
    }

    // 4. Save to database — update pending record if it exists, otherwise create new
    let newReg: any;
    let oldReg: any = null;
    try {
        const pendingRegId = notes.pendingRegId ? Number(notes.pendingRegId) : null;
        if (pendingRegId) {
            oldReg = await storage.getRegistration(pendingRegId);
            newReg = await storage.updateRegistration(pendingRegId, {
                paymentStatus: "success",
                status: "verified",
                razorpayTxnId: paymentId,
            });
            console.log(`[Webhook] Updated existing pending registration ID: ${pendingRegId}`);
        } else {
            const { insertRegistrationSchema } = await import("@shared/schema");
            const regInput = insertRegistrationSchema.parse({
                ...userData,
                paymentStatus: "success",
                status: "verified",
                razorpayTxnId: paymentId,
            });
            newReg = await storage.createRegistration(regInput);
            console.log(`[Webhook] Created new registration ID: ${newReg.id}`);
        }
    } catch (e) {
        console.error("[Webhook] Failed to save registration to DB:", e);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    const newlyVerified = !oldReg || oldReg.status !== "verified";

    // 5. Append to Google Sheets
    let formattedHrdaId: string | number = newReg.id;
    if (newlyVerified) {
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
            console.log(`[Webhook] Added to sheets: ${sheetId}`);
        } catch (e) {
            console.error("[Webhook] Google Sheets sync failed:", e);
        }

        // 6. Send Notifications
        if (newReg.email) {
            await emailService.sendRegistrationConfirmation(
                newReg.email,
                `${newReg.firstName} ${newReg.lastName}`,
                newReg.tgmcId || "N/A",
                formattedHrdaId,
                newReg.phone,
                newReg.address || ""
            ).catch(console.error);
        }

        if (newReg.phone) {
            await smsService.sendRegistrationSuccess(
                newReg.phone, 
                newReg.firstName, 
                formattedHrdaId, 
                newReg.tgmcId || "N/A"
            ).catch(console.error);
        }
    }

    console.log(`[Webhook] ✅ Payment processed for ${newReg.firstName} (${paymentId}).`);
    return NextResponse.json({ status: "ok", hrdaId: formattedHrdaId });
}
