"use client";

import { appConfig } from "@/lib/app-config";
import { Info, Construction } from "lucide-react";

export function DevelopmentBanner() {
    // Only show on AP site
    if (appConfig.region !== 'AP') return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-3 text-amber-900">
                    <Construction className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm sm:text-base font-medium text-center">
                        <span className="font-bold">AP Site Under Development:</span> HRDA Andhra Pradesh is launching soon. Registration and some features are currently disabled.
                    </p>
                </div>
            </div>
        </div>
    );
}
