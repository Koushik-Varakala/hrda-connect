import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { emailService } from "@/lib/services/email";

export async function POST(request: Request) {
    try {
        const bodyText = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ message: "Missing signature" }, { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error("[Nomination Webhook] Webhook secret not configured");
            return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
        }

        // 1. Verify Webhook Signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyText)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("[Nomination Webhook] Invalid signature");
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        // 2. Parse Event
        const event = JSON.parse(bodyText);
        
        // We only care about successful payments
        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;
            
            // Try to extract nominationId from notes if available
            const notes = payment.notes || {};
            const nominationIdStr = notes.nominationId;

            // 3. Find corresponding pending nomination
            let nomination;
            
            if (nominationIdStr) {
                nomination = await storage.getNominationById(Number(nominationIdStr));
            } else if (orderId) {
                // Fallback to searching by order ID
                nomination = await storage.getNominationByOrderId(orderId);
            }

            if (!nomination) {
                console.error(`[Nomination Webhook] No matching nomination found for order ${orderId} or payment ${paymentId}`);
                // Return 200 anyway so Razorpay doesn't keep retrying
                return NextResponse.json({ received: true });
            }

            // 4. Check if it's already processed (Idempotency)
            if (nomination.paymentStatus === 'success' || nomination.status === 'payment_success' || nomination.status === 'submitted') {
                console.log(`[Nomination Webhook] Nomination ${nomination.id} already marked as success. Ignoring.`);
                return NextResponse.json({ received: true });
            }

            // 5. Verify the amount matches what we expect
            if ((payment.amount / 100) !== nomination.nominationFee) {
                console.error(`[Nomination Webhook] Amount mismatch for nomination ${nomination.id}. Expected: ${nomination.nominationFee}, Received: ${payment.amount / 100}`);
                // Could flag for manual review here, but for now we'll accept it and log the error
            }

            // 6. Update Status (The actual safety net)
            console.log(`[Nomination Webhook] Fulfilling nomination ${nomination.id} via webhook fallback.`);
            const updatedNomination = await storage.updateNomination(nomination.id, {
                paymentStatus: "success",
                status: "payment_success",
                razorpayPaymentId: paymentId,
            });

            // 7. Send Confirmation Email (since the client-side verify probably failed)
            if (updatedNomination) {
                try {
                    await emailService.sendNominationConfirmation({
                        to: updatedNomination.email,
                        name: updatedNomination.fullName,
                        hrdaId: updatedNomination.hrdaMembershipId,
                        tgmcNumber: updatedNomination.tgmcNumber,
                        district: updatedNomination.district,
                        postApplied: updatedNomination.postApplied,
                        fee: updatedNomination.nominationFee,
                        paymentRef: paymentId
                    });
                } catch (emailError) {
                    console.error("[Nomination Webhook] Error sending confirmation emails:", emailError);
                }
            }
        }

        // Always return 200 OK quickly to acknowledge receipt to Razorpay
        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("[Nomination Webhook] Error processing webhook:", error);
        return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
    }
}
