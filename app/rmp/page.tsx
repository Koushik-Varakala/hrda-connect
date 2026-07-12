"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Scale, AlertTriangle, CheckCircle2, XCircle, FileText, Award, Gavel, Search, Users, Siren, Building2, HelpCircle } from "lucide-react";
import { appConfig } from "@/lib/app-config";

function RMPPortalInner() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("who-is-rmp");

    useEffect(() => {
        if (tabParam && ["who-is-rmp", "policy", "enforcement"].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-[#1a237e] via-[#0d47a1] to-[#1565c0] text-white py-14 md:py-20 shadow-md">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs md:text-sm font-semibold tracking-wide">
                            <Scale className="w-4 h-4" />
                            STATUTORY LEGAL &amp; ANTI-QUACKERY PORTAL
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-white drop-shadow-sm">
                            Registered Medical Practitioner (RMP) &amp; Anti-Quackery Enforcement
                        </h1>
                        <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            Authoritative legal definitions, statutory prohibitions against unqualified practice, and official inspection procedures under the laws of India and {appConfig.stateName}.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content & Interactive Tabs */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto space-y-8">
                    <TabsList className="grid grid-cols-1 sm:grid-cols-3 h-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                        <TabsTrigger
                            value="who-is-rmp"
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Is RMP a Doctor?
                        </TabsTrigger>
                        <TabsTrigger
                            value="policy"
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Anti-Quackery Legal Policy
                        </TabsTrigger>
                        <TabsTrigger
                            value="enforcement"
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400"
                        >
                            <Gavel className="w-4 h-4" />
                            APMC Section 8 Enforcement
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: WHO IS RMP? - OFFICIAL CORRECTED LEGAL TEXT */}
                    <TabsContent value="who-is-rmp" className="space-y-8 animate-in fade-in-50 duration-300">
                        {/* SECTION 1: RMP is a DOCTOR */}
                        <Card className="border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/60 to-white dark:from-slate-900 dark:to-slate-900 shadow-sm">
                            <CardContent className="p-6 md:p-8 space-y-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Statutory Legal Overview</div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            Is RMP a Doctor?
                                        </h2>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        Important Legal Clarification
                                    </div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Every day, millions of patients visit persons displaying signboards such as:
                                </p>
                                <div className="p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl max-w-xs mx-auto text-center shadow-inner my-2">
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">Dr. XXXXXXX</div>
                                    <div className="font-extrabold text-blue-700 dark:text-blue-400 text-xl tracking-wider">RMP</div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Most people assume that anyone using the designation <span className="font-bold text-slate-900 dark:text-white">RMP</span> is legally entitled to practise Modern Scientific Medicine (Allopathy). Many Government officials also make the same assumption.
                                </p>
                                <p className="font-bold text-slate-900 dark:text-white text-base">
                                    But is that assumption legally correct?
                                </p>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    To answer this, we must first understand a few basic legal concepts.
                                </p>
                            </CardContent>
                        </Card>

                        {/* SECTION 2 & 3: WHAT IS MEDICINE & WHO IS A MEDICAL PRACTITIONER */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        WHAT IS &ldquo;MEDICINE&rdquo;?
                                    </CardTitle>
                                    <CardDescription>Section 2(j) of the National Medical Commission Act, 2019</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <p>Many people think medicine simply means tablets, injections, or treatment. Legally, however, the word has a specific meaning.</p>
                                    <p>Under <span className="font-semibold text-slate-900 dark:text-white">Section 2(j) of the National Medical Commission Act, 2019</span>:</p>
                                    <blockquote className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600 text-slate-900 dark:text-slate-100 font-medium italic">
                                        &ldquo;Medicine means Modern Scientific Medicine in all its branches and includes Surgery and Obstetrics, but does not include Veterinary Medicine and Surgery.&rdquo;
                                    </blockquote>
                                    <p>
                                        Therefore, under the <span className="font-semibold text-slate-900 dark:text-white">National Medical Commission Act, 2019</span>, the practice of <span className="font-bold">Medicine</span> refers exclusively to <span className="font-bold">Modern Scientific Medicine (Allopathy).</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium">This leads to the next question.</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                        WHO IS A MEDICAL PRACTITIONER?
                                    </CardTitle>
                                    <CardDescription>In Modern Scientific Medicine</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <p>
                                        A <span className="font-bold text-slate-900 dark:text-white">Medical Practitioner</span> is a person who possesses a <span className="font-semibold text-slate-900 dark:text-white">recognised medical qualification</span> in <span className="font-semibold text-slate-900 dark:text-white">Modern Scientific Medicine (Allopathy)</span> recognised under the <span className="font-semibold text-slate-900 dark:text-white">National Medical Commission Act, 2019</span>, and is trained and competent to diagnose diseases, prescribe medicines, treat illnesses, perform medical procedures, and provide healthcare in accordance with law.
                                    </p>
                                    <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-950 dark:text-indigo-200 font-medium">
                                        In India, the primary recognised undergraduate medical qualification is <span className="font-bold">MBBS</span>.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION 4: WHO IS A REGISTERED MEDICAL PRACTITIONER (RMP)? */}
                        <Card className="border-t-4 border-t-emerald-600 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                    WHO IS A REGISTERED MEDICAL PRACTITIONER (RMP)?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                                <p>
                                    A <span className="font-bold text-slate-900 dark:text-white">Registered Medical Practitioner (RMP)</span> is a medical practitioner who is duly registered in the <span className="font-bold text-slate-900 dark:text-white">State Medical Register</span> and/or the <span className="font-bold text-slate-900 dark:text-white">National Medical Register</span> in accordance with the applicable law.
                                </p>
                                <p>
                                    Only after possessing a recognised medical qualification and obtaining such statutory registration does a person become legally entitled to practise Modern Scientific Medicine.
                                </p>
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 font-bold text-base">
                                    Thus, RMP is not merely a title or abbreviation—it is a statutory legal status.
                                </div>
                                <p>Accordingly, persons such as:</p>
                                <div className="grid sm:grid-cols-2 gap-4 my-2">
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-center">
                                        Dr. XXXXXXX, MBBS
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-center">
                                        Dr. XXXXXXX, MBBS, MD/MS, DM, MCh, etc.
                                    </div>
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    holding valid statutory registration, are legally Registered Medical Practitioners, provided they possess a recognised medical qualification and hold valid statutory registration.
                                </p>
                            </CardContent>
                        </Card>

                        {/* SECTION 5: WHY IS THERE CONFUSION? */}
                        <Card className="bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-amber-600 border-amber-200 dark:border-amber-900 shadow-sm">
                            <CardContent className="p-6 md:p-8 space-y-4">
                                <h3 className="text-xl font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                                    WHY IS THERE CONFUSION?
                                </h3>
                                <div className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-4">
                                    <p>
                                        Some unqualified persons describe themselves as <span className="font-bold">&ldquo;RMP&rdquo;</span>, claiming it means <span className="font-bold">&ldquo;Rural Medical Practitioner&rdquo;</span> or similar expressions.
                                    </p>
                                    <p>
                                        This has created widespread confusion among patients and even public authorities.
                                    </p>
                                    <p>
                                        However, the abbreviation <span className="font-bold">RMP (Registered Medical Practitioner)</span> already has a recognised legal meaning in medical law. Merely expanding it as <span className="font-bold">&ldquo;Rural Medical Practitioner&rdquo;</span> or any similar expression does <span className="font-bold text-red-700 dark:text-red-400">not</span> create the legal status of a <span className="font-bold">Registered Medical Practitioner</span>.
                                    </p>
                                    <p>Therefore, when a signboard reads:</p>
                                    <div className="p-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-lg max-w-xs mx-auto text-center font-bold text-slate-900 dark:text-white">
                                        Dr. XXXXXXX, RMP
                                    </div>
                                    <p>
                                        the letters <span className="font-bold">&ldquo;RMP&rdquo;</span> alone do <span className="font-bold text-red-700 dark:text-red-400">not</span> establish that the person is legally entitled to practise Modern Scientific Medicine.
                                    </p>
                                    <p>
                                        Neither First Aid certificates, private certificates, village medical practice, experience, nor self-assumed designations can substitute the statutory requirements of recognised medical qualifications and valid statutory registration.
                                    </p>
                                    <p>
                                        Patients should never assume that the mere use of the abbreviation <span className="font-bold">&ldquo;RMP&rdquo;</span> signifies legal entitlement to practise Modern Scientific Medicine.
                                    </p>
                                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-500/60 font-bold text-slate-900 dark:text-white">
                                        The legal status of an RMP depends entirely upon recognised medical qualifications and statutory registration—not upon the letters &ldquo;RMP&rdquo; displayed on a signboard.
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-100/80 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 font-semibold">
                                        A person who practises Modern Scientific Medicine without a recognised medical qualification and valid statutory registration is commonly referred to as a quack, illegal medical practitioner, unqualified medical practitioner, or fake medical practitioner.
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-base shadow-md">
                                        Therefore, a person merely describing himself or herself as a &ldquo;Rural Medical Practitioner (RMP)&rdquo; without possessing a recognised medical qualification and valid statutory registration is not a Registered Medical Practitioner and is not legally entitled to practise Modern Scientific Medicine. Such a RMP is not a doctor.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: ANTI-QUACKERY LEGAL POLICY */}
                    <TabsContent value="policy" className="space-y-8 animate-in fade-in-50 duration-300">
                        <div className="text-center max-w-3xl mx-auto space-y-2">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Statutory Provisions Prohibiting Unqualified Practice
                            </h2>
                            <p className="text-muted-foreground text-sm md:text-base">
                                The unlawful practice of Modern Scientific Medicine (Allopathy) carries strict statutory penal sanctions across parliamentary enactments and the state laws of {appConfig.stateName}.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* NMC Act 2019 */}
                            <Card className="shadow-sm border-l-4 border-l-blue-600 bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                        1. National Medical Commission Act, 2019
                                    </CardTitle>
                                    <CardDescription>Section 34 Statutory Mandate</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                                    <p>
                                        <span className="font-semibold text-slate-900 dark:text-white">Section 34</span> strictly prohibits any person other than a duly qualified and registered medical practitioner from practicing Modern Scientific Medicine (Allopathy) anywhere in India.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Only practitioners possessing recognized medical qualifications and valid registration are legally entitled to practice.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* BNS 2023 - 7 Years Jail */}
                            <Card className="shadow-sm border-l-4 border-l-red-600 bg-red-50/30 dark:bg-red-950/20">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center justify-between">
                                        <span>2. Bharatiya Nyaya Sanhita (BNS), 2023</span>
                                        <span className="text-xs px-2.5 py-1 rounded bg-red-600 text-white font-bold">Up to 7 Years Jail</span>
                                    </CardTitle>
                                    <CardDescription>Section 318(4) — Cheating by Personation</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                                    <p>
                                        <span className="font-semibold text-slate-900 dark:text-white">Section 318(4)</span> provides severe criminal prosecution for individuals who falsely represent themselves as qualified medical practitioners and dishonestly obtain money or benefits from patients.
                                    </p>
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                                        Punishable with imprisonment of up to seven (7) years along with statutory fines.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* AP 1968 Act */}
                            <Card className="shadow-sm border-l-4 border-l-indigo-600 bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                                        3. AP Medical Practitioners Registration Act, 1968
                                    </CardTitle>
                                    <CardDescription>Sections 20 &amp; 22</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                                    Sections 20 and 22 explicitly prohibit unauthorized practice of Modern Medicine and mandate swift legal proceedings against individuals practicing without valid statutory registration.
                                </CardContent>
                            </Card>

                            {/* APMC Rules 2013 */}
                            <Card className="shadow-sm border-l-4 border-l-indigo-600 bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                                        4. AP Medical Council Rules, 2013
                                    </CardTitle>
                                    <CardDescription>Rule 8 Enforcement</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                                    Rule 8 empowers the competent authority to regulate medical practice and initiate legal proceedings against unauthorized practitioners and statutory violators across the state.
                                </CardContent>
                            </Card>

                            {/* Private Medical Care Establishments Act 2002 */}
                            <Card className="shadow-sm border-l-4 border-l-purple-600 bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                        5. AP Allopathic Private Establishments Act, 2002
                                    </CardTitle>
                                    <CardDescription>Section 3 Mandate</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                                    Mandates registration of all private allopathic establishments. Clinics, nursing homes, or hospitals employing unqualified or unregistered persons are liable for immediate closure and statutory prosecution.
                                </CardContent>
                            </Card>

                            {/* Private Establishments Rules 2007 */}
                            <Card className="shadow-sm border-l-4 border-l-purple-600 bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                        6. AP Private Establishments Rules, 2007
                                    </CardTitle>
                                    <CardDescription>Rule 5(a) Strict Liability</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                                    Requires strict compliance with eligibility requirements. Medical establishments shall not permit, encourage, or facilitate the practice of Modern Medicine by unqualified persons.
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAB 3: ANTI-QUACKERY ENFORCEMENT */}
                    <TabsContent value="enforcement" className="space-y-8 animate-in fade-in-50 duration-300">
                        {/* Section 8 Intro */}
                        <Card className="bg-gradient-to-r from-[#1a237e] to-[#0d47a1] text-white shadow-md border-none">
                            <CardContent className="p-6 md:p-8 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/20 text-white text-xs font-semibold">
                                    STATUTORY INSPECTION MANDATE
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
                                    APMC Section 8 Inspection Committees
                                </h2>
                                <p className="text-blue-100 leading-relaxed text-sm md:text-base">
                                    Under <span className="text-white font-bold">Section 8</span> of the <span className="font-semibold text-white">Andhra Pradesh Medical Practitioners Registration (Amendment) Act, 2013</span>, the Government permits the Council to constitute dedicated 2 or 3-member Inspection Committees appointed by the Chairman from elected/nominated members.
                                </p>
                            </CardContent>
                        </Card>

                        {/* What Committees Inspect */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        Where Can Committees Inspect?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                    <p>The Act authorizes formal inspection and visitation of:</p>
                                    <ul className="grid grid-cols-2 gap-2 font-medium">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Hospitals</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Nursing Homes</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Clinics</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Institutions</li>
                                    </ul>
                                    <p className="text-xs text-muted-foreground pt-2">
                                        Any premises where the Council believes quackery, cross-pathy, or unauthorized practice of modern medicine is occurring.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Siren className="w-5 h-5 text-amber-600" />
                                        Statutory Trigger Conditions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <p>Inspections are authorized whenever:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                                            <span>Unethical medical practices are taking place;</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                                            <span>Unqualified persons (quacks) are practising;</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                                            <span>Persons belonging to other systems are practising Allopathy (Cross-pathy);</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                                            <span>Modern allopathic drugs are being prescribed illegally.</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Powers vs Limitations Matrix */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-t-4 border-t-blue-600 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Statutory Powers (What Committee CAN Do)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <li className="flex items-center gap-2">✔ Inspect &amp; visit premises</li>
                                        <li className="flex items-center gap-2">✔ Verify qualifications</li>
                                        <li className="flex items-center gap-2">✔ Verify registration</li>
                                        <li className="flex items-center gap-2">✔ Verify prescriptions</li>
                                        <li className="flex items-center gap-2">✔ Collect formal evidence</li>
                                        <li className="flex items-center gap-2">✔ Prepare inspection report</li>
                                        <li className="flex items-center gap-2">✔ Submit report to Council</li>
                                        <li className="flex items-center gap-2">✔ Coordinate with Police</li>
                                        <li className="flex items-center gap-2">✔ Coordinate Drug Control</li>
                                        <li className="flex items-center gap-2">✔ Coordinate with DM&amp;HO</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-t-4 border-t-red-600 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                                        <XCircle className="w-5 h-5" />
                                        Limitations (What Committee CANNOT Do)
                                    </CardTitle>
                                    <CardDescription>Its role is fact-finding and recommendatory.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                            <XCircle className="w-4 h-4 shrink-0" /> Cannot punish or sentence anyone directly
                                        </li>
                                        <li className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                            <XCircle className="w-4 h-4 shrink-0" /> Cannot convict a quack
                                        </li>
                                        <li className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                            <XCircle className="w-4 h-4 shrink-0" /> Cannot seal a hospital directly
                                        </li>
                                        <li className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                                            <XCircle className="w-4 h-4 shrink-0" /> Cannot arrest anyone or impose penal fines
                                        </li>
                                    </ul>
                                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-muted-foreground">
                                        Subsequent enforcement &amp; criminal action is initiated through competent courts by APMC, Police, Drug Control Administration, and DM&amp;HO authorities.
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}

export default function RMPLegalPortal() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <RMPPortalInner />
        </Suspense>
    );
}
