import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { googleSheetsService } from "@/lib/services/googleSheets";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";

export async function POST(request: Request) {
    try {
        const session = await auth();
        const isAdmin = session?.user && (session.user as any).isAdmin;

        if (!isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ message: "Razorpay keys missing" }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Fetch payments from the last 24 hours
        const yesterday = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
        const paymentsResponse = await razorpay.payments.all({
            from: yesterday,
            count: 100 // Adjust if high volume
        });

        let syncedCount = 0;

        if (paymentsResponse && paymentsResponse.items) {
            for (const payment of paymentsResponse.items) {
                if (payment.status === "captured") {
                    const notes = payment.notes as any;
                    const pendingRegId = notes?.pendingRegId ? Number(notes.pendingRegId) : null;
                    const phone = notes?.phone || "";

                    let regToUpdate = null;

                    if (pendingRegId) {
                        regToUpdate = await storage.getRegistration(pendingRegId);
                    } else if (phone) {
                        // fallback to finding by phone
                        const phoneMatch = await storage.searchRegistrations({ phone: phone.replace(/\D/g, '').slice(-10) });
                        regToUpdate = phoneMatch.find(r => r.paymentStatus !== "success");
                    }

                    if (regToUpdate && regToUpdate.paymentStatus !== "success") {
                        // Mark as success & verified
                        const updated = await storage.updateRegistration(regToUpdate.id, {
                            paymentStatus: "success",
                            status: "verified"
                        });

                        if (updated) {
                            syncedCount++;
                            let formattedHrdaId: string | number = updated.id;
                            try {
                                const sheetId = await googleSheetsService.appendRegistration({
                                    id: String(updated.id),
                                    tgmcId: updated.tgmcId || "",
                                    firstName: updated.firstName,
                                    lastName: updated.lastName,
                                    phone: updated.phone,
                                    email: updated.email || "",
                                    address: updated.address || "",
                                    district: updated.district || "",
                                    membershipType: updated.membershipType || "single",
                                    paymentStatus: "success",
                                    status: "verified",
                                    registrationDate: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    rowStatus: "Active"
                                });

                                if (sheetId) {
                                    formattedHrdaId = sheetId;
                                    await storage.updateRegistration(updated.id, { hrdaId: String(formattedHrdaId) });
                                    updated.hrdaId = String(formattedHrdaId);
                                }
                            } catch (e) {
                                console.error("Sync: Failed to append to sheets", e);
                            }

                            // Send communications
                            try {
                                if (updated.email) {
                                    await emailService.sendRegistrationConfirmation(
                                        updated.email,
                                        `${updated.firstName} ${updated.lastName}`,
                                        updated.tgmcId || "N/A",
                                        formattedHrdaId,
                                        updated.phone,
                                        updated.address || ""
                                    );
                                }
                                if (updated.phone) {
                                    await smsService.sendRegistrationSuccess(updated.phone, updated.firstName, formattedHrdaId, updated.tgmcId || "N/A");
                                }
                            } catch (e) {
                                console.error("Sync: Failed to send comms", e);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: "Sync complete", syncedCount }, { status: 200 });

    } catch (err: any) {
        console.error("Sync Payments Error:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}
