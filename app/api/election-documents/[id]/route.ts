import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);

    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const docs = await storage.getElectionDocuments();
        const doc = docs.find(d => d.id === id);

        if (doc) {
            // Delete from Cloudinary
            if (doc.filename.includes("cloudinary")) {
                try {
                    // Extract public_id
                    // URL: .../upload/v123.../hrda_documents/filename.pdf
                    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
                    const match = doc.filename.match(regex);
                    if (match && match[1]) {
                        await cloudinary.uploader.destroy(match[1]);
                    }
                } catch (e) {
                    console.error("Cloudinary delete failed", e);
                }
            }
            await storage.deleteElectionDocument(id);
        }
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Delete error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
