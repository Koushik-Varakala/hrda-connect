import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertNominationSchema } from "@shared/schema";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        const data = await request.json();
        const validatedData = insertNominationSchema.partial().parse(data);

        const updated = await storage.updateNomination(id, validatedData);
        if (!updated) {
            return NextResponse.json({ message: "Nomination not found" }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Update Nomination Error:", error);
        return NextResponse.json({ message: "Failed to update nomination", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
        }

        // We now have a hard delete available in storage.
        await storage.deleteNomination(id);

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Delete Nomination Error:", error);
        return NextResponse.json({ message: "Failed to delete nomination", error: error.message }, { status: 500 });
    }
}
