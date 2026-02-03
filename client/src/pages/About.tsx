import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <Layout>
      <div className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif font-bold text-center mb-4">About HRDA</h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Our history, mission, and the team behind the movement.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-20">
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
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Unsplash: Medical team meeting */}
              <img 
                src="https://images.unsplash.com/photo-1576091160550-217358c7e618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                alt="HRDA History" 
                className="absolute inset-0 w-full h-full object-cover"
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
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Medical Education", desc: "Ensuring quality standards, fair admission processes, and adequate infrastructure in medical colleges." },
              { title: "Public Health", desc: "Strengthening primary healthcare centers and ensuring accessible medical services for rural populations." },
              { title: "Doctors' Rights", desc: "Advocating for safety in the workplace, fair compensation, and protection against violence." },
              { title: "Policy Transparency", desc: "Demanding transparency in the functioning of medical councils and regulatory bodies." },
              { title: "Research & Innovation", desc: "Promoting medical research and adopting modern technologies in healthcare delivery." },
              { title: "Community Welfare", desc: "Conducting health camps and awareness programs for the general public." }
            ].map((item, i) => (
              <Card key={i} className="card-hover border-t-4 border-t-primary">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Founders Note - can be dynamic later */}
        <section className="bg-primary/5 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Founding Vision</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl italic text-slate-700 leading-relaxed mb-6">
              "We believe that a healthy society is built on the foundation of a robust healthcare system where doctors can practice with dignity and patients can receive care with trust. HRDA is the bridge between these two ideals."
            </p>
            <div className="font-bold text-primary">— Founders of HRDA</div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
