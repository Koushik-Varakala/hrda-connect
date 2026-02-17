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
            // Check if DLT is configured (Required for cheaper SMS)
            const senderId = process.env.FAST2SMS_SENDER_ID; // e.g. HRDAIN
            const dltTemplateId = message.includes("verification code is")
                ? process.env.FAST2SMS_DLT_OTP_TE_ID
                : process.env.FAST2SMS_DLT_REG_TE_ID;

            let payload: any = {
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": cleanPhone
            };

            // If DLT credentials exist, switch to DLT route (Cheaper)
            if (senderId && dltTemplateId) {
                let variables = "";

                // Check if OTP
                if (message.includes("Your verification code is")) {
                    // "Your verification code is 123456. Valid..." -> "123456"
                    // Match digits after "is "
                    const match = message.match(/is (\d+)\./);
                    variables = match ? match[1] : "";
                }
                // Check if Welcome
                else {
                    // "Dear {name}, Registration Successful. HRDA ID: {id}, TGMC Req: {tgmc}. Welcome to HRDA. - Healthcare Reforms Doctors Association"
                    // Use a slightly more flexible regex to capture everything between the delimiters
                    // "Dear (name), Registration Successful. HRDA ID: (id), TGMC Req: (tgmc). Welcome"
                    const match = message.match(/Dear (.*?), Registration Successful. HRDA ID: (.*?), TGMC Req: (.*?). Welcome/);
                    if (match) {
                        variables = `${match[1]}|${match[2]}|${match[3]}`;
                    }
                }

                payload = {
                    "route": "dlt",
                    "sender_id": senderId,
                    "message": dltTemplateId,
                    "variables_values": variables,
                    "flash": 0,
                    "numbers": cleanPhone
                };
            }

            console.log(`[Fast2SMS] DLT Payload:`, JSON.stringify(payload));
            const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
                method: "POST",
                headers: {
                    "authorization": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(`[Fast2SMS] Response:`, JSON.stringify(data));

            if (data.return) {
                console.log(`[Fast2SMS] Sent SMS to ${to} (Route: ${payload.route})`);
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
        // Updated to match DLT Template v2 (with full entity name)
        const message = `Dear ${name}, Registration Successful. HRDA ID: ${hrdaId}, TGMC Req: ${tgmcId}. Welcome to HRDA. - Healthcare Reforms Doctors Association`;
        return this.sendSms(to, message);
    }

    async sendOtp(to: string, otp: string) {
        // Updated to match DLT Template v2 (with full entity name)
        const message = `Your verification code is ${otp}. Valid for 5 minutes. Do not share this code. - Healthcare Reforms Doctors Association`;
        return this.sendSms(to, message);
    }
}

export const smsService = new SmsService();
