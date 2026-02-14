"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentFailed() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-md mx-auto">
                    <Card className="shadow-xl border-t-8 border-t-red-500">
                        <CardContent className="p-8 text-center bg-red-50">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-red-800">Payment Failed</h3>
                            <p className="text-muted-foreground mb-6">
                                Unfortunately, we could not process your payment. This could be due to a declined transaction or a network error.
                            </p>
                            <div className="space-y-3">
                                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                                    <Link href="/register">
                                        Try Again
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/">
                                        <ArrowLeft className="mr-2 w-4 h-4" /> Return to Home
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        <p>If you continue to face issues, please contact us at</p>
                        <a href="mailto:hrda4people@gmail.com" className="text-primary hover:underline font-medium">hrda4people@gmail.com</a>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
