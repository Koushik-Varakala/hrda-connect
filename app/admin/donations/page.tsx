"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDonationsList } from "@/hooks/use-donations";
import { useState } from "react";
import { Search, Download } from "lucide-react";

export default function ManageDonations() {
    const { data: donations, isLoading } = useDonationsList();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDonations = donations?.filter((donation: any) =>
        donation.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.phone?.includes(searchTerm) ||
        donation.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadCSV = () => {
        if (!filteredDonations || filteredDonations.length === 0) return;

        const headers = ["Date", "Name", "Email", "Phone", "Amount", "Payment Status", "Payment ID"];
        const csvRows = filteredDonations.map((d: any) => {
            return [
                `"${new Date(d.createdAt).toLocaleString("en-IN")}"`,
                `"${(d.fullName || '').replace(/"/g, '""')}"`,
                `"${(d.email || '').replace(/"/g, '""')}"`,
                `"${(d.phone || '').replace(/"/g, '""')}"`,
                `"${d.amount}"`,
                `"${(d.paymentStatus || '').replace(/"/g, '""')}"`,
                `"${(d.razorpayPaymentId || '').replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `hrda-donations-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Donations</h1>
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={downloadCSV}
                        disabled={!filteredDonations || filteredDonations.length === 0}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export to CSV
                    </Button>
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name, phone, email, Txn ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Donor Details</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Txn ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                        ) : filteredDonations?.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No donations found</TableCell></TableRow>
                        ) : filteredDonations?.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-sm">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{item.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{item.email}</div>
                                    <div className="text-xs text-muted-foreground">{item.phone}</div>
                                </TableCell>
                                <TableCell className="font-semibold text-green-700">
                                    ₹{item.amount}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${item.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                                        item.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {item.paymentStatus}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {item.razorpayPaymentId || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
