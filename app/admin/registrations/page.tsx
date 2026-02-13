"use client";

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegistrationsList, useUpdateRegistration, useDeleteRegistration } from "@/hooks/use-registrations";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageRegistrations() {
    const { data: registrations, isLoading } = useRegistrationsList();
    const updateMutation = useUpdateRegistration();
    const deleteMutation = useDeleteRegistration();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            tgmcId: "",
            hrdaId: "",
            address: "",
            district: "",
            status: "",
        }
    });

    const filteredRegistrations = registrations?.filter(reg =>
        reg.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.includes(searchTerm) ||
        reg.hrdaId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.tgmcId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onSubmit = (data: any) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, ...data }, {
                onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); form.reset(); }
            });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        form.reset({
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            phone: item.phone,
            tgmcId: item.tgmcId,
            hrdaId: item.hrdaId,
            address: item.address,
            district: item.district,
            status: item.status,
        });
        setIsDialogOpen(true);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Registrations</h1>
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, phone, HRDA/TGMC ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingItem(null); }}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Registration</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input {...form.register("firstName")} placeholder="First Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input {...form.register("lastName")} placeholder="Last Name" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input {...form.register("email")} placeholder="Email" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input {...form.register("phone")} placeholder="Phone" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">TGMC ID</label>
                                        <Input {...form.register("tgmcId")} placeholder="TGMC ID" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">HRDA ID</label>
                                        <Input {...form.register("hrdaId")} placeholder="HRDA ID" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">District</label>
                                        <Input {...form.register("district")} placeholder="District" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Controller
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                                        <SelectItem value="verified">Verified</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Input {...form.register("address")} placeholder="Address" />
                                </div>

                                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                                    Update Registration
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>HRDA ID</TableHead>
                            <TableHead>TGMC ID</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                        ) : filteredRegistrations?.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No registrations found</TableCell></TableRow>
                        ) : filteredRegistrations?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.firstName} {item.lastName}
                                    {item.district && <div className="text-xs text-muted-foreground">{item.district}</div>}
                                </TableCell>
                                <TableCell>{item.hrdaId || '-'}</TableCell>
                                <TableCell>{item.tgmcId || '-'}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{item.phone}</div>
                                    <div className="text-xs text-muted-foreground">{item.email}</div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${item.status === 'verified' ? 'bg-green-100 text-green-700' :
                                        item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {item.status?.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the registration for {item.firstName} {item.lastName}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
