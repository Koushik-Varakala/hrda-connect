"use client";

import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, Award, Scale, Users, HeartHandshake, Compass } from "lucide-react";
import { appConfig } from "@/lib/app-config";

export default function About() {
    const tgAgenda = [
        "To work for Reforms in present Healthcare System, especially in Primary Health Sector of both Rural & Urban areas (Universal Health Care).",
        "To work until separate medical recruitment board is established for calendar year recruitment of Healthcare Professionals for improved healthcare delivery.",
        "To promote Ethical Practice among Registered Healthcare Professionals.",
        "To Conduct Health Awareness Programs and Multidisciplinary Health Camps.",
        "To Work for Total ban on Quack practice which is causing adverse effects on health of people.",
        "To pursue for strict Act implementation for not issuing of drugs other than on-counter medicines by pharmacies.",
        "To work for minimum wages for duty doctors in private sector.",
        "To bring the Doctors under common platform to deal with assaults on Healthcare Professionals",
    ];

    const apAgenda = [
        "🛑 End to Quackery — Only qualified care. No compromise.",
        "⚕️ No Mixopathy — One system. One science. One standard.",
        "🚫 Zero Violence — Safe doctors. Safe hospitals.",
        "🧠 Clinical Freedom — Science guides practice, not politics.",
        "💻 100% Digital APMC — One-click services. Zero red tape.",
        "💰 Rational APMC Charges — Transparent, fair, and justified fees.",
        "⚡ Fast Registrations (Including FMGs) — No delays. No discrimination.",
        "📚 Easy CME & Skill Development — Continuous learning for better care.",
        "🧾 Ethical Prescriptions — Right diagnosis. Right medicine.",
        "💊 Stop OTC Drug Abuse — No prescription. No medicine.",
        "⚖️ Legal Support for Doctors — You heal. We protect.",
        "⚖️ Fair Inquiries — Zero Harassment. Justice with dignity.",
        "🛑 Curtail Derogatory Campaigns — Protect reputation. Protect the profession.",
        "🛡️ Livelihood Protection & Professional Security — Stability. Safety. Dignity.",
        "🔬 Research & Innovation Support — Removing barriers to medical progress.",
        "👩‍⚕️ Women's Safety & POSH Enforcement — Safe workplaces. Strong professionals.",
        "👨‍⚕️ Senior Expert Advisory Panels — Experience guides. Youth leads.",
        "🗣️ Every Doctor's Voice in APMC — Our voice. Our council.",
    ];

    const agendaItems = appConfig.region === 'AP' ? apAgenda : tgAgenda;

    const apCoreValues = [
        { title: "Integrity", desc: "We uphold honesty, transparency, accountability, and ethical conduct in every action." },
        { title: "Professionalism", desc: "We maintain the highest standards of medical ethics, competence, responsibility, and professional excellence." },
        { title: "Scientific Excellence", desc: "We promote evidence-based medicine, lifelong learning, research, and innovation." },
        { title: "Patient Safety", desc: "The health, dignity, and safety of every patient remain our foremost priority." },
        { title: "Justice", desc: "We believe in fairness, equality, due process, and the rule of law." },
        { title: "Collaboration", desc: "We achieve meaningful reforms through unity, partnership, and collective leadership." },
    ];

    return (
        <Layout>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-12 md:py-16 border-b">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold text-center mb-4 text-slate-900 dark:text-white">
                        About HRDA {appConfig.region === 'AP' ? "Andhra Pradesh" : ""}
                    </h1>
                    <p className="text-center text-muted-foreground max-w-3xl mx-auto text-base md:text-lg">
                        {appConfig.region === 'AP'
                            ? "The Voice of Registered Allopathic Medical Practitioners in AP, advancing Modern Scientific Medicine through Reform, Ethics, Professional Excellence, and Public Service."
                            : "Our history, mission, and the team behind the movement."}
                    </p>
                    {appConfig.region === 'AP' && (
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-semibold tracking-wide text-blue-700 dark:text-blue-400">
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60">Reforming Allopathic Healthcare</span>
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60">Protecting Doctors</span>
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60">Serving Society</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
                {/* History Section */}
                <section>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-primary">Our History</h2>
                            {appConfig.region === 'AP' ? (
                                <div className="prose prose-slate max-w-none text-muted-foreground space-y-4 text-sm md:text-base leading-relaxed">
                                    <p>
                                        The origins of HRDA AP can be traced to the growing need for a unified platform to address systemic challenges affecting <span className="font-semibold text-slate-900 dark:text-white">Modern Scientific Medicine (Allopathy)</span>, medical education, professional practice, healthcare governance, and patient safety in Andhra Pradesh.
                                    </p>
                                    <p>
                                        This vision first emerged through <span className="font-bold text-slate-900 dark:text-white">Prajarogya Parirakshana Samiti</span>, an initiative led by <span className="font-bold text-blue-700 dark:text-blue-400">Dr. M. Venkata Ramana (MuVeRa)</span>, former State President of the Andhra Pradesh Junior Doctors Association (APJUDA), together with like-minded colleagues committed to the eradication of quackery.
                                    </p>
                                    <p>
                                        With the suggestion of <span className="font-semibold text-slate-900 dark:text-white">Dr. K. Mahesh Kumar</span>, then President of HRDA Telangana, the initiative evolved into a broader reform movement established as a sister organization.
                                    </p>
                                    <p>
                                        Recognizing individuals who demonstrated exceptional commitment to the Anti-Quackery Movement, HRDA AP welcomed <span className="font-semibold text-slate-900 dark:text-white">Dr. Ramana N</span> whose relentless anti-quackery campaigns and hunger strikes in Kadapa and Anantapur significantly strengthened the Association&apos;s statewide mission.
                                    </p>
                                    <p>
                                        One of the defining milestones in the Association&apos;s history was its legal initiative, represented by <span className="font-semibold text-slate-900 dark:text-white">Advocate Sama Sandeep Reddy</span>, seeking conduct of elections to the <span className="font-semibold text-slate-900 dark:text-white">Andhra Pradesh Medical Council (APMC)</span>—culminating in a landmark judgment of the Hon&apos;ble High Court of Andhra Pradesh directing the democratic constitution of the Council. During this phase, <span className="font-semibold text-slate-900 dark:text-white">Dr. Metta Jayachandra Reddy</span> joined and contributed his extensive administrative and legal experience.
                                    </p>
                                    <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white font-medium">
                                        Following the conduct of APMC elections, HRDA AP secured <span className="font-bold text-blue-700 dark:text-blue-400">9 of the 13 elected seats</span>, emerging as the largest elected group within the AP Medical Council and securing representation in <span className="font-bold">9 of the 25 Council positions</span> overall.
                                    </div>
                                </div>
                            ) : (
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
                            )}
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                            <img
                                src={appConfig.region === 'AP' ? "/AP-group.jpeg" : "/HRDA-group.jpeg"}
                                alt="HRDA History"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* AP Vision, Mission & Core Values */}
                {appConfig.region === 'AP' && (
                    <>
                        <Separator />
                        <section className="space-y-12">
                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-t-4 border-t-blue-600 shadow-sm bg-white dark:bg-slate-900">
                                    <CardContent className="pt-6 space-y-3">
                                        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                            <Compass className="w-5 h-5" />
                                            Our Vision
                                        </h3>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                                            To build a healthcare system where Modern Scientific Medicine (Allopathy) is practiced ethically, regulated transparently, protected from quackery, and made accessible to every citizen through strong institutions, accountable governance, and professional excellence.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-t-4 border-t-indigo-600 shadow-sm bg-white dark:bg-slate-900">
                                    <CardContent className="pt-6 space-y-3">
                                        <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            Our Mission
                                        </h3>
                                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                                <span>Advance evidence-based healthcare reforms.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                                <span>Eradicate quackery and the unlawful practice of Modern Scientific Medicine.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                                <span>Uphold the highest standards of medical ethics and professionalism.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                                <span>Protect the dignity, rights, safety, and professional independence of Registered Allopathic Medical Practitioners.</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Core Values</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Guiding Principles: <span className="font-semibold text-blue-600">Science • Ethics • Excellence • Integrity • Service</span>
                                    </p>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {apCoreValues.map((val, idx) => (
                                        <Card key={idx} className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <CardContent className="p-5 space-y-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{val.title}</h4>
                                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                <Separator />

                {/* Agenda */}
                <section>
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-primary">Our Agenda</h2>
                        <p className="text-muted-foreground">
                            {appConfig.region === 'AP'
                                ? 'Our comprehensive reform agenda for Andhra Pradesh — Reforming APMC, The HRDA Way.'
                                : 'We are committed to a comprehensive roadmap for healthcare reform.'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {agendaItems.map((item, i) => (
                            <Card key={i} className="card-hover border-l-4 border-l-primary border-t-0 bg-white dark:bg-slate-900 shadow-sm">
                                <CardContent className="pt-6 flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                                    <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed">{item}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
}
