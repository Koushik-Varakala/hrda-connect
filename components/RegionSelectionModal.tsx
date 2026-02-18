"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { appConfig } from "@/lib/app-config";

const REGION_URLS = {
    TG: process.env.NODE_ENV === 'production' ? 'https://hrda-india.org' : 'http://localhost:3000',
    AP: process.env.NODE_ENV === 'production' ? 'https://ap.hrda-india.org' : 'http://localhost:3000',
} as const;

export function RegionSelectionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Skip modal if user is on the registration page (direct link)
        const isRegisterPage = window.location.pathname.includes('register');
        if (isRegisterPage) {
            // Auto-mark as visited so modal never shows on this visit
            localStorage.setItem('regionPreferenceSet', 'true');
            setIsOpen(false);
            return;
        }
        // Check if user has already selected a region
        const hasVisited = localStorage.getItem('regionPreferenceSet');
        if (!hasVisited) {
            setIsOpen(true);
        }
    }, []);

    const handleRegionSelect = (selectedRegion: 'TG' | 'AP') => {
        // Store preference
        localStorage.setItem('regionPreferenceSet', 'true');
        localStorage.setItem('regionPreference', selectedRegion);

        // If selected region matches current site, just close modal
        if (selectedRegion === appConfig.region) {
            setIsOpen(false);
            return;
        }

        // Otherwise, redirect to the other subdomain
        const targetUrl = REGION_URLS[selectedRegion];
        const currentPath = window.location.pathname;
        window.location.href = `${targetUrl}${currentPath}`;
    };

    // Don't render anything on server
    if (!isClient) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl max-w-[95vw] mx-4">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-serif text-center mb-2">
                        Welcome to HRDA
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm sm:text-base">
                        Please select your region to view relevant content
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                    {/* Telangana Card */}
                    <button
                        onClick={() => handleRegionSelect('TG')}
                        className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-primary transition-all p-4 sm:p-6 text-left hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] sm:min-h-auto"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Telangana</h3>
                            </div>

                            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                                Access HRDA Telangana branch with information about TGMC, 33 districts, and our achievements including the historic 2023 council elections.
                            </p>

                            <div className="flex items-center gap-2 text-primary font-medium text-xs sm:text-sm">
                                <span>Visit Telangana Site</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </button>

                    {/* Andhra Pradesh Card */}
                    <button
                        onClick={() => handleRegionSelect('AP')}
                        className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-primary transition-all p-4 sm:p-6 text-left hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[160px] sm:min-h-auto"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Andhra Pradesh</h3>
                            </div>

                            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                                Access HRDA Andhra Pradesh branch with information about APMC, 25 districts, and our growing movement for healthcare reform.
                            </p>

                            <div className="flex items-center gap-2 text-primary font-medium text-xs sm:text-sm">
                                <span>Visit Andhra Pradesh Site</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </button>
                </div>

                <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4">
                    You can switch regions anytime using the toggle in the navigation bar
                </p>
            </DialogContent>
        </Dialog>
    );
}
