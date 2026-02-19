import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

/**
 * Called when:
 * - User dismisses the Razorpay modal without paying
 * - Payment explicitly fails (card declined, etc.)
 *
 * Updates the pending registration status so admins can see
 * who tried to register but didn't complete payment.
 */
export async function POST(request: Request) {
    try {
        const { pendingRegId, reason } = await request.json();

        if (!pendingRegId) {
            return NextResponse.json({ error: "Missing pendingRegId" }, { status: 400 });
        }

        await storage.updateRegistration(Number(pendingRegId), {
            paymentStatus: "failed",
            status: "payment_failed",
        });

        console.log(`[mark-failed] Registration ${pendingRegId} marked as failed. Reason: ${reason || "unknown"}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[mark-failed] Error:", error);
        // Always return 200 — this is a best-effort call, we don't want
        // the client to retry or show errors for this.
        return NextResponse.json({ success: false });
    }
}
