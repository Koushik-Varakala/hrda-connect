"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { appConfig } from "@/lib/app-config";

export default function Membership() {
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    return (
        <Layout>
            <div className="bg-primary py-20 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Become a Member</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        {appConfig.registrationTagline}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">

                    {/* Left column: Why Join + HRDA movement block */}
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
                                    <span className="text-slate-700">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* HRDA Movement Description */}
                        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <p className="text-sm font-bold text-slate-900 mb-3">
                                ✅ HRDA (Healthcare Reforms Doctors Association) is a doctor-driven movement working for:
                            </p>
                            <ul className="space-y-2 mb-5">
                                {[
                                    `Healthcare reforms in ${appConfig.stateName} (Rural & Urban)`,
                                    "Doctors' rights, dignity & safety",
                                    "Ethical medical practice",
                                    "Strict action against quackery & illegal healthcare",
                                    "Support for medical students & residents",
                                    "Stronger primary healthcare & public health initiatives",
                                ].map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-orange-400 flex-shrink-0 mt-0.5">◆</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Donation Promo Box (AP Only) */}
                        {appConfig.region === 'AP' && (
                            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                                <span className="text-3xl mb-2 block">💝</span>
                                <h3 className="text-base font-bold text-emerald-950 mb-1">Support the HRDA Movement</h3>
                                <p className="text-xs text-emerald-800 mb-4 leading-relaxed">
                                    Your contributions power our legal battles, healthcare reform advocacy, and campaigns for doctors' rights across Andhra Pradesh.
                                </p>
                                <Button 
                                    onClick={() => (window as any).triggerDonationModal?.()} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 py-2 rounded-lg"
                                >
                                    Donate Here
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right column: Form */}
                    <div>
                        {isSuccess ? (
                            <Card className="border-2 border-green-200 bg-green-50">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-green-900 mb-3">Registration Successful!</h3>
                                        <p className="text-green-800 mb-4">
                                            Your membership application has been received. You will receive a confirmation email shortly.
                                        </p>
                                        <Button
                                            onClick={() => setIsSuccess(false)}
                                            variant="outline"
                                            className="border-green-600 text-green-700 hover:bg-green-100"
                                        >
                                            Register Another Member
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <RegistrationForm 
                                onSuccess={() => {
                                    setIsSuccess(true);
                                    toast({
                                        title: "Registration Successful",
                                        description: "Welcome to HRDA! Please check your email for confirmation.",
                                        duration: 5000,
                                    });
                                }} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
