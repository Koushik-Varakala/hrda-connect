import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { emailService } from "@/lib/services/email";

export async function POST(request: Request) {
    try {
        const { nominationId } = await request.json();

        if (!nominationId) {
            return NextResponse.json({ message: "Missing nominationId" }, { status: 400 });
        }

        const nomination = await storage.getNominationById(Number(nominationId));
        if (!nomination) {
            return NextResponse.json({ message: "Nomination not found" }, { status: 404 });
        }

        // Generate PDF
        let pdfBuffer: Buffer | undefined;
        try {
            const { generateNominationPDF } = await import("@/lib/services/nomination-pdf");
            pdfBuffer = await generateNominationPDF(nomination);
            console.log(`[Resend Email] Generated PDF (${(pdfBuffer.length / 1024).toFixed(1)}KB) for nomination ${nominationId}`);
        } catch (pdfError) {
            console.error("[Resend Email] PDF generation failed:", pdfError);
        }

        // Send email
        await emailService.sendNominationConfirmation({
            to: nomination.email,
            name: nomination.fullName,
            hrdaId: nomination.hrdaMembershipId,
            tgmcNumber: nomination.tgmcNumber,
            mobile: nomination.mobile,
            district: nomination.district,
            postApplied: nomination.postApplied,
            fee: nomination.nominationFee,
            paymentRef: nomination.razorpayPaymentId || "MANUAL",
            photoUrl: nomination.photoUrl || undefined,
            signatureUrl: nomination.signatureUrl || undefined,
            pdfBuffer,
        });

        console.log(`[Resend Email] Successfully sent confirmation for nomination ${nominationId} to ${nomination.email}`);
        return NextResponse.json({ success: true, email: nomination.email });

    } catch (error: any) {
        console.error("[Resend Email] Error:", error);
        return NextResponse.json({ message: "Failed to send email", error: error.message }, { status: 500 });
    }
}
