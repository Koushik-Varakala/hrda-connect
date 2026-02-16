"use client";

import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Panel } from "@shared/schema";
import { Vote, FileText, Eye, FileDown } from "lucide-react";

export default function ElectionPanel() {
    const { data: panels } = useQuery<Panel[]>({
        queryKey: ["/api/panels"],
        queryFn: async () => {
            const res = await fetch("/api/panels");
            if (!res.ok) throw new Error("Failed to fetch panels");
            return res.json();
        }
    });

    const electedMembers = panels?.filter(p => p.category === 'elected_member') || [];

    // Election Documents
    const { data: documents = [] } = useQuery<any[]>({
        queryKey: ["/api/election-documents"],
        queryFn: async () => {
            const res = await fetch("/api/election-documents");
            if (!res.ok) throw new Error("Failed to fetch election documents");
            return res.json();
        }
    });

    return (
        <Layout>
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-4">January 2026</Badge>
                    <h1 className="text-4xl text-headline md:text-6xl font-serif font-bold mb-6">Elected Panel Members & Notifications</h1>
                </div>
            </div>

            <div className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    {/* Elected Members */}
                    <div className="mb-16">
                        <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2 text-slate-900">
                            <Vote className="w-6 h-6 text-primary" />
                            Elected Panel Members
                        </h3>

                        {electedMembers.length === 0 ? (
                            <div className="text-slate-500 italic text-center py-10 bg-white rounded-xl border border-dashed">No members added yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {electedMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/30 group"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-32 h-32 rounded-full bg-slate-100 mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                                                {member.imageUrl ? (
                                                    <img
                                                        src={member.imageUrl}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-bold text-slate-300">
                                                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none mb-2">
                                                {member.role || "Elected Member"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Election Documents */}
            <div className="py-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-2 text-slate-900">
                        <FileText className="w-6 h-6 text-primary" />
                        Election Documents & Notices
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc: any, i: number) => (
                            <Dialog key={doc.id || i}>
                                <div className="group border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-slate-50 hover:bg-white hover:border-primary/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="secondary" className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20">
                                            {doc.category}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-medium">{doc.date}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2" title={doc.title}>
                                        {doc.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                                        {doc.description}
                                    </p>

                                    <div className="flex gap-2 mt-auto">
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-primary hover:text-white transition-colors">
                                                <Eye className="w-4 h-4" /> View
                                            </Button>
                                        </DialogTrigger>
                                        <Button asChild variant="ghost" size="sm" className="px-2 text-slate-400 hover:text-primary">
                                            <a
                                                href={doc.filename.startsWith('http') ? doc.filename : `/documents/${doc.filename}`}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileDown className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                                    <DialogHeader className="p-4 border-b">
                                        <DialogTitle>{doc.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 w-full bg-slate-100 overflow-hidden">
                                        <iframe
                                            src={doc.filename.startsWith('http') ? doc.filename : `/documents/${doc.filename}`}
                                            className="w-full h-full border-none"
                                            title={doc.title}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
