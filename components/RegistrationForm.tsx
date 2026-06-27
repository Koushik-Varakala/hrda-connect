"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";

// Form Schema
const registrationSchema = z.object({
    firstName: z.string().min(2, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),
    tgmcId: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number required"),
    address: z.string().min(5, "Address is required"),
    district: z.string().min(1, "District is required"),
    // Couple specific
    spouseName: z.string().optional(),
    spouseTgmcId: z.string().optional(),
    
    // Student specific
    mbbsOrPgYear: z.string().optional(),
    yearOfAdmission: z.string().optional(),
    universityRegNumber: z.string().optional(),
    collegeName: z.string().optional(),
    universityName: z.string().optional(),
});

const districts = appConfig.districts;

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    onSuccess: () => void;
}

const QUESTIONS = [
    { id: 1, section: "Justice", text: "When faced with a difficult decision, I prioritize fairness and ethical conduct even if it makes the situation more complicated." },
    { id: 2, section: "Justice", text: "I am comfortable raising concerns about policies or rules when they seem to be applied inconsistently." },
    { id: 3, section: "Leadership", text: "I naturally take charge and begin organizing tasks when a team or committee lacks clear direction." },
    { id: 4, section: "Leadership", text: "I find it rewarding to take responsibility for important decisions that affect my colleagues or practice." },
    { id: 5, section: "Leadership", text: "I frequently notice opportunities to improve administrative or organizational workflows that others overlook." },
    { id: 6, section: "Independence", text: "I am willing to continue advocating for a necessary change or goal, even if my peers are initially skeptical." },
    { id: 7, section: "Independence", text: "I am comfortable making critical decisions based on my own judgment without always waiting for full consensus." },
    { id: 8, section: "Guidance", text: "I actively seek out feedback and advice from more experienced professionals before making major decisions." },
    { id: 9, section: "Guidance", text: "I believe that having strong mentors and structured guidance is crucial to reaching one's full potential quickly." },
    { id: 10, section: "Guidance", text: "I value studying how successful leaders approach systemic challenges." }
];

const MEMBERSHIP_CATEGORIES = [
    {
        id: "Student",
        name: "Student Membership",
        price: 0,
        badge: "Free",
        description: "Valid until completion of the course.",
        bullets: [
            "Eligible to participate in all organizational activities.",
            "Not eligible to vote or contest elections."
        ]
    },
    {
        id: "General",
        name: "General Membership",
        price: 500,
        badge: "₹500 / year",
        description: "Valid for one year (annual renewal is mandatory).",
        bullets: [
            "Eligible to participate in all organizational activities, including voting.",
            "Continuous membership for 3 consecutive years automatically qualifies for Lifetime Membership."
        ]
    },
    {
        id: "Lifetime",
        name: "Lifetime Membership",
        price: 1500,
        badge: "₹1,500",
        description: "Valid for life.",
        bullets: [
            "Eligible to participate in all organizational activities, including voting and contesting elections."
        ]
    },
    {
        id: "Contributory",
        name: "Contributory Membership",
        price: 0,
        badge: "Free",
        description: "Reserved exclusively for past contributors to the organization.",
        bullets: [
            "Membership subject to approval by the Founders.",
            "Eligible to participate in all organizational activities, including voting and contesting elections."
        ]
    },
    {
        id: "Founders",
        name: "Founders Membership",
        price: 0,
        badge: "Free",
        description: "Reserved exclusively for the Founders of the organization.",
        bullets: [
            "Eligible to participate in all organizational activities, including voting and contesting elections.",
            "Special privileges and key decision-making powers regarding strategic organizational matters."
        ]
    }
];

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
    const [membershipType, setMembershipType] = useState<string>("General");
    const { toast } = useToast();
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const [searchTgmcId, setSearchTgmcId] = useState("");

    // Auto-fill handler
    const handleAutoFill = (doc: any) => {
        const fullName = doc.fullname || "";
        const nameParts = fullName.trim().split(" ");
        let firstName = fullName;
        let lastName = ".";

        if (nameParts.length > 1) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(" ");
        }

        form.setValue("firstName", firstName);
        form.setValue("lastName", lastName);
        form.setValue("tgmcId", doc.original_fmr_no || doc.fmr_no || searchTgmcId);

        const address = [doc.address1, doc.address2].filter(Boolean).join(", ");
        form.setValue("address", address);

        if (doc.mobileno) {
            form.setValue("phone", doc.mobileno);
        }

        setSearchResults([]); // clear selection
        toast({ title: "Details Auto-filled", description: "Please verify the information." });
    };

    const searchDetails = async () => {
        if (!searchTgmcId || searchTgmcId.length < 4) {
            toast({ title: "Invalid ID", description: `Please enter a valid ${appConfig.medicalCouncilShort} ID`, variant: "destructive" });
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(`/api/external/tsmc-doctor/${searchTgmcId}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const responseData = await res.json();
            const data = responseData.data || [];

            if (Array.isArray(data) && data.length > 0) {
                if (data.length === 1) {
                    handleAutoFill(data[0]);
                } else {
                    setSearchResults(data);
                    toast({ title: "Multiple Records Found", description: "Please select your profile from the list." });
                }
            } else {
                toast({ title: "Details Not Found", description: "You can proceed by filling the form manually.", variant: "default" });
                // If not found, user might still want to use the ID they searched for
                form.setValue("tgmcId", searchTgmcId);
            }
        } catch (e) {
            toast({ title: "Fetch Failed", description: "Could not fetch details. Please fill the form manually.", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            tgmcId: "",
            email: "",
            phone: "",
            address: "",
            district: "",
            spouseName: "",
            spouseTgmcId: "",
            mbbsOrPgYear: "",
            yearOfAdmission: "",
            universityRegNumber: "",
            collegeName: "",
            universityName: "",
        },
    });

    const onSubmit = async (data: RegistrationFormValues) => {
        if (membershipType !== 'Student' && membershipType !== 'Contributory' && membershipType !== 'Founders' && (!data.tgmcId || data.tgmcId.length < 3)) {
            form.setError('tgmcId', { type: "manual", message: `${appConfig.medicalCouncilShort} ID is required` });
            return;
        }
        if (membershipType === 'Student') {
            let hasError = false;
            if (!data.mbbsOrPgYear) { form.setError('mbbsOrPgYear', { type: "manual", message: 'Required' }); hasError = true; }
            if (!data.yearOfAdmission) { form.setError('yearOfAdmission', { type: "manual", message: 'Required' }); hasError = true; }
            if (!data.universityRegNumber) { form.setError('universityRegNumber', { type: "manual", message: 'Required' }); hasError = true; }
            if (!data.collegeName) { form.setError('collegeName', { type: "manual", message: 'Required' }); hasError = true; }
            if (!data.universityName) { form.setError('universityName', { type: "manual", message: 'Required' }); hasError = true; }
            if (hasError) {
                toast({ title: "Incomplete Form", description: "Please fill all required student details", variant: "destructive" });
                return;
            }
        }

        setIsProcessing(true);
        try {
            let finalAssessmentProfile: string | undefined = undefined;

            if (appConfig.region === 'AP') {
                const answeredCount = Object.keys(assessmentAnswers).length;
                if (answeredCount < QUESTIONS.length) {
                    toast({
                        title: "Incomplete Assessment",
                        description: "Please answer all 10 assessment questions at the bottom of the form before submitting.",
                        variant: "destructive"
                    });
                    setIsProcessing(false);
                    return;
                }

                // Calculate archetype
                let justice = 0;
                let leadership = 0;
                let independence = 0;
                let guidance = 0;

                QUESTIONS.forEach(q => {
                    const val = assessmentAnswers[q.id] || 3;
                    if (q.section === "Justice") justice += val;
                    if (q.section === "Leadership") leadership += val;
                    if (q.section === "Independence") independence += val;
                    if (q.section === "Guidance") guidance += val;
                });

                let archetype = "Collaborator";
                const maxScore = Math.max(justice, leadership, independence, guidance);
                
                if (justice === maxScore && independence >= 8) archetype = "Rebel";
                else if (justice === maxScore && leadership >= 10) archetype = "Guardian";
                else if (leadership === maxScore) archetype = "Leader";
                else if (guidance === maxScore && justice >= 8) archetype = "Disciple";
                else if (independence === maxScore) archetype = "Lone Wolf";
                else if (leadership >= 12 && independence >= 8) archetype = "Strategist";

                finalAssessmentProfile = archetype;

                // Handle direct free registration
                const isFree = ["Student", "Contributory", "Founders"].includes(membershipType);
                if (isFree) {
                    const res = await apiRequest("POST", "/api/registrations/free", {
                        ...data,
                        membershipType,
                        assessmentProfile: finalAssessmentProfile
                    });
                    
                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.message || "Failed to complete free registration");
                    }
                    
                    onSuccess();
                    return;
                }
            }

            const amount = appConfig.region === 'AP' 
                ? (membershipType === 'General' ? 500 : 1500) 
                : appConfig.registrationFee;

            // 1. Create Order + pre-save pending registration
            const orderRes = await apiRequest("POST", "/api/registrations/order", {
                amount,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
                userData: { 
                    ...data, 
                    membershipType: appConfig.region === 'AP' ? membershipType : 'single', 
                    assessmentProfile: finalAssessmentProfile 
                }
            });
            const order = await orderRes.json();
            if (!orderRes.ok) {
                throw new Error(order.message || "Failed to create order");
            }
            const pendingRegId = order.pendingRegId ?? null;

            // 2. Open Razorpay
            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: appConfig.organizationName,
                description: appConfig.region === 'AP' ? `${membershipType} Membership` : "Lifetime Membership",
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify & update pending registration to success
                    setIsVerifyingPayment(true);
                    try {
                        await apiRequest("POST", "/api/registrations/verify", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            userData: { ...data, membershipType: appConfig.region === 'AP' ? membershipType : 'single' },
                            pendingRegId,
                        });
                        window.location.href = "/thank-you";
                    } catch (err) {
                        setIsVerifyingPayment(false);
                        toast({
                            title: "Verification Failed",
                            description: "Payment successful but verification failed. Please contact support.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    contact: data.phone
                },
                theme: { color: "#2563eb" },
                modal: {
                    ondismiss: async function () {
                        // User closed the modal without paying
                        if (pendingRegId) {
                            try {
                                await apiRequest("POST", "/api/registrations/mark-failed", { pendingRegId, reason: "modal_dismissed" });
                            } catch (_) { /* best-effort */ }
                        }
                    }
                }
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

            const rzp1 = new window.Razorpay(options);

            rzp1.on('payment.failed', async function (response: any) {
                console.error("Payment Failed Details:", response);
                // Mark the pending registration as failed
                if (pendingRegId) {
                    try {
                        await apiRequest("POST", "/api/registrations/mark-failed", {
                            pendingRegId,
                            reason: response.error?.description || "payment_failed"
                        });
                    } catch (_) { /* best-effort */ }
                }
                window.location.href = `/payment-failed?reason=${encodeURIComponent(response.error?.description || "Payment failed")}`;
            });

            rzp1.open();

        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Could not initiate payment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
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

            <Card className="w-full max-w-2xl mx-auto shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-primary">Membership Registration</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to join HRDA. Secure payment via Razorpay.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full">

                        {appConfig.region === 'AP' && (
                            <div className="mb-8 space-y-4">
                                <label className="text-sm font-semibold text-slate-700 block">Select Membership Category</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MEMBERSHIP_CATEGORIES.filter(cat => cat.id !== "Contributory" && cat.id !== "Founders").map((cat) => {
                                        const isSelected = membershipType === cat.id;
                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => setMembershipType(cat.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                                    isSelected
                                                        ? "border-primary bg-primary/5 shadow-md scale-[1.01]"
                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-2 gap-2">
                                                        <span className="font-bold text-sm text-slate-900 leading-tight">{cat.name}</span>
                                                        <span className={`whitespace-nowrap flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${cat.price === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                                            {cat.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">{cat.description}</p>
                                                    <ul className="space-y-1">
                                                        {cat.bullets.map((b, idx) => (
                                                            <li key={idx} className="flex items-start gap-1 text-[11px] text-slate-600 leading-normal">
                                                                <span className="text-primary flex-shrink-0 mt-0.5">•</span>
                                                                <span>{b}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-primary/5 p-4 rounded-lg mb-8 text-center border border-primary/20">
                            {appConfig.region === 'AP' ? (
                                <p className="font-semibold text-primary">
                                    Selected Category: <span className="font-bold">{MEMBERSHIP_CATEGORIES.find(c => c.id === membershipType)?.name}</span> — 
                                    {membershipType === 'General' ? ' ₹500' : membershipType === 'Lifetime' ? ' ₹1,500' : ' Free'}
                                </p>
                            ) : (
                                <p className="font-semibold text-primary">Lifetime Membership: ₹{appConfig.registrationFee}</p>
                            )}
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                {/* Medical Council Search Section (TG Only - TGMC has API, APMC doesn't) */}
                                {appConfig.region === 'TG' && (
                                    <>
                                        <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <FormLabel>Search by {appConfig.medicalCouncil} Reg. No</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={`Enter ${appConfig.medicalCouncilShort} ID to fetch details`}
                                                            value={searchTgmcId}
                                                            onChange={(e) => setSearchTgmcId(e.target.value)}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="mb-[2px]"
                                                    onClick={searchDetails}
                                                    disabled={isSearching}
                                                >
                                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Details"}
                                                </Button>
                                            </div>
                                            <p className="text-red-500 text-xs text-muted-foreground -mt-3 mb-2">
                                                If details are not found, you can still register by filling the form manually.
                                            </p>

                                            {searchResults.length > 0 && (
                                                <div className="space-y-2 mt-2 border-t pt-2">
                                                    <p className="text-sm font-medium text-slate-700">Select your profile:</p>
                                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                                        {searchResults.map((doc, idx) => (
                                                            <div key={idx} className="p-3 bg-white border rounded cursor-pointer hover:border-primary flex justify-between items-center" onClick={() => handleAutoFill(doc)}>
                                                                <div className="text-sm">
                                                                    <p className="font-bold">{doc.fullname}</p>
                                                                    <p className="text-xs text-muted-foreground">{[doc.address1, doc.address2].filter(Boolean).join(", ")}</p>
                                                                    <p className="text-xs text-muted-foreground">FMR: {doc.original_fmr_no || doc.fmr_no}</p>
                                                                </div>
                                                                <Button size="sm" variant="ghost" type="button">Select</Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2"> <hr /> </div>
                                    </>
                                )}

                                {/* Main Form Fields */}
                                <div className="space-y-4">
                                    {membershipType !== 'Student' && (
                                        <FormField
                                            control={form.control}
                                            name="tgmcId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{appConfig.medicalCouncilId}</FormLabel>
                                                    <FormControl><Input placeholder={`Confirmation of your ${appConfig.medicalCouncilShort} ID`} {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {membershipType === 'Student' && (
                                        <div className="space-y-4 border p-4 rounded-lg bg-blue-50/50">
                                            <h3 className="font-semibold text-sm text-blue-800">Student Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="mbbsOrPgYear" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>MBBS or PG Year</FormLabel>
                                                        <FormControl><Input placeholder="e.g. 2nd Year MBBS" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="yearOfAdmission" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Year of Admission</FormLabel>
                                                        <FormControl><Input placeholder="e.g. 2022" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <FormField control={form.control} name="universityRegNumber" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>University Reg Number for Exams</FormLabel>
                                                    <FormControl><Input placeholder="Registration Number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="collegeName" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>College Name</FormLabel>
                                                        <FormControl><Input placeholder="Medical College" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="universityName" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>University Name</FormLabel>
                                                        <FormControl><Input placeholder="University" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl><Input placeholder="Dr. John" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl><Input placeholder="doctor@example.com" type="email" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Choose the district you want to represent</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select District" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-[200px]">
                                                        {districts.map((d) => (
                                                            <SelectItem key={d} value={d}>
                                                                {d}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl><Input placeholder="Clinic or Home Address" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />



                                </div>

                                {appConfig.region === 'AP' && (
                                    <div className="space-y-6 pt-6 border-t border-slate-200 mt-6 bg-slate-50 p-6 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 flex-shrink-0">
                                                <BrainCircuit className="w-5 h-5 animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">Membership Profile Assessment</h3>
                                                <p className="text-xs text-slate-500">
                                                    For each statement, please select a rating from 1 to 5. <br />
                                                    <strong>1 = Strongly Disagree, 5 = Strongly Agree</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-2">
                                            {QUESTIONS.map((q) => (
                                                <div key={q.id} className="space-y-3">
                                                    <label className="text-sm font-medium text-slate-700 block leading-relaxed">
                                                        <span className="text-primary font-bold mr-1">{q.id}.</span> {q.text}
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((score) => {
                                                                const isSelected = assessmentAnswers[q.id] === score;
                                                                return (
                                                                    <button
                                                                        key={score}
                                                                        type="button"
                                                                        onClick={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: score }))}
                                                                        className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                                                                            isSelected
                                                                                ? "bg-primary text-white scale-110 shadow-md ring-2 ring-primary/20"
                                                                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                                                                        }`}
                                                                    >
                                                                        {score}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {assessmentAnswers[q.id] === 1 && "Strongly Disagree"}
                                                            {assessmentAnswers[q.id] === 2 && "Disagree"}
                                                            {assessmentAnswers[q.id] === 3 && "Neutral"}
                                                            {assessmentAnswers[q.id] === 4 && "Agree"}
                                                            {assessmentAnswers[q.id] === 5 && "Strongly Agree"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full mt-6" size="lg" disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {appConfig.region === 'AP' && (membershipType === 'Student' || membershipType === 'Contributory' || membershipType === 'Founders') 
                                                ? "Submitting Registration..." 
                                                : "Processing Payment..."
                                            }
                                        </>
                                    ) : (
                                        <>
                                            {appConfig.region === 'AP' ? (
                                                (membershipType === 'Student' || membershipType === 'Contributory' || membershipType === 'Founders') ? (
                                                    "Register Membership (Free)"
                                                ) : (
                                                    `Pay & Register ₹${membershipType === 'General' ? '500' : '1,500'}`
                                                )
                                            ) : (
                                                `Pay & Register ₹${appConfig.registrationFee}`
                                            )}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
