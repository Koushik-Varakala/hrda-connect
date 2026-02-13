import { NextResponse } from "next/server";
import { storage } from "@/lib/storage"; // We need to update imports in storage.ts later or move it
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";
// import { googleSheetsService } from "@/server/services/googleSheets"; // Needs migration
// import { emailService } from "@/server/services/email"; // Needs migration
// import { smsService } from "@/server/services/sms"; // Needs migration

// Temporary: storage import might fail if it depends on local files.
// We need to move server/storage.ts to lib/storage.ts and ensure it doesn't use 'express' types.


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = insertRegistrationSchema.parse(body);
        const registration = await storage.createRegistration(data);

        // TODO: Add Google Sheets, Email, SMS logic here (Copy from routes.ts)
        // For now, returning the registration to unblock basic flow.

        return NextResponse.json(registration, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(err, { status: 400 });
        }
        console.error("Registrations API Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
