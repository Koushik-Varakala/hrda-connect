import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertDepartmentSchema } from "@shared/schema";
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
        // For PUT, typically the entire resource is replaced, so we use the full schema.
        // If partial updates are intended, insertDepartmentSchema.partial() would be used.
        const data = insertDepartmentSchema.parse(body);
        const result = await storage.updateDepartment(id, data); // Assuming updateDepartment can handle full replacement
        return NextResponse.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) { // Fix: params is part of context, await might be needed in future next versions but currently context.params
    // Next.js 15+ might require awaiting params, but Next 14 does not.
    // We'll treat it as standard.
    const params = await props.params;
    const id = Number(params.id);

    const session = await auth();
    if (!session?.user || !(session.user as any).isAdmin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        // Using partial schema for updates or just the insert schema partial
        const data = insertDepartmentSchema.partial().parse(body);
        const result = await storage.updateDepartment(id, data);
        return NextResponse.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json(err, { status: 400 });
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
