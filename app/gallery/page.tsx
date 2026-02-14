"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GalleryPhoto } from "@shared/schema";
import { Loader2, X } from "lucide-react";
import { GallerySlideshow } from "@/components/GallerySlideshow";
import { Layout } from "@/components/Layout";

export default function GalleryPage() {
    const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
    const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
        queryKey: ["/api/gallery"],
        queryFn: async () => {
            const res = await fetch("/api/gallery");
            if (!res.ok) throw new Error("Failed to fetch gallery photos");
            return res.json();
        }
    });

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50">
                {/* Hero Section */}
                <div className="bg-[#1a237e] text-white py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                        <h1 className="text-headline text-4xl md:text-5xl font-bold mb-4 font-serif">Media Gallery</h1>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : !photos || photos.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <p className="text-xl">No photos available in the gallery yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="group relative overflow-hidden rounded-xl shadow-md cursor-pointer aspect-[4/3] bg-white"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.title || "Gallery Photo"}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                        <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {photo.title && (
                                                <h3 className="text-xl font-bold mb-1">{photo.title}</h3>
                                            )}
                                            {photo.description && (
                                                <p className="text-sm text-slate-200">{photo.description}</p>
                                            )}
                                            <p className="text-xs text-slate-300 mt-2 bg-white/20 inline-block px-3 py-1 rounded-full">Click to View</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox Overlay */}
                {selectedPhoto && (
                    <div
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <div className="relative max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.title || "Full View"}
                                className="max-h-[85vh] max-w-full object-contain rounded-md shadow-2xl"
                            />
                            {(selectedPhoto.title || selectedPhoto.description) && (
                                <div className="mt-4 text-center text-white max-w-2xl px-4">
                                    {selectedPhoto.title && <h3 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h3>}
                                    {selectedPhoto.description && <p className="text-slate-300">{selectedPhoto.description}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Slideshow at the bottom as requested */}
                <GallerySlideshow />
            </div>
        </Layout>
    );
}
