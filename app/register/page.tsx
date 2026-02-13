"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useState } from "react";

export default function Membership() {
    const [isSuccess, setIsSuccess] = useState(false);
    return (
        <Layout>
            <div className="bg-primary py-20 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Become a Member</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Join the strongest voice for doctors in Telangana. Your support strengthens our cause.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">

                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900">Why Join HRDA?</h2>
                        <div className="space-y-4">
                            {[
                                "Representation in government policy making",
                                "Legal and professional support",
                                "Networking with medical professionals across the state",
                                "Access to academic workshops and conferences",
                                "A unified voice against violence and injustice"
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-700">{benefit}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-lg mb-2">Have Questions?</h3>
                            <p className="text-slate-600 mb-1">Email us at: <span className="font-medium text-primary">hrda4people@gmail.com</span></p>
                            <p className="text-slate-600">We are here to help you with the registration process.</p>
                        </div>
                    </div>

                    {isSuccess ? (
                        <Card className="shadow-xl border-t-8 border-t-green-500">
                            <CardContent className="p-8 text-center bg-green-50">
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-green-800">Registration Successful!</h3>
                                <p className="text-muted-foreground mb-6">
                                    Thank you for joining HRDA. Your membership details have been recorded.
                                    A confirmation email has been sent to your registered address.
                                </p>
                                <Button onClick={() => setIsSuccess(false)} variant="outline">
                                    Register Another Member
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <RegistrationForm onSuccess={() => setIsSuccess(true)} />
                    )}

                </div>
            </div>
        </Layout>
    );
}
