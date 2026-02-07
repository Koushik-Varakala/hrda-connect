import { Layout } from "@/components/Layout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MediaCoverage } from "@shared/schema";

export default function Media() {
    const [selectedMedia, setSelectedMedia] = useState<MediaCoverage | null>(null);

    const { data: mediaItems, isLoading } = useQuery<MediaCoverage[]>({
        queryKey: ["/api/media-coverage"],
    });

    return (
        <Layout>
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-800 opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl text-headline md:text-6xl font-serif font-bold mb-6"
                    >
                        Media Coverage
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-300 max-w-3xl mx-auto"
                    >
                        Tracking the impact of HRDA's advocacy through the lens of the press.
                    </motion.p>
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mediaItems?.map((item) => (
                                <MediaCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => setSelectedMedia(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        {selectedMedia && (
                            <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
                                <div className="flex-1 bg-black/5 overflow-auto relative flex items-center justify-center p-4">
                                    <img
                                        src={selectedMedia.imageUrl}
                                        alt={selectedMedia.title}
                                        className="max-w-full max-h-full object-contain shadow-lg"
                                    />
                                </div>
                                <div className="p-4 bg-white border-t">
                                    <h3 className="text-xl font-bold font-serif">{selectedMedia.title}</h3>
                                    <p className="text-muted-foreground mt-1">{selectedMedia.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

function MediaCard({ item, onClick }: { item: MediaCoverage, onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={onClick}
        >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold font-serif">{item.title}</h3>
                    {item.date && <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">{new Date(item.date).getFullYear()}</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{item.description}</p>
            </div>
        </motion.div>
    );
}
