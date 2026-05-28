import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { storage } from "@/lib/storage";
import { formNominationSchema, NOMINATION_FEE_MAP } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const { userData } = await request.json();

        // 1. Validate Input Data
        const validatedData = formNominationSchema.parse(userData);

        // 2. Server-Side Fee Calculation (Crucial for Security to prevent amount tampering)
        const expectedFee = NOMINATION_FEE_MAP[validatedData.postApplied];
        if (!expectedFee) {
            return NextResponse.json({ message: "Invalid post selected" }, { status: 400 });
        }

        // 3. Duplicate Prevention
        // Check if there's already a successful nomination for this user + post + district
        const isDuplicate = await storage.checkDuplicateNomination(
            validatedData.tgmcNumber,
            validatedData.district,
            validatedData.postApplied
        );

        if (isDuplicate) {
            return NextResponse.json(
                { message: "You have already submitted a paid nomination for this post in this district." },
                { status: 400 }
            );
        }

        // 4. Create Pending Nomination Record
        let pendingNomId: number | null = null;
        try {
            const pendingNom = await storage.createNomination({
                ...validatedData,
                nominationFee: expectedFee, // Force server-side fee — never trust client
                paymentStatus: "pending",
                status: "pending_payment",
            });
            pendingNomId = pendingNom.id;
            console.log(`[Nomination Order] Created pending nomination ID: ${pendingNomId}`);
        } catch (e: any) {
            console.error("Failed to create pending nomination:", e);
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        // 5. Razorpay Configuration
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Razorpay keys missing. Using mock order.");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: expectedFee * 100,
                currency: "INR",
                key_id: "rzp_test_mock_key",
                nominationId: pendingNomId,
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 6. Create Razorpay Order
        const notes: Record<string, string> = {
            nominationId: String(pendingNomId),
            fullName: validatedData.fullName.slice(0, 50),
            tgmcNumber: validatedData.tgmcNumber,
            postApplied: validatedData.postApplied.slice(0, 50),
        };

        const orderOptions = {
            amount: expectedFee * 100, // amount in paise
            currency: "INR",
            receipt: `rcpt_nom_${Date.now()}`,
            payment_capture: true,
            notes,
        };

        const order = await razorpay.orders.create(orderOptions);

        // 7. Update pending nomination with order ID
        await storage.updateNomination(pendingNomId, {
            razorpayOrderId: order.id
        });

        return NextResponse.json({ 
            ...order, 
            key_id: process.env.RAZORPAY_KEY_ID, 
            nominationId: pendingNomId 
        });

    } catch (error: any) {
        console.error("Nomination Order API Error:", error);
        return NextResponse.json({ message: "Failed to create order", error: error.message }, { status: 500 });
    }
}
