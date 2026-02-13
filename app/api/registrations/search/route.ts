import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get("phone");
        const tgmcId = searchParams.get("tgmcId");

        const cookieStore = await cookies();
        const verifiedId = cookieStore.get("verified_registration_id")?.value;

        let results = [];

        if (phone) {
            results = await storage.searchRegistrations({ phone });
        } else if (tgmcId) {
            results = await storage.searchRegistrations({ tgmcId });
        } else {
            return NextResponse.json([], { status: 200 });
        }

        // Mask data if not verified
        const maskedResults = results.map(reg => {
            const isVerified = verifiedId === String(reg.id);
            if (isVerified) {
                return { ...reg, isMasked: false };
            }

            // Masking
            const maskPhone = (p: string) => p.slice(0, 2) + "******" + p.slice(-2);
            const maskEmail = (e: string) => {
                const [user, domain] = e.split("@");
                return user.slice(0, 2) + "***@" + domain;
            };

            return {
                ...reg,
                phone: reg.phone ? maskPhone(reg.phone) : "",
                email: reg.email ? maskEmail(reg.email) : "",
                address: reg.address ? "******" : "", // Mask address too
                isMasked: true
            };
        });

        return NextResponse.json(maskedResults);
    } catch (err) {
        console.error("Search API Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
