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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";
import { NOMINATION_FEE_MAP, NOMINATION_POSTS, HYDERABAD_ZONES } from "@shared/schema";
import { Layout } from "@/components/Layout";

// Form Schema
const nominationFormSchema = z.object({
    fullName: z.string().min(2, "Full Name is required"),
    hrdaMembershipId: z.string().regex(/^HRDA(0[1-9]|1[0-2])20\d{2}-\d{4}$/, "Invalid format. Expected: HRDA[MM][YYYY]-[4 digits] (e.g., HRDA042026-2598)"),
    tgmcNumber: z.string().min(3, `${appConfig.medicalCouncilShort} ID is required`),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Valid phone number required").max(15, "Valid phone number required"),
    district: z.string().min(1, "District/Zone is required"),
    postApplied: z.string().min(1, "Post applied for is required"),
});

type NominationFormValues = z.infer<typeof nominationFormSchema>;

// Combine districts and zones, sort them alphabetically
const allDistrictsAndZones = [...appConfig.districts, ...HYDERABAD_ZONES].sort();

export default function NominatePage() {
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
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
        setIsProcessing(true);
        try {
            // 1. Create Order + pre-save pending nomination
            const orderRes = await apiRequest("POST", "/api/nominations/order", {
                userData: data
            });
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

                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-lg" 
                                        disabled={isProcessing || isVerifyingPayment || !selectedPost}
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

                                    <p className="text-xs text-center text-slate-500 mt-4">
                                        By submitting this form, you agree to the terms and conditions of HRDA Telangana.
                                        Fees once paid are non-refundable.
                                    </p>
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
