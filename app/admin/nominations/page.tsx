"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNominationsList, useUpdateNomination, useDeleteNomination } from "@/hooks/use-nominations";
import { Pencil, Search, Trash2, Download, Mail, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { NOMINATION_POSTS } from "@shared/schema";
import { appConfig } from "@/lib/app-config";
import { useToast } from "@/hooks/use-toast";

export default function ManageNominations() {
    const [filterDistrict, setFilterDistrict] = useState<string>("all");
    const [filterPost, setFilterPost] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("payment_success"); // Default to paid
    const [searchTerm, setSearchTerm] = useState("");

    const { data: nominations, isLoading } = useNominationsList({
        district: filterDistrict !== "all" ? filterDistrict : undefined,
        post: filterPost !== "all" ? filterPost : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
    });

    const updateMutation = useUpdateNomination();
    const deleteMutation = useDeleteNomination();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [resendingId, setResendingId] = useState<number | null>(null);
    const { toast } = useToast();

    const form = useForm({
        defaultValues: {
            status: "",
            adminNotes: "",
        }
    });

    const filteredNominations = nominations?.filter(nom =>
        nom.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nom.hrdaMembershipId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nom.tgmcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nom.mobile?.includes(searchTerm)
    );

    const openEdit = (nom: any) => {
        setEditingItem(nom);
        form.reset({
            status: nom.status || "payment_success",
            adminNotes: nom.adminNotes || "",
        });
        setIsDialogOpen(true);
    };

    const onSubmit = (data: any) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, ...data }, {
                onSuccess: () => { 
                    setIsDialogOpen(false); 
                    setEditingItem(null); 
                    form.reset(); 
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleResendEmail = async (nom: any) => {
        setResendingId(nom.id);
        try {
            const res = await fetch("/api/nominations/resend-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nominationId: nom.id }),
            });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Email Sent", description: `Confirmation email sent to ${data.email}` });
            } else {
                toast({ title: "Failed", description: data.message || "Could not send email", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Network error sending email", variant: "destructive" });
        } finally {
            setResendingId(null);
        }
    };

    const downloadCSV = () => {
        if (!filteredNominations || filteredNominations.length === 0) return;

        const headers = ["ID", "Full Name", "HRDA ID", "TGMC Number", "Mobile", "Email", "District/Zone", "Post Applied", "Fee", "Status", "Payment Ref", "Admin Notes", "Date"];
        const csvRows = filteredNominations.map(nom => {
            return [
                nom.id,
                `"${(nom.fullName || '').replace(/"/g, '""')}"`,
                `"${(nom.hrdaMembershipId || '').replace(/"/g, '""')}"`,
                `"${(nom.tgmcNumber || '').replace(/"/g, '""')}"`,
                `"${(nom.mobile || '').replace(/"/g, '""')}"`,
                `"${(nom.email || '').replace(/"/g, '""')}"`,
                `"${(nom.district || '').replace(/"/g, '""')}"`,
                `"${(nom.postApplied || '').replace(/"/g, '""')}"`,
                nom.nominationFee,
                `"${(nom.status || '').replace(/"/g, '""')}"`,
                `"${(nom.razorpayPaymentId || '').replace(/"/g, '""')}"`,
                `"${(nom.adminNotes || '').replace(/"/g, '""')}"`,
                `"${new Date(nom.createdAt!).toLocaleString().replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `hrda-nominations-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Stats
    const totalNominations = nominations?.length || 0;
    const approvedCount = nominations?.filter(n => n.status === "approved").length || 0;
    const paidCount = nominations?.filter(n => n.status === "payment_success" || n.status === "approved" || n.status === "submitted").length || 0;
    const totalRevenue = nominations?.reduce((sum, nom) => {
        // Only count paid ones
        if (nom.paymentStatus === 'success') {
            return sum + (nom.nominationFee || 0);
        }
        return sum;
    }, 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Manage Nominations</h1>
                <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Filtered Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalNominations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Paid Nominations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{paidCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Revenue (Filtered)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">₹{totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Row */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search name, ID, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending_payment">Pending Payment (Abandoned)</SelectItem>
                                <SelectItem value="payment_success">Payment Success (New)</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterPost} onValueChange={setFilterPost}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Post" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Posts</SelectItem>
                                {NOMINATION_POSTS.map(post => (
                                    <SelectItem key={post} value={post}>{post}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by District" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts/Zones</SelectItem>
                                {appConfig.districts.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                                {/* Assuming Zones will be searched here, we can add them manually or keep generic search */}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate Details</TableHead>
                                <TableHead>Election Details</TableHead>
                                <TableHead>Fee Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading nominations...</TableCell>
                                </TableRow>
                            ) : filteredNominations?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No nominations found matching criteria.</TableCell>
                                </TableRow>
                            ) : (
                                filteredNominations?.map((nom) => (
                                    <TableRow key={nom.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {nom.photoUrl ? (
                                                    <img
                                                        src={nom.photoUrl}
                                                        alt={nom.fullName}
                                                        className="w-10 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                        <span className="text-xs text-slate-400">N/A</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{nom.fullName}</div>
                                                    <div className="text-xs text-slate-500">{nom.hrdaMembershipId} | {nom.tgmcNumber}</div>
                                                    <div className="text-xs text-slate-500">{nom.mobile}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm">{nom.postApplied}</div>
                                            <div className="text-xs text-slate-500">{nom.district}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">₹{nom.nominationFee}</div>
                                            {nom.paymentStatus === 'success' ? (
                                                <div className="text-xs text-green-600 bg-green-50 inline-block px-1 rounded border border-green-200">Paid</div>
                                            ) : (
                                                <div className="text-xs text-yellow-600 bg-yellow-50 inline-block px-1 rounded border border-yellow-200">Pending</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className={`text-xs px-2 py-1 rounded-full capitalize inline-block font-medium ${
                                                nom.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                nom.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                nom.status === 'payment_success' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {nom.status.replace('_', ' ')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {new Date(nom.createdAt!).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openEdit(nom)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleResendEmail(nom)}
                                                    disabled={resendingId === nom.id}
                                                    title="Resend confirmation email"
                                                >
                                                    {resendingId === nom.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Nomination</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete the nomination for {nom.fullName}? This cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={() => handleDelete(nom.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Nomination Status</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4 py-4">
                            <div className="bg-slate-50 p-3 rounded-lg border text-sm space-y-1 flex gap-4">
                                {editingItem.photoUrl && (
                                    <img
                                        src={editingItem.photoUrl}
                                        alt={editingItem.fullName}
                                        className="w-20 h-24 rounded-lg object-cover border border-slate-200 shrink-0"
                                    />
                                )}
                                <div className="space-y-1">
                                    <p><strong>Candidate:</strong> {editingItem.fullName}</p>
                                    <p><strong>Post:</strong> {editingItem.postApplied}</p>
                                    <p><strong>District:</strong> {editingItem.district}</p>
                                    <p><strong>Email:</strong> {editingItem.email}</p>
                                    <p><strong>Payment Ref:</strong> {editingItem.razorpayPaymentId || 'N/A'}</p>
                                    {editingItem.signatureUrl && (
                                        <div>
                                            <p><strong>Signature:</strong></p>
                                            <img src={editingItem.signatureUrl} alt="Signature" className="h-12 mt-1 border border-slate-200 rounded bg-white p-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Controller
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="payment_success">Payment Success (Under Review)</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Notes (Optional)</label>
                                    <Controller
                                        control={form.control}
                                        name="adminNotes"
                                        render={({ field }) => (
                                            <Input placeholder="E.g. Verified details manually" {...field} />
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
