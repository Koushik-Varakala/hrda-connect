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
                    "numbers": to
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
}

export const smsService = new SmsService();
