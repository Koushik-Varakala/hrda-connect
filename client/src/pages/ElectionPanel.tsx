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
    });

    const electedMembers = panels?.filter(p => p.category === 'elected_member') || [];

    // Manifesto Points - Keeping static as they are historical/fixed for this election context
    const manifestoPoints = [
        "State-of-the-Art TSMC Building",
        "Eradication of Quackery & Crosspathy",
        "Digital Transformation (Online NOCs/Registrations)",
        "Affordable Fees (Rationalized charges)",
        "Enforcing Ethics & Professional Dignity",
        "FMGE & Stipend Reforms",
        "Professional Development (CME credits)",
        "Accountability (Audit of last 15 years)",
        "Senior Doctor Support (Helpdesk for >60 yrs)"
    ];

    // Election Documents
    const { data: documents = [] } = useQuery<any[]>({
        queryKey: ["/api/election-documents"],
    });

    return (
        <Layout>
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-4">January 2026</Badge>
                    <h1 className="text-4xl text-headline md:text-6xl font-serif font-bold mb-6">Election Panel</h1>

                </div>
            </div>

            <div className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Manifesto */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2 text-slate-900">
                                <FileText className="w-6 h-6 text-primary" />
                                Our Vision (Manifesto)
                            </h3>
                            <ul className="grid gap-3">
                                {manifestoPoints.map((point, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Elected Members */}
                        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
                            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                <Vote className="w-6 h-6 text-green-400" />
                                The Elected Panel
                            </h3>

                            {electedMembers.length === 0 ? (
                                <div className="text-slate-400 italic">No members added yet.</div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {electedMembers.map((member) => (
                                        <Badge key={member.id} className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-3 py-1.5 text-base whitespace-nowrap">
                                            {member.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <p className="text-slate-400 italic">
                                    "Probably for the first time in history, a single panel has won all elected positions."
                                </p>
                            </div>
                        </div>

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
                        {documents.map((doc, i) => (
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
                                            <a href={`/documents/${doc.filename}`} download target="_blank" rel="noopener noreferrer">
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
                                            src={`/documents/${doc.filename}`}
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
