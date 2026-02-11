import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-50 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold text-center mb-4">About HRDA</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Our history, mission, and the team behind the movement.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
        {/* History */}
        <section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our History</h2>
              <div className="prose prose-slate max-w-none text-muted-foreground">
                <p className="mb-4">
                  The Healthcare Reforms Doctors Association (HRDA) was established with a singular vision: to create a transparent, efficient, and equitable healthcare system in Telangana.
                </p>
                <p className="mb-4">
                  Born out of the collective necessity to address systemic gaps in medical education and healthcare delivery, HRDA has grown into a formidable voice for doctors. We have led numerous successful campaigns advocating for better working conditions, fair policies, and the autonomy of medical institutions.
                </p>
                <p>
                  From challenging irregularities in medical councils to fighting for the rights of post-graduate students, our history is defined by unwavering commitment to the truth and the welfare of the medical fraternity.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              {/* Unsplash: Medical team meeting */}
              <img
                src="/HRDA-group.jpeg"
                alt="HRDA History"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Agenda */}
        <section>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary">Our Agenda</h2>
            <p className="text-muted-foreground">
              We are committed to a comprehensive roadmap for healthcare reform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "To work for Reforms in present Healthcare System, especially in Primary Health Sector of both Rural & Urban areas (Universal Health Care).",
              "To work until separate medical recruitment board is established for calendar year recruitment of Healthcare Professionals for improved healthcare delivery.",
              "To promote Ethical Practice among Registered Healthcare Professionals.",
              "To Conduct Health Awareness Programs and Multidisciplinary Health Camps.",
              "To Work for Total ban on Quack practice which is causing adverse effects on health of people.",
              "To pursue for strict Act implementation for not issuing of drugs other than on-counter medicines by pharmacies.",
              "To work for minimum wages for duty doctors in private sector.",
              "To bring the Doctors under common platform to deal with assaults on Healthcare Professionals"
            ].map((item, i) => (
              <Card key={i} className="card-hover border-l-4 border-l-primary border-t-0 bg-white shadow-sm">
                <CardContent className="pt-6 flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Founders Note - can be dynamic later */}
        {/* Founders Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary">Our Founders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The visionaries who established HRDA to fight for the rights of the medical fraternity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Dr. K. Mahesh Kumar",
                role: "Founder & President",
                image: "https://placehold.co/400x400?text=Mahesh+Kumar",
                bio: "A dedicated advocate for medical reforms, Dr. Mahesh Kumar led the charge in establishing HRDA to address systemic issues in healthcare administration."
              },
              {
                name: "Dr. G. Srinivas",
                role: "Co-Founder",
                image: "https://placehold.co/400x400?text=G.+Srinivas",
                bio: "With a passion for policy transparency, Dr. Srinivas has been instrumental in shaping the organizational structure and strategic goals of HRDA."
              }
            ].map((founder, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl shadow-lg border border-slate-100 items-center">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-md"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-800">{founder.name}</h3>
                  <div className="text-primary font-medium mb-2">{founder.role}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {founder.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
