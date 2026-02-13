import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const stats = await storage.getRegistrations();
        return NextResponse.json(stats);
    } catch (err) {
        console.error("Admin Registrations API Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
