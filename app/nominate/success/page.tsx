"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

export default function NominationSuccessPage() {
    const searchParams = useSearchParams();
    const paymentRef = searchParams.get("ref");
    const isDelayed = searchParams.get("delayed") === "true";

    return (
        <Layout>
            <div className="min-h-screen flex flex-col bg-slate-50">
                <main className="flex-1 py-16 px-4 flex items-center justify-center">
                <Card className="max-w-lg w-full shadow-xl border-t-8 border-t-green-500">
                    <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">
                        {isDelayed ? (
                            <Clock className="w-20 h-20 text-yellow-500" />
                        ) : (
                            <CheckCircle2 className="w-20 h-20 text-green-500" />
                        )}
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900">
                                {isDelayed ? "Payment Received" : "Nomination Submitted!"}
                            </h1>
                            <p className="text-slate-600 text-lg">
                                {isDelayed 
                                    ? "Your payment was successful, but there was a slight delay in updating our systems. Don't worry, your nomination is safe."
                                    : "Your nomination application for the HRDA District Elections has been successfully submitted."}
                            </p>
                        </div>

                        {paymentRef && (
                            <div className="w-full bg-slate-100 p-4 rounded-lg mt-4">
                                <p className="text-sm text-slate-500 font-medium mb-1">Payment Reference ID</p>
                                <p className="font-mono text-slate-900 font-bold">{paymentRef}</p>
                            </div>
                        )}

                        <div className="text-sm text-slate-500">
                            A confirmation email has been sent to your registered email address with all the details.
                        </div>

                        <div className="pt-6 w-full">
                            <Link href="/" className="w-full">
                                <Button className="w-full h-12 text-lg">
                                    Return to Home <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
                </main>
            </div>
        </Layout>
    );
}
