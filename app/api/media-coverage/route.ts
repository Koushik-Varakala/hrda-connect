import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertMediaCoverageSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function GET() {
    const data = await storage.getMediaCoverage();
    return NextResponse.json(data);
}

import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        let data: any;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            data = {
                title: formData.get("title"),
                description: formData.get("description"),
                date: formData.get("date"),
                active: formData.get("active") === "true",
                imageUrl: formData.get("imageUrl") || "",
            };

            const file = formData.get("image") as File;
            if (file) {
                const imageUrl = await uploadImage(file);
                data.imageUrl = imageUrl;
            }
        } else {
            data = await request.json();
        }

        const parsedData = insertMediaCoverageSchema.parse(data);
        const result = await storage.createMediaCoverage(parsedData);
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        console.error("Error creating media coverage:", err);
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
