"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Search as SearchIcon, User, AlertCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSearchRegistration } from "@/hooks/use-registrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Search() {
    const [phone, setPhone] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    // Pass searchTerm only when button is clicked (handled by setSearchTerm in handleSearch)
    const { data: results, isLoading } = useSearchRegistration(searchTerm);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(phone);
    };

    return (
        <Layout>
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Search & Update Details</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Search for registered doctors in the HRDA database using your <strong>Registered Phone Number</strong>.
                        You can verify your HRDA ID and update your contact details here.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                <div className="max-w-xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Enter Phone Number (e.g. 9876543210)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-12 text-lg shadow-sm"
                        />
                        <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading}>
                            {isLoading ? "Searching..." : <><SearchIcon className="w-4 h-4 mr-2" /> Search</>}
                        </Button>
                    </form>
                </div>

                <div className="max-w-3xl mx-auto">
                    {searchTerm && results && results.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                            {results.map((reg) => (
                                <ResultCard key={reg.id} registration={reg} />
                            ))}
                        </div>
                    )}

                    {searchTerm && results && results.length === 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Not Found</AlertTitle>
                            <AlertDescription>
                                No records found matching Phone Number "{searchTerm}". Please check the number and try again.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </Layout>
    );
}

import { appConfig } from "@/lib/app-config";

const districts = appConfig.districts;

// ... imports
import { IdCard } from "@/components/IdCard";
import { Printer } from "lucide-react";
import { useRef, useEffect } from "react";
import { api } from "@shared/routes";

// ... existing ResultCard component

function ResultCard({ registration }: { registration: any }) {
    // Use local state for registration to allow immediate updates
    const [regData, setRegData] = useState(registration);

    // Sync prop changes to local state (e.g. when search term changes)
    useEffect(() => {
        setRegData(registration);
    }, [registration]);

    const { toast } = useToast();

    // OTP State
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // ID Card State
    const [showIdCard, setShowIdCard] = useState(false);
    const idCardRef = useRef<HTMLDivElement>(null);
    // Removed `downloadRef` as we only print now, or reuse it for printing (which we do for `@media print`)
    const printRef = useRef<HTMLDivElement>(null);

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        try {
            await apiRequest("POST", "/api/registrations/send-otp", { registrationId: regData.id });
            toast({ title: "OTP Sent", description: "Please check your registered phone and email for the code." });
            setIsSendingOtp(false);
            setShowOtpDialog(true);
        } catch (e: any) {
            setIsSendingOtp(false);
            toast({
                title: "Error",
                description: e.message || "Failed to send OTP. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast({ title: "Invalid OTP", description: "Please enter a valid 6-digit code.", variant: "destructive" });
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const response = await apiRequest("POST", "/api/registrations/verify-otp", {
                registrationId: regData.id,
                otp
            });
            const data = await response.json();

            toast({ title: "Verified", description: "You can now edit your details." });
            setShowOtpDialog(false);
            setIsVerifyingOtp(false);

            if (data.registration) {
                // Update local state immediately properly
                setRegData(data.registration);

                // Also update the cache for good measure
                queryClient.setQueriesData({ queryKey: [api.registrations.search.path] }, (oldData: any) => {
                    if (!oldData) return oldData;
                    return oldData.map((reg: any) =>
                        reg.id === regData.id ? data.registration : reg
                    );
                });
            }
        } catch (e: any) {
            setIsVerifyingOtp(false);
            toast({
                title: "Verification Failed",
                description: e.message || "Invalid OTP. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <Card className="border-l-4 border-l-primary shadow-md">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start gap-4">
                <div className="flex w-full md:w-auto items-start gap-4">
                    <div className="bg-slate-100 p-3 rounded-full flex-shrink-0">
                        <User className="w-8 h-8 text-slate-500" />
                    </div>
                    <div className="flex-1 md:flex-none">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg md:text-xl font-bold">{regData.firstName} {regData.lastName}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-medium uppercase ${regData.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {regData.status?.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 mb-2">
                            <p className="text-sm text-muted-foreground">TGMC ID: <span className="text-foreground font-medium">{regData.tgmcId}</span></p>
                            {regData.hrdaId && (
                                <p className="text-sm text-muted-foreground">HRDA ID: <span className="text-primary font-bold">{regData.hrdaId}</span></p>
                            )}
                        </div>
                        {regData.membershipType && <p className="text-xs text-slate-500 capitalize">{regData.membershipType} Membership</p>}
                    </div>
                </div>

                <div className="w-full md:flex-1 md:ml-4 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                        <div>
                            <span className="font-medium text-slate-900 block sm:inline">Phone:</span> {regData.phone}
                        </div>
                        <div className="truncate" title={regData.email || ""}>
                            <span className="font-medium text-slate-900 block sm:inline">Email:</span> {regData.email || "-"}
                        </div>
                        <div className="sm:col-span-2 text-wrap break-words">
                            <span className="font-medium text-slate-900 block sm:inline">Address:</span> {regData.address || "-"}
                        </div>
                        <div className="sm:col-span-2">
                            <span className="font-medium text-slate-900 block sm:inline">District:</span> {regData.district || "-"}
                        </div>
                    </div>
                </div>

                {/* Update Action Buttons Section */}
                <div className="w-full md:w-[220px] shrink-0 flex flex-col md:items-end gap-3 mt-4 md:mt-0">
                    {regData.isMasked ? (
                        <Button variant="outline" size="sm" onClick={handleSendOtp} disabled={isSendingOtp} className="w-full">
                            {isSendingOtp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Verify to View
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2 w-full">
                            <Button variant="default" size="sm" onClick={() => setShowIdCard(true)} className="w-full bg-slate-800 hover:bg-slate-900 text-white">
                                <Printer className="w-4 h-4 mr-2" /> Print ID Card
                            </Button>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 md:text-right w-full leading-tight mt-1">
                        In case you're facing issues,<br />Contact : <span className="whitespace-nowrap font-medium">9441568635</span>
                    </p>
                </div>
            </CardContent >

            {/* OTP Dialog ... */}
            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Verification Code</DialogTitle>
                        <DialogDescription>
                            We've sent a 6-digit code to your registered phone number and email <strong>{regData.email}</strong>.
                            Enter it below to verify your identity.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4 justify-center">
                        <Input
                            id="otp"
                            className="text-center text-2xl font-bold tracking-[0.5em] h-14 w-full max-w-[200px]"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="000000"
                        />
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setShowOtpDialog(false)}>Cancel</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSendOtp} disabled={isSendingOtp}>
                                {isSendingOtp ? "Sending..." : "Resend"}
                            </Button>
                            <Button type="submit" onClick={handleVerifyOtp} disabled={isVerifyingOtp || otp.length !== 6}>
                                {isVerifyingOtp ? "Verifying..." : "Verify"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ID Card Preview Dialog */}
            <Dialog open={showIdCard} onOpenChange={setShowIdCard}>
                <DialogContent className="max-w-[700px] w-full bg-slate-50">
                    <DialogHeader>
                        <DialogTitle>Your HRDA Identity Card</DialogTitle>
                        <DialogDescription>
                            Preview and download your official HRDA Digital ID Card.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center p-4 overflow-auto">
                        {/* Visible Preview (Scaled) */}
                        <div className="scale-75 md:scale-90 lg:scale-100 origin-top">
                            <IdCard ref={idCardRef} registration={regData} />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setShowIdCard(false)}>Close</Button>
                        <Button
                            onClick={() => window.print()}
                            className="bg-slate-800 hover:bg-slate-900 text-white"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print Card
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hidden Off-Screen Container for Perfect Export & Printing */}
            {/* Must be visible (not display:none) for html2canvas, but positioned off-screen */}
            {/* Renamed ref to printRef to be explicit */}
            <div id="print-area" className="fixed top-0 left-0 -z-50" style={{ transform: "translate(-9999px, -9999px)" }}>
                <IdCard ref={printRef} registration={regData} />
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute !important;
                        left: 50% !important;
                        top: 20% !important;
                        transform: translate(-50%, 0) !important;
                        margin: 0;
                        padding: 0;
                        width: auto;
                        height: auto;
                    }
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                }
            `}</style>
        </Card >
    );
}
