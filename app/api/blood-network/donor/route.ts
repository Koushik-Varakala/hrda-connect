import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertBloodDonorSchema } from "@shared/schema";
import { appConfig } from "@/lib/app-config";

export async function POST(request: Request) {
    try {
        if (appConfig.region !== 'AP') {
            return NextResponse.json(
                { message: "HRDA Blood Donor Network is currently active exclusively for Andhra Pradesh." },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Ensure explicit consent is required
        if (!body.consentGiven) {
            return NextResponse.json(
                { message: "Explicit informed consent is required to register as a blood donor." },
                { status: 400 }
            );
        }

        const cleanPhone = (body.phone || "").replace(/\D/g, "").slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) {
            return NextResponse.json(
                { message: "Please provide a valid 10-digit mobile number." },
                { status: 400 }
            );
        }

        // Validate age (must be 18-45)
        if (body.age !== undefined && body.age !== null && body.age !== '') {
            const age = parseInt(body.age);
            if (isNaN(age) || age < 18 || age > 45) {
                return NextResponse.json(
                    { message: "Blood donors must be between 18 and 45 years of age as per medical guidelines." },
                    { status: 400 }
                );
            }
        }

        // Check if donor already registered with this phone
        const existingDonor = await storage.getBloodDonorByPhone(cleanPhone);
        if (existingDonor) {
            // Update existing donor availability & details
            const updated = await storage.updateBloodDonor(existingDonor.id, {
                fullName: body.fullName || existingDonor.fullName,
                bloodGroup: body.bloodGroup || existingDonor.bloodGroup,
                district: body.district || existingDonor.district,
                cityTown: body.cityTown || existingDonor.cityTown,
                hospitalOrWorkplace: body.hospitalOrWorkplace || existingDonor.hospitalOrWorkplace,
                email: body.email || existingDonor.email,
                age: body.age ? parseInt(body.age) : existingDonor.age,
                isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
                status: 'active',
            });

            return NextResponse.json({
                success: true,
                message: "Welcome back! Your donor details and availability have been refreshed.",
                donor: {
                    id: updated?.id,
                    fullName: updated?.fullName,
                    bloodGroup: updated?.bloodGroup,
                    district: updated?.district,
                    cityTown: updated?.cityTown,
                    isAvailable: updated?.isAvailable,
                    token: updated?.verificationToken,
                },
                isExisting: true
            });
        }

        const parsed = insertBloodDonorSchema.parse({
            fullName: body.fullName?.trim(),
            phone: cleanPhone,
            email: body.email?.trim() || null,
            bloodGroup: body.bloodGroup,
            district: body.district,
            cityTown: body.cityTown?.trim(),
            hospitalOrWorkplace: body.hospitalOrWorkplace?.trim() || null,
            isAvailable: true,
            consentGiven: true,
            status: 'active',
        });

        const donor = await storage.createBloodDonor(parsed);

        return NextResponse.json({
            success: true,
            message: "Thank you, Doctor / Colleague! You have been successfully registered into the HRDA AP Blood Donor Network.",
            donor: {
                id: donor.id,
                fullName: donor.fullName,
                bloodGroup: donor.bloodGroup,
                district: donor.district,
                cityTown: donor.cityTown,
                isAvailable: donor.isAvailable,
                token: donor.verificationToken,
            }
        });
    } catch (err: any) {
        console.error("[Blood Donor API] Registration error:", err);
        return NextResponse.json(
            { message: err.message || "Failed to register donor." },
            { status: 400 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Verification token is required." }, { status: 400 });
        }

        const donor = await storage.getBloodDonorByToken(token);
        if (!donor) {
            return NextResponse.json({ message: "Donor profile not found." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            donor: {
                id: donor.id,
                fullName: donor.fullName,
                phone: donor.phone,
                email: donor.email,
                bloodGroup: donor.bloodGroup,
                district: donor.district,
                cityTown: donor.cityTown,
                hospitalOrWorkplace: donor.hospitalOrWorkplace,
                isAvailable: donor.isAvailable,
                lastDonatedDate: donor.lastDonatedDate,
                status: donor.status,
            }
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { token, isAvailable, lastDonatedDate, cityTown, hospitalOrWorkplace } = body;

        if (!token) {
            return NextResponse.json({ message: "Token is required." }, { status: 400 });
        }

        const donor = await storage.getBloodDonorByToken(token);
        if (!donor) {
            return NextResponse.json({ message: "Donor not found." }, { status: 404 });
        }

        const updates: any = {};
        if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
        if (lastDonatedDate !== undefined) updates.lastDonatedDate = lastDonatedDate;
        if (cityTown) updates.cityTown = cityTown;
        if (hospitalOrWorkplace) updates.hospitalOrWorkplace = hospitalOrWorkplace;

        const updated = await storage.updateBloodDonor(donor.id, updates);

        return NextResponse.json({
            success: true,
            message: "Donor profile updated successfully.",
            donor: updated
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
