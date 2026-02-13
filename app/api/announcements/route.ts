import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function GET() {
    const data = await storage.getAnnouncements();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    // Auth Check
    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const data = insertAnnouncementSchema.parse(body);
        const result = await storage.createAnnouncement(data);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
