export class SmsService {
    private isConfigured = false;

    constructor() {
        // Check for SMS config (e.g., Twilio, SNS, Fast2SMS)
        // if (process.env.SMS_API_KEY) this.isConfigured = true;
    }

    async sendSms(to: string, message: string): Promise<boolean> {
        const apiKey = process.env.FAST2SMS_API_KEY;


        if (!apiKey) {
            console.log(`[Mock SMS] To: ${to} | Message: ${message}`);
            return true;
        }

        // Clean phone number: remove non-digits and strip leading 91 or +91 if length > 10
        let cleanPhone = to.replace(/\D/g, "");
        if (cleanPhone.length > 10 && (cleanPhone.startsWith("91"))) {
            cleanPhone = cleanPhone.slice(2);
        } else if (cleanPhone.length > 10 && cleanPhone.startsWith("0")) {
            cleanPhone = cleanPhone.slice(1);
        }

        try {
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
                    "numbers": cleanPhone
                })
            });

            const data = await response.json();

            if (data.return) {
                console.log(`[Fast2SMS] Sent SMS to ${to}: ${message}`);
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

    async sendRegistrationSuccess(to: string, name: string, hrdaId: number | string, tgmcId: string) {
        // Keep it short for SMS, but include key details
        const message = `Dear ${name}, Registration Successful. HRDA ID: ${hrdaId}, TGMC Req: ${tgmcId}. Welcome to HRDA Telangana.`;
        return this.sendSms(to, message);
    }

    async sendOtp(to: string, otp: string) {
        const message = `Your HRDA verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
        return this.sendSms(to, message);
    }
}

export const smsService = new SmsService();
