import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertAchievementSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
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
                category: formData.get("category"),
                active: formData.get("active") === "true",
                imageUrl: formData.get("imageUrl") || undefined, // undefined to allow partial updates properly or avoid overwriting if not present? 
                // actually in update if not provided we might want to keep existing. 
                // If the hook sends current imageUrl when no new file, we handle that.
            };

            // Clean up undefined values from FormData extraction if needed, 
            // but Zod partial() handles undefined/missing keys, but FormData.get returns null not undefined.
            // We need to be careful. Schema expects strings usually.
            if (data.imageUrl === "") delete data.imageUrl; // If empty string, maybe remove? Or schema allows it? 
            // insertAchievementSchema allows string.
            // If the user sends "active" as string "true"/"false".

            // Let's refine the data construction.
            const entries = Array.from(formData.entries());
            data = {};
            for (const [key, value] of entries) {
                if (key === "image") continue; // Handle separately
                if (key === "active") {
                    data[key] = value === "true";
                    continue;
                }
                data[key] = value;
            }

            const file = formData.get("image") as File;
            if (file) {
                const imageUrl = await uploadImage(file);
                data.imageUrl = imageUrl;
            }
        } else {
            data = await request.json();
        }

        const parsedData = insertAchievementSchema.partial().parse(data);
        const result = await storage.updateAchievement(id, parsedData);
        if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json(result);
    } catch (err) {
        console.error("Error updating achievement:", err);
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
    const session = await auth();

    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await storage.deleteAchievement(id);
    return new NextResponse(null, { status: 204 });
}
