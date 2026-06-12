import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { emailService } from "@/lib/services/email";
import Razorpay from "razorpay";

export async function POST(request: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pendingDonationId } = await request.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Mock verifying donation.");
            
            let donation: any;
            if (pendingDonationId) {
                donation = await storage.updateDonation(Number(pendingDonationId), {
                    paymentStatus: 'success',
                    razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
                });
            }
            
            if (donation && donation.email) {
                try {
                    await emailService.sendDonationConfirmation(donation.email, donation.fullName, donation.amount);
                } catch (e) {
                    console.error("[Donation Verify API] Mock email failed:", e);
                }
            }
            return NextResponse.json({ success: true, donationId: donation?.id });
        }

        // 1. Fetch payment status from Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status === 'authorized') {
            await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
        }

        // 2. Update status
        let donation: any;
        if (pendingDonationId) {
            donation = await storage.updateDonation(Number(pendingDonationId), {
                paymentStatus: 'success',
                razorpayPaymentId: razorpay_payment_id,
            });
        }

        // Fallback search by order ID
        if (!donation && razorpay_order_id) {
            const existing = await storage.getDonationByOrderId(razorpay_order_id);
            if (existing) {
                donation = await storage.updateDonation(existing.id, {
                    paymentStatus: 'success',
                    razorpayPaymentId: razorpay_payment_id,
                });
            }
        }

        // 3. Send donation thank you email and admin notification
        if (donation) {
            if (donation.email) {
                try {
                    await emailService.sendDonationConfirmation(
                        donation.email,
                        donation.fullName,
                        donation.amount
                    );
                } catch (e) {
                    console.error("[Donation Verify API] Email send failed:", e);
                }
            }

            // Notify Admin
            try {
                await emailService.sendAdminDonationNotification(
                    donation.fullName,
                    donation.email || '',
                    donation.phone,
                    donation.amount
                );
            } catch (e) {
                console.error("[Donation Verify API] Admin email send failed:", e);
            }
        }

        return NextResponse.json({ success: true, donationId: donation?.id });
    } catch (error: any) {
        console.error("[Donation Verify API] Catch-all error:", error);
        return NextResponse.json({ message: "Verification failed", error: error.message }, { status: 500 });
    }
}
