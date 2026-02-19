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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { appConfig } from "@/lib/app-config";

// Form Schema
const registrationSchema = z.object({
    firstName: z.string().min(2, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),
    tgmcId: z.string().min(3, `${appConfig.medicalCouncilShort} ID is required`),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number required"),
    address: z.string().min(5, "Address is required"),
    district: z.string().min(1, "District is required"),
    // Couple specific
    spouseName: z.string().optional(),
    spouseTgmcId: z.string().optional(),
});

const districts = appConfig.districts;

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    onSuccess: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
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
        },
    });

    const onSubmit = async (data: RegistrationFormValues) => {
        setIsProcessing(true);
        try {
            const amount = 1015;

            // 1. Create Order (with userData embedded in notes for webhook recovery)
            const orderRes = await apiRequest("POST", "/api/registrations/order", {
                amount,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
                userData: { ...data, membershipType: 'single' }
            });
            const order = await orderRes.json();


            // 2. Open Razorpay
            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "HRDA Telangana",
                description: "Lifetime Membership",
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify & Save Registration
                    setIsVerifyingPayment(true); // Show verification popup
                    try {
                        await apiRequest("POST", "/api/registrations/verify", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            userData: {
                                ...data,
                                membershipType: 'single'
                            }
                        });
                        const { location } = window;
                        location.href = "/thank-you";
                    } catch (err) {
                        setIsVerifyingPayment(false); // Hide popup on error
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
                theme: {
                    color: "#2563eb"
                }
            };

            // Handle Mock Mode
            if (order.key_id === "rzp_test_mock_key") {
                // Bypass Razorpay logic for local dev
                console.log("Using Mock Payment Flow");
                options.handler({
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id: order.id,
                    razorpay_signature: "mock_signature"
                });
                return;
            }


            const rzp1 = new window.Razorpay(options);

            rzp1.on('payment.failed', function (response: any) {
                console.error("Payment Failed Details:", response);
                alert(`Payment Failed: ${response.error.description} (Code: ${response.error.code})`);
                // Redirect to failure page with error reason if needed
                window.location.href = `/payment-failed?reason=${encodeURIComponent(response.error.description)}`;
            });

            rzp1.open();

        } catch (error) {
            toast({
                title: "Registration Failed",
                description: "Could not initiate payment. Please try again.",
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

                        <div className="bg-primary/5 p-4 rounded-lg mb-8 text-center border border-primary/20">
                            <p className="font-semibold text-primary">Lifetime Membership: ₹1015</p>
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

                                <Button type="submit" className="w-full mt-6" size="lg" disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            Pay & Register ₹1015
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
