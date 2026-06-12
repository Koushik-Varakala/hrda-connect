import nodemailer from "nodemailer";
import { appConfig } from "@/lib/app-config";

export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
}

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attachments?: EmailAttachment[];
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
                            email: process.env.SMTP_USER || appConfig.email
                        },
                        to: [{ email: options.to }],
                        subject: options.subject,
                        textContent: options.text,
                        ...(options.html && { htmlContent: options.html }),
                        ...(options.attachments && options.attachments.length > 0 && {
                            attachment: options.attachments.map(a => ({
                                name: a.filename,
                                content: Buffer.isBuffer(a.content) ? a.content.toString("base64") : a.content,
                            }))
                        })
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
                ...(options.html && { html: options.html }),
                ...(options.attachments && {
                    attachments: options.attachments.map(a => ({
                        filename: a.filename,
                        content: a.content,
                        contentType: a.contentType || "application/pdf",
                    }))
                })
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

Congratulations! You have successfully registered with ${appConfig.organizationName}.

Here are your membership details:
------------------------------------------------
Name: ${name}
HRDA Membership ID: ${hrdaId}
${appConfig.medicalCouncilShort} Registration ID: ${tgmcId}
Mobile Number: ${phone}
Email Address: ${to}
Address: ${address}
------------------------------------------------

Thank you for strengthening our voice. We look forward to your active participation.

Regards,
${appConfig.organizationName}`
        });
    }

    async sendDonationConfirmation(to: string, name: string, amount: number) {
        const siteUrl = "https://" + appConfig.domain;
        return this.sendEmail({
            to,
            subject: "Thank You for Your Donation - Healthcare Reforms Doctors Association",
            text: `Dear ${name},

Thank you very much for your donation of ₹${amount} to the Healthcare Reforms Doctors Association (HRDA).

Your contribution directly supports our advocacy for doctor welfare, healthcare reforms, and medical student rights.

Regards,
${appConfig.organizationName}
${appConfig.domain}`,
            html: `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f8fafc;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background-color:#f8fafc;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
<tr><td style="background-color:#059669;padding:32px;text-align:center;color:#ffffff;">
  <h1 style="margin:0;font-size:24px;font-weight:700;">Thank You for Your Support!</h1>
</td></tr>
<tr><td style="padding:32px;">
  <p style="font-size:16px;margin:0 0 16px 0;">Dear <strong>${name}</strong>,</p>
  <p style="font-size:14px;color:#475569;margin:0 0 24px 0;line-height:1.7;">On behalf of the Healthcare Reforms Doctors Association (HRDA), we express our deepest gratitude for your contribution of <strong>₹${amount}</strong>.</p>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;overflow:hidden;margin-bottom:24px;">
    <tr><td style="padding:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#065f46;">
        <tr><td style="padding:4px 0;font-weight:700;color:#047857;font-size:14px;" colspan="2">Contribution Summary</td></tr>
        <tr><td style="padding:6px 0;width:120px;color:#047857;">Contributor</td><td style="padding:6px 0;font-weight:700;">${name}</td></tr>
        <tr><td style="padding:6px 0;color:#047857;">Amount</td><td style="padding:6px 0;font-weight:700;font-size:15px;">₹${amount}</td></tr>
        <tr><td style="padding:6px 0;color:#047857;">Date</td><td style="padding:6px 0;">${new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
      </table>
    </td></tr>
  </table>

  <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 24px 0;">Your donation directly powers our movements, legal advocacy, and healthcare reform efforts to protect the interests of doctors and improve medical education.</p>
  <p style="font-size:14px;color:#475569;margin:0;">If you have any questions or require additional details, feel free to contact us at <a href="mailto:${appConfig.email}" style="color:#059669;text-decoration:none;font-weight:600;">${appConfig.email}</a>.</p>
</td></tr>
<tr><td style="background-color:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="margin:0;font-size:12px;color:#94a3b8;">Healthcare Reforms Doctors Association (HRDA)<br/><a href="${siteUrl}" style="color:#059669;text-decoration:none;">${appConfig.domain}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
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
        const adminEmail = process.env.CONTACT_EMAIL || appConfig.email;

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
        mobile: string,
        district: string,
        postApplied: string,
        fee: number,
        paymentRef: string,
        photoUrl?: string,
        signatureUrl?: string,
        pdfBuffer?: Buffer
    }) {
        const pdfAttachment = data.pdfBuffer ? [{
            filename: `HRDA_Nomination_${data.name.replace(/\s+/g, '_')}.pdf`,
            content: data.pdfBuffer,
            contentType: "application/pdf" as const,
        }] : [];

        const siteUrl = "https://" + appConfig.domain;
        const logoUrl = `${siteUrl}/hrda_full_logo.png`;
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

        const photoBlock = data.photoUrl
            ? `<td width="90" style="vertical-align:top;padding-left:16px;"><img src="${data.photoUrl}" alt="Photo" width="80" height="100" style="width:80px;height:100px;object-fit:cover;border-radius:10px;border:2px solid #e2e8f0;" /></td>`
            : '';

        const signatureBlock = data.signatureUrl
            ? `<tr><td style="padding:16px 32px 0 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefce8;border-radius:12px;border:1px solid #fde68a;overflow:hidden;"><tr><td style="padding:12px 16px;"><span style="color:#92400e;font-size:12px;font-weight:700;">CANDIDATE SIGNATURE</span></td></tr><tr><td style="padding:0 16px 12px 16px;"><img src="${data.signatureUrl}" alt="Signature" height="50" style="height:50px;max-width:200px;object-fit:contain;" /></td></tr></table></td></tr>`
            : '';

        const pdfNotice = data.pdfBuffer
            ? `<tr><td style="padding:16px 32px 0 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;"><tr><td style="padding:14px 16px;"><span style="color:#1e40af;font-size:13px;">&#128206; <strong>Your complete nomination application is attached as a PDF.</strong> Please save it for your records.</span></td></tr></table></td></tr>`
            : '';

        const year = now.getFullYear();

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#2563eb 100%);padding:28px 32px;text-align:center;">
  <img src="${logoUrl}" alt="HRDA" width="200" style="max-width:200px;height:auto;margin-bottom:12px;" />
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background-color:rgba(255,255,255,0.2);"></td></tr></table>
  <p style="color:#93c5fd;font-size:13px;margin:12px 0 0 0;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">District Elections 2026</p>
</td></tr>

<!-- Success Badge -->
<tr><td style="padding:24px 32px 0 32px;text-align:center;">
  <table cellpadding="0" cellspacing="0" align="center"><tr>
    <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:24px;padding:8px 20px;">
      <span style="color:#16a34a;font-size:14px;font-weight:700;">&#10003; NOMINATION SUBMITTED SUCCESSFULLY</span>
    </td>
  </tr></table>
</td></tr>

<!-- Greeting + Photo -->
<tr><td style="padding:24px 32px 0 32px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:top;">
      <h2 style="color:#0f172a;margin:0 0 8px 0;font-size:20px;">Dear ${data.name},</h2>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0;">Your nomination for the <strong style="color:#1e40af;">HRDA ${appConfig.stateName} District Elections 2026</strong> has been successfully submitted. Your payment has been received and verified.</p>
    </td>
    ${photoBlock}
  </tr></table>
</td></tr>

<!-- Personal Details -->
<tr><td style="padding:24px 32px 0 32px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr><td style="background-color:#1e3a8a;padding:10px 16px;"><span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.5px;">PERSONAL DETAILS</span></td></tr>
    <tr><td style="padding:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
        <tr><td style="padding:6px 0;width:140px;color:#64748b;font-weight:600;">Full Name</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${data.name}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">HRDA Membership ID</td><td style="padding:6px 0;">${data.hrdaId}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">${appConfig.medicalCouncilShort} Number</td><td style="padding:6px 0;">${data.tgmcNumber}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Mobile Number</td><td style="padding:6px 0;">${data.mobile}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Email Address</td><td style="padding:6px 0;">${data.to}</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- Election Details -->
<tr><td style="padding:16px 32px 0 32px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr><td style="background-color:#7c3aed;padding:10px 16px;"><span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.5px;">ELECTION DETAILS</span></td></tr>
    <tr><td style="padding:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
        <tr><td style="padding:6px 0;width:140px;color:#64748b;font-weight:600;">District / Zone</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${data.district}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Post Applied For</td><td style="padding:6px 0;font-weight:700;color:#7c3aed;">${data.postApplied}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #e2e8f0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Nomination Fee</td><td style="padding:6px 0;font-weight:700;">&#8377;${data.fee}/-</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<!-- Payment Details -->
<tr><td style="padding:16px 32px 0 32px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;overflow:hidden;">
    <tr><td style="background-color:#16a34a;padding:10px 16px;"><span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.5px;">PAYMENT CONFIRMATION</span></td></tr>
    <tr><td style="padding:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#334155;">
        <tr><td style="padding:6px 0;width:140px;color:#64748b;font-weight:600;">Amount Paid</td><td style="padding:6px 0;font-weight:700;color:#16a34a;font-size:16px;">&#8377;${data.fee}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #bbf7d0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Payment Reference</td><td style="padding:6px 0;font-family:monospace;font-size:12px;">${data.paymentRef}</td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #bbf7d0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Payment Status</td><td style="padding:6px 0;"><span style="background-color:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:12px;font-weight:700;font-size:12px;">&#10003; PAID</span></td></tr>
        <tr><td colspan="2" style="border-bottom:1px solid #bbf7d0;"></td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-weight:600;">Date &amp; Time</td><td style="padding:6px 0;">${dateStr}, ${timeStr}</td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>

${signatureBlock}
${pdfNotice}

<!-- Note -->
<tr><td style="padding:20px 32px 0 32px;">
  <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">Your application is currently <strong>under review</strong> by the HRDA Election Commission. You will be notified of any updates regarding your nomination status.</p>
  <p style="color:#475569;font-size:13px;line-height:1.7;margin:12px 0 0 0;">Thank you for participating in the democratic process. For queries, contact us at <a href="mailto:${appConfig.email}" style="color:#2563eb;text-decoration:none;font-weight:600;">${appConfig.email}</a>.</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:28px 32px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6;">Healthcare Reforms Doctors Association (HRDA) &#8212; ${appConfig.stateName}<br/>&#169; ${year} HRDA. All rights reserved.<br/><a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">${appConfig.domain}</a></p>
  </td></tr></table>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

        const plainText = `Dear ${data.name},

Your nomination for HRDA ${appConfig.stateName} District Elections 2026 has been submitted.

Personal Details:
- Name: ${data.name}
- HRDA ID: ${data.hrdaId}
- ${appConfig.medicalCouncilShort} No: ${data.tgmcNumber}
- Mobile: ${data.mobile}
- Email: ${data.to}

Election Details:
- District/Zone: ${data.district}
- Post: ${data.postApplied}
- Fee: Rs.${data.fee}/-

Payment:
- Amount: Rs.${data.fee}
- Reference: ${data.paymentRef}
- Status: PAID
- Date: ${dateStr}, ${timeStr}

Your application is under review by the HRDA Election Commission.

Regards,
${appConfig.organizationName} | ${appConfig.domain}`;

        // Send to Applicant
        await this.sendEmail({
            to: data.to,
            subject: "Nomination Submitted Successfully - HRDA District Elections 2026",
            text: plainText,
            html: html,
            attachments: pdfAttachment,
        });

        // Send same professional email to Admin (hrda4people@gmail.com)
        const adminEmail = process.env.CONTACT_EMAIL || appConfig.email;
        await this.sendEmail({
            to: adminEmail,
            subject: `[New Nomination] ${data.postApplied} - ${data.district} (${data.name})`,
            text: `New nomination received.\n\nCandidate: ${data.name}\nHRDA ID: ${data.hrdaId}\nTGMC: ${data.tgmcNumber}\nMobile: ${data.mobile}\nEmail: ${data.to}\nDistrict: ${data.district}\nPost: ${data.postApplied}\nFee: Rs.${data.fee}\nPayment Ref: ${data.paymentRef}\nDate: ${dateStr}`,
            html: html,
            attachments: pdfAttachment,
        });
    }
}

export const emailService = new EmailService();
