import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Response token is required." }, { status: 400 });
        }

        const donorResp = await storage.getBloodDonorResponseByToken(token);
        if (!donorResp) {
            return NextResponse.json({ message: "Invalid or expired response link." }, { status: 404 });
        }

        const [bloodReq, donor] = await Promise.all([
            storage.getBloodRequestById(donorResp.requestId),
            storage.getBloodDonorById(donorResp.donorId)
        ]);

        if (!bloodReq || !donor) {
            return NextResponse.json({ message: "Requirement or donor record not found." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            donorName: donor.fullName,
            donorBloodGroup: donor.bloodGroup,
            currentStatus: donorResp.status,
            respondedAt: donorResp.respondedAt,
            requirement: {
                patientName: bloodReq.patientName,
                bloodGroup: bloodReq.bloodGroup,
                unitsRequired: bloodReq.unitsRequired,
                hospitalName: bloodReq.hospitalName,
                hospitalAddress: bloodReq.hospitalAddress,
                district: bloodReq.district,
                cityTown: bloodReq.cityTown,
                urgency: bloodReq.urgency,
                clinicalRequirement: bloodReq.clinicalRequirement,
                createdAt: bloodReq.createdAt,
                // Only share recipient contact phone if donor has already accepted
                recipientContactPhone: donorResp.status === 'accepted' ? bloodReq.contactPhone : null,
                attendantName: donorResp.status === 'accepted' ? bloodReq.attendantName : null,
            }
        });
    } catch (err: any) {
        console.error("[Blood Donor Response GET] Error:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, action, notes } = body;

        if (!token || !action || !['accept', 'decline'].includes(action)) {
            return NextResponse.json(
                { message: "Valid token and action ('accept' or 'decline') are required." },
                { status: 400 }
            );
        }

        const donorResp = await storage.getBloodDonorResponseByToken(token);
        if (!donorResp) {
            return NextResponse.json({ message: "Invalid or expired response link." }, { status: 404 });
        }

        const updatedStatus = action === 'accept' ? 'accepted' : 'declined';
        await storage.updateBloodDonorResponse(donorResp.id, {
            status: updatedStatus,
            respondedAt: new Date(),
            notes: notes || null,
        });

        const [bloodReq, donor] = await Promise.all([
            storage.getBloodRequestById(donorResp.requestId),
            storage.getBloodDonorById(donorResp.donorId)
        ]);

        if (action === 'accept' && bloodReq) {
            // Update request status to matching / in-progress
            if (bloodReq.status === 'open' || bloodReq.status === 'matching') {
                await storage.updateBloodRequest(bloodReq.id, {
                    status: 'matching'
                });
            }
        }

        return NextResponse.json({
            success: true,
            status: updatedStatus,
            message: action === 'accept'
                ? "Thank you, Doctor / Colleague! Your willingness to donate has been recorded. Your contact number is now shared with the patient attendant to coordinate."
                : "Thank you for letting us know. We appreciate your response and hope you can help in a future requirement.",
            recipientContact: action === 'accept' && bloodReq ? {
                attendantName: bloodReq.attendantName,
                contactPhone: bloodReq.contactPhone,
                secondaryPhone: bloodReq.secondaryPhone,
                hospitalName: bloodReq.hospitalName,
                hospitalAddress: bloodReq.hospitalAddress,
            } : null
        });
    } catch (err: any) {
        console.error("[Blood Donor Response POST] Error:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
