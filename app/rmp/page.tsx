"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Scale, AlertTriangle, CheckCircle2, XCircle, FileText, Award, Gavel, Search, Users, Siren, Building2, HelpCircle } from "lucide-react";
import { appConfig } from "@/lib/app-config";

export default function RMPLegalPortal() {
    const [activeTab, setActiveTab] = useState("who-is-rmp");

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
                            Who is an RMP?
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

                    {/* TAB 1: WHO IS RMP? */}
                    <TabsContent value="who-is-rmp" className="space-y-8 animate-in fade-in-50 duration-300">
                        {/* Myth vs Reality Header Banner */}
                        <Card className="border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/60 to-white dark:from-slate-900 dark:to-slate-900 shadow-sm">
                            <CardContent className="p-6 md:p-8 space-y-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Statutory Reality Check</div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            Is every person using "RMP" a doctor?
                                        </h2>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold text-sm flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        Popular Assumption is Legally INCORRECT
                                    </div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Every day, millions of patients visit signboards displaying <span className="font-semibold text-slate-900 dark:text-white">Dr. XXXXXXX RMP</span>. 
                                    Most members of the public—and even many public authorities—incorrectly assume that the abbreviation "RMP" denotes a rural or informal practitioner. 
                                    In Indian law, <span className="font-bold text-blue-700 dark:text-blue-400">RMP (Registered Medical Practitioner)</span> is <span className="underline decoration-blue-500 font-semibold">not merely a title or abbreviation</span>; it denotes a <span className="font-bold">statutory legal status</span> recognized under parliamentary enactments.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Step 1: What is Medicine */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        Legal Definition of "Medicine"
                                    </CardTitle>
                                    <CardDescription>Section 2(j) of the National Medical Commission Act, 2019</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <p>Many believe medicine simply means tablets, injections, or treatment. Legally, that understanding is incorrect.</p>
                                    <blockquote className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600 text-slate-900 dark:text-slate-100 font-medium italic">
                                        &ldquo;Medicine means Modern Scientific Medicine in all its branches and includes Surgery and Obstetrics, but does not include Veterinary Medicine and Surgery.&rdquo;
                                    </blockquote>
                                    <p className="text-xs text-muted-foreground">
                                        Therefore, whenever parliamentary or state laws refer to the practice of medicine, it refers exclusively to <span className="font-semibold">Modern Scientific Medicine (Allopathy)</span>.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border border-slate-200 dark:border-slate-800">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                        Degree vs. Statutory Licence
                                    </CardTitle>
                                    <CardDescription>Academic Qualification vs. Legal Entitlement</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <p>
                                        A <span className="font-semibold">Medical Practitioner</span> is a person possessing a recognized undergraduate medical qualification (such as <span className="font-bold">MBBS</span>) under the NMC Act, 2019.
                                    </p>
                                    <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium">
                                        A recognized medical degree is an academic qualification. It is not, by itself, the statutory authority or licence to practise Modern Scientific Medicine independently.
                                    </div>
                                    <p>
                                        Independent practice requires valid statutory enrollment in the State Medical Register or the National Medical Register.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Who IS vs Who is NOT an RMP */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-t-4 border-t-emerald-600 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        An RMP IS Strictly a Person Who:
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                                        <li className="flex items-start gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                            <span>Possesses a recognized medical qualification in <span className="font-semibold">Modern Scientific Medicine (Allopathy)</span>; and</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                            <span>Is duly enrolled in the <span className="font-bold">State Medical Register</span> or <span className="font-bold">National Medical Register</span> under Section 31 of the NMC Act, 2019.</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-t-4 border-t-red-600 shadow-sm bg-white dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                                        <XCircle className="w-5 h-5" />
                                        An RMP is NEVER:
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> A generic title</li>
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> A private certificate</li>
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> A "Village Doctor"</li>
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> A "Rural Practitioner"</li>
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> Experience without degree</li>
                                        <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> Self-assumed designation</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Clarification Box */}
                        <Card className="bg-amber-50/80 border-l-4 border-l-amber-600 border-amber-200 shadow-sm">
                            <CardContent className="p-6 md:p-8 space-y-3">
                                <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                    Legal Verdict: Is &ldquo;Dr. XXXXX RMP&rdquo; Legally Valid?
                                </h3>
                                <p className="text-slate-800 text-sm md:text-base leading-relaxed">
                                    The expression <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300">Dr. XXXXX RMP</span> does <span className="text-red-700 font-bold underline">NOT</span>, by itself, establish that the person is legally entitled to practise Modern Scientific Medicine. Neither private certificates, village practice, experience, nor self-assumed designations can substitute statutory enrollment under Section 31 of the NMC Act, 2019.
                                </p>
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
