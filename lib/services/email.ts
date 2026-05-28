import nodemailer from "nodemailer";

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
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
                        sender: {
                            name: "Healthcare Reforms Doctors Association",
                            email: process.env.SMTP_USER || "hrda4people@gmail.com"
                        },
                        to: [{ email: options.to }],
                        subject: options.subject,
                        textContent: options.text,
                        ...(options.html && { htmlContent: options.html })
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
                ...(options.html && { html: options.html })
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

    async sendNominationConfirmation(data: {
        to: string,
        name: string,
        hrdaId: string,
        tgmcNumber: string,
        district: string,
        postApplied: string,
        fee: number,
        paymentRef: string
    }) {
        // Send to Applicant
        await this.sendEmail({
            to: data.to,
            subject: "Nomination Application Successful - HRDA District Elections",
            text: `Dear ${data.name},

Your nomination application for the HRDA Telangana District Elections has been successfully submitted and your payment has been received.

Nomination Details:
------------------------------------------------
Name: ${data.name}
HRDA ID: ${data.hrdaId}
TGMC No: ${data.tgmcNumber}
District/Zone: ${data.district}
Post Applied For: ${data.postApplied}

Payment Details:
------------------------------------------------
Amount Paid: ₹${data.fee}
Payment Reference: ${data.paymentRef}
Status: SUCCESS

Thank you for participating in the democratic process of our association.
Your application is currently under review by the election committee.

                Regards,
Healthcare Reforms Doctors Association (HRDA) - Telangana`,
            html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w-lg mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">HRDA Telangana</h2>
        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">District Elections 2026</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h3 style="color: #0f172a; margin-top: 0;">Dear ${data.name},</h3>
        <p style="color: #334155; line-height: 1.6;">
            Your nomination application for the <strong>HRDA Telangana District Elections</strong> has been successfully submitted and your payment has been received.
        </p>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 12px; font-size: 16px;">Nomination Details</h4>
            <table style="width: 100%; color: #475569; font-size: 14px; line-height: 1.8;">
                <tr><td style="width: 120px;"><strong>Name:</strong></td><td>${data.name}</td></tr>
                <tr><td><strong>HRDA ID:</strong></td><td>${data.hrdaId}</td></tr>
                <tr><td><strong>TGMC No:</strong></td><td>${data.tgmcNumber}</td></tr>
                <tr><td><strong>District/Zone:</strong></td><td>${data.district}</td></tr>
                <tr><td><strong>Post Applied:</strong></td><td><strong>${data.postApplied}</strong></td></tr>
            </table>
        </div>

        <div style="background-color: #f0fdf4; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h4 style="color: #166534; margin-top: 0; margin-bottom: 12px; font-size: 16px;">Payment Details</h4>
            <table style="width: 100%; color: #475569; font-size: 14px; line-height: 1.8;">
                <tr><td style="width: 120px;"><strong>Amount Paid:</strong></td><td><span style="color: #16a34a; font-weight: bold;">₹${data.fee}</span></td></tr>
                <tr><td><strong>Reference:</strong></td><td>${data.paymentRef}</td></tr>
                <tr><td><strong>Status:</strong></td><td><span style="color: #16a34a; font-weight: bold;">SUCCESS</span></td></tr>
            </table>
        </div>

        <p style="color: #334155; line-height: 1.6; margin-bottom: 0;">
            Thank you for participating in the democratic process of our association.<br/>
            Your application is currently under review by the election committee.
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Healthcare Reforms Doctors Association (HRDA) - Telangana</p>
    </div>
</div>`
        });

        // Send to Admin
        const adminEmail = process.env.CONTACT_EMAIL || "hrda4people@gmail.com";
        await this.sendEmail({
            to: adminEmail,
            subject: `[New Nomination] ${data.postApplied} - ${data.district} (${data.name})`,
            text: `A new nomination has been submitted and paid successfully.

Applicant: ${data.name}
HRDA ID: ${data.hrdaId}
TGMC No: ${data.tgmcNumber}
Phone: ${data.to} (Email)
District/Zone: ${data.district}
Post Applied For: ${data.postApplied}

Payment Ref: ${data.paymentRef}
Amount: ₹${data.fee}

Please check the Admin Dashboard for full details.
`
        });
    }
}

export const emailService = new EmailService();
