import "dotenv/config";
import { db } from "./lib/db";
import { panels } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allPanels = await db.select().from(panels);
    for (const p of allPanels) {
        if (p.role === "CO-ORDINATION COMMITTEE" || p.role.toLowerCase().includes("co-ordination") || p.role.toLowerCase().includes("coordination")) {
            console.log(`Updating panel ${p.id}: ${p.role} -> State Coordinator`);
            await db.update(panels).set({ role: "State Coordinator" }).where(eq(panels.id, p.id));
        }
    }
    console.log("Done fixing roles.");
    process.exit(0);
}

main().catch(console.error);
