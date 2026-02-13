import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertElectionDocumentSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // Upload to Cloudinary
        const buffer = await file.arrayBuffer();
        const bytes = Buffer.from(buffer);

        // Cloudinary Upload Promise
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "hrda_documents", resource_type: "auto" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            // Write buffer to stream
            const stream = require('stream'); // Dynamic import maybe safer or use standard node
            const bufferStream = new stream.PassThrough();
            bufferStream.end(bytes);
            bufferStream.pipe(uploadStream);
        });

        const docData = {
            title,
            description,
            category,
            date,
            filename: uploadResult.secure_url, // Store Cloudinary URL
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
