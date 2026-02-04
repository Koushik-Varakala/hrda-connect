import { log } from "../index";

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
}

export class EmailService {
    private isConfigured = false;

    constructor() {
        // Check for SMTP config (mock for now or implement nodemailer)
        // if (process.env.SMTP_HOST) this.isConfigured = true;
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured) {
            log(`[Mock Email] To: ${options.to} | Subject: ${options.subject} | Body: ${options.text}`);
            return true;
        }

        // Implement real email sending here if credentials exist
        return true;
    }

    async sendRegistrationConfirmation(to: string, name: string, tgmcId: string) {
        return this.sendEmail({
            to,
            subject: "HRDA Registration Successful",
            text: `Dear ${name},\n\nThank you for registering with HRDA Telangana. Your registration is successful.\n\nTGMC ID: ${tgmcId}\n\nWelcome to the community.\n\nRegards,\nHRDA Team`
        });
    }
}

export const emailService = new EmailService();
