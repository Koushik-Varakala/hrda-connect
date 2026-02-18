"use client";

import { Layout } from "@/components/Layout";
import { appConfig } from "@/lib/app-config";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function Manifesto() {
    // AP only
    if (appConfig.region !== 'AP') return notFound();

    const sections = [
        {
            roman: "I",
            title: "Doctor Welfare, Security, and Social Protection",
            items: [
                {
                    num: 1,
                    heading: "Health Protection for Every Doctor & Medical Student",
                    body: "HRDA will advocate for the creation of a universal Health Protection Card for doctors and medical students that ensures free or cashless treatment at empanelled hospitals, life and accidental insurance coverage for families in cases of death or disability, and access to emergency medical and legal support.",
                    aim: "A system where caregivers are themselves protected and never left vulnerable.",
                },
                {
                    num: 2,
                    heading: "Fair and Regular Stipends",
                    body: "HRDA will fight for standardized, timely stipends for Government, Private, and FMGE Interns and Government and Private Postgraduate Students.",
                    aim: "End financial exploitation and ensure dignity for young doctors in training.",
                },
                {
                    num: 3,
                    heading: "Financial Security During Career Transitions",
                    body: "HRDA will press for Government-backed financial assistance for doctors preparing for postgraduate entrance examinations and temporarily unemployed qualified doctors.",
                    aim: "Reduce economic stress and allow doctors to focus on professional growth.",
                },
                {
                    num: 4,
                    heading: "Violence-Free Healthcare Environments",
                    body: "HRDA will stand firmly for zero tolerance to violence against doctors and healthcare institutions by advocating for strict enforcement of medical protection laws, mandatory hospital security systems, and rapid-response coordination with law enforcement.",
                    aim: "Safe hospitals that allow uninterrupted, confident medical service.",
                },
            ],
        },
        {
            roman: "II",
            title: "Ethical Practice, Public Safety, and Healthcare Integrity",
            items: [
                {
                    num: 5,
                    heading: "Eradication of Quackery & Strengthening Rural Healthcare",
                    body: "HRDA will work to eliminate illegal medical practice and promote strong enforcement of anti-quackery laws, establishment of Janatha Clinics staffed by qualified MBBS doctors, and self-employment opportunities in tribal and rural areas.",
                    aim: "Safe, qualified healthcare access for every community.",
                },
                {
                    num: 6,
                    heading: "Clear Boundaries Between Medical Systems (No Mixopathy)",
                    body: "HRDA will advocate for defined scope-of-practice standards and enforcement of system-specific clinical boundaries, along with fair employment opportunities for MBBS doctors in private hospitals.",
                    aim: "Patient safety, legal clarity, and professional integrity.",
                },
                {
                    num: 7,
                    heading: "Ethical Prescribing and Rational Drug Use",
                    body: "HRDA will promote responsible prescribing through standard treatment guidelines, advisory prescription audits, and protection of ethical doctors from malicious complaints.",
                    aim: "Trust-based doctor–patient relationships and safer medication practices.",
                },
                {
                    num: 8,
                    heading: "Control of Over-the-Counter Sale of Scheduled Drugs",
                    body: "HRDA will push for strict prescription-only enforcement via pharmacy audits and public education campaigns.",
                    aim: "Reduce drug misuse, resistance, and unsafe self-medication.",
                },
            ],
        },
        {
            roman: "III",
            title: "Education, Career Growth, and Professional Development",
            items: [
                {
                    num: 9,
                    heading: "Balanced Growth of MBBS and PG Opportunities",
                    body: "HRDA will fight for expansion of PG seats in proportion to MBBS intake and for long-term workforce planning.",
                    aim: "Career continuity and reduced migration of medical talent.",
                },
                {
                    num: 10,
                    heading: "Work–Life Balance and Humane Duty Hours",
                    body: "HRDA will advocate for regulated duty hours and mandatory rest and leave policies.",
                    aim: "Healthier doctors and safer patient care.",
                },
                {
                    num: 11,
                    heading: "End to Compulsory Bonded Service",
                    body: "HRDA will oppose forced bonded service and support incentive-based rural and public service programs.",
                    aim: "Voluntary, motivated service instead of compulsion.",
                },
                {
                    num: 12,
                    heading: "Campus-to-Career Pathways",
                    body: "HRDA will push for structured campus placements and active placement cells in medical colleges.",
                    aim: "Faster, fairer entry into the medical workforce.",
                },
                {
                    num: 13,
                    heading: "Continuous Skill Development",
                    body: "HRDA will work with universities to ensure regular BLS and BCMET programs and ongoing professional development.",
                    aim: "High clinical competence and emergency readiness.",
                },
            ],
        },
        {
            roman: "IV",
            title: "Governance, Administration, and Fair Systems",
            items: [
                {
                    num: 14,
                    heading: "Transparent Recruitment and Career Progression",
                    body: "HRDA will demand annual recruitment calendars and time-bound promotions and allowances.",
                    aim: "Predictable and fair career pathways.",
                },
                {
                    num: 15,
                    heading: "Doctor-Led Health Governance",
                    body: "HRDA will advocate for medical professionals to lead health directorates rather than non-medical administrators.",
                    aim: "Policy shaped by clinical insight and ground reality.",
                },
                {
                    num: 16,
                    heading: "Fair Academic and Certification Fees",
                    body: "HRDA will seek rationalization of university certification and academic service fees.",
                    aim: "Financial transparency and fairness.",
                },
            ],
        },
        {
            roman: "V",
            title: "Doctor-Friendly APMC Reform",
            items: [
                {
                    num: null,
                    heading: "Continuous Reform with APMC",
                    body: "HRDA will work continuously with APMC and regulatory bodies to ensure time-bound registration and renewals (including for FMGs), rational and transparent APMC charges, unrestricted access to CPD and CME programs, legal protection for ethical practitioners, harassment-free and fair inquiry systems, prevention of unnecessary prescriptions, and protection of clinical freedom from external interference.",
                    aim: "A transparent, doctor-centric regulatory environment.",
                },
            ],
        },
        {
            roman: "VI",
            title: "Support for Self-Employment and Professional Independence",
            items: [
                {
                    num: 17,
                    heading: "Simplified Pathways to Practice",
                    body: "HRDA will advocate for single-window systems for clinical establishment registration and simplified OPD norms for MBBS doctors.",
                    aim: "Encourage entrepreneurship and expand community healthcare access.",
                },
            ],
        },
        {
            roman: "VII",
            title: "Special Cells & Professional Support Committees",
            items: [
                {
                    num: null,
                    heading: "Dedicated Support Platforms",
                    body: "HRDA will establish and sustain dedicated platforms for: Career Guidance; Stress Management & Psychological Counseling; Research, Publications & Academic Support; POSH (Prevention of Sexual Harassment); Financial Assistance for Economically Weaker Students; Foreign Education Guidance; Cultural and Wellness Activities; Physical Fitness & Leadership Training; Rapid Action & Disaster Management; Legal Support for Employment and Posting Grievances; and Comprehensive Medico-Legal Services.",
                    aim: "Holistic professional, academic, and personal development of every doctor.",
                },
            ],
        },
    ];

    return (
        <Layout>
            {/* Hero */}
            <div className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900" />
                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
                    <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                        HRDA Andhra Pradesh
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                        HRDA Commitment Charter
                    </h1>
                    <p className="text-lg text-slate-300 mb-2 italic">
                        A Charter of Advocacy, Protection, and Professional Excellence
                    </p>
                    <p className="text-sm text-slate-400">— Team HRDA</p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl">

                {/* Preamble */}
                <section className="mb-14">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-5">Preamble</h2>
                    <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-base leading-relaxed">
                        <p>
                            The medical profession is a noble calling. The service of saving lives cannot be measured in monetary terms. It is a lifelong commitment to humanity, compassion, and excellence.
                        </p>
                        <p>
                            HRDA is not a political entity. It is a professional, reform-oriented platform dedicated to the advancement, protection, and dignity of the medical fraternity. Our purpose is to advocate, engage, and work with institutions, authorities, and society to create a healthcare environment where doctors are safe, respected, fairly supported, and empowered to deliver the highest standards of care.
                        </p>
                        <p>
                            We believe that safety, security, fair financial support, and proper facilities are the foundations upon which quality healthcare is built. Equally, high standards in medical education, ethical practice, and hospital infrastructure are essential to protect public health and preserve the integrity of the profession.
                        </p>
                        <p className="font-medium text-slate-800">
                            This document is not a list of political promises. It is a commitment to continuous action, dialogue, and reform — a roadmap of what HRDA will fight for, stand for, and work towards in service of every doctor and every patient.
                        </p>
                    </div>
                </section>

                <Separator className="mb-14" />

                {/* Sections */}
                <div className="space-y-14">
                    {sections.map((section) => (
                        <section key={section.roman}>
                            {/* Section header */}
                            <div className="flex items-center gap-4 mb-8">
                                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold text-sm">
                                    {section.roman}
                                </span>
                                <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                                    {section.title}
                                </h2>
                            </div>

                            <div className="space-y-6 pl-0 md:pl-14">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                                        <div className="flex items-start gap-3 mb-3">
                                            {item.num !== null && (
                                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mt-0.5">
                                                    {item.num}
                                                </span>
                                            )}
                                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                                                {item.heading}
                                            </h3>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3 pl-10">
                                            {item.body}
                                        </p>
                                        <div className="pl-10">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full">
                                                🎯 Our Aim: {item.aim}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="mt-10" />
                        </section>
                    ))}
                </div>

                {/* Closing Statement */}
                <section className="mt-14 bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-serif font-bold mb-6">Closing Statement</h2>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                        This Commitment Charter reflects HRDA's unwavering resolve to stand with doctors, speak for doctors, and work for doctors — while safeguarding patient welfare and strengthening the healthcare system.
                    </p>
                    <div className="space-y-1 text-slate-400 italic mb-8">
                        <p>We do not seek power.</p>
                        <p>We seek reform, respect, and responsibility.</p>
                    </div>
                    <div className="border-t border-white/10 pt-8">
                        <p className="text-blue-300 font-bold text-lg mb-1">For Our Rule. Our Future. Our Dignity.</p>
                        <p className="text-white font-bold text-xl mb-1">Now or never.</p>
                        <p className="text-slate-300">One stand. One voice. One reformed medical fraternity.</p>
                        <p className="text-slate-400 mt-4 text-sm">— Team HRDA</p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
