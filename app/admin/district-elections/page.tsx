"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, FileText, Upload, ExternalLink } from "lucide-react";
import { ElectionDocument } from "@shared/schema";

export default function ManageDistrictElectionDocs() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateStr, setDateStr] = useState(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    const [file, setFile] = useState<File | null>(null);

    const { data: documents, isLoading } = useQuery<ElectionDocument[]>({
        queryKey: ["/api/district-election-docs"],
        queryFn: async () => {
            const res = await fetch("/api/district-election-docs");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/district-election-docs", { method: "POST", body: formData });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Upload failed"); }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/district-election-docs"] });
            toast({ title: "Uploaded", description: "Document uploaded successfully." });
            setTitle(""); setDescription(""); setFile(null);
            const fi = document.getElementById("de-file-upload") as HTMLInputElement;
            if (fi) fi.value = "";
        },
        onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
        onSettled: () => setIsUploading(false),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/district-election-docs/${id}`, { method: "DELETE" });
            if (!res.ok && res.status !== 204) throw new Error("Delete failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/district-election-docs"] });
            toast({ title: "Deleted", description: "Document removed." });
        },
        onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            toast({ title: "Missing fields", description: "Title and PDF file are required.", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("description", description);
        fd.append("date", dateStr);
        uploadMutation.mutate(fd);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    District Elections – Documents
                </h1>
                <p className="text-muted-foreground mt-2">
                    Upload official PDFs for the HRDA Telangana District Elections page.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <Card className="lg:col-span-1 shadow-md border-t-4 border-t-blue-500">
                    <CardHeader>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>Add a new PDF — it will appear on the District Elections public page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="de-title">Document Title *</Label>
                                <Input id="de-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Election Schedule 2026" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="de-desc">Description (Optional)</Label>
                                <Input id="de-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="de-date">Display Date</Label>
                                <Input id="de-date" value={dateStr} onChange={e => setDateStr(e.target.value)} placeholder="e.g. 28 May 2026" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>PDF File *</Label>
                                <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                                    <input
                                        id="de-file-upload"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-emerald-600 truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-slate-600">Click to select PDF</p>
                                            <p className="text-xs text-slate-400">Max 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isUploading || uploadMutation.isPending}>
                                {isUploading || uploadMutation.isPending ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> Upload Document</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Document List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Uploaded Documents ({documents?.length ?? 0})</h2>
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : !documents || documents.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No documents uploaded yet</p>
                            <p className="text-sm mt-1">Upload a PDF to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-start justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{doc.date}</p>
                                            {doc.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{doc.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.filename)}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => { if (confirm("Delete this document?")) deleteMutation.mutate(doc.id); }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
