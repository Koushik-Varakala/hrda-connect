
import dotenv from "dotenv";
import { count } from "drizzle-orm";

async function main() {
    dotenv.config();

    try {
        const { db } = await import("../lib/db");
        const { achievements, mediaCoverage, panels, electionDocuments, galleryPhotos } = await import("../shared/schema");

        console.log("Verifying data in database...");
        if (process.env.DATABASE_URL) {
            console.log("DB Context:", process.env.DATABASE_URL.split('@')[1]);
        }

        const achievementsCount = await db.select({ count: count() }).from(achievements);
        console.log(`Achievements: ${achievementsCount[0].count}`);

        const mediaCount = await db.select({ count: count() }).from(mediaCoverage);
        console.log(`Media Coverage: ${mediaCount[0].count}`);

        const panelsCount = await db.select({ count: count() }).from(panels);
        console.log(`Panels: ${panelsCount[0].count}`);

        const docsCount = await db.select({ count: count() }).from(electionDocuments);
        console.log(`Election Documents: ${docsCount[0].count}`);

        const galleryCount = await db.select({ count: count() }).from(galleryPhotos);
        console.log(`Gallery Photos: ${galleryCount[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

main();
