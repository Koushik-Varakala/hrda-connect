import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(request: Request) {
    try {
        const { registrationId, otp } = await request.json();
        const reg = await storage.getRegistration(registrationId);

        if (!reg) return NextResponse.json({ message: "Registration not found" }, { status: 404 });

        // Check expiry
        if (!reg.otpExpiresAt || new Date() > new Date(reg.otpExpiresAt)) {
            return NextResponse.json({ message: "OTP expired" }, { status: 400 });
        }

        // Check attempts
        if ((reg.otpAttempts || 0) >= 3) {
            return NextResponse.json({ message: "Too many failed attempts" }, { status: 400 });
        }

        // Check code
        if (reg.otpCode !== otp) {
            await storage.updateRegistration(registrationId, {
                otpAttempts: (reg.otpAttempts || 0) + 1
            });
            return NextResponse.json({ message: "Invalid code" }, { status: 400 });
        }

        // Success
        await storage.updateRegistration(registrationId, {
            otpCode: null,
            otpExpiresAt: null,
            otpAttempts: 0
        });

        // Set Secure Cookie
        const response = NextResponse.json({ success: true, registration: reg });
        // We can't set cookies on NextResponse directly if we want to read them in Server Components cleanly sometimes, but here it works.
        // Actually, in App Router Route Handlers, use `cookies().set(...)`

        const { cookies } = require("next/headers");
        const cookieStore = await cookies();
        cookieStore.set("verified_registration_id", String(registrationId), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60, // 1 hour
            path: "/",
        });

        return NextResponse.json({
            success: true,
            registration: {
                ...reg,
                isMasked: false // Explicitly return unmasked state
            }
        });

    } catch (err) {
        console.error("OTP Verify Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
