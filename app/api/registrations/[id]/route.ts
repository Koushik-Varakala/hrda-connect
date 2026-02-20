
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";

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
        const oldRegistration = await storage.getRegistration(id);

        if (!oldRegistration) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const wasNotSuccess = oldRegistration.paymentStatus !== "success";
        const isNowSuccess = body.paymentStatus === "success";

        // If it's becoming successful now, also mark it verified automatically
        if (wasNotSuccess && isNowSuccess) {
            body.status = "verified";
        }

        const result = await storage.updateRegistration(id, body);
        if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });

        // If newly successful -> Append to Sheets + Generate HRDA ID + Email + SMS
        if (wasNotSuccess && isNowSuccess) {
            let formattedHrdaId: string | number = result.id;

            try {
                const sheetId = await googleSheetsService.appendRegistration({
                    id: String(result.id),
                    tgmcId: result.tgmcId || "",
                    firstName: result.firstName,
                    lastName: result.lastName,
                    phone: result.phone,
                    email: result.email || "",
                    address: result.address || "",
                    district: result.district || "",
                    membershipType: result.membershipType || "single",
                    paymentStatus: "success",
                    status: "verified",
                    registrationDate: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    rowStatus: "Active"
                });

                if (sheetId) {
                    formattedHrdaId = sheetId;
                    await storage.updateRegistration(result.id, { hrdaId: String(formattedHrdaId) });
                    result.hrdaId = String(formattedHrdaId);
                }
            } catch (e) {
                console.error("Failed to append to sheets for manual approval:", e);
            }

            try {
                if (result.email) {
                    await emailService.sendRegistrationConfirmation(
                        result.email,
                        `${result.firstName} ${result.lastName}`,
                        result.tgmcId || "N/A",
                        formattedHrdaId,
                        result.phone,
                        result.address || ""
                    );
                }
                if (result.phone) {
                    await smsService.sendRegistrationSuccess(result.phone, result.firstName, formattedHrdaId, result.tgmcId || "N/A");
                }
            } catch (e) {
                console.error("Failed to send communications for manual approval:", e);
            }

        } else if (isNowSuccess && !wasNotSuccess) {
            // Was already success, but admin might be updating other details via edit
            try {
                if (result.tgmcId) {
                    await googleSheetsService.updateRegistration(result.tgmcId, {
                        firstName: result.firstName,
                        lastName: result.lastName,
                        phone: result.phone,
                        email: result.email || "",
                        address: result.address || "",
                        district: result.district || "",
                        tgmcId: result.tgmcId, // in case ID changed
                        updatedAt: new Date().toISOString()
                    });
                }
            } catch (e) {
                console.error("Failed to sync update to sheets", e);
            }
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
    const session = await auth();
    const isAdmin = session?.user && (session.user as any).isAdmin;

    // Admins can delete. Users typically cannot delete themselves in this app, but if they could:
    // strict check: only admin.
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get registration first to get TGMC ID for sheet deletion
    const registration = await storage.getRegistration(id);
    if (!registration) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await storage.deleteRegistration(id);

    // Sync Delete to Sheets
    try {
        if (registration.tgmcId) {
            await googleSheetsService.deleteRegistration(registration.tgmcId);
        }
    } catch (e) {
        console.error("Failed to sync deletion to sheets", e);
    }

    return new NextResponse(null, { status: 204 });
}
