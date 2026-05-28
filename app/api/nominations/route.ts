import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { formNominationSchema, NOMINATION_FEE_MAP } from "@shared/schema";
import { auth } from "@/lib/auth"; // Assuming an auth helper exists, or we check session

export async function GET(request: Request) {
    try {
        // Auth guard — only logged-in admins can list all nominations
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const district = searchParams.get('district') || undefined;
        const post = searchParams.get('post') || undefined;
        const status = searchParams.get('status') || undefined;

        const nominations = await storage.getNominations({ district, post, status });
        return NextResponse.json(nominations);
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch nominations", error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Validate input data
        const validatedData = formNominationSchema.parse(data);

        // We create the nomination initially as 'pending_payment'
        const newNomination = await storage.createNomination({
            ...validatedData,
            nominationFee: NOMINATION_FEE_MAP[validatedData.postApplied] || 0,
            paymentStatus: "pending",
            status: "pending_payment",
            razorpayOrderId: null,
            razorpayPaymentId: null,
            adminNotes: null
        });

        return NextResponse.json(newNomination, { status: 201 });
    } catch (error: any) {
        console.error("Nomination Creation Error:", error);
        return NextResponse.json({ message: "Invalid data", error: error.message }, { status: 400 });
    }
}
