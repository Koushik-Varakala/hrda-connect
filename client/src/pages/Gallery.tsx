import { useQuery } from "@tanstack/react-query";
import type { GalleryPhoto } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { GallerySlideshow } from "@/components/GallerySlideshow";
import { Layout } from "@/components/Layout";

export default function GalleryPage() {
    const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
        queryKey: ["/api/gallery"],
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
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Slideshow at the bottom as requested */}
                <GallerySlideshow />
            </div>
        </Layout>
    );
}
