"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera, X as XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";
import { NOMINATION_FEE_MAP, NOMINATION_POSTS, HYDERABAD_ZONES } from "@shared/schema";
import { Layout } from "@/components/Layout";

// Form Schema
const nominationFormSchema = z.object({
    fullName: z.string().min(2, "Full Name is required"),
    hrdaMembershipId: z.string().min(1, "HRDA Membership ID is required"),
    tgmcNumber: z.string().min(3, `${appConfig.medicalCouncilShort} ID is required`),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Valid phone number required").max(15, "Valid phone number required"),
    district: z.string().min(1, "District/Zone is required"),
    postApplied: z.string().min(1, "Post applied for is required"),
});

type NominationFormValues = z.infer<typeof nominationFormSchema>;

// Combine districts and zones, sort them alphabetically
const allDistrictsAndZones = [...appConfig.districts, ...HYDERABAD_ZONES].sort();

// Compress and resize photo client-side before upload (saves ~98% storage)
const compressImage = (file: File, maxW = 400, maxH = 500, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width, h = img.height;
            // Scale down to fit within maxW x maxH while keeping aspect ratio
            if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d")!;
            // Fill white background (prevents transparent PNGs from going black in JPEG)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Compression failed"));
                    resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
};

export default function NominatePage() {
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [declarationAgreed, setDeclarationAgreed] = useState(false);
    const [declarationOpen, setDeclarationOpen] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<NominationFormValues>({
        resolver: zodResolver(nominationFormSchema),
        defaultValues: {
            fullName: "",
            hrdaMembershipId: "",
            tgmcNumber: "",
            email: "",
            mobile: "",
            district: "",
            postApplied: "",
        },
    });

    const selectedPost = form.watch("postApplied");
    const currentFee = selectedPost ? NOMINATION_FEE_MAP[selectedPost] : 0;

    const onSubmit = async (data: NominationFormValues) => {
        if (!photoFile) {
            toast({ title: "Photo Required", description: "Please upload your passport-size photo.", variant: "destructive" });
            return;
        }
        if (!signatureFile) {
            toast({ title: "Signature Required", description: "Please upload your signature.", variant: "destructive" });
            return;
        }
        setIsProcessing(true);
        try {
            // 1. Create Order + pre-save pending nomination (send as FormData for photo)
            const fd = new FormData();
            fd.append("fullName", data.fullName);
            fd.append("hrdaMembershipId", data.hrdaMembershipId);
            fd.append("tgmcNumber", data.tgmcNumber);
            fd.append("email", data.email);
            fd.append("mobile", data.mobile);
            fd.append("district", data.district);
            fd.append("postApplied", data.postApplied);
            fd.append("photo", photoFile);
            fd.append("signature", signatureFile);

            const orderRes = await fetch("/api/nominations/order", { method: "POST", body: fd });
            if (!orderRes.ok) {
                const err = await orderRes.json();
                throw new Error(err.message || "Failed to create order");
            }
            const order = await orderRes.json();
            const pendingNomId = order.nominationId ?? null;

            // 2. Open Razorpay
            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "HRDA Telangana",
                description: `Nomination Fee for ${data.postApplied}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify & update pending nomination to success
                    setIsVerifyingPayment(true);
                    try {
                        await apiRequest("POST", "/api/nominations/verify", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            nominationId: pendingNomId,
                        });
                        router.push(`/nominate/success?ref=${response.razorpay_payment_id}`);
                    } catch (err: any) {
                        setIsVerifyingPayment(false);
                        toast({
                            title: "Verification Failed",
                            description: err.message || "Payment successful but verification failed. Please contact support.",
                            variant: "destructive"
                        });
                        // At this point, the webhook is the fallback safety net.
                        router.push(`/nominate/success?ref=${response.razorpay_payment_id}&delayed=true`);
                    }
                },
                prefill: {
                    name: data.fullName,
                    email: data.email,
                    contact: data.mobile
                },
                theme: { color: "#2563eb" },
                modal: {
                    ondismiss: async function () {
                        // User closed the Razorpay popup without paying
                        if (pendingNomId) {
                            try {
                                await apiRequest("PUT", `/api/nominations/${pendingNomId}`, {
                                    status: "payment_failed",
                                    paymentStatus: "failed",
                                });
                            } catch (e) {
                                console.warn("Could not mark dismissed nomination as failed:", e);
                            }
                        }
                        toast({
                            title: "Payment Cancelled",
                            description: "You closed the payment window. You can try again anytime.",
                        });
                        setIsProcessing(false);
                    }
                },
            };

            // Handle Mock Mode
            if (order.key_id === "rzp_test_mock_key") {
                console.log("Using Mock Payment Flow");
                options.handler({
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id: order.id,
                    razorpay_signature: "mock_signature"
                });
                return;
            }

            const rzp1 = new (window as any).Razorpay(options);

            rzp1.on('payment.failed', async function (response: any) {
                console.error("Payment Failed Details:", response?.error || response);

                // Mark the pending nomination as failed in DB so it doesn't linger
                if (pendingNomId) {
                    try {
                        await apiRequest("PUT", `/api/nominations/${pendingNomId}`, {
                            status: "payment_failed",
                            paymentStatus: "failed",
                        });
                    } catch (e) {
                        console.warn("Could not mark nomination as failed:", e);
                    }
                }

                toast({
                    title: "Payment Failed",
                    description: response?.error?.description || response?.description || "Your payment could not be processed. Please try again.",
                    variant: "destructive"
                });
                setIsProcessing(false);
            });

            rzp1.open();

        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Could not initiate payment. Please try again.",
                variant: "destructive",
            });
            setIsProcessing(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex flex-col bg-slate-50">
                <main className="flex-1 py-12 px-4 md:px-8">
                <Dialog open={isVerifyingPayment}>
                    <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>Verifying Payment</DialogTitle>
                            <DialogDescription className="flex flex-col items-center justify-center py-4 gap-4 text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <span className="text-base text-slate-700 font-medium">
                                    Please wait while we verify your payment. <br />
                                    <strong>Do not close or refresh this window.</strong>
                                </span>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">HRDA Telangana District Elections</h1>
                        <p className="text-slate-600">Nomination Application Form</p>
                    </div>

                    <Card className="w-full shadow-xl">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle>Submit Your Nomination</CardTitle>
                            <CardDescription>All fields are mandatory. Please verify your details before payment.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    
                                    {/* Section 1: Personal Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">1. Personal Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Dr. John Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="hrdaMembershipId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>HRDA Membership ID</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="HRDA-TG-12345" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tgmcNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{appConfig.medicalCouncilShort} Registration Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="TSMC-..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="mobile"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mobile Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="10-digit number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Email ID</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="john@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Passport Size Photo <span className="text-red-500">*</span></label>
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-32 h-40 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 hover:border-blue-400 transition-colors">
                                                {photoPreview ? (
                                                    <>
                                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                                        >
                                                            <XIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                                        <p className="text-xs text-slate-400">Upload Photo</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={async (e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) {
                                                            if (f.size > 5 * 1024 * 1024) {
                                                                toast({ title: "File too large", description: "Photo must be under 5MB.", variant: "destructive" });
                                                                return;
                                                            }
                                                            try {
                                                                const compressed = await compressImage(f);
                                                                setPhotoFile(compressed);
                                                                setPhotoPreview(URL.createObjectURL(compressed));
                                                            } catch {
                                                                toast({ title: "Error", description: "Could not process image. Try another photo.", variant: "destructive" });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 space-y-1">
                                                <p>• Recent passport-size photograph</p>
                                                <p>• Formats: JPG, PNG, or WebP</p>
                                                <p>• Max size: 5MB</p>
                                                <p>• Clear face, white background preferred</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Signature <span className="text-red-500">*</span></label>
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-48 h-24 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0 hover:border-blue-400 transition-colors">
                                                {signaturePreview ? (
                                                    <>
                                                        <img src={signaturePreview} alt="Signature" className="w-full h-full object-contain p-2" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setSignatureFile(null); setSignaturePreview(null); }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                                        >
                                                            <XIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                        <p className="text-xs text-slate-400">Upload Signature</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={async (e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) {
                                                            if (f.size > 3 * 1024 * 1024) {
                                                                toast({ title: "File too large", description: "Signature must be under 3MB.", variant: "destructive" });
                                                                return;
                                                            }
                                                            try {
                                                                const compressed = await compressImage(f, 600, 200, 0.85);
                                                                setSignatureFile(compressed);
                                                                setSignaturePreview(URL.createObjectURL(compressed));
                                                            } catch {
                                                                toast({ title: "Error", description: "Could not process image. Try again.", variant: "destructive" });
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 space-y-1">
                                                <p>• Sign on white paper and photograph it</p>
                                                <p>• Formats: JPG, PNG, or WebP</p>
                                                <p>• Max size: 3MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Election Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">2. Election Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="district"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>District / Zone</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select District/Zone" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {allDistrictsAndZones.map(d => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="postApplied"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Post Applying For</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Post" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {NOMINATION_POSTS.map(post => (
                                                                    <SelectItem key={post} value={post}>{post}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Fee Display */}
                                    {selectedPost && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between">
                                            <div>
                                                <p className="text-blue-900 font-medium">Nomination Fee</p>
                                                <p className="text-sm text-blue-700">For the post of {selectedPost}</p>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-700 mt-2 sm:mt-0">
                                                ₹{currentFee}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 3: Declaration & Undertaking */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">3. Candidate Declaration & Undertaking</h3>
                                        
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setDeclarationOpen(!declarationOpen)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 transition-colors"
                                            >
                                                <span className="font-medium text-slate-700 text-sm">Read Full Declaration & Undertaking</span>
                                                <svg className={`w-5 h-5 text-slate-400 transition-transform ${declarationOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            
                                            {declarationOpen && (
                                                <div className="px-4 pb-4 text-sm text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto border-t border-slate-200 pt-4">
                                                    <p className="text-slate-800 font-medium">
                                                        I, the undersigned candidate, hereby submit my nomination for election to the post applied for in the Healthcare Reforms Doctors Association (HRDA) District Panel / Hyderabad City Zonal Branch Committee for the term 2026–2028 and solemnly declare and undertake as follows:
                                                    </p>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">1. Membership Status</p>
                                                            <p>I declare that I am a valid, active, and bona fide member of the Healthcare Reforms Doctors Association (HRDA). The membership details furnished by me are true and correct, and I fulfill all eligibility requirements prescribed under the HRDA Constitution, Election Rules, By-laws, and Election Notification.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">2. Correctness of Information</p>
                                                            <p>I hereby affirm that all particulars furnished by me in this nomination form, including my name, HRDA Membership ID, TGMC Registration Number, address, mobile number, email address, and all supporting documents uploaded by me, are true, correct, complete, and in accordance with official records.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">3. Eligibility and Non-Disqualification</p>
                                                            <p>I declare that I am eligible and qualified to contest for the post for which I have filed this nomination. I further declare that I am not disqualified under any provision of the HRDA Constitution, Rules, By-laws, or Election Guidelines, including but not limited to suspension of membership, disciplinary proceedings, organizational misconduct, financial arrears, or any other disability that may render me ineligible to contest the election.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">4. Voluntary Consent</p>
                                                            <p>I am submitting this nomination voluntarily and of my own free will, without any coercion, undue influence, inducement, pressure, or misrepresentation by any individual, group, panel, or organization.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">5. Compliance with HRDA Constitution and Election Rules</p>
                                                            <p>I undertake to abide by and faithfully comply with the HRDA Constitution, Election Rules, By-laws, Code of Conduct, policies, resolutions, and all lawful directions issued by the HRDA Election Commission, Returning Officers, District Panels, Hyderabad City Zonal Branch Committees, and HRDA State Panel.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">6. Professional Ethics and Organizational Discipline</p>
                                                            <p>I undertake to uphold the highest standards of medical ethics, professionalism, integrity, and organizational discipline expected of a member and office bearer of HRDA.</p>
                                                            <p className="mt-2">I further declare that I shall not engage in, support, promote, encourage, facilitate, or associate myself with:</p>
                                                            <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                                                                <li>Quackery or unqualified medical practice</li>
                                                                <li>Unethical medical practices</li>
                                                                <li>Fraudulent healthcare activities</li>
                                                                <li>Misleading medical advertisements</li>
                                                                <li>Activities detrimental to patient welfare</li>
                                                                <li>Activities prejudicial to the interests, reputation, objectives, or principles of HRDA</li>
                                                            </ul>
                                                            <p className="mt-2">I understand and agree that if I am found to be involved in or supporting any unethical medical practice, quackery, organizational indiscipline, anti-organizational activities, misconduct, or violation of HRDA rules, I shall be liable for disciplinary action. Such action may include warning, censure, suspension, removal from office, cancellation of candidature, suspension or termination of HRDA membership, or any other action permissible under the HRDA Constitution, Rules, and By-laws.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">7. Authenticity of Documents</p>
                                                            <p>I certify that all documents uploaded and submitted by me, including membership proof, identity proof, registration details, declarations, and payment particulars, are genuine and belong to me.</p>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">8. Consequences of False Declaration</p>
                                                            <p>I fully understand that any false statement, concealment of facts, suppression of information, forged documents, or misrepresentation made by me may result in:</p>
                                                            <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                                                                <li>Rejection of my nomination</li>
                                                                <li>Cancellation of candidature at any stage of the election process</li>
                                                                <li>Removal from office if elected</li>
                                                                <li>Disciplinary action under HRDA Rules</li>
                                                                <li>Suspension or cancellation of membership</li>
                                                                <li>Any other action permissible under law</li>
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">9. Acceptance of Election Process</p>
                                                            <p>I agree to accept and abide by the decisions of the HRDA Election Commission and Returning Officers regarding scrutiny of nominations, conduct of elections, counting of votes, declaration of results, and all election-related matters, subject to the provisions of the HRDA Constitution and Election Rules.</p>
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-slate-200 pt-3 mt-3">
                                                        <p className="font-medium text-slate-800">DECLARATION</p>
                                                        <p>I hereby declare that I have carefully read and understood the above declaration and undertaking. I affirm that all information furnished by me is true and correct to the best of my knowledge and belief, and I voluntarily submit my nomination for election under the Healthcare Reforms Doctors Association (HRDA).</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Checkbox */}
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={declarationAgreed}
                                                onChange={e => setDeclarationAgreed(e.target.checked)}
                                                className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-relaxed">
                                                I have read and agree to the <strong>Candidate Declaration & Undertaking</strong> by the HRDA State Panel. I affirm that all information furnished by me is true and correct to the best of my knowledge and belief. Fees once paid are non-refundable.
                                            </span>
                                        </label>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-lg" 
                                        disabled={isProcessing || isVerifyingPayment || !selectedPost || !declarationAgreed}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay ₹${currentFee} & Submit Nomination`
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            </div>
        </Layout>
    );
}
