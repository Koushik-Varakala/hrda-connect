import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const stats = await storage.getRegistrations();
        return NextResponse.json(stats);
    } catch (err) {
        console.error("Admin Registrations API Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 401 });
        }

        const body = await request.json();

        if (!body.firstName || !body.lastName) {
            return NextResponse.json({ message: "First Name and Last Name are required" }, { status: 400 });
        }

        const phoneClean = body.phone?.trim();
        if (phoneClean && phoneClean !== "0" && !phoneClean.startsWith("0000-")) {
            const existingPhone = await storage.getRegistrationByPhone(phoneClean);
            if (existingPhone) {
                return NextResponse.json({ message: `Phone number (${phoneClean}) is already registered to ${existingPhone.firstName} ${existingPhone.lastName}` }, { status: 400 });
            }
        }

        const hrdaClean = body.hrdaId?.trim();
        if (hrdaClean) {
            const existingHrda = await storage.getRegistrationByHrdaId(hrdaClean);
            if (existingHrda) {
                return NextResponse.json({ message: `HRDA ID (${hrdaClean}) is already registered to ${existingHrda.firstName} ${existingHrda.lastName}` }, { status: 400 });
            }
        }

        let parsedCreatedAt: Date | undefined = undefined;
        if (body.createdAt) {
            const d = new Date(body.createdAt);
            if (!isNaN(d.getTime())) {
                parsedCreatedAt = d;
            }
        }

        const created = await storage.createRegistration({
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            phone: phoneClean || `0000-${hrdaClean || Date.now()}`,
            email: body.email?.trim() || null,
            hrdaId: hrdaClean || null,
            tgmcId: body.tgmcId?.trim() || null,
            address: body.address?.trim() || null,
            district: body.district?.trim() || null,
            status: body.status || "verified",
            paymentStatus: body.paymentStatus || "success",
            membershipType: body.membershipType || "single",
            registrationSource: "admin_manual",
            createdAt: parsedCreatedAt || new Date(),
        });

        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        console.error("Admin Registration Create API Error:", err);
        return NextResponse.json({ message: err.message || "Failed to create registration" }, { status: 500 });
    }
}
