import React from "react";

export default function Loading() {
    return (
        <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-background p-6">
            <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
                {/* Logo with smooth pulse and subtle ring */}
                <div className="relative flex items-center justify-center p-4 rounded-2xl bg-white shadow-md border border-slate-100">
                    <img
                        src="/hrda_full_logo.png"
                        alt="HRDA Logo"
                        className="h-14 w-auto object-contain animate-pulse"
                    />
                </div>

                {/* Smooth Loading Indicator */}
                <div className="space-y-3 w-full">
                    <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                        <div className="w-1/2 h-full bg-blue-600 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 tracking-wide">
                        Loading HRDA Portal...
                    </p>
                    <p className="text-xs text-slate-400">
                        Advocating for Doctors &amp; Public Health
                    </p>
                </div>
            </div>
        </div>
    );
}
