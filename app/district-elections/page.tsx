"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Calendar, Vote, ArrowRight, Loader2, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ElectionDocument } from "@shared/schema";

export default function DistrictElectionsPage() {
    const [selectedDoc, setSelectedDoc] = useState<ElectionDocument | null>(null);

    const { data: docs, isLoading } = useQuery<ElectionDocument[]>({
        queryKey: ["/api/district-election-docs"],
        queryFn: async () => {
            const res = await fetch("/api/district-election-docs");
            if (!res.ok) throw new Error("Failed to fetch documents");
            return res.json();
        },
    });

    return (
        <Layout>
            {/* Hero Banner */}
            <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)" }}
                />
                <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
                            District Elections{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                                Nomination Portal
                            </span>
                        </h1>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Apply for leadership positions in your district. Submit your nomination securely online with instant payment confirmation and email receipt.
                        </p>
                        <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 h-14 rounded-full shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
                            <Link href="/nominate">
                                <Vote className="mr-2 w-5 h-5" />
                                Submit Nomination
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Info Cards */}
            <section className="bg-white border-b border-slate-100 py-8">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { label: "28 Districts", sub: "+ 6 Hyderabad Zones" },
                            { label: "8 Posts Available", sub: "President to Executive Member" },
                            { label: "Secure Payment", sub: "Razorpay powered checkout" },
                        ].map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="text-center py-4 px-6 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-xl font-bold text-slate-900">{item.label}</p>
                                <p className="text-sm text-slate-500 mt-1">{item.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Documents Section */}
            <section className="py-16 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Election Documents</h2>
                        <p className="text-slate-500 mt-2">Click any document to view it right here on the page.</p>
                        <div className="w-16 h-1 bg-blue-500 rounded-full mt-3" />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : !docs || docs.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Documents Yet</h3>
                            <p className="text-slate-400 text-sm">Official election documents will be published here soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {docs.map((doc, i) => (
                                <motion.div key={doc.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <button
                                        onClick={() => setSelectedDoc(doc)}
                                        className="group w-full text-left flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden"
                                    >
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 flex items-center justify-between border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PDF</div>
                                                <FileText className="w-8 h-8 text-red-500" />
                                            </div>
                                            <span className="text-xs text-blue-500 font-medium group-hover:underline">View</span>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                                                {doc.title}
                                            </h3>
                                            {doc.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-grow">{doc.description}</p>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{doc.date}</span>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to nominate yourself?</h2>
                    <p className="text-blue-100 mb-6 text-base max-w-xl mx-auto">
                        Submit your nomination application securely online. Confirmation email sent instantly.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-slate-100 font-bold px-10 h-12 rounded-full shadow-xl transition-transform hover:scale-105">
                        <Link href="/nominate">Apply Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
                    </Button>
                </div>
            </section>

            {/* Inline PDF Viewer Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 md:p-6"
                        onClick={() => setSelectedDoc(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="bg-red-100 p-2 rounded-lg shrink-0">
                                        <FileText className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate text-sm md:text-base">{selectedDoc.title}</h3>
                                        <p className="text-xs text-slate-400">{selectedDoc.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <a
                                        href={selectedDoc.filename}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>
                                    <button
                                        onClick={() => setSelectedDoc(null)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer */}
                            <div className="flex-1 bg-slate-100 overflow-hidden">
                                <iframe
                                    src={selectedDoc.filename}
                                    className="w-full h-full border-0"
                                    title={selectedDoc.title}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
