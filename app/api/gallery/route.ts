import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertGalleryPhotoSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function GET() {
    const data = await storage.getGalleryPhotos();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const data = insertGalleryPhotoSchema.parse(body);
        const result = await storage.createGalleryPhoto(data);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
