import { storage } from "./storage";
import { ElectionDocument } from "@shared/schema";

export async function seedElectionDocuments() {
    const existingDocs = await storage.getElectionDocuments();
    if (existingDocs.length > 0) {
        console.log("Election documents already exist, skipping seed.");
        return;
    }

    console.log("Seeding election documents...");

    const docs = [
        {
            title: "Election Notification 2025",
            description: "Official notification for the HRDA Election 2025.",
            category: "Notices",
            date: "Dec 10, 2025",
            filename: "HRDA-Election-Notification..pdf",
        },
        {
            title: "Election Notice (Letter Head)",
            description: "Official election notice on letterhead.",
            category: "Notices",
            date: "Dec 12, 2025",
            filename: "HRDA LETTER HEAD-Notice.pdf",
        },
        {
            title: "Election Instructions",
            description: "Instructions regarding the election process.",
            category: "Notices",
            date: "Dec 12, 2025",
            filename: "HRDA LETTER HEAD Instructions .pdf",
        },
        {
            title: "Nominations List 2025",
            description: "List of nominations received for HRDA Election 2025.",
            category: "Candidates",
            date: "Dec 15, 2025",
            filename: "HRDA Election Nominations -2025.pdf",
        },
        {
            title: "Unanimous Nominations List",
            description: "List of candidates elected unanimously.",
            category: "Candidates",
            date: "Dec 18, 2025",
            filename: "Unanimous List - HRDA Election Nominations -2025.pdf",
        },
        {
            title: "Final Candidates List (State Elections)",
            description: "Final list of candidates after withdrawals.",
            category: "Candidates",
            date: "Dec 20, 2025",
            filename: "Final List After withdrawals- HRDA State Elections-2025.pdf",
        },
        {
            title: "Model Ballot Paper",
            description: "Sample ballot paper for ECM elections.",
            category: "Ballots",
            date: "Dec 22, 2025",
            filename: " ECM Model ballot .pdf",
        },
        {
            title: "HRDA SCCA List 2025",
            description: "SCCA related document for 2025.",
            category: "Records",
            date: "Dec 25, 2025",
            filename: "HRDA 2025-SCCA.pdf",
        },
        {
            title: "Elected Candidates (EC & SCCA)",
            description: "List of elected candidates for EC and SCCA.",
            category: "Results",
            date: "Dec 28, 2025",
            filename: "EC and scca Elected Candidates list-2025.pdf",
        },
        {
            title: "Elected Candidates List 2025",
            description: "Official list of elected candidates.",
            category: "Results",
            date: "Dec 28, 2025",
            filename: "Elected Candidates list--2025.pdf",
        },
        {
            title: "Final Membership List",
            description: "HRDA final membership list as of 10-12-25.",
            category: "Records",
            date: "Dec 10, 2025",
            filename: "HRDA FINAL MEMBERSHIP LIST 10-12-25.pdf",
        },
        {
            title: "Election Document (Ref 5_62...)",
            description: "Additional election reference document.",
            category: "Records",
            date: "Dec 01, 2025",
            filename: "5_6206319448861711732.pdf",
        }
    ];

    for (const doc of docs) {
        await storage.createElectionDocument(doc);
    }

    console.log("Seeding complete.");
}
