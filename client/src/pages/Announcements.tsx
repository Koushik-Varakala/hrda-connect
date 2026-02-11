import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Calendar, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Announcements() {
    const { data: announcements, isLoading } = useAnnouncements();
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const filteredAnnouncements = announcements?.filter((announcement) => {
        const matchesSearch =
            announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

        // If date filter is empty, match everything. Otherwise check if dates match
        const matchesDate = dateFilter
            ? new Date(announcement.date).toISOString().split('T')[0] === dateFilter
            : true;

        return matchesSearch && matchesDate && announcement.active;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setDateFilter("");
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">

                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Announcements</h1>
                        <p className="text-slate-600 text-lg">Stay updated with the latest news and updates from HRDA.</p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    className="pl-10 h-12 text-base"
                                    placeholder="Search announcements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48 relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    type="date"
                                    className="pl-10 h-12 text-base"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                            {(searchQuery || dateFilter) && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="h-12 px-6 flex items-center gap-2 text-slate-600 border-slate-300 hover:bg-slate-50"
                                >
                                    <RefreshCcw className="w-4 h-4" /> Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Announcements Grid */}
                    <div className="max-w-4xl mx-auto">
                        {isLoading ? (
                            <div className="text-center py-20 text-slate-500">Loading announcements...</div>
                        ) : filteredAnnouncements?.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
                                <div className="text-slate-400 mb-2 font-medium text-lg">No announcements found</div>
                                <p className="text-slate-500">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredAnnouncements?.map((announcement) => {
                                    const isNew = new Date(announcement.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                                    return (
                                        <motion.div
                                            key={announcement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card className="overflow-hidden bg-white border-l-4 border-l-brand-red hover:shadow-md transition-shadow">
                                                <CardContent className="p-6 md:p-8">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {isNew && (
                                                                    <Badge className="bg-brand-red hover:bg-red-700 text-white border-none px-2 py-0.5 text-xs font-semibold">
                                                                        New
                                                                    </Badge>
                                                                )}
                                                                <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {format(new Date(announcement.date), 'MMMM dd, yyyy')}
                                                                </span>
                                                            </div>
                                                            <h2 className="text-xl md:text-2xl font-bold text-brand-dark leading-tight">
                                                                {announcement.title}
                                                            </h2>
                                                        </div>
                                                    </div>
                                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                                                        <p>{announcement.content}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
