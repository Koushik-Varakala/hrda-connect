"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegistrationsList, useUpdateRegistration, useDeleteRegistration } from "@/hooks/use-registrations";
import { useForm, Controller } from "react-hook-form";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { Pencil, Search, Trash2, Download, RefreshCw, CheckCircle, Loader2, Upload, FileSpreadsheet, AlertCircle, UserPlus, Calendar } from "lucide-react";
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
import { appConfig } from "@/lib/app-config";
import { useToast } from "@/hooks/use-toast";

export default function ManageRegistrations() {
    const { data: registrations, isLoading } = useRegistrationsList();
    const updateMutation = useUpdateRegistration();
    const deleteMutation = useDeleteRegistration();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
    const [filterMembershipType, setFilterMembershipType] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [isSyncing, setIsSyncing] = useState(false);
    const [verifyingIds, setVerifyingIds] = useState<Record<number, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [previewData, setPreviewData] = useState<{ toAdd: any[]; toSkip: any[]; summary: any } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const createForm = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            tgmcId: "",
            hrdaId: "",
            address: "",
            district: "",
            status: "verified",
            paymentStatus: "success",
            membershipType: "single",
            createdAt: new Date().toISOString().slice(0, 16),
        }
    });

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
            paymentStatus: "",
            createdAt: "",
        }
    });

    const filteredRegistrations = registrations?.filter(reg =>
        (reg.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.includes(searchTerm) ||
        reg.hrdaId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.tgmcId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterPaymentStatus === "all" || reg.paymentStatus === filterPaymentStatus) &&
        (filterMembershipType === "all" || reg.membershipType === filterMembershipType)
    ).sort((a, b) => {
        if (sortBy === "newest") return b.id - a.id;
        if (sortBy === "oldest") return a.id - b.id;
        if (sortBy === "hrda_asc") return (a.hrdaId || "").localeCompare(b.hrdaId || "");
        if (sortBy === "hrda_desc") return (b.hrdaId || "").localeCompare(a.hrdaId || "");
        return b.id - a.id;
    });

    const onSubmit = (data: any) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, ...data }, {
                onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); form.reset(); }
            });
        }
    };

    const onCreateSubmit = async (data: any) => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (res.ok) {
                toast({ title: "Registration Created", description: `Successfully added ${data.firstName} ${data.lastName}.` });
                setIsCreateOpen(false);
                createForm.reset();
                queryClient.invalidateQueries();
            } else {
                toast({ title: "Failed to create", description: result.message || "An error occurred", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to create registration", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const downloadCSV = () => {
        if (!filteredRegistrations || filteredRegistrations.length === 0) return;

        const headers = ["First Name", "Last Name", "Email", "Phone", appConfig.medicalCouncilId, "HRDA ID", "District", "Status", "Membership Category", "Assessment Profile", "Address"];
        const csvRows = filteredRegistrations.map(reg => {
            return [
                `"${(reg.firstName || '').replace(/"/g, '""')}"`,
                `"${(reg.lastName || '').replace(/"/g, '""')}"`,
                `"${(reg.email || '').replace(/"/g, '""')}"`,
                `"${(reg.phone || '').replace(/"/g, '""')}"`,
                `"${(reg.tgmcId || '').replace(/"/g, '""')}"`,
                `"${(reg.hrdaId || '').replace(/"/g, '""')}"`,
                `"${(reg.district || '').replace(/"/g, '""')}"`,
                `"${(reg.status || '').replace(/"/g, '""')}"`,
                `"${(reg.paymentStatus || '').replace(/"/g, '""')}"`,
                `"${(reg.membershipType || '').replace(/"/g, '""')}"`,
                `"${(reg.assessmentProfile || '').replace(/"/g, '""')}"`,
                `"${(reg.address || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `hrda-registrations-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const data = new Uint8Array(await file.arrayBuffer());
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

            if (!rows || rows.length === 0) {
                toast({ title: "Empty File", description: "No data rows found in spreadsheet.", variant: "destructive" });
                return;
            }

            const res = await fetch("/api/admin/registrations/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "preview", rows })
            });

            if (res.ok) {
                const result = await res.json();
                setPreviewData(result);
                setIsPreviewOpen(true);
            } else {
                const err = await res.json();
                toast({ title: "Preview Error", description: err.message || "Failed to process spreadsheet.", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Import Error", description: err.message || "Failed to read Excel file.", variant: "destructive" });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleConfirmImport = async () => {
        if (!previewData?.toAdd || previewData.toAdd.length === 0) {
            toast({ title: "Nothing to import", description: "All rows already exist in database." });
            setIsPreviewOpen(false);
            return;
        }
        setIsImporting(true);
        try {
            const res = await fetch("/api/admin/registrations/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "execute", rows: previewData.toAdd })
            });
            if (res.ok) {
                const result = await res.json();
                toast({ title: "Import Success", description: `Successfully imported ${result.count} missing registrations!` });
                setIsPreviewOpen(false);
                setPreviewData(null);
                queryClient.invalidateQueries();
            } else {
                const err = await res.json();
                toast({ title: "Import Failed", description: err.message || "Could not save registrations.", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: "An error occurred during database save.", variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    };

    const handleSyncPayments = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/sync-payments", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Sync Complete", description: `Successfully synced ${data.syncedCount} payments.` });
            } else {
                toast({ title: "Sync Failed", description: data.message, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Sync Failed", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleVerifyTGMC = async (item: any) => {
        if (!item.tgmcId) return;
        setVerifyingIds(prev => ({ ...prev, [item.id]: true }));
        try {
            const res = await fetch(`/api/external/tsmc-doctor/${encodeURIComponent(item.tgmcId)}?name=${encodeURIComponent(item.firstName || '')}`);
            if (res.ok) {
                const data = await res.json();
                const externalDoctors = data.data || [];
                const matches = externalDoctors.some((doc: any) => {
                    const councilName = (doc.fullname || "").toLowerCase();
                    const fName = (item.firstName || "").toLowerCase();
                    const lName = (item.lastName || "").toLowerCase();
                    
                    const matchesFirst = fName ? councilName.includes(fName) : false;
                    const matchesLast = lName ? councilName.includes(lName) : false;
                    
                    return matchesFirst || matchesLast;
                });

                if (externalDoctors.length === 0) {
                    toast({ title: "Not Found", description: "No doctor found with this exact ID in the Council database. Check if a prefix is needed (e.g., TSMC/FMR/).", variant: "destructive" });
                } else if (matches) {
                    updateMutation.mutate({ id: item.id, status: "verified" }, {
                        onSuccess: () => {
                            toast({ title: "Verified", description: `Doctor ${item.tgmcId} verified successfully via Council DB.` });
                        }
                    });
                } else {
                    toast({ title: "No Match", description: "Names did not match exactly, manual verification needed.", variant: "destructive" });
                }
            } else {
                toast({ title: "Verification Failed", description: "Could not fetch details from Council DB.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Verification Error", description: "An error occurred during verification.", variant: "destructive" });
        } finally {
            setVerifyingIds(prev => ({ ...prev, [item.id]: false }));
        }
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
            paymentStatus: item.paymentStatus || "pending",
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 16) : "",
        });
        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Manage Registrations</h1>
                <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full xl:w-auto">
                    <Button 
                        variant="outline" 
                        onClick={handleSyncPayments}
                        disabled={isSyncing}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Sync Payments
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={downloadCSV}
                        disabled={!filteredRegistrations || filteredRegistrations.length === 0}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        Export to CSV
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting || isSyncing}
                        className="flex items-center gap-2 whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                    >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Import Excel
                    </Button>
                    <Button 
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Registration
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                    />
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
                        <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="success">Paid / Success</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterMembershipType} onValueChange={setFilterMembershipType}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Membership Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Memberships</SelectItem>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Lifetime">Lifetime</SelectItem>
                                <SelectItem value="Contributory">Contributory</SelectItem>
                                <SelectItem value="Founders">Founders</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="hrda_asc">HRDA ID (A-Z)</SelectItem>
                                <SelectItem value="hrda_desc">HRDA ID (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative w-full col-span-2 sm:col-span-1 sm:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search by name, phone, HRDA/${appConfig.medicalCouncilShort} ID...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
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
                                        <label className="text-sm font-medium">{appConfig.medicalCouncilId}</label>
                                        <Input {...form.register("tgmcId")} placeholder={appConfig.medicalCouncilId} />
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Payment Status</label>
                                        <Controller
                                            control={form.control}
                                            name="paymentStatus"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Payment Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="success">Paid / Success</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="failed">Failed</SelectItem>
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                                        <Calendar className="w-4 h-4" />
                                        Registration Date & Time (created_at)
                                    </label>
                                    <Input type="datetime-local" {...form.register("createdAt")} className="border-purple-200 dark:border-purple-800" />
                                </div>

                                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                                    Update Registration
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <UserPlus className="w-5 h-5 text-blue-600" />
                                    Add New Member Registration ({appConfig.region})
                                </DialogTitle>
                                <DialogDescription>
                                    Manually insert a verified registration into the secure production database.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name *</label>
                                        <Input {...createForm.register("firstName", { required: true })} placeholder="Dr. First Name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name *</label>
                                        <Input {...createForm.register("lastName", { required: true })} placeholder="Last Name" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <Input {...createForm.register("phone")} placeholder="9876543210 (or auto-generated if blank)" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input {...createForm.register("email")} placeholder="doctor@example.com" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">HRDA Registration Number</label>
                                        <Input {...createForm.register("hrdaId")} placeholder="e.g. 1042" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{appConfig.medicalCouncilId}</label>
                                        <Input {...createForm.register("tgmcId")} placeholder={appConfig.medicalCouncilId} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">District</label>
                                        <Input {...createForm.register("district")} placeholder="District Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Verification Status</label>
                                        <Controller
                                            control={createForm.control}
                                            name="status"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="verified">Verified</SelectItem>
                                                        <SelectItem value="pending_verification">Pending Verification</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Payment Status</label>
                                        <Controller
                                            control={createForm.control}
                                            name="paymentStatus"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="success">Paid / Success</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="failed">Failed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <Input {...createForm.register("address")} placeholder="Clinic or Residential Address" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                                        <Calendar className="w-4 h-4" />
                                        Registration Date & Time (created_at)
                                    </label>
                                    <Input type="datetime-local" {...createForm.register("createdAt")} className="border-purple-200 dark:border-purple-800" />
                                    <p className="text-xs text-muted-foreground">Allows setting backdated or custom registration timestamps.</p>
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    Create Member Registration
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
                            <TableHead>{appConfig.medicalCouncilId}</TableHead>
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
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span>{item.tgmcId || '-'}</span>
                                        {item.tgmcId && item.status !== 'verified' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-6 text-xs px-2"
                                                onClick={() => handleVerifyTGMC(item)}
                                                disabled={verifyingIds[item.id]}
                                            >
                                                {verifyingIds[item.id] ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1 text-green-600" />}
                                                Auto-Verify
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{item.phone}</div>
                                    <div className="text-xs text-muted-foreground">{item.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded text-xs capitalize ${item.status === 'verified' ? 'bg-green-100 text-green-700' :
                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.status?.replace('_', ' ')}
                                        </span>
                                        {item.paymentStatus && (
                                            <span className={`px-2 py-1 rounded text-xs capitalize border ${item.paymentStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                item.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {item.paymentStatus === 'success' ? 'Paid' : item.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                    {item.membershipType && (
                                        <div className="mt-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold capitalize block w-fit">
                                            {item.membershipType} Membership
                                        </div>
                                    )}
                                    {item.assessmentProfile && (
                                        <div className="mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded block w-fit">
                                            {item.assessmentProfile}
                                        </div>
                                    )}
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
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                            Excel Import Preview & Deduplication
                        </DialogTitle>
                        <DialogDescription>
                            Review the data before importing into the production database. Existing records have been safely skipped.
                        </DialogDescription>
                    </DialogHeader>

                    {previewData && (
                        <div className="flex-1 overflow-y-auto space-y-6 my-2 pr-1">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 font-medium">TOTAL ROWS IN SHEET</div>
                                    <div className="text-2xl font-bold mt-1 text-slate-800">{previewData.summary.totalRows}</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> NEW TO ADD
                                    </div>
                                    <div className="text-2xl font-bold mt-1 text-emerald-700">{previewData.summary.newCount}</div>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" /> ALREADY EXIST (SKIPPED)
                                    </div>
                                    <div className="text-2xl font-bold mt-1 text-amber-700">{previewData.summary.skipCount}</div>
                                </div>
                            </div>

                            {previewData.toAdd.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-sm mb-2 text-emerald-700">
                                        New Registrations Ready to Import ({previewData.toAdd.length})
                                    </h3>
                                    <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="text-xs">Name</TableHead>
                                                    <TableHead className="text-xs">HRDA ID</TableHead>
                                                    <TableHead className="text-xs">Medical Council</TableHead>
                                                    <TableHead className="text-xs">Phone</TableHead>
                                                    <TableHead className="text-xs">Email</TableHead>
                                                    <TableHead className="text-xs">District</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.toAdd.map((row: any, idx: number) => (
                                                    <TableRow key={idx} className="text-xs">
                                                        <TableCell className="font-medium">{row.firstName} {row.lastName}</TableCell>
                                                        <TableCell>{row.hrdaId || "-"}</TableCell>
                                                        <TableCell>{row.tgmcId || "-"}</TableCell>
                                                        <TableCell>{row.phone}</TableCell>
                                                        <TableCell>{row.email || "-"}</TableCell>
                                                        <TableCell>{row.district || "-"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {previewData.toSkip.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-sm mb-2 text-amber-700">
                                        Existing Registrations Skipped ({previewData.toSkip.length})
                                    </h3>
                                    <div className="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="text-xs w-16">Row #</TableHead>
                                                    <TableHead className="text-xs">Name</TableHead>
                                                    <TableHead className="text-xs">HRDA ID</TableHead>
                                                    <TableHead className="text-xs">Skip Reason</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.toSkip.slice(0, 50).map((row: any, idx: number) => (
                                                    <TableRow key={idx} className="text-xs">
                                                        <TableCell className="font-mono">{row.rowNumber}</TableCell>
                                                        <TableCell className="font-medium">{row.name}</TableCell>
                                                        <TableCell>{row.hrdaId || "-"}</TableCell>
                                                        <TableCell className="text-amber-600">{row.reason}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-4 pt-2 border-t">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirmImport} 
                            disabled={!previewData || previewData.toAdd.length === 0 || isImporting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Confirm & Save {previewData?.toAdd.length || 0} Registrations
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
