import { googleSheetsService } from "../lib/services/googleSheets";

async function main() {
    const phone = "7799001102";
    console.log(`Searching for phone: ${phone}`);

    try {
        const result = await googleSheetsService.findRegistrationByPhone(phone);
        console.log("Result:", result);

        // Also try listing some rows to see format
        // accessing private doc is hard, let's just use the service public methods or simple reflection if needed
        // or just trust the result.
        // If null, we might want to debug the raw rows.
        // I'll add a temporary debug method to the service if this fails? 
        // Or I can just instantiate GoogleSpreadsheet here manually.
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
