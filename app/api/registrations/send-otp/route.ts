
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { emailService } from "@/lib/services/email";
import { smsService } from "@/lib/services/sms";

const otpRateLimit = new Map<number, number>(); // userId -> timestamp

// app/api/registrations/send-otp/route.ts
export async function POST(request: Request) {
    try {
        const { registrationId } = await request.json();

        // Rate limiting
        const lastSent = otpRateLimit.get(registrationId);
        if (lastSent && Date.now() - lastSent < 60000) {
            return NextResponse.json({ message: "Please wait before requesting another code." }, { status: 429 });
        }

        const session = await auth();
        const reg = await storage.getRegistration(registrationId);
        if (!reg) return NextResponse.json({ message: "Registration not found" }, { status: 404 });

        if (!reg.email) {
            return NextResponse.json({ message: "No email address linked." }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await storage.updateRegistration(registrationId, {
            otpCode: otp,
            otpExpiresAt: expiresAt,
            otpAttempts: 0
        });

        // Send Email
        const emailSent = await emailService.sendOtp(reg.email, otp);

        // Send SMS
        let smsSent = false;
        if (reg.phone) {
            try {
                smsSent = await smsService.sendOtp(reg.phone, otp);
            } catch (smsError) {
                console.error(`Failed to send SMS to ${reg.phone}:`, smsError);
                // We do NOT fail the request if SMS fails, but we should probably inform 
                // debugging or just proceed since Email is primary.
            }
        }

        if (!emailSent && !smsSent) {
            console.error("Failed to send OTP via both Email and SMS");
            // Force log for debugging (development only)
            console.log(`[DEV ONLY] OTP for ${reg.email}: ${otp}`);
            return NextResponse.json({ message: "Failed to send OTP. Please try again." }, { status: 500 });
        }

        console.log(`Sent OTP to ${reg.email} (Email: ${emailSent}, SMS: ${smsSent})`);

        otpRateLimit.set(registrationId, Date.now());
        return NextResponse.json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error("OTP Send Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
