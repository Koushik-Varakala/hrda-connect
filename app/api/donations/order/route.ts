import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { storage } from "@/lib/storage";
import { insertDonationSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const { amount, userData } = await request.json();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json({ message: "Invalid donation amount." }, { status: 400 });
        }

        // 1. Save pending donation
        let pendingDonationId: number | null = null;
        if (userData) {
            try {
                const donationInput = insertDonationSchema.parse({
                    fullName: userData.fullName,
                    email: userData.email || null,
                    phone: userData.phone,
                    amount: Number(amount),
                    paymentStatus: "pending",
                });
                const pendingDonation = await storage.createDonation(donationInput);
                pendingDonationId = pendingDonation.id;
            } catch (e: any) {
                console.error("[Donation Order API] Database save error:", e);
            }
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Using mock donation order.");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: "INR",
                key_id: "rzp_test_mock_key",
                pendingDonationId,
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects paise
            currency: "INR",
            receipt: `rcpt_donate_${Date.now()}`,
            payment_capture: true,
            notes: {
                fullName: userData.fullName || "",
                phone: userData.phone || "",
                email: userData.email || "",
                pendingDonationId: pendingDonationId ? String(pendingDonationId) : "",
                type: "donation"
            }
        });

        // Update donation order ID in DB
        if (pendingDonationId) {
            await storage.updateDonation(pendingDonationId, { razorpayOrderId: order.id });
        }

        return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID, pendingDonationId });
    } catch (error: any) {
        console.error("[Donation Order API] Catch-all error:", error);
        return NextResponse.json({ message: "Failed to create donation order", error: error.message }, { status: 500 });
    }
}
