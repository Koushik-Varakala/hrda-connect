"use client";

import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { appConfig } from "@/lib/app-config";

export default function About() {
    return (
        <Layout>
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold text-center mb-4">About HRDA</h1>
                    <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                        Our history, mission, and the team behind the movement.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
                {/* History */}
                <section>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-primary">Our History</h2>
                            <div className="prose prose-slate max-w-none text-muted-foreground">
                                <p className="mb-4">
                                    {appConfig.aboutUsDescription}
                                </p>
                                <p className="mb-4">
                                    Born out of the collective necessity to address systemic gaps in medical education and healthcare delivery, HRDA has grown into a formidable voice for doctors. We have led numerous successful campaigns advocating for better working conditions, fair policies, and the autonomy of medical institutions.
                                </p>
                                <p>
                                    From challenging irregularities in medical councils to fighting for the rights of post-graduate students, our history is defined by unwavering commitment to the truth and the welfare of the medical fraternity.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="/HRDA-group.jpeg"
                                alt="HRDA History"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </section>

                <Separator />

                {/* Agenda — TG: general agenda, AP: APMC Elections 2026 manifesto */}
                <section>
                    {appConfig.region === 'AP' ? (
                        /* AP: APMC Elections 2026 Agenda */
                        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 md:p-12">
                            {/* Header */}
                            <div className="text-center mb-12">
                                <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                                    APMC Elections 2026
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                                    Reforming APMC — The HRDA Way
                                </h2>
                                <p className="text-blue-200 max-w-2xl mx-auto text-base">
                                    Our 18-point agenda for a strong, fair &amp; independent Andhra Pradesh Medical Council.
                                </p>
                            </div>

                            {/* 4 themed cards */}
                            <div className="grid md:grid-cols-2 gap-6 mb-10">
                                {[
                                    {
                                        emoji: "⚕️", label: "Professional Standards",
                                        items: [
                                            { num: 1, icon: "🛑", title: "End to Quackery", desc: "Only qualified care. No compromise." },
                                            { num: 2, icon: "⚕️", title: "No Mixopathy", desc: "One system. One science. One standard." },
                                            { num: 3, icon: "🚫", title: "Zero Violence", desc: "Safe doctors. Safe hospitals." },
                                            { num: 4, icon: "🧠", title: "Clinical Freedom", desc: "Science guides practice, not politics." },
                                        ]
                                    },
                                    {
                                        emoji: "💻", label: "Digital & Administrative Reform",
                                        items: [
                                            { num: 5, icon: "💻", title: "100% Digital APMC", desc: "One-click services. Zero red tape." },
                                            { num: 6, icon: "💰", title: "Rational APMC Charges", desc: "Transparent, fair, and justified fees." },
                                            { num: 7, icon: "⚡", title: "Fast Registrations (Including FMGs)", desc: "No delays. No discrimination." },
                                            { num: 8, icon: "📚", title: "Easy CME & Skill Development", desc: "Continuous learning for better care." },
                                        ]
                                    },
                                    {
                                        emoji: "⚖️", label: "Ethics & Legal Protection",
                                        items: [
                                            { num: 9, icon: "🧾", title: "Ethical Prescriptions", desc: "Right diagnosis. Right medicine." },
                                            { num: 10, icon: "💊", title: "Stop OTC Drug Abuse", desc: "No prescription. No medicine." },
                                            { num: 11, icon: "⚖️", title: "Legal Support for Doctors", desc: "You heal. We protect." },
                                            { num: 12, icon: "⚖️", title: "Fair Inquiries — Zero Harassment", desc: "Justice with dignity." },
                                        ]
                                    },
                                    {
                                        emoji: "🛡️", label: "Dignity & Representation",
                                        items: [
                                            { num: 13, icon: "🛑", title: "Curtail Derogatory Campaigns", desc: "Protect reputation. Protect the profession." },
                                            { num: 14, icon: "🛡️", title: "Livelihood Protection & Professional Security", desc: "Stability. Safety. Dignity." },
                                            { num: 15, icon: "🔬", title: "Research & Innovation Support", desc: "Removing barriers to medical progress." },
                                            { num: 16, icon: "👩‍⚕️", title: "Women's Safety & POSH Enforcement", desc: "Safe workplaces. Strong professionals." },
                                            { num: 17, icon: "👨‍⚕️", title: "Senior Expert Advisory Panels", desc: "Experience guides. Youth leads." },
                                            { num: 18, icon: "🗣️", title: "Every Doctor's Voice in APMC", desc: "Our voice. Our council." },
                                        ]
                                    },
                                ].map(({ emoji, label, items }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-base font-bold text-blue-300 mb-5 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">{emoji}</span>
                                            {label}
                                        </h3>
                                        <ul className="space-y-4">
                                            {items.map(({ num, icon, title, desc }) => (
                                                <li key={num} className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-blue-300">{num}</span>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{icon} {title}</p>
                                                        <p className="text-xs text-slate-400">{desc}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="text-center bg-blue-600/20 border border-blue-500/30 rounded-2xl p-8">
                                <p className="text-2xl font-bold text-white mb-2">✊ NOW OR NEVER</p>
                                <p className="text-blue-200 mb-4">
                                    One Vote. One Stand. One Revolution.<br />
                                    For Our Rule. Our Future. Our Dignity.
                                </p>
                                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm">
                                    🗳️ e-Vote on 9th February 2026 — Vote for All 13 Members of HRDA PANEL
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* TG: General Agenda */
                        <>
                            <div className="text-center max-w-3xl mx-auto mb-12">
                                <h2 className="text-3xl font-bold mb-4 text-primary">Our Agenda</h2>
                                <p className="text-muted-foreground">
                                    We are committed to a comprehensive roadmap for healthcare reform.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    "To work for Reforms in present Healthcare System, especially in Primary Health Sector of both Rural & Urban areas (Universal Health Care).",
                                    "To work until separate medical recruitment board is established for calendar year recruitment of Healthcare Professionals for improved healthcare delivery.",
                                    "To promote Ethical Practice among Registered Healthcare Professionals.",
                                    "To Conduct Health Awareness Programs and Multidisciplinary Health Camps.",
                                    "To Work for Total ban on Quack practice which is causing adverse effects on health of people.",
                                    "To pursue for strict Act implementation for not issuing of drugs other than on-counter medicines by pharmacies.",
                                    "To work for minimum wages for duty doctors in private sector.",
                                    "To bring the Doctors under common platform to deal with assaults on Healthcare Professionals"
                                ].map((item, i) => (
                                    <Card key={i} className="card-hover border-l-4 border-l-primary border-t-0 bg-white shadow-sm">
                                        <CardContent className="pt-6 flex gap-4">
                                            <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                                            <p className="text-slate-700 text-sm md:text-base leading-relaxed">{item}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </Layout>
    );
}
