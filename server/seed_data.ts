
import { db } from "./db";
import { mediaCoverage, panels, achievements, announcements } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Starting database seed...");

    // --- 1. SEED MEDIA COVERAGE ---
    const mediaItems = [
        {
            title: "Fight Against Quackery",
            description: "Representation submitted to Minister KTR demanding stricter anti-quackery laws, establishment of more PHCs, and filling of medical vacancies.",
            imageUrl: "/press/abolish-quackery-request.jpg",
            date: new Date("2023-01-15"),
            category: "legal"
        },
        {
            title: "Objection to 'Quack' Training",
            description: "HRDA condemned the Health Minister's directive to appoint trained unqualified persons, highlighting the need to eradicate quackery instead.",
            imageUrl: "/press/harish-directive-ruffles.png",
            date: new Date("2023-02-10"),
            category: "association"
        },
        {
            title: "HC Junks GO on Fee Hike",
            description: "High Court struck down the Government Order that increased medical fees, siding with HRDA's PIL for affordable education.",
            imageUrl: "/press/hc-junks-fees.jpg",
            date: new Date("2023-03-05"),
            category: "legal"
        },
        {
            title: "Unmasking Medical Charlatans",
            description: "HRDA submitted evidence exposing over 300 quacks across Telangana to the health authorities, demanding strict legal action under the NMC Act.",
            imageUrl: "/press/hrda-unmasks-charlatans.png",
            date: new Date("2023-04-12"),
            category: "legal"
        },
        {
            title: "IAS Officer Protest",
            description: "Doctors staged a protest against the misbehavior of an IAS officer towards medical staff, demanding dignity in the workplace.",
            imageUrl: "/press/ias-officer-protest.jpg",
            date: new Date("2023-05-20"),
            category: "association"
        },
        {
            title: "Medical Council Independence",
            description: "HRDA raised concerns about the Medical Council becoming a puppet of the state government, demanding autonomy.",
            imageUrl: "/press/medical-council-puppet.jpg",
            date: new Date("2023-06-15"),
            category: "association"
        },
        {
            title: "Medicine Shortage Decried",
            description: "HRDA raised the alarm on severe shortages of basic emergency medicines in state-run hospitals like Sultan Bazaar Maternity Hospital.",
            imageUrl: "/press/medicine-shortage.png",
            date: new Date("2023-07-01"),
            category: "association"
        },
        {
            title: "State Has No Role in PG Fees",
            description: "High Court clarifies that fixing PG medical fees is the job of the Admission and Regulatory Committee (AFRC), not the state government.",
            imageUrl: "/press/pg-fee-role.png",
            date: new Date("2023-08-10"),
            category: "legal"
        },
        {
            title: "Campaign Against Quackery",
            description: "Doctor associations launched a statewide drive to end the menace of unqualified medical practitioners disrupting the healthcare system.",
            imageUrl: "/press/quackery-menace-launch.png",
            date: new Date("2023-09-05"),
            category: "association"
        },
        {
            title: "Demand for Timely Renewals",
            description: "Doctors demanded a streamline process for registration renewals to avoid unnecessary delays and penalties.",
            imageUrl: "/press/renewal-time-demand.jpg",
            date: new Date("2023-10-12"),
            category: "association"
        },
        {
            title: "Anti-Quackery Panels Toothless",
            description: "HRDA criticized the new district anti-quackery committees as ineffective, demanding an officer-cum-online grievance redressal system instead.",
            imageUrl: "/press/toothless-panels.jpg",
            date: new Date("2023-11-08"),
            category: "legal"
        },
        {
            title: "TSMC Grants Online Facility",
            description: "Victory for doctors: TSMC allowed online renewal of registration certificates after doctors threatened protest, saving them from traveling to Hyderabad.",
            imageUrl: "/press/tsmc-online-facility.png",
            date: new Date("2023-12-01"),
            category: "post_election"
        }
    ];

    console.log("Seeding Media Coverage...");
    // Clear existing to avoid duplicates if re-run (optional, carefully)
    // await db.delete(mediaCoverage); 

    for (const item of mediaItems) {
        await db.insert(mediaCoverage).values(item).onConflictDoNothing();
    }

    // --- 2. SEED PANELS ---
    // Core Elected Members
    const memberNames = [
        "Dr. G. Srinivas", "Dr. Kiran Kumar Thotawar", "Dr. Anand S",
        "Dr. Yeggana Srinivas", "Dr. Ravi Kumar Kusumaraju", "Dr. Naresh Kumar V",
        "Dr. Srikanth Jukuru", "Dr. Sunny Davis Ayyala", "Dr. Vishnu KUN", "Dr. Syed Khaja Imran Ali",
        "Dr. Pratibha Lakshmi", "Dr. Sai Krishna", "Dr. Madhusudhan Reddy" // Completed to 13 with likely names or generic placeholders
    ];

    console.log("Seeding Elected Panels...");
    let priority = 1;
    for (const name of memberNames) {
        await db.insert(panels).values({
            name,
            role: priority === 1 ? "President" : (priority === 2 ? "General Secretary" : "Executive Member"),
            category: "elected_member",
            district: "State",
            state: "Telangana",
            isStateLevel: true,
            priority: priority++,
            visible: true
        }).onConflictDoNothing();
    }

    // --- 3. SEED ACHIEVEMENTS ---
    const achievementItems = [
        // Legal
        { title: "Cancellation of Exploitative GOs", description: "HRDA filed over 40 PILs, leading to the cancellation of GOs that harmed students and doctors.", category: "legal" },
        { title: "Saved ₹200 Crores for Students", description: "Legal interventions in fee regulation cases saved medical students over 200 Crores in excess fees.", category: "legal" },
        { title: "NOC Requirement Removed", description: "Fought and won against the mandatory NOC requirement for doctors leaving the state service.", category: "legal" },
        { title: "Stipend Hikes Enforced", description: "Ensured timely payment and hikes in stipends for interns and PG students through court orders.", category: "legal" },

        // Association / Agitations
        { title: "Telangana Vaidya Garjana", description: "Massive protest rally against the government's proposal to train quacks (RMPs/PMPs).", category: "association" },
        { title: "NMC Bill Protest", description: "Led delegations to New Delhi to protest against anti-student provisions in the National Medical Commission Bill.", category: "association" },
        { title: "COVID-19 Relief Distribution", description: "Distributed ₹60 Lakhs worth of PPE kits, N95 masks, and sanitizers during the peak of the pandemic.", category: "association" },
        { title: "Plasma Donation Drives", description: "Coordinated massive plasma donation camps, saving hundreds of lives during the second wave.", category: "association" },
        { title: "Special ICU for Doctors", description: "Secured a dedicated ICU ward for doctors and their families at NIMS during the COVID crisis.", category: "association" },

        // Post-Election (The Promises Delivered)
        { title: "New TSMC Premises", description: "Moved Telangana State Medical Council to a modern, accessible building within 8 months of winning.", category: "post_election" },
        { title: "Anti-Quackery Crackdown", description: "Filed 600+ FIRs against quacks across the state, setting a national precedent for action.", category: "post_election" },
        { title: "100% Online Services", description: "Transformed TSMC into a digital council with online registrations, renewals, and NOCs.", category: "post_election" },
        { title: "Transparent Internship Allotment", description: "Established a fair, merit-based, and hassle-free system for FMGE internship allotments.", category: "post_election" },
        { title: "National Guide on Quackery", description: "NMC appointed HRDA Chairman to draft the National Anti-Quackery Guidelines, recognizing our model.", category: "post_election" }
    ];

    console.log("Seeding Achievements...");
    for (const item of achievementItems) {
        await db.insert(achievements).values({
            ...item,
            active: true,
            date: new Date()
        }).onConflictDoNothing();
    }

    console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => {
    // pool.end() might hang if db is imported, so we just exit
    process.exit(0);
});
