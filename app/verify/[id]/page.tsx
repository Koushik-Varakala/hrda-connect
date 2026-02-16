
"use client";

import { Layout } from "@/components/Layout";
import { useEffect, useState, use } from "react"; // Added `use` for Promise support
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ShieldCheck, MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params); // Unwrap params with React.use()
    const { id } = params;
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/verify/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Member not found");
                    throw new Error("Failed to verify membership");
                }
                const data = await res.json();
                setRegistration(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container max-w-lg mx-auto py-12 px-4">
                    <Card>
                        <CardHeader className="text-center pb-2">
                            <Skeleton className="h-8 w-48 mx-auto mb-2" />
                            <Skeleton className="h-4 w-32 mx-auto" />
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex justify-center">
                                <Skeleton className="h-24 w-24 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (error || !registration) {
        return (
            <Layout>
                <div className="container max-w-lg mx-auto py-12 px-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6 text-center">
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h2>
                            <p className="text-red-600 mb-4">{error || "Invalid ID or Member Not Found"}</p>
                            <p className="text-sm text-red-500">
                                Please check the QR code or contact HRDA support if you believe this is an error.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-slate-50 min-h-[calc(100vh-200px)] py-12">
                <div className="container max-w-lg mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-serif font-bold text-slate-800">Member Verification</h1>
                        <p className="text-slate-500 mt-2">Official Verification Portal</p>
                    </div>

                    <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden relative">
                        {/* Status Banner */}
                        <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${registration.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {registration.status === 'verified' ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-3 h-3" />
                                    {registration.status?.replace('_', ' ')}
                                </>
                            )}
                        </div>

                        <CardContent className="pt-8 px-6 pb-8">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    <User className="w-12 h-12 text-slate-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 text-center">
                                    {registration.firstName} {registration.lastName}
                                </h2>
                                {registration.membershipType && (
                                    <Badge variant="outline" className="mt-2 capitalize bg-primary/5 border-primary/20 text-primary">
                                        {registration.membershipType} Member
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-4 divide-y divide-slate-100">
                                <div className="grid grid-cols-[100px_1fr] gap-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">HRDA ID</span>
                                    <span className="text-sm font-bold text-primary font-mono text-lg">
                                        {registration.hrdaId || "PENDING"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">TGMC ID</span>
                                    <span className="text-sm font-medium text-slate-900">{registration.tgmcId}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">District</span>
                                    <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {registration.district || "-"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 py-3">
                                    <span className="text-sm font-medium text-slate-500">Joined On</span>
                                    <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {format(new Date(registration.createdAt || new Date()), "MMMM d, yyyy")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-400">
                                    This is a digitally verified membership record of <br />
                                    <strong>Healthcare Reforms Doctors Association</strong>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
