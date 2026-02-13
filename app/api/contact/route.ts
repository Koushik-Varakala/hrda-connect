import { NextResponse } from "next/server";
import { z } from "zod";
// import { emailService } from "@/server/services/email"; // Needs migration of service imports

const contactSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    subject: z.string().min(1),
    message: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = contactSchema.parse(body);

        // TODO: Send Email
        // await emailService.sendContactMessage(data);

        return NextResponse.json({ message: "Message sent successfully" });
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
