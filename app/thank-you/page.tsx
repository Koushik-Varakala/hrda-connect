"use client";

import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYou() {
    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-xl w-full text-center shadow-xl border-t-8 border-t-green-500">
                    <CardContent className="pt-12 pb-12 px-6">
                        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-800 mb-4">Registration Successful!</h1>

                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Thank you for becoming a member of HRDA. <br />
                            Your transaction has been completed successfully.
                        </p>

                        <div className="bg-blue-50 p-6 rounded-lg mb-8 text-left border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                            <ul className="space-y-2 text-blue-800 text-sm">
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>You will receive a confirmation email with your membership details shortly.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Our admin team will verify your details for the final approval.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>You can use the "Search" feature to find your ID and update your profile anytime.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Link href="/">
                                <Button size="lg" className="w-full sm:w-auto">Return to Home</Button>
                            </Link>
                            <Link href="/search">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">View My Profile</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
