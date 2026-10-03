import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        if (!code) {
            return NextResponse.json({ message: "Tracking code is required." }, { status: 400 });
        }

        const bloodReq = await storage.getBloodRequestByTrackingCode(code);
        if (!bloodReq) {
            return NextResponse.json({ message: "No blood requirement found with this tracking code." }, { status: 404 });
        }

        // Fetch donor responses for this request
        const responses = await storage.getBloodDonorResponsesByRequestId(bloodReq.id);

        // Fetch accepted donor details ONLY
        const acceptedDonors = [];
        for (const resp of responses) {
            if (resp.status === 'accepted') {
                const donor = await storage.getBloodDonorById(resp.donorId);
                if (donor) {
                    acceptedDonors.push({
                        id: donor.id,
                        fullName: donor.fullName,
                        phone: donor.phone,
                        bloodGroup: donor.bloodGroup,
                        cityTown: donor.cityTown,
                        district: donor.district,
                        respondedAt: resp.respondedAt,
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            request: {
                trackingCode: bloodReq.requestTrackingCode,
                patientName: bloodReq.patientName,
                attendantName: bloodReq.attendantName,
                contactPhone: bloodReq.contactPhone,
                bloodGroup: bloodReq.bloodGroup,
                unitsRequired: bloodReq.unitsRequired,
                hospitalName: bloodReq.hospitalName,
                hospitalAddress: bloodReq.hospitalAddress,
                district: bloodReq.district,
                cityTown: bloodReq.cityTown,
                urgency: bloodReq.urgency,
                status: bloodReq.status,
                clinicalRequirement: bloodReq.clinicalRequirement,
                createdAt: bloodReq.createdAt,
                stats: {
                    alertsDispatched: responses.length,
                    donorsAccepted: acceptedDonors.length,
                },
                acceptedDonors: acceptedDonors, // Controlled sharing: only contains donors who explicitly accepted
            }
        });
    } catch (err: any) {
        console.error("[Blood Request Status API] Error:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
