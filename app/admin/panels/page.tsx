"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePanels, useCreatePanel, useUpdatePanel, useDeletePanel } from "@/hooks/use-panels";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPanelSchema } from "@shared/schema";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ManagePanels() {
    const { data: panels, isLoading } = usePanels();
    const createMutation = useCreatePanel();
    const updateMutation = useUpdatePanel();
    const deleteMutation = useDeletePanel();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const form = useForm({
        resolver: zodResolver(insertPanelSchema),
        defaultValues: {
            name: "",
            role: "",
            district: "",
            category: "state_executive",
            isStateLevel: false,
            imageUrl: "",
            phone: "",
            priority: 99,
            active: true,
        }
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const onSubmit = (data: any) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("role", data.role);
        formData.append("category", data.category || "state_executive");

        // Logic for State/District
        let isStateLevel = data.isStateLevel;
        let district = data.district;

        if (data.category === 'elected_member') {
            isStateLevel = true;
            district = "";
        } else if (isStateLevel) {
            district = "";
        }

        formData.append("isStateLevel", String(isStateLevel));
        if (district) formData.append("district", district);

        if (data.phone) formData.append("phone", data.phone);
        if (data.priority) formData.append("priority", String(data.priority));
        formData.append("active", String(data.active ?? true));

        if (selectedFile) {
            formData.append("image", selectedFile);
        } else if (data.imageUrl) {
            formData.append("imageUrl", data.imageUrl);
        }

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, formData }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingItem(null);
                    form.reset();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue("imageUrl", ""); // Clear manual URL if file selected
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        form.reset({
            name: item.name,
            role: item.role,
            category: item.category || "state_executive",
            district: item.district || "",
            isStateLevel: item.isStateLevel,
            imageUrl: item.imageUrl || "",
            phone: item.phone || "",
            priority: item.priority || 99,
            active: item.active
        });
        setPreviewUrl(item.imageUrl || null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this member?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Panels</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingItem(null);
                        form.reset();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Member" : "New Member"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <Input {...form.register("name")} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <Input {...form.register("role")} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Controller
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "state_executive"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="state_executive">State Executive</SelectItem>
                                                <SelectItem value="elected_member">Elected Member (Election Panel)</SelectItem>
                                                <SelectItem value="district_member">District Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="flex items-center gap-2 py-2">
                                <Controller
                                    control={form.control}
                                    name="isStateLevel"
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <label className="text-sm font-medium">Is State Level? (Overrides Category default)</label>
                            </div>

                            {!form.watch("isStateLevel") && (
                                <div>
                                    <label className="text-sm font-medium">District</label>
                                    <Input {...form.register("district")} placeholder="e.g. Hyderabad" />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">Target Image</label>
                                <div className="flex flex-col gap-2">
                                    {previewUrl && (
                                        <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
                                    )}
                                    {!previewUrl && form.watch("imageUrl") && (
                                        <img src={form.watch("imageUrl")} alt="Existing" className="w-20 h-20 object-cover rounded-md border" />
                                    )}
                                    <Input type="file" accept="image/*" onChange={handleFileChange} />
                                    <div className="text-xs text-muted-foreground text-center">- OR -</div>
                                    <Input {...form.register("imageUrl")} placeholder="Image URL (optional)" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input {...form.register("phone")} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Priority (Sort Order)</label>
                                    <Input type="number" {...form.register("priority", { valueAsNumber: true })} placeholder="1" />
                                </div>
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
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                        ) : panels?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>
                                    <span className="capitalize text-sm text-slate-600">
                                        {item.category?.replace('_', ' ') || (item.isStateLevel ? 'State' : 'District')}
                                    </span>
                                </TableCell>
                                <TableCell>{item.district || '-'}</TableCell>
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
