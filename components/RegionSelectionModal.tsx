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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-center mb-2">
                        Welcome to HRDA
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Please select your region to view relevant content
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Telangana Card */}
                    <button
                        onClick={() => handleRegionSelect('TG')}
                        className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-primary transition-all p-6 text-left hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Telangana</h3>
                            </div>

                            <p className="text-slate-600 text-sm mb-4">
                                Access HRDA Telangana branch with information about TGMC, 33 districts, and our achievements including the historic 2023 council elections.
                            </p>

                            <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                <span>Visit Telangana Site</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </button>

                    {/* Andhra Pradesh Card */}
                    <button
                        onClick={() => handleRegionSelect('AP')}
                        className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-primary transition-all p-6 text-left hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Andhra Pradesh</h3>
                            </div>

                            <p className="text-slate-600 text-sm mb-4">
                                Access HRDA Andhra Pradesh branch with information about APMC, 25 districts, and our growing movement for healthcare reform.
                            </p>

                            <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                <span>Visit Andhra Pradesh Site</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </button>
                </div>

                <p className="text-center text-xs text-slate-500 mt-4">
                    You can switch regions anytime using the toggle in the navigation bar
                </p>
            </DialogContent>
        </Dialog>
    );
}
