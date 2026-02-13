"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { GalleryPhoto, InsertGalleryPhoto } from "@shared/schema";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGalleryPhotoSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";

export default function ManageGallery() {
    const { toast } = useToast();
    const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
        queryKey: ["/api/gallery"],
    });

    const form = useForm<InsertGalleryPhoto>({
        resolver: zodResolver(insertGalleryPhotoSchema),
        defaultValues: {
            url: "",
            title: "",
            description: "",
            active: true,
        },
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const createMutation = useMutation({
        mutationFn: async (data: InsertGalleryPhoto) => {
            const res = await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to add photo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
            form.reset();
            setSelectedFile(null);
            toast({ title: "Success", description: "Photo added to gallery" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");
        const data = await res.json();
        return data.url;
    };

    async function onSubmit(data: InsertGalleryPhoto) {
        try {
            if (selectedFile) {
                setIsUploading(true);
                const url = await uploadFile(selectedFile);
                data.url = url;
                setIsUploading(false);
            }

            if (!data.url) {
                toast({ title: "Error", description: "Please provide an image URL or upload a file", variant: "destructive" });
                return;
            }

            createMutation.mutate(data);
        } catch (error: any) {
            setIsUploading(false);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/gallery/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete photo");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
            toast({ title: "Success", description: "Photo removed from gallery" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Manage Gallery</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Photo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormItem>
                                    <FormLabel>Upload Image</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setSelectedFile(e.target.files[0]);
                                                    form.setValue("url", "");
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>

                                <div className="text-center text-sm text-muted-foreground">- OR -</div>

                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL (External)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://..."
                                                    {...field}
                                                    disabled={!!selectedFile}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Event Title" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Short description" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" disabled={createMutation.isPending || isUploading}>
                                    {createMutation.isPending || isUploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    {isUploading ? "Uploading..." : "Add Photo"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : photos?.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden group">
                            <div className="aspect-video relative">
                                <img
                                    src={photo.url}
                                    alt={photo.title || "Gallery"}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate(photo.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                {photo.title ? (
                                    <h3 className="font-semibold">{photo.title}</h3>
                                ) : (
                                    <span className="text-slate-400 italic">No Title</span>
                                )}
                                {photo.description && (
                                    <p className="text-sm text-slate-500 mt-1">{photo.description}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
