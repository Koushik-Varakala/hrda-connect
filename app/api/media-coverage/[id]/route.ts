
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertMediaCoverageSchema } from "@shared/schema";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = Number(params.id);
    const session = await auth();

    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const data = insertMediaCoverageSchema.partial().parse(body);
        const result = await storage.updateMediaCoverage(id, data);
        if (!result) return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json(result);
    } catch (err) {
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

    await storage.deleteMediaCoverage(id);
    return new NextResponse(null, { status: 204 });
}
