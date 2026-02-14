"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Megaphone, Users, Search } from "lucide-react";
import Link from "next/link";
import { useAnnouncements } from "@/hooks/use-announcements";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@shared/schema";
import { Vote } from "lucide-react";
import { GallerySlideshow } from "@/components/GallerySlideshow";

export default function Home() {
    const { data: announcements, isLoading } = useAnnouncements();
    const { data: panels } = useQuery<Panel[]>({
        queryKey: ["/api/panels"],
    });

    const electedMembers = panels?.filter(p => p.category === 'elected_member') || [];

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
                {/* Unsplash: Doctor abstract background */}

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 max-w-3xl lg:max-w-none"
                        >
                            <Badge className="mb-4 bg-primary text-white border-none px-3 py-1">
                                Voice of Telangana Doctors
                            </Badge>
                            <h1 className="text-3xl text-headline md:text-6xl font-serif font-bold leading-tight mb-6 break-words">
                                Advocating for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block md:inline">Healthcare Reform</span> & Professional Rights
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                                HRDA works tirelessly with governments and regulators to improve medical education,
                                strengthen primary healthcare, and protect the interests of doctors across Telangana.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold">
                                    <Link href="/index.php/new-registration-2/">
                                        Join HRDA Today
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 h-12 text-base">
                                    <Link href="/search">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search and Edit Membership Details
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right Side Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 flex justify-center lg:justify-end"
                        >
                            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                                <div className="relative w-full h-full rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white p-4 flex items-center justify-center ring-4 ring-white/10">
                                    <img
                                        src="/hrda_logo.png"
                                        alt="HRDA Emblem"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Gallery Slideshow */}
            <GallerySlideshow />

            {/* Announcements */}
            <section className="py-16 md:py-24 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8 border-b-2 border-slate-200 pb-2">
                        <div className="relative">
                            <h2 className="text-3xl font-bold text-slate-900">Announcements</h2>
                            <div className="absolute -bottom-[10px] left-0 w-24 h-1 bg-[#007bff] rounded-full"></div>
                        </div>
                        <Link href="/announcements">
                            <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-medium hidden md:flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {isLoading ? (
                            <div className="col-span-2 text-center py-10 text-muted-foreground">Loading announcements...</div>
                        ) : announcements?.length === 0 ? (
                            <div className="col-span-2 text-center py-10 text-muted-foreground bg-white rounded-xl shadow-sm border">No active announcements</div>
                        ) : (
                            announcements?.filter(a => a.active).slice(0, 4).map((announcement) => {
                                const isNew = new Date(announcement.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // New if within last 7 days
                                return (
                                    <motion.div
                                        key={announcement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="h-full"
                                    >
                                        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden group border-l-4 border-l-transparent hover:border-l-primary/50 relative">
                                            <CardContent className="p-6 flex flex-col h-full relative">
                                                {isNew && (
                                                    <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white border-none px-2 py-0.5 text-xs font-semibold rounded-sm z-10">
                                                        New
                                                    </Badge>
                                                )}
                                                <div className="mb-4 pr-10">
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {announcement.title}
                                                    </h3>
                                                </div>

                                                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                                                    {announcement.content}
                                                </p>

                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-1.5 text-pink-500/80 bg-pink-50 px-2 py-1 rounded">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                                                        <span>{format(new Date(announcement.date), 'MMMM dd, yyyy')}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                    <div className="mt-6 md:hidden text-center">
                        <Link href="/announcements">
                            <Button variant="outline" className="w-full text-teal-600 border-teal-200">View All</Button>
                        </Link>
                    </div>
                </div>
            </section>




            {/* Elected Panel Members - Horizontal Scroll */}
            {
                electedMembers.length > 0 && (
                    <section className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden">
                        <div className="container mx-auto px-4 md:px-6 lg:px-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl text-headline font-serif font-bold mb-2 flex items-center gap-2">
                                        <Vote className="w-8 h-8 text-primary" />
                                        Elected Panel Members
                                    </h2>
                                    <p className="text-slate-400">Our representatives leading the change.</p>
                                </div>
                                <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hidden md:flex">
                                    <Link href="/panels">View All Members</Link>
                                </Button>
                            </div>

                            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {electedMembers.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="snap-start shrink-0 w-[280px] bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-40 h-40 rounded-full bg-slate-700 mb-6 flex items-center justify-center overflow-hidden border-4 border-slate-600 shadow-lg">
                                                {member.imageUrl ? (
                                                    <img
                                                        src={member.imageUrl}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-4xl font-bold text-slate-400">
                                                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{member.name}</h3>
                                            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 border-none mb-3">
                                                {member.role || "Elected Member"}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}

                                <div className="snap-start shrink-0 w-[100px] flex items-center justify-center">
                                    <Link href="/election-panel" className="flex flex-col items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
                                        <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover:border-primary transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">View All</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="md:hidden mt-4 text-center">
                                <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300">
                                    <Link href="/election-panel">View All Members</Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Mission & Vision Grid */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-lg bg-white/50 backdrop-blur card-hover">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle>United Community</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Bringing together doctors from all specialties to create a unified voice for the medical fraternity in Telangana.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-white/50 backdrop-blur card-hover">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                                </div>
                                <CardTitle>Policy Reform</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Actively engaging with policymakers to shape healthcare legislation that benefits both patients and practitioners.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-white/50 backdrop-blur card-hover">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                    <Megaphone className="w-6 h-6 text-indigo-600" />
                                </div>
                                <CardTitle>Public Advocacy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Raising awareness about critical health issues and fighting for the dignity and safety of medical professionals.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>


            {/* CTA */}
            <section className="py-16 md:py-24 bg-primary text-white">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Join the Movement for Better Healthcare</h2>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
                        Become a member of HRDA today and contribute to the future of the medical profession in Telangana.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100 font-bold px-10 h-14 rounded-full shadow-xl">
                        <Link href="/index.php/new-registration-2/">
                            Become a Member <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </section>
        </Layout >
    );
}
