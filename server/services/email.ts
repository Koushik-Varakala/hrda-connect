import { log } from "../app";
import nodemailer from "nodemailer";

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            log(`[EmailService] Configured with SMTP host: ${process.env.SMTP_HOST}`);
        } else {
            log("[EmailService] SMTP credentials missing. Emails will be mocked.");
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        const apiKey = process.env.SMTP_PASS;
        const useBrevoApi = apiKey && apiKey.startsWith("xkeysib-");

        if (useBrevoApi) {
            try {
                const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "api-key": apiKey,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        sender: { email: process.env.SMTP_USER || "no-reply@hrdaconnect.com", name: "HRDA Telangana" },
                        to: [{ email: options.to }],
                        subject: options.subject,
                        textContent: options.text
                    })
                });

                if (!response.ok) {
                    const error = await response.text();
                    console.error("[EmailService] Brevo API Error:", error);
                    return false;
                }

                log(`[EmailService] Sent email to ${options.to} via Brevo API`);
                return true;
            } catch (error) {
                console.error("[EmailService] Error sending via Brevo API:", error);
                return false;
            }
        }

        if (!this.transporter) {
            log(`[Mock Email] To: ${options.to} | Subject: ${options.subject} | Body: ${options.text}`);
            return true;
        }

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"HRDA Connect" <no-reply@hrdaconnect.com>',
                to: options.to,
                subject: options.subject,
                text: options.text,
            });
            log(`[EmailService] Sent email to ${options.to}`);
            return true;
        } catch (error) {
            console.error("[EmailService] Error sending email:", error);
            return false;
        }
    }

    async sendRegistrationConfirmation(to: string, name: string, tgmcId: string, hrdaId: number | string, phone: string, address: string) {
        return this.sendEmail({
            to,
            subject: "HRDA Registration Successful - Welcome to the Family",
            text: `Dear ${name},

Congratulations! You have successfully registered with HRDA Telangana.

Here are your membership details:
------------------------------------------------
Name: ${name}
HRDA Membership ID: ${hrdaId}
TGMC Registration ID: ${tgmcId}
Mobile Number: ${phone}
Email Address: ${to}
Address: ${address}
------------------------------------------------

Thank you for strengthening our voice. We look forward to your active participation.

Regards,
HRDA Team`
        });
    }
}

export const emailService = new EmailService();
