import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET() {
    try {
        const [donors, requests] = await Promise.all([
            storage.getBloodDonors({}),
            storage.getBloodRequests({})
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalDonors: donors.length,
                availableDonors: donors.filter(d => d.isAvailable).length,
                totalRequests: requests.length,
                fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
            }
        });
    } catch (err: any) {
        return NextResponse.json(
            { message: err.message || "Failed to fetch stats." },
            { status: 500 }
        );
    }
}
