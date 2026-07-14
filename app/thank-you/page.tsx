"use client";

import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { appConfig } from "@/lib/app-config";

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

                        <div className="bg-blue-50 p-6 rounded-lg mb-6 text-left border border-blue-100">
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

                        {/* Official WhatsApp Group Invite Card */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 p-6 rounded-xl mb-8 text-center shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-left">
                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-base">
                                        Join Official HRDA WhatsApp Group
                                    </h3>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                                        Connect with doctors across the region and receive important legal & policy updates.
                                    </p>
                                </div>
                                <a
                                    href={appConfig.whatsappGroupLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto"
                                >
                                    <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">
                                        Join WhatsApp Group
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <Link href="/">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">Return to Home</Button>
                            </Link>
                            <Link href="/search">
                                <Button size="lg" className="w-full sm:w-auto">View My Profile</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
