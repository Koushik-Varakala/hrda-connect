"use client";

import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import type { GalleryPhoto } from "@shared/schema";
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function GallerySlideshow() {
    const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
        queryKey: ["/api/gallery"],
        queryFn: async () => {
            const res = await fetch("/api/gallery");
            if (!res.ok) throw new Error("Failed to fetch gallery photos");
            return res.json();
        }
    });

    // Carousel Configuration
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "center",
        skipSnaps: false,
    }, [
        Autoplay({ delay: 4000, stopOnInteraction: false })
    ]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20 bg-slate-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!photos || photos.length === 0) {
        return null;
    }

    // Create a buffer of slides to ensure smooth infinite loop feeling
    // If fewer than 5 photos, multiply them significantly. If more, just double.
    const displayPhotos = photos.length < 5
        ? [...photos, ...photos, ...photos, ...photos]
        : [...photos, ...photos];

    return (
        <div className="w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-20 overflow-hidden relative">
            <div className="relative max-w-[1400px] mx-auto group/carousel">
                {/* Navigation Buttons */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 hidden md:block"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 hidden md:block"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>

                <div className="embla overflow-visible" ref={emblaRef}>
                    <div className="flex touch-pan-y items-center">
                        {displayPhotos.map((photo, index) => {
                            const isActive = index === selectedIndex;
                            return (
                                <div
                                    key={`${photo.id}-${index}`}
                                    className="flex-[0_0_85%] md:flex-[0_0_60%] lg:flex-[0_0_50%] min-w-0 px-4 transition-all duration-500 ease-out"
                                    style={{
                                        transform: isActive ? "scale(1)" : "scale(0.9)",
                                        opacity: isActive ? 1 : 0.4,
                                        zIndex: isActive ? 10 : 0
                                    }}
                                >
                                    <div className={cn(
                                        "relative overflow-hidden rounded-2xl transition-all duration-500",
                                        isActive
                                            ? "border-[4px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                            : "border border-slate-700/50 grayscale-[50%]"
                                    )}>
                                        <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[16/8] relative">
                                            <img
                                                src={photo.url}
                                                alt={photo.title || "Gallery"}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />

                                            {/* Gradient Overlay */}
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500",
                                                isActive ? "opacity-100" : "opacity-0"
                                            )} />

                                            {/* Content Overlay (Active Only) */}
                                            <div className={cn(
                                                "absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row justify-between items-end gap-6 transition-all duration-500 transform",
                                                isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                            )}>
                                                <div className="max-w-xl text-left">
                                                    {photo.title && (
                                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                                                            {photo.title}
                                                        </h3>
                                                    )}
                                                    {photo.description && (
                                                        <p className="text-slate-300 text-sm md:text-base line-clamp-2 md:line-clamp-none drop-shadow-sm">
                                                            {photo.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Pinned CTA Button */}
                                                <Button size="lg" className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-blue-500/25 transition-all group/btn" asChild>
                                                    <Link href="/gallery" className="flex items-center gap-2">
                                                        View Gallery
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
