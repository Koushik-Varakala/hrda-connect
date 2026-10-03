"use client";

import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appConfig } from "@/lib/app-config";
import {
    Droplet,
    HeartHandshake,
    ShieldCheck,
    Clock,
    PhoneCall,
    Search,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Share2,
    Hospital,
    Info,
    Ban,
    ArrowRight,
    Users,
    Activity
} from "lucide-react";
import Link from "next/link";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_LEVELS = [
    { label: "Critical / Immediate Need", value: "Critical / Immediate" },
    { label: "Urgent (Within 12-24 Hours)", value: "Urgent" },
    { label: "Routine (Scheduled Procedure)", value: "Routine" },
];

export default function BloodDonorNetworkPage() {
    const isAP = appConfig.region === 'AP';

    // Donor Form State
    const [donorForm, setDonorForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        bloodGroup: "",
        district: "",
        cityTown: "",
        hospitalOrWorkplace: "",
        consentGiven: false,
    });
    const [donorSubmitting, setDonorSubmitting] = useState(false);
    const [donorResult, setDonorResult] = useState<any>(null);
    const [donorError, setDonorError] = useState("");

    // Request Form State
    const [requestForm, setRequestForm] = useState({
        patientName: "",
        attendantName: "",
        contactPhone: "",
        secondaryPhone: "",
        bloodGroup: "",
        unitsRequired: "1",
        hospitalName: "",
        hospitalAddress: "",
        district: "",
        cityTown: "",
        urgency: "Urgent",
        clinicalRequirement: "",
    });
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requestResult, setRequestResult] = useState<any>(null);
    const [requestError, setRequestError] = useState("");

    // Tracking State
    const [trackingCode, setTrackingCode] = useState("");
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [trackingError, setTrackingError] = useState("");

    // Handle Donor Submit
    const handleDonorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDonorError("");
        setDonorResult(null);

        if (!donorForm.consentGiven) {
            setDonorError("Please provide your consent to be listed in the HRDA Blood Donor Network.");
            return;
        }

        if (!donorForm.fullName || !donorForm.phone || !donorForm.bloodGroup || !donorForm.district || !donorForm.cityTown) {
            setDonorError("Please fill in all required fields (Name, Phone, Blood Group, District, City/Town).");
            return;
        }

        setDonorSubmitting(true);
        try {
            const res = await fetch("/api/blood-network/donor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(donorForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to register as donor.");

            setDonorResult(data);
            setDonorForm({
                fullName: "",
                phone: "",
                email: "",
                bloodGroup: "",
                district: "",
                cityTown: "",
                hospitalOrWorkplace: "",
                consentGiven: false,
            });
        } catch (err: any) {
            setDonorError(err.message || "Something went wrong.");
        } finally {
            setDonorSubmitting(false);
        }
    };

    // Handle Request Submit
    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestError("");
        setRequestResult(null);

        if (!requestForm.patientName || !requestForm.attendantName || !requestForm.contactPhone || !requestForm.bloodGroup || !requestForm.district || !requestForm.hospitalName) {
            setRequestError("Please complete all required fields (Patient, Attendant, Primary Phone, Blood Group, District, Hospital).");
            return;
        }

        setRequestSubmitting(true);
        try {
            const res = await fetch("/api/blood-network/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit request.");

            setRequestResult(data);
            setTrackingCode(data.request.trackingCode);
        } catch (err: any) {
            setRequestError(err.message || "Something went wrong.");
        } finally {
            setRequestSubmitting(false);
        }
    };

    // Handle Tracking Lookup
    const handleTrackingLookup = async (codeToLookup?: string) => {
        const query = (codeToLookup || trackingCode).trim();
        if (!query) {
            setTrackingError("Please enter your tracking code.");
            return;
        }

        setTrackingLoading(true);
        setTrackingError("");
        setTrackingResult(null);

        try {
            const res = await fetch(`/api/blood-network/request/${encodeURIComponent(query)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Request not found.");

            setTrackingResult(data.request);
        } catch (err: any) {
            setTrackingError(err.message || "Failed to find tracking status.");
        } finally {
            setTrackingLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-gradient-to-b from-rose-50 via-slate-50 to-white min-h-screen pb-20">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white py-12 px-4 shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
                        <Droplet className="w-96 h-96 fill-white" />
                    </div>

                    <div className="container mx-auto max-w-5xl relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <Badge className="bg-rose-900/80 text-rose-200 border border-rose-500/40 text-xs px-3 py-1 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                HRDA Andhra Pradesh Initiative
                            </Badge>

                            <div className="text-xs sm:text-sm text-rose-100 flex items-center gap-3">
                                <span>Save Lives</span>
                                <span>•</span>
                                <span>Support Our Fraternity</span>
                                <span>•</span>
                                <span className="font-semibold text-white">Strengthen HRDA</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                <Droplet className="w-7 h-7 text-rose-200 fill-rose-200" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                                HRDA Blood Donor Network
                            </h1>
                        </div>

                        <p className="text-rose-100 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
                            Fraternity Support &nbsp;|&nbsp; Verified Donors &nbsp;|&nbsp; Quick Help &nbsp;|&nbsp; No Commercial Involvement
                        </p>

                        {/* Four Guiding Principles Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-rose-600/60">
                            <div className="flex items-center gap-2 bg-rose-800/40 backdrop-blur-sm p-2 rounded-lg border border-rose-500/30 text-xs">
                                <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                                <span>Consent Based</span>
                            </div>
                            <div className="flex items-center gap-2 bg-rose-800/40 backdrop-blur-sm p-2 rounded-lg border border-rose-500/30 text-xs">
                                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                                <span>Minimal Details Only</span>
                            </div>
                            <div className="flex items-center gap-2 bg-rose-800/40 backdrop-blur-sm p-2 rounded-lg border border-rose-500/30 text-xs">
                                <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                                <span>Periodic Verification</span>
                            </div>
                            <div className="flex items-center gap-2 bg-rose-800/40 backdrop-blur-sm p-2 rounded-lg border border-rose-500/30 text-xs">
                                <Share2 className="w-4 h-4 text-purple-300 shrink-0" />
                                <span>Controlled Sharing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strict Non-Commercial Disclaimer Banner */}
                <div className="container mx-auto max-w-5xl px-4 mt-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 border border-rose-300">
                                <Ban className="w-5 h-5 text-rose-700" />
                            </div>
                            <div>
                                <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    No Monetary Transactions
                                </h2>
                                <p className="text-xs text-slate-600">
                                    No payment, charges, or financial transactions from either donors or recipients to HRDA. This is a strictly voluntary fraternity support initiative.
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-100/50 text-[11px] shrink-0 font-medium">
                            100% Free & Voluntary
                        </Badge>
                    </div>
                </div>

                {/* Main Interactive Tabs Container */}
                <div className="container mx-auto max-w-5xl px-4 mt-8">
                    <Tabs defaultValue="register" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full bg-slate-200/80 p-1 rounded-xl h-12 shadow-inner">
                            <TabsTrigger value="register" className="rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm">
                                <Droplet className="w-4 h-4 fill-rose-600 text-rose-600" />
                                <span>Register as Donor</span>
                            </TabsTrigger>
                            <TabsTrigger value="request" className="rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm">
                                <Hospital className="w-4 h-4 text-rose-600" />
                                <span>Request Blood</span>
                            </TabsTrigger>
                            <TabsTrigger value="track" className="rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm">
                                <Search className="w-4 h-4 text-rose-600" />
                                <span>Track Request</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: DONOR REGISTRATION */}
                        <TabsContent value="register" className="mt-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="bg-slate-50/60 border-b border-slate-100 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">
                                            1
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            Doctor / Member Blood Donor Registration
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                                        Join the internal fraternity registry. Your contact number remains completely private and is never made public.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    {donorResult ? (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-emerald-900">
                                                Registration Successful!
                                            </h3>
                                            <p className="text-sm text-emerald-800 max-w-md mx-auto">
                                                {donorResult.message}
                                            </p>
                                            <div className="bg-white border border-emerald-200 p-4 rounded-lg inline-block text-left text-xs space-y-1 shadow-sm">
                                                <p><span className="font-semibold text-slate-700">Donor Name:</span> {donorResult.donor?.fullName}</p>
                                                <p><span className="font-semibold text-slate-700">Blood Group:</span> <span className="font-bold text-rose-700">{donorResult.donor?.bloodGroup}</span></p>
                                                <p><span className="font-semibold text-slate-700">District:</span> {donorResult.donor?.district}</p>
                                                <p><span className="font-semibold text-slate-700">Status:</span> <span className="text-emerald-600 font-semibold">Active & Available</span></p>
                                            </div>
                                            <div>
                                                <Button
                                                    onClick={() => setDonorResult(null)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 text-xs"
                                                >
                                                    Register Another Donor
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleDonorSubmit} className="space-y-5">
                                            {donorError && (
                                                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{donorError}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorName" className="text-xs font-semibold text-slate-700">
                                                        Full Name (with Dr. prefix) <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="donorName"
                                                        placeholder="e.g. Dr. Rajesh Kumar"
                                                        value={donorForm.fullName}
                                                        onChange={(e) => setDonorForm({ ...donorForm, fullName: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorPhone" className="text-xs font-semibold text-slate-700">
                                                        Mobile Number (10 digits) <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="donorPhone"
                                                        placeholder="e.g. 9876543210"
                                                        value={donorForm.phone}
                                                        maxLength={10}
                                                        onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                                                        required
                                                    />
                                                    <p className="text-[11px] text-slate-400">Kept private; never shown publicly.</p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorEmail" className="text-xs font-semibold text-slate-700">
                                                        Email Address (Optional — for alert notifications)
                                                    </Label>
                                                    <Input
                                                        id="donorEmail"
                                                        type="email"
                                                        placeholder="e.g. doctor@gmail.com"
                                                        value={donorForm.email}
                                                        onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                                                    />
                                                    <p className="text-[11px] text-slate-400">Receive instant emergency alerts in your inbox.</p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorBlood" className="text-xs font-semibold text-slate-700">
                                                        Blood Group <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Select
                                                        value={donorForm.bloodGroup}
                                                        onValueChange={(val) => setDonorForm({ ...donorForm, bloodGroup: val })}
                                                    >
                                                        <SelectTrigger id="donorBlood">
                                                            <SelectValue placeholder="Select blood group" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {BLOOD_GROUPS.map((bg) => (
                                                                <SelectItem key={bg} value={bg}>
                                                                    <span className="font-bold text-rose-700">{bg}</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorDistrict" className="text-xs font-semibold text-slate-700">
                                                        District (Andhra Pradesh) <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Select
                                                        value={donorForm.district}
                                                        onValueChange={(val) => setDonorForm({ ...donorForm, district: val })}
                                                    >
                                                        <SelectTrigger id="donorDistrict">
                                                            <SelectValue placeholder="Select your district" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {appConfig.districts.map((d) => (
                                                                <SelectItem key={d} value={d}>
                                                                    {d}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorCity" className="text-xs font-semibold text-slate-700">
                                                        City / Town / Mandal <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="donorCity"
                                                        placeholder="e.g. Vijayawada, Guntur, Tirupati"
                                                        value={donorForm.cityTown}
                                                        onChange={(e) => setDonorForm({ ...donorForm, cityTown: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="donorHospital" className="text-xs font-semibold text-slate-700">
                                                        Hospital / College / Workplace (Optional)
                                                    </Label>
                                                    <Input
                                                        id="donorHospital"
                                                        placeholder="e.g. GGH Vijayawada, KIMS, Private Clinic"
                                                        value={donorForm.hospitalOrWorkplace}
                                                        onChange={(e) => setDonorForm({ ...donorForm, hospitalOrWorkplace: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
                                                <Checkbox
                                                    id="donorConsent"
                                                    checked={donorForm.consentGiven}
                                                    onCheckedChange={(checked) => setDonorForm({ ...donorForm, consentGiven: Boolean(checked) })}
                                                    className="mt-0.5"
                                                />
                                                <label htmlFor="donorConsent" className="cursor-pointer leading-relaxed">
                                                    <span className="font-semibold text-slate-800">Informed Consent:</span> I voluntarily consent to be included in the internal HRDA AP Blood Donor Group. I understand my phone number will only be shared with a patient representative after I explicitly accept an alert for an urgent requirement.
                                                </label>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={donorSubmitting}
                                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11"
                                            >
                                                {donorSubmitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 animate-spin" /> Registering...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <HeartHandshake className="w-4 h-4" /> Register as Blood Donor
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 2: REQUEST BLOOD */}
                        <TabsContent value="request" className="mt-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="bg-slate-50/60 border-b border-slate-100 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">
                                            4
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            Submit Emergency Blood Requirement
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                                        Provide hospital and requirement details. Our system coordinates alerts with verified donors in your district.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    {requestResult ? (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-emerald-900">
                                                Request Submitted Successfully!
                                            </h3>
                                            <p className="text-sm text-emerald-800 max-w-md mx-auto">
                                                {requestResult.message}
                                            </p>

                                            <div className="bg-white border-2 border-dashed border-rose-300 p-4 rounded-xl inline-block text-center shadow-sm">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Your Live Tracking Code</p>
                                                <p className="text-2xl font-black text-rose-700 tracking-wider my-1">
                                                    {requestResult.request?.trackingCode}
                                                </p>
                                                <p className="text-[11px] text-slate-500">Save this code to check real-time donor acceptances</p>
                                            </div>

                                            <div className="pt-2 flex flex-wrap justify-center gap-3">
                                                <Button
                                                    onClick={() => handleTrackingLookup(requestResult.request?.trackingCode)}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9"
                                                >
                                                    View Live Status & Accepted Donors
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setRequestResult(null);
                                                        setRequestForm({
                                                            patientName: "",
                                                            attendantName: "",
                                                            contactPhone: "",
                                                            secondaryPhone: "",
                                                            bloodGroup: "",
                                                            unitsRequired: "1",
                                                            hospitalName: "",
                                                            hospitalAddress: "",
                                                            district: "",
                                                            cityTown: "",
                                                            urgency: "Urgent",
                                                            clinicalRequirement: "",
                                                        });
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-9"
                                                >
                                                    Submit Another Request
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleRequestSubmit} className="space-y-5">
                                            {requestError && (
                                                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{requestError}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqPatient" className="text-xs font-semibold text-slate-700">
                                                        Patient Full Name <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqPatient"
                                                        placeholder="e.g. Smt. Lakshmi Devi"
                                                        value={requestForm.patientName}
                                                        onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqAttendant" className="text-xs font-semibold text-slate-700">
                                                        Attendant / Contact Person Name <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqAttendant"
                                                        placeholder="e.g. Ramesh (Son / Brother)"
                                                        value={requestForm.attendantName}
                                                        onChange={(e) => setRequestForm({ ...requestForm, attendantName: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqPhone" className="text-xs font-semibold text-slate-700">
                                                        Attendant Primary Mobile (10 digits) <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqPhone"
                                                        placeholder="e.g. 9876543210"
                                                        value={requestForm.contactPhone}
                                                        maxLength={10}
                                                        onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqSecPhone" className="text-xs font-semibold text-slate-700">
                                                        Secondary Mobile Number (Optional)
                                                    </Label>
                                                    <Input
                                                        id="reqSecPhone"
                                                        placeholder="e.g. 9123456780"
                                                        value={requestForm.secondaryPhone}
                                                        maxLength={10}
                                                        onChange={(e) => setRequestForm({ ...requestForm, secondaryPhone: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqBlood" className="text-xs font-semibold text-slate-700">
                                                        Required Blood Group <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Select
                                                        value={requestForm.bloodGroup}
                                                        onValueChange={(val) => setRequestForm({ ...requestForm, bloodGroup: val })}
                                                    >
                                                        <SelectTrigger id="reqBlood">
                                                            <SelectValue placeholder="Select blood group needed" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {BLOOD_GROUPS.map((bg) => (
                                                                <SelectItem key={bg} value={bg}>
                                                                    <span className="font-bold text-rose-700">{bg}</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqUnits" className="text-xs font-semibold text-slate-700">
                                                        Units / Quantity Required <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqUnits"
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={requestForm.unitsRequired}
                                                        onChange={(e) => setRequestForm({ ...requestForm, unitsRequired: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqHospital" className="text-xs font-semibold text-slate-700">
                                                        Hospital / Treating Facility Name <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqHospital"
                                                        placeholder="e.g. GGH Vijayawada, Ramesh Hospitals"
                                                        value={requestForm.hospitalName}
                                                        onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqDistrict" className="text-xs font-semibold text-slate-700">
                                                        District (Hospital Location) <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Select
                                                        value={requestForm.district}
                                                        onValueChange={(val) => setRequestForm({ ...requestForm, district: val })}
                                                    >
                                                        <SelectTrigger id="reqDistrict">
                                                            <SelectValue placeholder="Select district" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {appConfig.districts.map((d) => (
                                                                <SelectItem key={d} value={d}>
                                                                    {d}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqCity" className="text-xs font-semibold text-slate-700">
                                                        City / Town <span className="text-rose-600">*</span>
                                                    </Label>
                                                    <Input
                                                        id="reqCity"
                                                        placeholder="e.g. Vijayawada, Guntur, Tirupati"
                                                        value={requestForm.cityTown}
                                                        onChange={(e) => setRequestForm({ ...requestForm, cityTown: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="reqUrgency" className="text-xs font-semibold text-slate-700">
                                                        Urgency Level
                                                    </Label>
                                                    <Select
                                                        value={requestForm.urgency}
                                                        onValueChange={(val) => setRequestForm({ ...requestForm, urgency: val })}
                                                    >
                                                        <SelectTrigger id="reqUrgency">
                                                            <SelectValue placeholder="Select urgency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {URGENCY_LEVELS.map((u) => (
                                                                <SelectItem key={u.value} value={u.value}>
                                                                    {u.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="reqNotes" className="text-xs font-semibold text-slate-700">
                                                    Brief Clinical Requirement / Notes (Optional)
                                                </Label>
                                                <Textarea
                                                    id="reqNotes"
                                                    placeholder="e.g. Emergency Cardiac Surgery scheduled tomorrow morning, IP No. 10482, Ward 3"
                                                    rows={2}
                                                    value={requestForm.clinicalRequirement}
                                                    onChange={(e) => setRequestForm({ ...requestForm, clinicalRequirement: e.target.value })}
                                                />
                                            </div>

                                            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                                                <p className="font-semibold flex items-center gap-1.5">
                                                    <Info className="w-3.5 h-3.5 text-rose-700" />
                                                    Hospital & Blood Bank Protocol:
                                                </p>
                                                <p className="text-[11px] text-rose-700 leading-relaxed">
                                                    HRDA facilitates connection with voluntary donors in our fraternity. Actual blood cross-matching, testing, and collection must be conducted strictly at the authorized hospital / licensed blood bank as per standard medical guidelines.
                                                </p>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={requestSubmitting}
                                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11"
                                            >
                                                {requestSubmitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 animate-spin" /> Submitting Request...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Hospital className="w-4 h-4" /> Submit Blood Requirement
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 3: TRACK REQUEST */}
                        <TabsContent value="track" className="mt-6">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="bg-slate-50/60 border-b border-slate-100 rounded-t-xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs">
                                            7
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            Track Request & View Accepted Donors
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500">
                                        Enter your tracking code to view live responses. As soon as a donor confirms availability, their contact details will appear here.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Input
                                            placeholder="Enter Tracking Code (e.g. BLD-AP-8942AF)"
                                            value={trackingCode}
                                            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            onClick={() => handleTrackingLookup()}
                                            disabled={trackingLoading}
                                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0"
                                        >
                                            {trackingLoading ? "Checking..." : "Check Status"}
                                        </Button>
                                    </div>

                                    {trackingError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{trackingError}</span>
                                        </div>
                                    )}

                                    {trackingResult && (
                                        <div className="space-y-6">
                                            {/* Summary Card */}
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                                                    <div>
                                                        <span className="text-[11px] text-slate-400 font-mono">TRACKING CODE</span>
                                                        <h3 className="text-lg font-black text-slate-900 font-mono">
                                                            {trackingResult.trackingCode}
                                                        </h3>
                                                    </div>
                                                    <Badge className={`text-xs px-3 py-1 font-semibold capitalize ${
                                                        trackingResult.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                        trackingResult.status === 'donors_contacted' || trackingResult.status === 'matching' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                        'bg-amber-100 text-amber-800 border-amber-300'
                                                    }`}>
                                                        {trackingResult.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400">Patient:</span>
                                                        <p className="font-semibold text-slate-800">{trackingResult.patientName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Required:</span>
                                                        <p className="font-bold text-rose-700 text-sm">{trackingResult.bloodGroup} ({trackingResult.unitsRequired} Unit{trackingResult.unitsRequired > 1 ? 's' : ''})</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Hospital:</span>
                                                        <p className="font-semibold text-slate-800">{trackingResult.hospitalName}, {trackingResult.cityTown}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400">Donors Accepted:</span>
                                                        <p className="font-extrabold text-emerald-700 text-base">{trackingResult.acceptedDonors?.length || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Accepted Donors Section */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                                    <span>Verified Donors Ready to Help ({trackingResult.acceptedDonors?.length || 0})</span>
                                                </h4>

                                                {trackingResult.acceptedDonors && trackingResult.acceptedDonors.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {trackingResult.acceptedDonors.map((donor: any) => (
                                                            <div key={donor.id} className="bg-emerald-50/50 border border-emerald-300 rounded-xl p-4 shadow-sm space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                                            {donor.bloodGroup}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-bold text-slate-900 text-sm">{donor.fullName}</h5>
                                                                            <p className="text-[11px] text-slate-500">{donor.cityTown}, {donor.district}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge className="bg-emerald-200 text-emerald-900 border-none text-[10px]">
                                                                        Accepted
                                                                    </Badge>
                                                                </div>

                                                                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                                                                    <span className="font-mono text-xs font-semibold text-slate-800">
                                                                        +91 {donor.phone}
                                                                    </span>
                                                                    <a
                                                                        href={`tel:${donor.phone}`}
                                                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                                                                    >
                                                                        <PhoneCall className="w-3.5 h-3.5" /> Call Donor
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-xs text-slate-500 space-y-2">
                                                        <Clock className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
                                                        <p className="font-semibold text-slate-700">Waiting for donor confirmations...</p>
                                                        <p className="max-w-md mx-auto text-slate-500">
                                                            Matching donors in your district are being notified. As soon as a donor taps "Accept", their name and phone number will appear right here immediately.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* 8-Step Interactive Architecture Guide (from the flyer) */}
                <div className="container mx-auto max-w-5xl px-4 mt-16">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs px-3 py-1 mb-2 font-semibold">
                            How the Network Works
                        </Badge>
                        <h2 className="text-2xl font-bold text-slate-900">
                            The 8-Step Privacy-First Workflow
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Designed to deliver urgent medical help while strictly protecting our fraternity's personal privacy.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Step 1 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mb-2">1</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Donor Registration</h3>
                            <p className="text-xs text-slate-600">With explicit consent. Only minimal details (Name, Blood Group, District, Phone) recorded.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2">2</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Secure Database</h3>
                            <p className="text-xs text-slate-600">Stored securely with restricted access. Details are never indexed publicly on the web.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center mb-2">3</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Periodic Verification</h3>
                            <p className="text-xs text-slate-600">Regular check-ins (every 3-6 months) to verify active availability and contact information.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center mb-2">4</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Recipient Request</h3>
                            <p className="text-xs text-slate-600">Patient representative submits blood group, hospital facility, units, and contact details.</p>
                        </div>

                        {/* Step 5 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mb-2">5</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Matching Donor Alert</h3>
                            <p className="text-xs text-slate-600">SMS/WhatsApp alert sent to matching donors in district. Donor info is NOT shared at this stage.</p>
                        </div>

                        {/* Step 6 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center mb-2">6</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Donor Response</h3>
                            <p className="text-xs text-slate-600">Donor confirms willingness by tapping one click (Accept / Decline) on their private link.</p>
                        </div>

                        {/* Step 7 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-2">7</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Controlled Sharing</h3>
                            <p className="text-xs text-slate-600">After donor acceptance, HRDA reveals donor contact details directly to the recipient.</p>
                        </div>

                        {/* Step 8 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center mb-2">8</span>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Hospital Donation</h3>
                            <p className="text-xs text-slate-600">Coordination & clinical cross-match performed at authorized blood bank/hospital.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
