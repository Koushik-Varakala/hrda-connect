import { Layout } from "@/components/Layout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  X, ZoomIn, Gavel, Scale, FileText, CheckCircle2,
  Users, Building2, Vote, Megaphone, ShieldCheck, HeartPulse
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";

export default function Achievements() {
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const legalWins = achievements?.filter(a => a.category === 'legal') || [];
  const associationWins = achievements?.filter(a => a.category === 'association') || [];
  const postElectionWins = achievements?.filter(a => a.category === 'post_election') || [];
  const galleryImages = achievements?.filter(a => a.imageUrl) || [];

  // Helper to get icon for category/title (simplified for dynamic content)
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("legal") || title.toLowerCase().includes("court")) return <Scale className="w-5 h-5 text-primary" />;
    if (title.toLowerCase().includes("covid")) return <HeartPulse className="w-5 h-5 text-red-500" />;
    if (title.toLowerCase().includes("protest") || title.toLowerCase().includes("legacy")) return <Megaphone className="w-5 h-5 text-orange-500" />;
    return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl text-headline md:text-6xl font-serif font-bold mb-6"
          >
            A Legacy of Struggle & Victory
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto"
          >
            From fighting exploitative fees to reforming the Medical Council, HRDA has consistently stood for the dignity of doctors and the safety of patients.
          </motion.p>
        </div>
      </div>

      {/* Gallery / Highlights Section */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Gallery & Highlights</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Visual evidence of our struggles, protests, and victories.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl!}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-800 shadow-sm">
                        {item.date ? new Date(item.date).getFullYear() : ''}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                      {getIcon(item.title)}
                      <span>{item.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Legal Victories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Legal */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-serif font-bold text-slate-900">Legal Battles</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                HRDA has filed diverse PILs and writs in the High Court, protecting the rights of medical professionals and students.
              </p>

              {legalWins.length === 0 && <p className="text-slate-500 italic">No legal achievements added yet.</p>}

              <ul className="space-y-4">
                {legalWins.map((win) => (
                  <motion.li
                    key={win.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{win.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{win.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Association / Advocacy */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-orange-500" />
                Agitations & Association Activities
              </h3>

              {associationWins.length === 0 && <p className="text-slate-500 italic">No activities added yet.</p>}

              <ul className="space-y-6">
                {associationWins.map((win) => (
                  <li key={win.id} className="relative pl-6 border-l-2 border-slate-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                    <h4 className="font-bold text-slate-800">{win.title}</h4>
                    <p className="text-slate-600 text-sm mt-1">{win.description}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Post Election Impact */}
      <section className="py-16 bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Post-Election Reforms</h2>
            <p className="text-slate-400 w-full max-w-2xl mx-auto">
              Delivering on promises: Key milestones achieved after the historic victory.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {postElectionWins.map((win) => (
              <div key={win.id} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors">
                <div className="mb-4 bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-blue-400">
                  {/* Dynamic Icon placeholder or generic */}
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{win.title}</h3>
                <p className="text-sm text-slate-400">{win.description}</p>
              </div>
            ))}
          </div>
          {postElectionWins.length === 0 && <p className="text-center text-slate-500 italic">No post-election achievements added yet.</p>}
        </div>
      </section>

    </Layout>
  );
}
