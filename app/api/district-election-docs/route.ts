import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";

const DISTRICT_ELECTIONS_CATEGORY = "district_elections";

export async function GET() {
    try {
        const docs = await storage.getElectionDocuments(DISTRICT_ELECTIONS_CATEGORY);
        return NextResponse.json(docs);
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch documents", error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const dateStr = formData.get("date") as string;

        if (!file || !title) {
            return NextResponse.json({ message: "Title and PDF file are required" }, { status: 400 });
        }

        // Upload to Vercel Blob — serves with correct Content-Type: application/pdf
        const blob = await put(`district-elections/${Date.now()}-${file.name}`, file, {
            access: "public",
            contentType: "application/pdf",
        });

        const doc = await storage.createElectionDocument({
            title,
            description: description || null,
            category: DISTRICT_ELECTIONS_CATEGORY,
            filename: blob.url,  // Direct Vercel Blob URL — works perfectly for inline viewing
            date: dateStr || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            active: true,
        });

        return NextResponse.json(doc, { status: 201 });
    } catch (error: any) {
        console.error("District Election Doc Upload Error:", error);
        return NextResponse.json({ message: "Upload failed", error: error.message }, { status: 500 });
    }
}
