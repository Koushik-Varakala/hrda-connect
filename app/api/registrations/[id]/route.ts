
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { googleSheetsService } from "@/lib/services/googleSheets";

// GET /api/registrations/[id]
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    const data = await storage.getRegistration(id);
    if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(data);
}

// PUT /api/registrations/[id]
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    const session = await auth();
    const isAdmin = session?.user && (session.user as any).isAdmin;

    if (!isAdmin) {
        // Check for verified cookie
        const { cookies } = require("next/headers");
        const cookieStore = await cookies();
        const verifiedId = cookieStore.get("verified_registration_id")?.value;

        if (verifiedId !== String(id)) {
            return NextResponse.json({ message: "Unauthorized. Please verify via OTP first." }, { status: 401 });
        }
    }

    try {
        const body = await request.json();
        const result = await storage.updateRegistration(id, body);
        if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });

        // Sync Update to Sheets
        try {
            if (result.tgmcId) {
                await googleSheetsService.updateRegistration(result.tgmcId, {
                    updatedAt: new Date().toISOString()
                });

                await googleSheetsService.appendRegistration({
                    id: String(result.id),
                    tgmcId: result.tgmcId || "",
                    firstName: result.firstName,
                    lastName: result.lastName,
                    phone: result.phone,
                    email: result.email || "",
                    address: result.address || "",
                    membershipType: result.membershipType || "single",
                    paymentStatus: result.paymentStatus || "unknown",
                    status: result.status || "pending",
                    registrationDate: result.createdAt?.toISOString() || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    rowStatus: "Active"
                });
            }
        } catch (e) {
            console.error("Failed to sync update to sheets", e);
        }

        return NextResponse.json(result);
    } catch (err) {
        console.error("Update error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/registrations/[id]
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }
    const session = await auth();
    const isAdmin = session?.user && (session.user as any).isAdmin;

    // Admins can delete. Users typically cannot delete themselves in this app, but if they could:
    // strict check: only admin.
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await storage.deleteRegistration(id);
    return new NextResponse(null, { status: 204 });
}
