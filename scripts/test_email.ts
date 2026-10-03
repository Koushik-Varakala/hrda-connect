import "dotenv/config";
import { emailService } from "../lib/services/email";

async function test() {
    console.log("=== TESTING BREVO EMAIL CONFIGURATION ===");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_FROM:", process.env.SMTP_FROM);
    console.log("SMTP_PASS prefix:", process.env.SMTP_PASS?.slice(0, 10));

    try {
        const sent = await emailService.sendEmail({
            to: process.env.SMTP_USER || "koushikvarakala@gmail.com",
            subject: "HRDA AP - Test Email Connection",
            text: "This is a test email to verify that Brevo email integration is working for HRDA AP.",
            html: "<p>This is a test email to verify that <strong>Brevo email integration</strong> is working for HRDA AP.</p>"
        });
        console.log("Result:", sent ? "✅ Email Sent Successfully!" : "❌ Email Sending Failed!");
    } catch (e) {
        console.error("Error during test:", e);
    }
}

test();
