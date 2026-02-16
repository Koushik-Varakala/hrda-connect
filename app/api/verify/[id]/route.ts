
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

// GET /api/verify/[id]
// Supports looking up by numeric ID or string HRDA ID
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    if (!id) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Secure Verification: Look up ONLY by verification token (UUID)
    // This prevents guessing IDs (e.g. HRDA022026-2424)
    const registration = await storage.getRegistrationByToken(id);
    if (registration) return NextResponse.json(registration);

    return NextResponse.json({ message: "Invalid Verification Token" }, { status: 404 });
}
