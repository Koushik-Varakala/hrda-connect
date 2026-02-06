import { Layout } from "@/components/Layout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  X, ZoomIn, Gavel, Scale, FileText, CheckCircle2,
  Users, Building2, Vote, Megaphone, ShieldCheck, HeartPulse
} from "lucide-react";

export default function Achievements() {
  const [selectedMedia, setSelectedMedia] = useState<{ image: string, title: string, description: string } | null>(null);

  const legalWins = [
    "Revoked G.Os 41 and 43: Fee reduction (115% to 990%) for PG courses in 2017-2019 batches, saving ₹200 crores for 1500 students.",
    "Blocked G.O 78: Cancelled exorbitant fee hike (₹3.7L to ₹25L/year) for super specialty courses.",
    "Halted Quack Training: Stopped govt training programs for unqualified practitioners via PIL.",
    "PG Seat Blocking: Solely fought against seat blocking, forcing a Mop-up round.",
    "Stipend Justice: Helped 2018 batch PGs claim ₹80,500 stipend for May 2021.",
    "Certificate Release: Filed complaints to secure release of original certificates for PGs.",
    "Non-Medical Appointments: Opposed IAS officer as TVVP Commissioner (Govt eventually cancelled it).",
    "Osmania General Hospital: Pursuing PIL for new building construction (final stages).",
    "Reduced Bank Guarantee: Successfully reduced admission bank guarantee from 2 years to 1 year."
  ];

  const manifestoPoints = [
    "State-of-the-Art TSMC Building",
    "Eradication of Quackery & Crosspathy",
    "Digital Transformation (Online NOCs/Registrations)",
    "Affordable Fees (Rationalized charges)",
    "Enforcing Ethics & Professional Dignity",
    "FMGE & Stipend Reforms",
    "Professional Development (CME credits)",
    "Accountability (Audit of last 15 years)",
    "Senior Doctor Support (Helpdesk for >60 yrs)"
  ];

  const electedMembers = [
    "Dr. Prathibha Lakshmi", "Dr. Mahesh Kumar K", "Dr. Bandari Raj Kumar",
    "Dr. G. Srinivas", "Dr. Kiran Kumar Thotawar", "Dr. Anand S",
    "Dr. Yeggana Srinivas", "Dr. Ravi Kumar Kusumaraju", "Dr. Naresh Kumar V",
    "Dr. Srikanth Jukuru", "Dr. Sunny Davis Ayyala", "Dr. Vishnu KUN", "Dr. Syed Khaja Imran Ali"
  ];

  const postElectionWins = [
    { title: "New Premises", desc: "Moved TSMC to a modern building within 8 months.", icon: Building2 },
    { title: "Anti-Quackery Action", desc: "Filed 600+ FIRs against quacks, setting a national precedent.", icon: ShieldCheck },
    { title: "Digital Council", desc: "100% Online registrations & renewals with reduced fees.", icon: FileText },
    { title: "FMGE Internships", desc: "Transparent, fair, and hassle-free allotment system.", icon: Users },
    { title: "National Recognition", desc: "NMC appointed HRDA Chairman to draft National Anti-Quackery Guidelines.", icon: Gavel },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-6"
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

      {/* Legal Victories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-serif font-bold text-slate-900">Legal Victories</h2>
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                HRDA has filed over <b>40 PILs and writs</b> in the High Court, leading to the cancellation of exploitative GOs and saving over <b>₹200 crores</b> for students.
              </p>
              <ul className="space-y-4">
                {legalWins.map((win, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-slate-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                    <span>{win}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-red-500" />
                COVID-19 Leadership
              </h3>
              <p className="text-slate-600 mb-4">
                When the system faltered, HRDA led from the front:
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>Distributed ₹60 Lakhs worth of PPEs, N95 masks, and sanitizers.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>Recognized 2,000 COVID warriors.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>Secured special ICU wards for doctors at NIMS.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>Coordinated massive plasma donation drives.</li>
              </ul>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-orange-500" />
                Agitations & Advocacy
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div><b>Telangana Vaidya Garjana:</b> Protested against training quacks.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div><b>NMC Bill:</b> Advocated and protested in New Delhi.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div><b>Anti-Quackery:</b> Launched 'Collection of Quacks Prescriptions' movement.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Election Section */}
      <section className="py-16 bg-slate-900 text-white relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-4">December 2023</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Unprecedented Victory</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              After 17 years, elections were held. HRDA won <b>13 out of 13 seats</b>, a clean sweep that reiterated the trust of doctors across Telangana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Manifesto */}
            <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                Our Vision (Manifesto)
              </h3>
              <ul className="grid gap-3">
                {manifestoPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Elected Members */}
            <div className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 p-8 rounded-2xl border border-blue-500/20">
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <Vote className="w-6 h-6 text-green-400" />
                The Elected Panel
              </h3>
              <div className="flex flex-wrap gap-2">
                {electedMembers.map((member, i) => (
                  <Badge key={i} className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 border-blue-500/30 px-3 py-1.5 text-base">
                    {member}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-slate-400 italic">
                  "Probably for the first time in history, a single panel has won all elected positions."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Election Impact */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Promises Delivered</h2>
            <p className="text-muted-foreground w-full max-w-2xl mx-auto">
              Once in power, HRDA translated words into action with remarkable speed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {postElectionWins.map((win, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                    <win.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{win.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{win.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage Section */}
      <div className="bg-white py-16 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Media Coverage</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MediaCard
              image="/press/hc-junks-fees.jpg"
              title="High Court Strikes Down Fee Hike"
              description="A landmark victory: The Telangana High Court ruled against the government's 2017 GOs that increased PG medical fees, directing colleges to refund excess money."
              onClick={() => setSelectedMedia({
                image: "/press/hc-junks-fees.jpg",
                title: "High Court Strikes Down Fee Hike",
                description: "A landmark victory: The Telangana High Court ruled against the government's 2017 GOs that increased PG medical fees, directing colleges to refund excess money."
              })}
            />
            <MediaCard
              image="/press/ias-officer-protest.jpg"
              title="Opposition to Non-Medical Appointments"
              description="HRDA strongly objected to the appointment of an IAS officer as TVVP Commissioner, insisting that only qualified medical professionals should head medical bodies."
              onClick={() => setSelectedMedia({
                image: "/press/ias-officer-protest.jpg",
                title: "Opposition to Non-Medical Appointments",
                description: "HRDA strongly objected to the appointment of an IAS officer as TVVP Commissioner, insisting that only qualified medical professionals should head medical bodies."
              })}
            />
            <MediaCard
              image="/press/renewal-time-demand.jpg"
              title="Demanding Time for Renewals"
              description="HRDA urged the Health Secretary to provide sufficient time for clinical establishment registration renewals before initiating inspections or fines."
              onClick={() => setSelectedMedia({
                image: "/press/renewal-time-demand.jpg",
                title: "Demanding Time for Renewals",
                description: "HRDA urged the Health Secretary to provide sufficient time for clinical establishment registration renewals before initiating inspections or fines."
              })}
            />
            <MediaCard
              image="/press/medical-council-puppet.jpg"
              title="Protecting Medical Council Autonomy"
              description="Fighting against attempts to reduce elected members in the State Medical Council, HRDA moved the High Court to ensure fair elections and autonomy."
              onClick={() => setSelectedMedia({
                image: "/press/medical-council-puppet.jpg",
                title: "Protecting Medical Council Autonomy",
                description: "Fighting against attempts to reduce elected members in the State Medical Council, HRDA moved the High Court to ensure fair elections and autonomy."
              })}
            />
            <MediaCard
              image="/press/abolish-quackery-request.jpg"
              title="Fight Against Quackery"
              description="Representation submitted to Minister KTR demanding stricter anti-quackery laws, establishment of more PHCs, and filling of medical vacancies."
              onClick={() => setSelectedMedia({
                image: "/press/abolish-quackery-request.jpg",
                title: "Fight Against Quackery",
                description: "Representation submitted to Minister KTR demanding stricter anti-quackery laws, establishment of more PHCs, and filling of medical vacancies."
              })}
            />
            <MediaCard
              image="/press/tsmc-online-facility.png"
              title="TSMC Grants Online Facility"
              description="Victory for doctors: TSMC allowed online renewal of registration certificates after doctors threatened protest, saving them from traveling to Hyderabad."
              onClick={() => setSelectedMedia({
                image: "/press/tsmc-online-facility.png",
                title: "TSMC Grants Online Facility",
                description="Victory for doctors: TSMC allowed online renewal of registration certificates after doctors threatened protest, saving them from traveling to Hyderabad."
              })}
            />
            <MediaCard
              image="/press/medicine-shortage.png"
              title="Medicine Shortage Decried"
              description="HRDA raised the alarm on severe shortages of basic emergency medicines in state-run hospitals like Sultan Bazaar Maternity Hospital."
              onClick={() => setSelectedMedia({
                image: "/press/medicine-shortage.png",
                title: "Medicine Shortage Decried",
                description: "HRDA raised the alarm on severe shortages of basic emergency medicines in state-run hospitals like Sultan Bazaar Maternity Hospital."
              })}
            />
            <MediaCard
              image="/press/quackery-menace-launch.png"
              title="Campaign Against Quackery"
              description="Doctor associations launched a statewide drive to end the menace of unqualified medical practitioners disrupting the healthcare system."
              onClick={() => setSelectedMedia({
                image: "/press/quackery-menace-launch.png",
                title: "Campaign Against Quackery",
                description: "Doctor associations launched a statewide drive to end the menace of unqualified medical practitioners disrupting the healthcare system."
              })}
            />
            <MediaCard
              image="/press/pg-fee-role.png"
              title="State Has No Role in PG Fees"
              description="High Court clarifies that fixing PG medical fees is the job of the Admission and Regulatory Committee (AFRC), not the state government."
              onClick={() => setSelectedMedia({
                image: "/press/pg-fee-role.png",
                title: "State Has No Role in PG Fees",
                description: "High Court clarifies that fixing PG medical fees is the job of the Admission and Regulatory Committee (AFRC), not the state government."
              })}
            />
            <MediaCard
              image="/press/toothless-panels.jpg"
              title="Anti-Quackery Panels Toothless"
              description="HRDA criticized the new district anti-quackery committees as ineffective, demanding an officer-cum-online grievance redressal system instead."
              onClick={() => setSelectedMedia({
                image: "/press/toothless-panels.jpg",
                title: "Anti-Quackery Panels Toothless",
                description="HRDA criticized the new district anti-quackery committees as ineffective, demanding an officer-cum-online grievance redressal system instead."
              })}
            />
            <MediaCard
              image="/press/harish-directive-ruffles.png"
              title="Objection to 'Quack' Training"
              description="HRDA condemned the Health Minister's directive to appoint trained unqualified persons, highlighting the need to eradicate quackery instead."
              onClick={() => setSelectedMedia({
                image: "/press/harish-directive-ruffles.png",
                title: "Objection to 'Quack' Training",
                description: "HRDA condemned the Health Minister's directive to appoint trained unqualified persons, highlighting the need to eradicate quackery instead."
              })}
            />
            <MediaCard
              image="/press/hrda-unmasks-charlatans.png"
              title="Unmasking Medical Charlatans"
              description="HRDA submitted evidence exposing over 300 quacks across Telangana to the health authorities, demanding strict legal action under the NMC Act."
              onClick={() => setSelectedMedia({
                image: "/press/hrda-unmasks-charlatans.png",
                title: "Unmasking Medical Charlatans",
                description: "HRDA submitted evidence exposing over 300 quacks across Telangana to the health authorities, demanding strict legal action under the NMC Act."
              })}
            />
          </div>
        </div>
      </div>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedMedia && (
              <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
                <div className="flex-1 bg-black/5 overflow-auto relative flex items-center justify-center p-4">
                  <img
                    src={selectedMedia.image}
                    alt={selectedMedia.title}
                    className="max-w-full max-h-full object-contain shadow-lg"
                  />
                </div>
                <div className="p-4 bg-white border-t">
                  <h3 className="text-xl font-bold font-serif">{selectedMedia.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedMedia.description}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function MediaCard({ image, title, description, onClick }: { image: string, title: string, description: string, onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold font-serif mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
