"use client";

import { Layout } from "@/components/Layout";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

export default function AnnouncementsPage() {
    const { data: announcements, isLoading } = useAnnouncements();
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    // Filter and sort
    const sortedAnnouncements = announcements
        ?.filter(a => a.active)
        .filter(a => {
            const matchesSearch = searchQuery === "" ||
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.content.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDate = dateFilter === "" ||
                format(new Date(a.date), 'yyyy-MM-dd') === dateFilter;

            return matchesSearch && matchesDate;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Layout>
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                            Latest Updates
                        </Badge>
                        <h1 className="text-4xl font-serif font-bold mb-4 text-slate-900">
                            Announcements & News
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Stay informed about HRDA activities, healthcare policy changes, and important notifications for our members.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-6 mb-8 relative z-10">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search announcements..."
                            className="pl-10 h-11 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="w-full md:w-auto flex-shrink-0">
                        <Input
                            type="date"
                            className="h-11 w-full md:w-[200px]"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    {(searchQuery || dateFilter) && (
                        <Button
                            variant="ghost"
                            onClick={() => { setSearchQuery(""); setDateFilter(""); }}
                            className="text-slate-500 hover:text-red-500"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-slate-500">Loading announcements...</p>
                    </div>
                ) : !sortedAnnouncements || sortedAnnouncements.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Megaphone className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Announcements</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            There are currently no active announcements to display. Please check back later for updates.
                        </p>
                        <div className="mt-6">
                            <Button asChild variant="outline">
                                <Link href="/">Return Home</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sortedAnnouncements.map((announcement, index) => {
                            const isNew = new Date(announcement.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return (
                                <motion.div
                                    key={announcement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="h-full"
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow border-slate-200 flex flex-col relative overflow-hidden group">
                                        {isNew && (
                                            <div className="absolute top-0 right-0">
                                                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                                    NEW
                                                </div>
                                            </div>
                                        )}
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{format(new Date(announcement.date), 'MMMM d, yyyy')}</span>
                                            </div>
                                            <CardTitle className="text-xl leading-snug text-slate-900 group-hover:text-primary transition-colors">
                                                {announcement.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
}
