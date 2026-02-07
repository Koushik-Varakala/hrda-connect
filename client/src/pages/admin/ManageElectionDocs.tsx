import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, FileText, Upload } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AdminLayout } from "@/components/AdminLayout";
import { ElectionDocument } from "@shared/schema";
import { format } from "date-fns";

export default function ManageElectionDocs() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Notices");
    const [dateStr, setDateStr] = useState(format(new Date(), "MMM d, yyyy"));
    const [file, setFile] = useState<File | null>(null);

    const { data: documents, isLoading } = useQuery<ElectionDocument[]>({
        queryKey: ["/api/election-documents"],
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await fetch("/api/election-documents", {
                method: "POST",
                body: formData, // Browser automatically sets Content-Type to multipart/form-data
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to upload");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/election-documents"] });
            toast({ title: "Success", description: "Document uploaded successfully" });
            // Reset form
            setTitle("");
            setDescription("");
            setFile(null);
            // Reset file input value manually if needed, usually via key or ref
            (document.getElementById("file-upload") as HTMLInputElement).value = "";
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
        onSettled: () => setIsUploading(false),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/election-documents/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/election-documents"] });
            toast({ title: "Success", description: "Document deleted" });
        },
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !category) {
            toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("date", dateStr);

        uploadMutation.mutate(formData);
    };

    const categories = ["Foundational", "Candidates", "Notices", "Ballots", "Results", "Records"];

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Manage Election Documents
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and manage election-related PDFs.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <Card className="lg:col-span-1 shadow-md border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle>Upload New Document</CardTitle>
                            <CardDescription>Add a new PDF to the election panel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Document Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Election Notification"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Display Date</Label>
                                    <Input
                                        id="date"
                                        value={dateStr}
                                        onChange={(e) => setDateStr(e.target.value)}
                                        placeholder="e.g. Jan 11, 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of the document"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file-upload">PDF File</Label>
                                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {file ? (
                                            <div className="text-center">
                                                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                                                <p className="text-sm font-medium text-emerald-600 truncate max-w-[200px]">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm font-medium text-slate-700">
                                                    Tap to select PDF
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Max 10MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isUploading || uploadMutation.isPending}
                                >
                                    {isUploading || uploadMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Upload Document
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Document List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold">Existing Documents</h2>
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : documents?.length === 0 ? (
                            <p className="text-muted-foreground text-center p-8 border rounded-lg bg-slate-50">
                                No documents uploaded yet.
                            </p>
                        ) : (
                            <div className="grid gap-4">
                                {documents?.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-start justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                                                <p className="text-xs text-slate-500 mb-1">
                                                    {doc.category} • {doc.date}
                                                </p>
                                                <p className="text-sm text-slate-600 line-clamp-1">
                                                    {doc.description || doc.filename}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this document?')) {
                                                    deleteMutation.mutate(doc.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
