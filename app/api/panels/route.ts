import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertPanelSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as 'state' | 'district' | undefined;
    const district = searchParams.get("district") || undefined;

    const data = await storage.getPanels(type, district);
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
                name: formData.get("name"),
                role: formData.get("role"),
                category: formData.get("category") || 'state_executive',
                district: formData.get("district") || null,
                priority: parseInt(formData.get("priority") as string) || 0,
                isStateLevel: formData.get("isStateLevel") === "true",
                imageUrl: formData.get("imageUrl") || "",
                phone: formData.get("phone") || undefined,
                active: formData.get("active") !== "false" // defaults true
            };

            const file = formData.get("image") as File;
            if (file) {
                if (!process.env.CLOUDINARY_CLOUD_NAME) {
                    return NextResponse.json({
                        message: "Cloudinary credentials missing in Vercel. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your AP Vercel Project settings, and then REDEPLOY the deployment to apply them."
                    }, { status: 500 });
                }
                const imageUrl = await uploadImage(file);
                data.imageUrl = imageUrl;
            }
        } else {
            data = await request.json();
        }

        const parsedData = insertPanelSchema.parse(data);
        const result = await storage.createPanel(parsedData);
        return NextResponse.json(result, { status: 201 });
    } catch (err: any) {
        console.error("Error creating panel:", err);
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });

        // Pass explicit error information up if Cloudinary threw a deeper exception
        return NextResponse.json({
            message: err?.message || "Internal Server Error",
            details: err
        }, { status: 500 });
    }
}
