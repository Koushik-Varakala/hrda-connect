import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertElectionDocumentSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
    const data = await storage.getElectionDocuments();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const date = formData.get("date") as string;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // Upload to Cloudinary using helper
        // Use hrda_documents folder? helper uses hrda_connect. 
        // Helper is currently hardcoded to 'hrda_connect'.
        // For consistency/simplicity, using helper is better even if folder changes slightly, 
        // or I should update helper to accept folder.
        // Let's check lib/cloudinary.ts content again.

        // It hardcodes 'hrda_connect'. 
        // I will use uploadImage(file). 
        // If I strictly need 'hrda_documents' I should update helper. 
        // The user didn't specify folder requirements, but organization is nice.
        // I'll update helper to take optional folder? No, sticking to helper for now is fine. 'hrda_connect' is fine.

        const imageUrl = await uploadImage(file);

        const docData = {
            title,
            description,
            category,
            date,
            filename: imageUrl, // Store Cloudinary URL
            active: true
        };

        // Validate schema
        const input = insertElectionDocumentSchema.parse(docData);
        const result = await storage.createElectionDocument(input);
        return NextResponse.json(result, { status: 201 });

    } catch (err) {
        console.error("Upload error:", err);
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
