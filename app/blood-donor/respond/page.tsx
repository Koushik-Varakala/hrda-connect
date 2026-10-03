"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Droplet,
    CheckCircle2,
    XCircle,
    Hospital,
    PhoneCall,
    MapPin,
    AlertTriangle,
    ShieldCheck,
    Clock,
    Heart,
    MessageCircle,
    Activity
} from "lucide-react";

function DonorResponseContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState<any>(null);
    const [notes, setNotes] = useState("");
    const [completedAction, setCompletedAction] = useState<"accepted" | "declined" | null>(null);
    const [recipientContact, setRecipientContact] = useState<any>(null);

    useEffect(() => {
        if (!token) {
            setError("No response token provided. Please open the link sent to your SMS or WhatsApp.");
            setLoading(false);
            return;
        }

        fetch(`/api/blood-network/respond?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                const resData = await res.json();
                if (!res.ok) throw new Error(resData.message || "Failed to load requirement details.");
                setData(resData);
                if (resData.currentStatus === "accepted") {
                    setCompletedAction("accepted");
                    setRecipientContact({
                        attendantName: resData.requirement?.attendantName,
                        contactPhone: resData.requirement?.recipientContactPhone,
                        hospitalName: resData.requirement?.hospitalName,
                        hospitalAddress: resData.requirement?.hospitalAddress,
                    });
                } else if (resData.currentStatus === "declined") {
                    setCompletedAction("declined");
                }
            })
            .catch((err) => {
                setError(err.message || "Could not load requirement.");
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleAction = async (action: "accept" | "decline") => {
        if (!token) return;
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/blood-network/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, action, notes }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || "Failed to record response.");

            setCompletedAction(action === "accept" ? "accepted" : "declined");
            if (resData.recipientContact) {
                setRecipientContact(resData.recipientContact);
            }
        } catch (err: any) {
            setError(err.message || "Failed to submit response.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <Activity className="w-10 h-10 text-rose-600 animate-spin mb-4" />
                <p className="text-slate-600 font-semibold text-sm">Loading requirement details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Invalid or Expired Link</h3>
                <p className="text-xs text-slate-500 mb-6">{error || "This blood requirement alert link may have expired or is invalid."}</p>
                <Button asChild variant="outline" size="sm">
                    <a href="/blood-donor">Go to HRDA Blood Donor Portal</a>
                </Button>
            </div>
        );
    }

    const req = data.requirement;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            {/* Header Badge */}
            <div className="text-center mb-6">
                <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs px-3 py-1 font-semibold inline-flex items-center gap-1.5 mb-2">
                    <Droplet className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                    HRDA Blood Donor Network • Urgent Alert
                </Badge>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Dear Dr. {data.donorName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    An urgent requirement for blood has been reported in your district.
                </p>
            </div>

            {/* Requirement Details Card */}
            <Card className="border-rose-200 shadow-sm overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-rose-200 font-semibold">Blood Group Needed</span>
                        <div className="text-3xl font-black">{req.bloodGroup}</div>
                    </div>
                    <div className="text-right">
                        <Badge className="bg-white/20 hover:bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-wider mb-1">
                            {req.urgency}
                        </Badge>
                        <p className="text-xs text-rose-100 font-medium">
                            {req.unitsRequired} Unit{req.unitsRequired > 1 ? "s" : ""} Required
                        </p>
                    </div>
                </div>

                <CardContent className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                                <Hospital className="w-3.5 h-3.5 text-slate-500" /> Hospital Facility:
                            </span>
                            <p className="font-bold text-slate-800 text-sm">{req.hospitalName}</p>
                            {req.hospitalAddress && <p className="text-slate-500">{req.hospitalAddress}</p>}
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location:
                            </span>
                            <p className="font-bold text-slate-800 text-sm">{req.cityTown}, {req.district}</p>
                            <p className="text-slate-500">Andhra Pradesh</p>
                        </div>
                    </div>

                    {req.clinicalRequirement && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-700">Clinical Requirement / Condition:</span>
                            <p className="text-slate-600 mt-0.5">{req.clinicalRequirement}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Response Section */}
            {completedAction === "accepted" ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-emerald-900">
                            Thank You For Stepping Up!
                        </h3>
                        <p className="text-xs text-emerald-800 max-w-md mx-auto mt-1">
                            Your willingness to donate has been recorded. Your contact number is now shared with the patient attendant to coordinate donation.
                        </p>
                    </div>

                    {/* Attendant Details Card */}
                    {recipientContact && recipientContact.contactPhone && (
                        <div className="bg-white border border-emerald-200 rounded-xl p-4 text-left space-y-3 shadow-sm max-w-md mx-auto">
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                                Patient Attendant Contact Details
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {recipientContact.attendantName || "Attendant"}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono">
                                        +91 {recipientContact.contactPhone}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`tel:${recipientContact.contactPhone}`}
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                                    >
                                        <PhoneCall className="w-3.5 h-3.5" /> Call
                                    </a>
                                    <a
                                        href={`https://wa.me/91${recipientContact.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I am Dr. ${data.donorName} from HRDA Blood Donor Network regarding your blood requirement at ${req.hospitalName}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-[11px] text-emerald-700 max-w-sm mx-auto bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                        Reminder: Actual blood donation, testing, and cross-matching take place at the hospital / licensed blood bank as per standard clinical safety norms.
                    </div>
                </div>
            ) : completedAction === "declined" ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        Response Recorded: Unavailable
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Thank you for letting us know promptly. We understand you are unavailable right now and will not disturb you further for this request.
                    </p>
                    <div className="pt-2">
                        <Button
                            onClick={() => setCompletedAction(null)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-500 hover:text-slate-800"
                        >
                            Change Response
                        </Button>
                    </div>
                </div>
            ) : (
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-slate-800">
                            Confirm Your Availability
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                            Are you available and willing to donate blood for this patient? Your contact info will only be shared if you click Accept.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600">
                                Optional note / time availability:
                            </label>
                            <Textarea
                                placeholder="e.g. Can reach hospital after 2:00 PM, or please call directly."
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <Button
                                onClick={() => handleAction("accept")}
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm shadow-sm"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Yes, I Am Willing to Donate
                            </Button>

                            <Button
                                onClick={() => handleAction("decline")}
                                disabled={submitting}
                                variant="outline"
                                className="w-full border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold h-12 text-sm"
                            >
                                <XCircle className="w-5 h-5 mr-2 text-slate-400" />
                                Not Available Right Now
                            </Button>
                        </div>

                        <div className="pt-2 text-center">
                            <p className="text-[11px] text-slate-400">
                                🔒 Privacy guarantee: If you click "Not Available", your details remain completely hidden and no information is shared.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function DonorResponsePage() {
    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-6">
                <Suspense fallback={
                    <div className="min-h-[50vh] flex items-center justify-center">
                        <Activity className="w-8 h-8 text-rose-600 animate-spin" />
                    </div>
                }>
                    <DonorResponseContent />
                </Suspense>
            </div>
        </Layout>
    );
}
