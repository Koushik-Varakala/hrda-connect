import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { put } from "@vercel/blob";
import { storage } from "@/lib/storage";
import { formNominationSchema, NOMINATION_FEE_MAP } from "@shared/schema";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields from FormData
        const userData = {
            fullName: formData.get("fullName") as string,
            hrdaMembershipId: formData.get("hrdaMembershipId") as string,
            tgmcNumber: formData.get("tgmcNumber") as string,
            email: formData.get("email") as string,
            mobile: formData.get("mobile") as string,
            district: formData.get("district") as string,
            postApplied: formData.get("postApplied") as string,
        };

        const photoFile = formData.get("photo") as File | null;

        // 1. Validate Input Data
        const validatedData = formNominationSchema.parse(userData);

        // 2. Server-Side Fee Calculation (Crucial for Security to prevent amount tampering)
        const expectedFee = NOMINATION_FEE_MAP[validatedData.postApplied];
        if (!expectedFee) {
            return NextResponse.json({ message: "Invalid post selected" }, { status: 400 });
        }

        // 3. Duplicate Prevention
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

        // 4. Upload Photo to Vercel Blob (if provided)
        let photoUrl: string | null = null;
        if (photoFile && photoFile.size > 0) {
            // Validate file type and size
            const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!validTypes.includes(photoFile.type)) {
                return NextResponse.json({ message: "Invalid photo format. Use JPG, PNG, or WebP." }, { status: 400 });
            }
            if (photoFile.size > 5 * 1024 * 1024) {
                return NextResponse.json({ message: "Photo must be under 5MB." }, { status: 400 });
            }

            const blob = await put(
                `nominations/photos/${Date.now()}-${photoFile.name}`,
                photoFile,
                { access: "public" }
            );
            photoUrl = blob.url;
        }

        // 5. Create Pending Nomination Record
        let pendingNomId: number | null = null;
        try {
            const pendingNom = await storage.createNomination({
                ...validatedData,
                nominationFee: expectedFee,
                paymentStatus: "pending",
                status: "pending_payment",
                photoUrl,
            });
            pendingNomId = pendingNom.id;
            console.log(`[Nomination Order] Created pending nomination ID: ${pendingNomId}`);
        } catch (e: any) {
            console.error("Failed to create pending nomination:", e);
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        // 6. Razorpay Configuration
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

        // 7. Create Razorpay Order
        const notes: Record<string, string> = {
            nominationId: String(pendingNomId),
            fullName: validatedData.fullName.slice(0, 50),
            tgmcNumber: validatedData.tgmcNumber,
            postApplied: validatedData.postApplied.slice(0, 50),
        };

        const orderOptions = {
            amount: expectedFee * 100,
            currency: "INR",
            receipt: `rcpt_nom_${Date.now()}`,
            payment_capture: true,
            notes,
        };

        const order = await razorpay.orders.create(orderOptions);

        // 8. Update pending nomination with order ID
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
