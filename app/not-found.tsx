import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft, Search, Scale, ShieldCheck } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 md:px-6 py-12 font-sans">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10 text-center space-y-6">
                {/* Logo & 404 Badge */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <FileQuestion className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide">
                        404 • PAGE NOT FOUND
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">
                        Document or Page Unavailable
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                        The requested official page or document could not be located. It may have been archived, updated, or moved to another section of the HRDA Portal.
                    </p>
                </div>

                {/* Quick Directory navigation */}
                <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Recommended Official Portals
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-left">
                        <Link
                            href="/"
                            className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                                <Home className="w-4 h-4 text-blue-600" /> Home Page
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Main Portal &amp; Updates</div>
                        </Link>

                        <Link
                            href="/rmp"
                            className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                                <Scale className="w-4 h-4 text-blue-600" /> RMP Portal
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Anti-Quackery &amp; Law</div>
                        </Link>

                        <Link
                            href="/panels"
                            className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-blue-600" /> State Panels
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Leadership Directory</div>
                        </Link>

                        <Link
                            href="/search"
                            className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-1.5">
                                <Search className="w-4 h-4 text-blue-600" /> Search Site
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">Find Documents</div>
                        </Link>
                    </div>
                </div>

                {/* Primary Back Button */}
                <div className="pt-4 border-t border-slate-100">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg shadow-sm">
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Homepage
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
