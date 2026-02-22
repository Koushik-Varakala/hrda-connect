import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { storage } from "@/lib/storage";
import { insertRegistrationSchema } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const { amount, currency, userData } = await request.json();

        // 0. Pre-check: Ensure phone number doesn't already have a SUCCESSFUL registration
        if (userData && userData.phone) {
            // Strip any spaces, dashes, or +91 from the input phone for a safer match
            const normalizedPhone = userData.phone.replace(/\D/g, '').slice(-10);

            // 0a. Check local database first
            // Let's also search using the raw phone just in case it's stored that way
            const existingRegistrations = await storage.searchRegistrations({ phone: normalizedPhone });

            // Debugging
            console.log(`[Order API] Pre-check for phone ${userData.phone} (normalized: ${normalizedPhone}) -> Found ${existingRegistrations.length} existing records.`);

            const hasSuccessfulPayment = existingRegistrations.some(reg => reg.paymentStatus === 'success');

            if (hasSuccessfulPayment) {
                console.log(`[Order API] Blocked duplicate order for phone ${normalizedPhone} (Found in DB).`);
                return NextResponse.json(
                    { message: "A successful registration with this phone number already exists." },
                    { status: 400 }
                );
            }

            // 0b. Check Google Sheets (for legacy members who might not be in the database)
            try {
                // Import locally to avoid circular dependencies if any, though it should be fine at top level
                const { googleSheetsService } = require("@/lib/services/googleSheets");
                const legacyUser = await googleSheetsService.findRegistrationByPhone(normalizedPhone);

                if (legacyUser && legacyUser.hrdaId) {
                    console.log(`[Order API] Blocked duplicate order for phone ${normalizedPhone} (Found in Google Sheets: ${legacyUser.hrdaId}).`);
                    return NextResponse.json(
                        { message: "A legacy registration with this phone number already exists." },
                        { status: 400 }
                    );
                }
            } catch (e) {
                console.error("[Order API] Failed to check Google Sheets for legacy members:", e);
                // Non-fatal, proceed with registration order
            }
        }

        // 1. Save a pending registration BEFORE opening Razorpay
        //    This ensures we always have the form data regardless of payment outcome.
        let pendingRegId: number | null = null;
        if (userData) {
            try {
                const regInput = insertRegistrationSchema.parse({
                    ...userData,
                    paymentStatus: "pending",
                    status: "pending",
                    razorpayTxnId: null,
                });
                const pendingReg = await storage.createRegistration(regInput);
                pendingRegId = pendingReg.id;
                console.log(`[Order] Saved pending registration ID: ${pendingRegId}`);
            } catch (e) {
                // Non-fatal — still proceed with payment even if pre-save fails
                console.error("[Order] Could not pre-save pending registration:", e);
            }
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Using mock order.");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: currency,
                key_id: "rzp_test_mock_key",
                pendingRegId,
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 2. Embed userData + pendingRegId in Razorpay notes so the webhook can
        //    link back to and update the pending registration.
        const notes: Record<string, string> = userData ? {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            tgmcId: userData.tgmcId || "",
            phone: userData.phone || "",
            email: userData.email || "",
            district: userData.district || "",
            address: (userData.address || "").slice(0, 254),
            membershipType: userData.membershipType || "single",
            pendingRegId: pendingRegId ? String(pendingRegId) : "",
        } : {};

        const orderOptions: Parameters<typeof razorpay.orders.create>[0] = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: true,
            notes,
        };

        const order = await razorpay.orders.create(orderOptions);
        return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID, pendingRegId });
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
    }
}
