"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Mail, ShieldAlert } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 md:px-6 py-12 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
                {/* Logo & Alert Badge */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                        <AlertTriangle className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" /> SYSTEM ERROR ENCOUNTERED
                    </div>
                </div>

                {/* Title & Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-serif font-bold text-slate-900">
                        Something Went Wrong
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We encountered an unexpected error while loading this page on the HRDA Portal. Our technical team has been notified.
                    </p>
                </div>

                {/* Optional Error Digest / details */}
                {error?.message && (
                    <div className="p-3 rounded-lg bg-slate-100/80 border border-slate-200 text-left overflow-x-auto">
                        <p className="text-xs font-mono text-slate-700 break-words line-clamp-3">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm h-11 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" className="w-full h-10 border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Link href="/">
                                <Home className="w-4 h-4 mr-1.5" /> Home
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="w-full h-10 border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Link href="/contact">
                                <Mail className="w-4 h-4 mr-1.5" /> Support
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                    Healthcare Reforms Doctors Association Official Portal
                </p>
            </div>
        </div>
    );
}
