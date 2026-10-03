"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { appConfig } from "@/lib/app-config";
import {
    Droplet,
    Users,
    Activity,
    Hospital,
    Search,
    PhoneCall,
    Share2,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    MessageCircle,
    Send,
    Filter,
    ShieldAlert
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function AdminBloodNetworkPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({ donors: [], requests: [], stats: {} });
    const [error, setError] = useState("");

    // Donor Filters
    const [donorSearch, setDonorSearch] = useState("");
    const [donorDistrictFilter, setDonorDistrictFilter] = useState("all");
    const [donorBloodFilter, setDonorBloodFilter] = useState("all");

    // Match & Alert Modal State
    const [matchingModalOpen, setMatchingModalOpen] = useState(false);
    const [activeRequest, setActiveRequest] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedDonorIds, setSelectedDonorIds] = useState<number[]>([]);
    const [matchingLoading, setMatchingLoading] = useState(false);
    const [dispatching, setDispatching] = useState(false);
    const [dispatchResult, setDispatchResult] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/blood-network");
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || "Failed to load blood network data.");
            setData(resData);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open Match Donors Modal
    const handleOpenMatchModal = async (req: any) => {
        setActiveRequest(req);
        setMatchingModalOpen(true);
        setMatchingLoading(true);
        setDispatchResult([]);
        setSelectedDonorIds([]);

        try {
            const res = await fetch("/api/admin/blood-network", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "match", requestId: req.id }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || "Failed to find candidates.");

            setCandidates(resData.candidates || []);
            // Pre-select uncontacted candidates
            const uncontacted = (resData.candidates || [])
                .filter((c: any) => !c.alreadyContacted)
                .map((c: any) => c.id);
            setSelectedDonorIds(uncontacted);
        } catch (err: any) {
            alert(err.message || "Could not match donors.");
        } finally {
            setMatchingLoading(false);
        }
    };

    // Dispatch Alerts
    const handleDispatchAlerts = async () => {
        if (!activeRequest || selectedDonorIds.length === 0) return;
        setDispatching(true);

        try {
            const res = await fetch("/api/admin/blood-network", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "dispatch",
                    requestId: activeRequest.id,
                    donorIds: selectedDonorIds,
                }),
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || "Failed to dispatch alerts.");

            setDispatchResult(resData.dispatched || []);
            fetchData();
        } catch (err: any) {
            alert(err.message || "Failed to dispatch alerts.");
        } finally {
            setDispatching(false);
        }
    };

    // Update Request Status (e.g. Fulfilled)
    const handleUpdateStatus = async (requestId: number, newStatus: string) => {
        try {
            const res = await fetch("/api/admin/blood-network", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update-request-status",
                    requestId,
                    status: newStatus,
                }),
            });
            if (!res.ok) throw new Error("Failed to update status.");
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Toggle Donor Availability
    const handleToggleDonor = async (donorId: number, currentAvailable: boolean) => {
        try {
            const res = await fetch("/api/admin/blood-network", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update-donor",
                    donorId,
                    isAvailable: !currentAvailable,
                }),
            });
            if (!res.ok) throw new Error("Failed to toggle donor.");
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Filtered Donors
    const filteredDonors = (data.donors || []).filter((d: any) => {
        const matchesSearch = donorSearch === "" ||
            d.fullName.toLowerCase().includes(donorSearch.toLowerCase()) ||
            d.phone.includes(donorSearch) ||
            d.cityTown.toLowerCase().includes(donorSearch.toLowerCase());

        const matchesDistrict = donorDistrictFilter === "all" || d.district === donorDistrictFilter;
        const matchesBlood = donorBloodFilter === "all" || d.bloodGroup === donorBloodFilter;

        return matchesSearch && matchesDistrict && matchesBlood;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Droplet className="w-6 h-6 text-rose-600 fill-rose-600" />
                        <h1 className="text-2xl font-bold text-slate-900">
                            Blood Donor Network (AP)
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Fraternity emergency support, verified matching, and controlled donor dispatch for Andhra Pradesh.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="text-xs">
                        <a href="/blood-donor" target="_blank" rel="noopener noreferrer">
                            Open Public Portal ↗
                        </a>
                    </Button>
                    <Button onClick={fetchData} size="sm" variant="secondary" className="text-xs">
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-semibold uppercase">Total Donors</span>
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {data.stats?.totalDonors || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-semibold uppercase">Available</span>
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">
                            {data.stats?.availableDonors || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-semibold uppercase">Total Requests</span>
                            <Hospital className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                            {data.stats?.totalRequests || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-semibold uppercase">Active / Urgent</span>
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                        </div>
                        <div className="text-2xl font-black text-rose-600 mt-1">
                            {data.stats?.openRequests || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-400">
                            <span className="text-xs font-semibold uppercase">Fulfilled</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                            {data.stats?.fulfilledRequests || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="requests" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="requests" className="text-xs font-semibold data-[state=active]:bg-white">
                        Emergency Blood Requirements ({data.requests?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="donors" className="text-xs font-semibold data-[state=active]:bg-white">
                        Verified Donor Registry ({data.donors?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: REQUESTS */}
                <TabsContent value="requests" className="mt-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800">
                                Blood Requirement Requests
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Review patient requirements, match donors in the same district, and dispatch alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.requests && data.requests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 text-[11px]">
                                            <TableRow>
                                                <TableHead>Code & Date</TableHead>
                                                <TableHead>Blood Needed</TableHead>
                                                <TableHead>Patient & Attendant</TableHead>
                                                <TableHead>Hospital / District</TableHead>
                                                <TableHead>Urgency</TableHead>
                                                <TableHead>Donors Status</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {data.requests.map((req: any) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>
                                                        <span className="font-mono font-bold text-rose-700">{req.requestTrackingCode}</span>
                                                        <p className="text-[10px] text-slate-400">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-black text-sm text-slate-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                                            {req.bloodGroup}
                                                        </span>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{req.unitsRequired} Unit(s)</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-bold text-slate-800">{req.patientName}</p>
                                                        <p className="text-slate-500 text-[11px]">Attendant: {req.attendantName}</p>
                                                        <a href={`tel:${req.contactPhone}`} className="text-blue-600 text-[11px] font-mono hover:underline">
                                                            +91 {req.contactPhone}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium text-slate-800">{req.hospitalName}</p>
                                                        <p className="text-slate-500 text-[11px]">{req.cityTown}, {req.district}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`text-[10px] ${
                                                            req.urgency.includes("Critical") ? "bg-red-600 text-white" :
                                                            req.urgency === "Urgent" ? "bg-amber-500 text-white" :
                                                            "bg-slate-200 text-slate-700"
                                                        }`}>
                                                            {req.urgency}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-0.5 text-[11px]">
                                                            <p><span className="text-slate-400">Alerted:</span> {req.stats?.totalContacted || 0}</p>
                                                            <p><span className="text-emerald-600 font-semibold">Accepted:</span> {req.stats?.acceptedCount || 0}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`text-[10px] capitalize ${
                                                            req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                            req.status === 'donors_contacted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                            'bg-amber-100 text-amber-800 border-amber-300'
                                                        }`}>
                                                            {req.status.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                                                        <Button
                                                            onClick={() => handleOpenMatchModal(req)}
                                                            size="sm"
                                                            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] h-7 px-2.5"
                                                        >
                                                            <Send className="w-3 h-3 mr-1" /> Match & Alert
                                                        </Button>

                                                        {req.status !== 'fulfilled' && (
                                                            <Button
                                                                onClick={() => handleUpdateStatus(req.id, "fulfilled")}
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-[11px] h-7 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                            >
                                                                Mark Fulfilled
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No blood requirement requests received yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: DONORS REGISTRY */}
                <TabsContent value="donors" className="mt-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="p-4 border-b space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <CardTitle className="text-sm font-bold text-slate-800">
                                        Registered Blood Donors ({filteredDonors.length})
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Verified fraternity members who gave informed consent. Details are guarded under controlled sharing.
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                    <Input
                                        placeholder="Search by name, phone, city..."
                                        value={donorSearch}
                                        onChange={(e) => setDonorSearch(e.target.value)}
                                        className="h-8 pl-8 text-xs"
                                    />
                                </div>

                                <Select value={donorDistrictFilter} onValueChange={setDonorDistrictFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Filter by District" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts ({appConfig.districts.length})</SelectItem>
                                        {appConfig.districts.map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={donorBloodFilter} onValueChange={setDonorBloodFilter}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Filter by Blood Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Blood Groups</SelectItem>
                                        {BLOOD_GROUPS.map(bg => (
                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {filteredDonors.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 text-[11px]">
                                            <TableRow>
                                                <TableHead>Donor Name</TableHead>
                                                <TableHead>Blood Group</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Hospital / Workplace</TableHead>
                                                <TableHead>Contact Phone</TableHead>
                                                <TableHead>Consent</TableHead>
                                                <TableHead>Availability</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-xs">
                                            {filteredDonors.map((donor: any) => (
                                                <TableRow key={donor.id}>
                                                    <TableCell className="font-bold text-slate-900">
                                                        {donor.fullName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                                                            {donor.bloodGroup}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium text-slate-800">{donor.cityTown}</p>
                                                        <p className="text-[11px] text-slate-500">{donor.district}</p>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {donor.hospitalOrWorkplace || "—"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-slate-700">
                                                        +91 {donor.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                                                            ✓ Verified Consent
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`text-[10px] cursor-pointer ${
                                                            donor.isAvailable
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                                : "bg-slate-100 text-slate-500 border-slate-300"
                                                        }`}
                                                        onClick={() => handleToggleDonor(donor.id, donor.isAvailable)}
                                                        >
                                                            {donor.isAvailable ? "Available" : "Unavailable"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            onClick={() => handleToggleDonor(donor.id, donor.isAvailable)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-[11px] h-7 text-slate-500 hover:text-slate-800"
                                                        >
                                                            {donor.isAvailable ? "Set Inactive" : "Set Active"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No donors matching your search/filters.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* MATCH & DISPATCH MODAL */}
            <Dialog open={matchingModalOpen} onOpenChange={setMatchingModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Droplet className="w-5 h-5 text-rose-600 fill-rose-600" />
                            Match Donors for {activeRequest?.requestTrackingCode}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Searching available donors for <span className="font-bold text-rose-700">{activeRequest?.bloodGroup}</span> in <span className="font-bold text-slate-800">{activeRequest?.district}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {matchingLoading ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                            <Activity className="w-6 h-6 text-rose-600 animate-spin mx-auto mb-2" />
                            Matching verified donors in district...
                        </div>
                    ) : (
                        <div className="space-y-4 text-xs">
                            {/* Requirement Summary */}
                            <div className="bg-slate-50 p-3 rounded-lg border text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div>
                                    <span className="text-slate-400">Patient:</span>
                                    <p className="font-bold text-slate-800">{activeRequest?.patientName}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Hospital:</span>
                                    <p className="font-bold text-slate-800">{activeRequest?.hospitalName}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Units:</span>
                                    <p className="font-bold text-rose-700">{activeRequest?.unitsRequired} Unit(s)</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">District:</span>
                                    <p className="font-bold text-slate-800">{activeRequest?.district}</p>
                                </div>
                            </div>

                            {/* Dispatched Results (if alerts were just generated) */}
                            {dispatchResult.length > 0 ? (
                                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span>Alerts Generated for {dispatchResult.length} Donor(s)!</span>
                                    </div>
                                    <p className="text-xs text-emerald-700">
                                        You can now click WhatsApp to immediately notify each doctor. When they click Accept on their link, their details will be unlocked for the patient attendant.
                                    </p>

                                    <div className="space-y-2 pt-2">
                                        {dispatchResult.map((res: any, idx: number) => (
                                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                                                <div>
                                                    <p className="font-bold text-slate-800">{res.donorName}</p>
                                                    <p className="font-mono text-slate-500 text-[11px]">+91 {res.donorPhone}</p>
                                                </div>
                                                <a
                                                    href={res.whatsappUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" /> Send via WhatsApp
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Candidates Checklist */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between pb-1">
                                            <span className="font-bold text-slate-800">
                                                Matching Candidates ({candidates.length})
                                            </span>
                                            <Button
                                                onClick={() => {
                                                    if (selectedDonorIds.length === candidates.length) {
                                                        setSelectedDonorIds([]);
                                                    } else {
                                                        setSelectedDonorIds(candidates.map(c => c.id));
                                                    }
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="text-[11px] h-6 text-slate-500"
                                            >
                                                {selectedDonorIds.length === candidates.length ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>

                                        {candidates.length > 0 ? (
                                            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                                {candidates.map((c: any) => {
                                                    const isChecked = selectedDonorIds.includes(c.id);
                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className={`p-3 flex items-center justify-between transition-colors ${
                                                                c.alreadyContacted ? "bg-slate-50 opacity-60" : "hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setSelectedDonorIds([...selectedDonorIds, c.id]);
                                                                        } else {
                                                                            setSelectedDonorIds(selectedDonorIds.filter(id => id !== c.id));
                                                                        }
                                                                    }}
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-slate-900">{c.fullName}</p>
                                                                    <p className="text-[11px] text-slate-500">
                                                                        {c.cityTown} • {c.hospitalOrWorkplace || "Doctor Member"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                                                                    {c.bloodGroup}
                                                                </Badge>
                                                                {c.alreadyContacted && (
                                                                    <Badge variant="outline" className="text-[10px] text-slate-400">
                                                                        Already Contacted
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                                                No registered {activeRequest?.bloodGroup} donors found in {activeRequest?.district}.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {dispatchResult.length > 0 ? (
                            <Button
                                onClick={() => setMatchingModalOpen(false)}
                                className="text-xs"
                            >
                                Done
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDispatchAlerts}
                                disabled={dispatching || selectedDonorIds.length === 0}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                            >
                                {dispatching ? (
                                    <span className="flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 animate-spin" /> Preparing Alerts...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <Send className="w-3.5 h-3.5" /> Dispatch Alerts to Selected ({selectedDonorIds.length})
                                    </span>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
