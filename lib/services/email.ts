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
            console.log(`[EmailService] Configured with SMTP host: ${process.env.SMTP_HOST}`);
        } else {
            console.log("[EmailService] SMTP credentials missing. Emails will be mocked.");
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
                        sender: { name: "Healthcare Reforms Doctors Association", email: "hrda4people@gmail.com" },
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

                console.log(`[EmailService] Sent email to ${options.to} via Brevo API`);
                return true;
            } catch (error) {
                console.error("[EmailService] Error sending via Brevo API:", error);
                return false;
            }
        }

        if (!this.transporter) {
            console.log(`[Mock Email] To: ${options.to} | Subject: ${options.subject} | Body: ${options.text}`);
            return true;
        }

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Healthcare Reforms Doctors Association" <no-reply@hrdaconnect.com>',
                to: options.to,
                subject: options.subject,
                text: options.text,
            });
            console.log(`[EmailService] Sent email to ${options.to}`);
            return true;
        } catch (error) {
            console.error("[EmailService] Error sending email:", error);
            return false;
        }
    }

    async sendRegistrationConfirmation(to: string, name: string, tgmcId: string, hrdaId: number | string, phone: string, address: string) {
        return this.sendEmail({
            to,
            subject: "Registration Successful - Welcome to Healthcare Reforms Doctors Association",
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
Healthcare Reforms Doctors Association (HRDA) - Telangana`
        });
    }

    async sendOtp(to: string, otp: string) {
        return this.sendEmail({
            to,
            subject: "HRDA Verification Code",
            text: `Your verification code is: ${otp}

This code will expire in 5 minutes. Do not share this code with anyone.

If you did not request this code, please ignore this email.`
        });
    }
    async sendContactMessage(data: { firstName: string, lastName: string, email: string, subject: string, message: string }) {
        const adminEmail = process.env.CONTACT_EMAIL || "hrda4people@gmail.com";

        return this.sendEmail({
            to: adminEmail,
            subject: `[Contact Form] ${data.subject} - ${data.firstName} ${data.lastName}`,
            text: `You have received a new message from the HRDA Connect contact form.

From: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

------------------------------------------------
Please reply directly to ${data.email}
`
        });
    }
}

export const emailService = new EmailService();
