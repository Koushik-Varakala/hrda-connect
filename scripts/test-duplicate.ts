import { storage } from "../lib/storage";

async function run() {
    const existing = await storage.searchRegistrations({ phone: "9849299988" });
    console.log(`Length: ${existing.length}`);
    if (existing.length > 0) {
        console.log(`Payment Status: ${existing[0].paymentStatus}`);
    }
    process.exit(0);
}

run();
