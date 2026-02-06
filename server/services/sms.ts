import { log } from "../app";

export class SmsService {
    private isConfigured = false;

    constructor() {
        // Check for SMS config (e.g., Twilio, SNS, Fast2SMS)
        // if (process.env.SMS_API_KEY) this.isConfigured = true;
    }

    async sendSms(to: string, message: string): Promise<boolean> {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            log(`[Mock SMS] To: ${to} | Message: ${message}`);
            return true;
        }

        try {
            // Fast2SMS API integration
            // route: "q" (Quick transactional), "v" (OTP/Service Implicit - requires DLT)
            // For free testing, they usually allow "q" or "p" (promotional) but specific routes change.
            // Using 'dlt_manual' or 'v3' is common now if DLT registered, but 'q' is good for quick storage/testing.
            // Note: Real transactional SMS in India strictly requires DLT registration. 
            // For testing, this might fail on DND numbers if not DLT approved.

            const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "route": "q",
                    "message": message,
                    "language": "english",
                    "flash": 0,
                    "numbers": to
                })
            });

            const data = await response.json();

            if (data.return) {
                log(`[Fast2SMS] Sent SMS to ${to}: ${message}`);
                return true;
            } else {
                console.error("[Fast2SMS] Error:", data.message);
                return false;
            }
        } catch (error) {
            console.error("[Fast2SMS] Request Failed:", error);
            return false;
        }
    }

    async sendRegistrationSuccess(to: string, name: string, hrdaId: number | string) {
        // Keep it short for SMS
        const message = `Dear ${name}, Welcome to HRDA! Registration Successful. Member ID: ${hrdaId}. Thank you via HRDA Telangana.`;
        return this.sendSms(to, message);
    }
}

export const smsService = new SmsService();
