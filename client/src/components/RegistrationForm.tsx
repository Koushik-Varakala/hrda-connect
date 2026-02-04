import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form Schema
const registrationSchema = z.object({
    firstName: z.string().min(2, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),
    tgmcId: z.string().min(3, "TGMC ID is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Valid phone number required"),
    address: z.string().min(5, "Address is required"),
    // Couple specific
    spouseName: z.string().optional(),
    spouseTgmcId: z.string().optional(),
});

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
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            tgmcId: "",
            email: "",
            phone: "",
            address: "",
            spouseName: "",
            spouseTgmcId: "",
        },
    });

    const onSubmit = async (data: RegistrationFormValues) => {
        setIsProcessing(true);
        try {
            const amount = 1015;

            // 1. Create Order
            const orderRes = await apiRequest("POST", "/api/registrations/order", {
                amount,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`
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
                                    name="tgmcId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>TGMC ID</FormLabel>
                                            <FormControl><Input placeholder="12345" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                            </div>

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
    );
}
