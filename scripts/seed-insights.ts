
import * as dotenv from "dotenv";
dotenv.config();

import { achievements, mediaCoverage, panels, electionDocuments, departments, galleryPhotos } from "../shared/schema";

async function main() {
    // Dynamic import to ensure dotenv loads first
    const { db } = await import("../lib/db");

    console.log("Seeding insights data...");
    console.log("DB URL exists:", !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
        console.log("DB Context:", process.env.DATABASE_URL.split('@')[1]); // Log host only
    }


    // --- Achievements ---
    console.log("Seeding Achievements...");
    await db.insert(achievements).values([
        {
            title: "Clean Sweep in TGMC Elections",
            description: "HRDA won all 13 seats in the Telangana Medical Council elections with a historic majority.",
            date: "2023-12-15",
            category: "post_election",
            imageUrl: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            title: "Stipend Hike for Post Graduates",
            description: "Successfully negotiated a 15% stipend hike for all PG medical students across state colleges.",
            date: "2024-03-10",
            category: "association",
            imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            title: "Legal Victory against Quackery",
            description: "High Court ordered strict action against unqualified practitioners following HRDA's PIL.",
            date: "2024-01-20",
            category: "legal",
            active: true
        },
        {
            title: "Foundation of New Medical College Block",
            description: "Participated in the foundation stone laying ceremony for the new academic block at Osmania.",
            date: "2023-11-05",
            category: "legacy",
            active: true
        }
    ]);

    // --- Media Coverage ---
    console.log("Seeding Media Coverage...");
    await db.insert(mediaCoverage).values([
        {
            title: "HRDA Demands Better Security for Doctors",
            description: "Leading newspaper coverage on HRDA's protest demanding enhanced security in government hospitals.",
            date: "2024-02-15",
            imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            title: "Interview: The Future of Medical Education",
            description: "HRDA President discusses the roadmap for medical education reforms on regional TV.",
            date: "2024-01-10",
            imageUrl: "https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            title: "Doctors Rally for Better Pay",
            description: "Photo feature of the massive rally organized by HRDA at Indira Park.",
            date: "2023-10-05",
            imageUrl: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=60",
            active: true
        }
    ]);

    // --- Panels (Elected Members) ---
    console.log("Seeding Panels...");
    await db.insert(panels).values([
        {
            name: "Dr. Koushik Varakala",
            role: "President",
            category: "elected_member",
            isStateLevel: true,
            imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            name: "Dr. Prathibha Lakshmi",
            role: "General Secretary",
            category: "elected_member",
            isStateLevel: true,
            imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            name: "Dr. Mahesh Kumar",
            role: "Treasurer",
            category: "elected_member",
            isStateLevel: true,
            imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&auto=format&fit=crop&q=60",
            active: true
        },
        {
            name: "Dr. Ravi Teja",
            role: "Executive Member",
            category: "state_executive",
            isStateLevel: true,
            imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=60",
            active: true
        }
    ]);

    // --- Election Documents ---
    console.log("Seeding Election Documents...");
    await db.insert(electionDocuments).values([
        {
            title: "HRDA Election Manifesto 2026",
            description: "The complete roadmap and vision document for the upcoming term.",
            category: "Foundational",
            filename: "manifesto_2026.pdf", // Placeholder
            date: "Jan 15, 2026",
            active: true
        },
        {
            title: "Final List of Candidates",
            description: "Official list of candidates contesting for the state executive body.",
            category: "Candidates",
            filename: "candidates_list.pdf", // Placeholder
            date: "Jan 20, 2026",
            active: true
        },
        {
            title: "Election Schedule Notice",
            description: "Important dates and venues for the polling process.",
            category: "Notices",
            filename: "schedule.pdf", // Placeholder
            date: "Jan 05, 2026",
            active: true
        }
    ]);

    // --- Departments ---
    console.log("Seeding Departments...");
    await db.insert(departments).values([
        {
            type: 'academic',
            title: 'Medical Education Wing',
            content: 'Focusing on curriculum updates and PG training enhancement.',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-21733e99dbb9?w=800&auto=format&fit=crop&q=60'
        },
        {
            type: 'sports',
            title: 'HRDA Sports Club',
            content: 'Organizing annual cricket and badminton tournaments for doctors.',
            imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60'
        },
        {
            type: 'culture',
            title: 'Cultural Committee',
            content: 'Celebrating festivals and organizing cultural gatherings.',
            imageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e233e?w=800&auto=format&fit=crop&q=60'
        }
    ]);

    // --- Gallery Photos ---
    console.log("Seeding Gallery Photos...");
    await db.insert(galleryPhotos).values([
        {
            url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
            title: "General Body Meeting 2023",
            description: "Annual general body meeting attended by over 500 members.",
            active: true
        },
        {
            url: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&auto=format&fit=crop&q=60",
            title: "Election Victory Celebration",
            description: "Celebrating the clean sweep in TGMC elections.",
            active: true
        },
        {
            url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60",
            title: "Protest at Indira Park",
            description: "Demanding better security measures for doctors.",
            active: true
        },
        {
            url: "https://images.unsplash.com/photo-1557992260-ec58e38d363c?w=800&auto=format&fit=crop&q=60",
            title: "Press Conference",
            description: "Addressing the media regarding new medical policies.",
            active: true
        }
    ]);


    console.log("Seeding complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
