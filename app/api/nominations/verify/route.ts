import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { emailService } from "@/lib/services/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, nominationId } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !nominationId) {
            return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
        }

        // 1. HMAC Signature Verification (Critical Security Fix)
        const secret = process.env.RAZORPAY_KEY_SECRET;
        
        // Skip verification ONLY if we are in mock mode
        if (razorpay_order_id.startsWith("order_mock_") && !secret) {
            console.log("[Nomination Verify] MOCK MODE - Skipping signature check");
        } else {
            if (!secret) {
                 return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
            }
            
            const generatedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (generatedSignature !== razorpay_signature) {
                console.error(`[Nomination Verify] Invalid signature. Expected: ${generatedSignature}, Received: ${razorpay_signature}`);
                return NextResponse.json({ message: "Invalid payment signature" }, { status: 401 });
            }
        }

        // 2. Replay Protection / Idempotency Check
        const existingByTxn = await storage.getNominationByPaymentId(razorpay_payment_id);
        if (existingByTxn && existingByTxn.paymentStatus === 'success') {
            console.log(`[Nomination Verify] Payment ${razorpay_payment_id} already processed — skipping duplicate`);
            return NextResponse.json({ success: true, nominationId: existingByTxn.id });
        }

        // 3. Verify Nomination Exists and is Pending
        const nomination = await storage.getNominationById(Number(nominationId));
        if (!nomination) {
             return NextResponse.json({ message: "Nomination record not found" }, { status: 404 });
        }

        if (nomination.razorpayOrderId !== razorpay_order_id && !razorpay_order_id.startsWith("order_mock_")) {
             return NextResponse.json({ message: "Order ID mismatch" }, { status: 400 });
        }

        // 4. Update the Nomination Status
        const updatedNomination = await storage.updateNomination(nomination.id, {
            paymentStatus: "success",
            status: "payment_success", // Move it to the next state
            razorpayPaymentId: razorpay_payment_id,
        });

        if (!updatedNomination) {
             throw new Error("Failed to update nomination status");
        }

        // 5. Send Email Notifications
        try {
            await emailService.sendNominationConfirmation({
                to: updatedNomination.email,
                name: updatedNomination.fullName,
                hrdaId: updatedNomination.hrdaMembershipId,
                tgmcNumber: updatedNomination.tgmcNumber,
                district: updatedNomination.district,
                postApplied: updatedNomination.postApplied,
                fee: updatedNomination.nominationFee,
                paymentRef: razorpay_payment_id
            });
        } catch (emailError) {
             console.error("[Nomination Verify] Error sending confirmation emails:", emailError);
             // We don't fail the request if the email fails, the payment was still successful
        }

        return NextResponse.json({ success: true, nominationId: updatedNomination.id });

    } catch (error: any) {
        console.error("Nomination Verification Error:", error);
        return NextResponse.json({ message: "Verification failed", error: error.message }, { status: 500 });
    }
}
