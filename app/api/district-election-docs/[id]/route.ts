import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const params = await props.params;
        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

        await storage.deleteElectionDocument(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to delete", error: error.message }, { status: 500 });
    }
}
