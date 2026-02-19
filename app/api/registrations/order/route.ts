import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
    try {
        const { amount, currency, userData } = await request.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Using mock order.");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: currency,
                key_id: "rzp_test_mock_key"
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Store userData in notes so the webhook can recover it even if
        // the client-side handler never fires (browser closed, network drop, etc.)
        const notes: Record<string, string> = userData ? {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            tgmcId: userData.tgmcId || "",
            phone: userData.phone || "",
            email: userData.email || "",
            district: userData.district || "",
            address: (userData.address || "").slice(0, 254), // Razorpay notes max 254 chars per field
            membershipType: userData.membershipType || "single",
        } : {};

        const orderOptions: Parameters<typeof razorpay.orders.create>[0] = {
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: true,
            notes,
        };

        const order = await razorpay.orders.create(orderOptions);

        return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
    }
}
