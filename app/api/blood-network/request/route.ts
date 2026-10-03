import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertBloodRequestSchema } from "@shared/schema";
import { appConfig } from "@/lib/app-config";
import { randomBytes } from "node:crypto";

export async function POST(request: Request) {
    try {
        if (appConfig.region !== 'AP') {
            return NextResponse.json(
                { message: "HRDA Blood Donor Network is currently active exclusively for Andhra Pradesh." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const cleanPhone = (body.contactPhone || "").replace(/\D/g, "").slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) {
            return NextResponse.json(
                { message: "Please provide a valid 10-digit primary contact phone number." },
                { status: 400 }
            );
        }

        // Generate unique tracking code e.g. "BLD-AP-8942"
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const codeSuffix = randomBytes(2).toString("hex").toUpperCase();
        const trackingCode = `BLD-AP-${randomDigits}${codeSuffix}`;

        const parsed = insertBloodRequestSchema.parse({
            requestTrackingCode: trackingCode,
            patientName: body.patientName?.trim(),
            attendantName: body.attendantName?.trim(),
            contactPhone: cleanPhone,
            secondaryPhone: body.secondaryPhone ? body.secondaryPhone.replace(/\D/g, "").slice(-10) : null,
            bloodGroup: body.bloodGroup,
            unitsRequired: Number(body.unitsRequired) || 1,
            hospitalName: body.hospitalName?.trim(),
            hospitalAddress: body.hospitalAddress?.trim() || null,
            district: body.district,
            cityTown: body.cityTown?.trim(),
            urgency: body.urgency || "Urgent",
            status: "open",
            clinicalRequirement: body.clinicalRequirement?.trim() || null,
            adminNotes: null,
        });

        const newRequest = await storage.createBloodRequest(parsed);

        // Find initial matching donors count in the same district + blood group
        const matchingDonors = await storage.getBloodDonors({
            district: parsed.district,
            bloodGroup: parsed.bloodGroup,
            isAvailable: true,
            status: 'active'
        });

        return NextResponse.json({
            success: true,
            message: "Emergency blood request submitted successfully. HRDA coordinators and matching donors will be alerted.",
            request: {
                id: newRequest.id,
                trackingCode: newRequest.requestTrackingCode,
                patientName: newRequest.patientName,
                bloodGroup: newRequest.bloodGroup,
                unitsRequired: newRequest.unitsRequired,
                hospitalName: newRequest.hospitalName,
                district: newRequest.district,
                cityTown: newRequest.cityTown,
                urgency: newRequest.urgency,
                status: newRequest.status,
                matchingDonorsFound: matchingDonors.length,
                createdAt: newRequest.createdAt,
            }
        });
    } catch (err: any) {
        console.error("[Blood Request API] Error:", err);
        return NextResponse.json(
            { message: err.message || "Failed to submit blood request." },
            { status: 400 }
        );
    }
}
