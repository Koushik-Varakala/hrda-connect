"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "@/hooks/use-announcements";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnnouncementSchema } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ManageAnnouncements() {
    const { data: announcements, isLoading } = useAnnouncements();
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();
    const deleteMutation = useDeleteAnnouncement();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(insertAnnouncementSchema),
        defaultValues: {
            title: "",
            content: "",
            date: new Date().toISOString().split('T')[0],
            active: true,
        }
    });

    const onSubmit = (data: any) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, ...data }, {
                onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); form.reset(); }
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => { setIsDialogOpen(false); form.reset(); }
            });
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        form.reset({
            ...item,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this announcement?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Announcements</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); form.reset(); } }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Announcement</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Announcement" : "New Announcement"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input {...form.register("title")} />
                                {form.formState.errors.title && <p className="text-red-500 text-xs">{form.formState.errors.title.message as string}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium">Content</label>
                                <Textarea {...form.register("content")} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" {...form.register("date")} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={form.watch("active") ?? true}
                                    onCheckedChange={(checked) => form.setValue("active", checked)}
                                />
                                <label className="text-sm font-medium">Active</label>
                            </div>
                            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editingItem ? "Update" : "Create"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                        ) : announcements?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {item.active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
