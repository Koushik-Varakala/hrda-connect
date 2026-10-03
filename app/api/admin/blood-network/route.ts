import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { randomBytes } from "node:crypto";
import { appConfig } from "@/lib/app-config";
import { emailService } from "@/lib/services/email";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const district = searchParams.get("district") || undefined;
        const bloodGroup = searchParams.get("bloodGroup") || undefined;
        const status = searchParams.get("status") || undefined;

        const [donors, requests] = await Promise.all([
            storage.getBloodDonors({ district, bloodGroup, status }),
            storage.getBloodRequests({ district, bloodGroup })
        ]);

        // Get responses counts for each request
        const requestsWithStats = await Promise.all(
            requests.map(async (req) => {
                const responses = await storage.getBloodDonorResponsesByRequestId(req.id);
                const accepted = responses.filter(r => r.status === 'accepted');
                const declined = responses.filter(r => r.status === 'declined');
                const pending = responses.filter(r => r.status === 'pending');

                return {
                    ...req,
                    stats: {
                        totalContacted: responses.length,
                        acceptedCount: accepted.length,
                        declinedCount: declined.length,
                        pendingCount: pending.length,
                    }
                };
            })
        );

        return NextResponse.json({
            success: true,
            stats: {
                totalDonors: donors.length,
                availableDonors: donors.filter(d => d.isAvailable).length,
                totalRequests: requests.length,
                openRequests: requests.filter(r => r.status === 'open' || r.status === 'matching').length,
                fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
            },
            donors,
            requests: requestsWithStats
        });
    } catch (err: any) {
        console.error("[Admin Blood Network GET] Error:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        // 1. MATCH DONORS
        if (action === 'match') {
            const { requestId } = body;
            const bloodReq = await storage.getBloodRequestById(Number(requestId));
            if (!bloodReq) {
                return NextResponse.json({ message: "Blood request not found." }, { status: 404 });
            }

            // Find matching donors in the district (or state-wide if specified)
            const donorsInDistrict = await storage.getBloodDonors({
                district: bloodReq.district,
                bloodGroup: bloodReq.bloodGroup,
                isAvailable: true,
                status: 'active'
            });

            // Existing responses already sent for this request
            const existingResponses = await storage.getBloodDonorResponsesByRequestId(bloodReq.id);
            const contactedDonorIds = new Set(existingResponses.map(r => r.donorId));

            const candidateDonors = donorsInDistrict.map(donor => ({
                id: donor.id,
                fullName: donor.fullName,
                phone: donor.phone,
                bloodGroup: donor.bloodGroup,
                district: donor.district,
                cityTown: donor.cityTown,
                hospitalOrWorkplace: donor.hospitalOrWorkplace,
                alreadyContacted: contactedDonorIds.has(donor.id),
            }));

            return NextResponse.json({
                success: true,
                request: bloodReq,
                candidates: candidateDonors
            });
        }

        // 2. DISPATCH ALERTS TO MATCHING DONORS
        if (action === 'dispatch') {
            const { requestId, donorIds } = body;
            const bloodReq = await storage.getBloodRequestById(Number(requestId));
            if (!bloodReq) {
                return NextResponse.json({ message: "Blood request not found." }, { status: 404 });
            }

            if (!Array.isArray(donorIds) || donorIds.length === 0) {
                return NextResponse.json({ message: "Please select at least one donor to alert." }, { status: 400 });
            }

            const existingResponses = await storage.getBloodDonorResponsesByRequestId(bloodReq.id);
            const alreadyContacted = new Set(existingResponses.map(r => r.donorId));

            const dispatched = [];
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (appConfig.region === 'AP' ? 'https://ap.hrda-india.org' : 'https://hrda-india.org');

            for (const donorId of donorIds) {
                if (alreadyContacted.has(Number(donorId))) continue;

                const donor = await storage.getBloodDonorById(Number(donorId));
                if (!donor) continue;

                // Generate secure response token
                const token = randomBytes(16).toString("hex");

                const responseRecord = await storage.createBloodDonorResponse({
                    requestId: bloodReq.id,
                    donorId: donor.id,
                    responseToken: token,
                    status: 'pending',
                    respondedAt: null,
                    notes: null
                });

                const responseUrl = `${siteUrl}/blood-donor/respond?token=${token}`;
                
                // Construct standardized alert message (Step 5 in flyer: Donor info NOT shared at this stage)
                const alertMessage = `[URGENT] HRDA Blood Network Alert:
Requirement: ${bloodReq.bloodGroup} Blood (${bloodReq.unitsRequired} unit${bloodReq.unitsRequired > 1 ? 's' : ''})
Facility: ${bloodReq.hospitalName}, ${bloodReq.cityTown}, ${bloodReq.district}
Urgency: ${bloodReq.urgency}
${bloodReq.clinicalRequirement ? `Reason: ${bloodReq.clinicalRequirement}\n` : ''}
Dear Dr. ${donor.fullName}, if you are willing and available to donate, please confirm here:
${responseUrl}

(This is a voluntary fraternity initiative. No commercial/monetary transaction).`;

                const whatsappUrl = `https://wa.me/91${donor.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(alertMessage)}`;

                // If donor provided email, send automated email alert
                if (donor.email) {
                    try {
                        emailService.sendBloodDonorAlertEmail({
                            to: donor.email,
                            donorName: donor.fullName,
                            bloodGroup: bloodReq.bloodGroup,
                            unitsRequired: bloodReq.unitsRequired,
                            hospitalName: bloodReq.hospitalName,
                            cityTown: bloodReq.cityTown,
                            district: bloodReq.district,
                            urgency: bloodReq.urgency,
                            clinicalRequirement: bloodReq.clinicalRequirement || undefined,
                            responseUrl,
                        }).catch(e => console.error(`[Blood Alert] Failed to send email to ${donor.email}:`, e));
                    } catch (e) {
                        console.error("[Blood Alert] Email dispatch error:", e);
                    }
                }

                dispatched.push({
                    donorId: donor.id,
                    donorName: donor.fullName,
                    donorPhone: donor.phone,
                    token,
                    responseUrl,
                    alertMessage,
                    whatsappUrl,
                });
            }

            // Update request status to 'donors_contacted'
            await storage.updateBloodRequest(bloodReq.id, {
                status: 'donors_contacted'
            });

            return NextResponse.json({
                success: true,
                message: `Successfully generated alerts for ${dispatched.length} donor(s).`,
                dispatched,
            });
        }

        // 3. UPDATE REQUEST STATUS
        if (action === 'update-request-status') {
            const { requestId, status, adminNotes } = body;
            const updated = await storage.updateBloodRequest(Number(requestId), {
                status,
                adminNotes
            });

            return NextResponse.json({
                success: true,
                message: "Request status updated successfully.",
                request: updated
            });
        }

        // 4. TOGGLE / UPDATE DONOR
        if (action === 'update-donor') {
            const { donorId, isAvailable, status, notes } = body;
            const updates: any = {};
            if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
            if (status) updates.status = status;
            if (notes !== undefined) updates.notes = notes;

            const updated = await storage.updateBloodDonor(Number(donorId), updates);
            return NextResponse.json({
                success: true,
                message: "Donor profile updated.",
                donor: updated
            });
        }

        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    } catch (err: any) {
        console.error("[Admin Blood Network POST] Error:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
