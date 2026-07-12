"use client";

import { Layout } from "@/components/Layout";
import { useDepartments } from "@/hooks/use-departments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Palette, FlaskConical, HeartPulse, CheckCircle2 } from "lucide-react";

const WING_TABS = [
    { id: "academic", label: "Academic", icon: BookOpen },
    { id: "sports", label: "Sports", icon: Trophy },
    { id: "culture", label: "Cultural", icon: Palette },
    { id: "research", label: "Research & Innovation", icon: FlaskConical },
    { id: "mental-health", label: "Mental Health", icon: HeartPulse },
];

const DEFAULT_DEPARTMENTS: Record<string, { title: string; subtitle: string; content: string; highlights: string[] }[]> = {
    academic: [
        {
            title: "Academic & Medical Education Wing",
            subtitle: "Advancing Continuous Medical Education & Professional Competence",
            content: "HRDA conducts accredited Continuing Medical Education (CME) seminars, clinical symposiums, and PG training workshops to ensure medical professionals stay at the cutting edge of modern scientific medicine across all specialties.",
            highlights: [
                "Regular state-level CME & PG skill advancement programs",
                "Career guidance & residency counseling for young medical graduates",
                "Medico-legal awareness & ethical medical practice workshops"
            ]
        }
    ],
    sports: [
        {
            title: "Sports & Physical Wellness Wing",
            subtitle: "Promoting Physical Fitness & Cardiovascular Health Among Doctors",
            content: "Recognizing that practicing physicians often experience sedentary stress and long hospital hours, our Sports Wing organizes inter-hospital tournaments, district-level athletics, and regular fitness drives to promote lifelong health.",
            highlights: [
                "Annual State & District HRDA Doctor Tournaments (Cricket, Badminton, Table Tennis)",
                "Marathon, walkathon & cardiovascular wellness campaigns",
                "Recreational sports clubs across government and private institutions"
            ]
        }
    ],
    culture: [
        {
            title: "Cultural & Literary Wing",
            subtitle: "Celebrating Creative Expression & Artistic Excellence",
            content: "Medicine is both an art and a science. Our Cultural Wing offers doctors and medical students a vibrant platform to showcase their artistic, musical, theatrical, and literary talents, building camaraderie beyond the hospital corridors.",
            highlights: [
                "Annual Doctors Cultural Festival & Literary Meet",
                "Music, debate, photography & creative writing forums",
                "Inter-college cultural exchange programs across medical colleges"
            ]
        }
    ],
    research: [
        {
            title: "Research & Innovation Wing",
            subtitle: "Fostering Medical Research, Clinical Trials & Healthcare Technology",
            content: "The HRDA Research & Innovation Wing empowers medical practitioners and postgraduate scholars to engage in high-impact epidemiological research, medical AI development, and clinical innovation tailored to regional public health needs.",
            highlights: [
                "Research protocol design, biostatistics & ethics approval mentorship",
                "Assistance with peer-reviewed medical journals & grant applications",
                "Incubating healthcare technology & AI-driven diagnostic solutions"
            ]
        }
    ],
    "mental-health": [
        {
            title: "Mental Health & Doctor Support Wing",
            subtitle: "Safeguarding the Emotional & Psychological Well-being of Healthcare Professionals",
            content: "Doctors care for everyone, but who cares for the doctor? Our dedicated Mental Health Wing actively combats physician burnout, anxiety, and occupational trauma through confidential psychological support, peer counseling, and institutional advocacy.",
            highlights: [
                "24/7 Confidential Helpline & peer-support networks for doctors & residents",
                "Physician burnout prevention & work-life balance workshops",
                "Institutional crisis intervention & psychological support counseling"
            ]
        }
    ]
};

export default function Departments() {
    const { data: departments, isLoading } = useDepartments();

    return (
        <Layout>
            <div className="bg-slate-900 text-white py-14 md:py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                        HRDA Departments &amp; Specialized Wings
                    </h1>
                    <p className="text-slate-300 max-w-2xl mx-auto text-base md:text-lg">
                        Empowering medical practitioners across academic excellence, research innovation, mental well-being, sports, and culture.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <Tabs defaultValue="academic" className="w-full">
                    <div className="flex justify-center mb-10 overflow-x-auto pb-2">
                        <TabsList className="bg-white border shadow-sm flex flex-wrap sm:flex-nowrap h-auto p-1.5 gap-1 rounded-xl">
                            {WING_TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{tab.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>

                    {WING_TABS.map((tab) => {
                        const type = tab.id;
                        const dbDepartments = departments?.filter(d => d.type === type) || [];
                        const fallbackCards = DEFAULT_DEPARTMENTS[type] || [];

                        return (
                            <TabsContent key={type} value={type}>
                                <div className="max-w-4xl mx-auto space-y-8">
                                    {isLoading ? (
                                        <div className="text-center py-16 text-slate-500">Loading department information...</div>
                                    ) : dbDepartments.length > 0 ? (
                                        dbDepartments.map(dept => (
                                            <Card key={dept.id} className="overflow-hidden shadow-md border-slate-200">
                                                {dept.imageUrl && (
                                                    <div className="h-64 sm:h-80 w-full overflow-hidden">
                                                        <img src={dept.imageUrl} alt={dept.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                                    <CardTitle className="text-2xl font-bold text-slate-900">{dept.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="prose prose-slate max-w-none">
                                                        <p className="whitespace-pre-line text-slate-600 leading-relaxed text-base">
                                                            {dept.content}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        fallbackCards.map((card, idx) => (
                                            <Card key={idx} className="overflow-hidden shadow-md border-slate-200 rounded-2xl">
                                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-100 py-6 px-6 sm:px-8">
                                                    <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                                                        {card.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-sm sm:text-base font-medium text-blue-700 mt-1">
                                                        {card.subtitle}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-6 sm:p-8 space-y-6">
                                                    <p className="text-slate-600 leading-relaxed text-base">
                                                        {card.content}
                                                    </p>
                                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">
                                                            Key Initiatives &amp; Focus Areas:
                                                        </h4>
                                                        <ul className="space-y-2.5">
                                                            {card.highlights.map((highlight, hIdx) => (
                                                                <li key={hIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700">
                                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                                    <span>{highlight}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </Layout>
    );
}
