import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMediaCoverage, useCreateMediaCoverage, useUpdateMediaCoverage, useDeleteMediaCoverage } from "@/hooks/use-media-coverage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMediaCoverageSchema } from "@shared/schema";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ManageMedia() {
    const { data: mediaItems, isLoading } = useMediaCoverage();
    const createMutation = useCreateMediaCoverage();
    const updateMutation = useUpdateMediaCoverage();
    const deleteMutation = useDeleteMediaCoverage();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(insertMediaCoverageSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
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
        if (confirm("Delete this media item?")) deleteMutation.mutate(id);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Media Coverage</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingItem(null); form.reset(); } }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Clipping</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Coverage" : "New Coverage"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input {...form.register("title")} placeholder="Headline" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea {...form.register("description")} placeholder="Summary of the news..." />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Image URL</label>
                                <Input {...form.register("imageUrl")} placeholder="/press/image.jpg" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" {...form.register("date")} />
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <Controller
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <label className="text-sm font-medium">Active (Visible)</label>
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
                            <TableHead>Preview</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                        ) : mediaItems?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <img src={item.imageUrl} alt="" className="h-10 w-auto object-contain rounded" />
                                </TableCell>
                                <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                                <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {item.active ? 'Active' : 'Hidden'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {mediaItems?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">No media items found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
