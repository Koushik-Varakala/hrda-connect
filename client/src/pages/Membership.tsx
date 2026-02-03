import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function Membership() {
  return (
    <Layout>
      <div className="bg-primary py-20 text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Become a Member</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join the strongest voice for doctors in Telangana. Your support strengthens our cause.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Why Join HRDA?</h2>
            <div className="space-y-4">
              {[
                "Representation in government policy making",
                "Legal and professional support",
                "Networking with medical professionals across the state",
                "Access to academic workshops and conferences",
                "A unified voice against violence and injustice"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-lg mb-2">Have Questions?</h3>
              <p className="text-slate-600 mb-1">Email us at: <span className="font-medium text-primary">hrda4people@gmail.com</span></p>
              <p className="text-slate-600">We are here to help you with the registration process.</p>
            </div>
          </div>

          <Card className="shadow-xl border-t-8 border-t-primary">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Lifetime Membership</h3>
              <div className="text-4xl font-bold text-primary mb-2">₹1015</div>
              <p className="text-muted-foreground mb-8">One-time payment</p>

              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  You will be redirected to our secure registration partner portal.
                </p>
                <a 
                  href="https://www.hrda-india.org/index.php/new-registration-2/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="lg" className="w-full font-bold h-12 text-base shadow-lg hover:shadow-xl transition-all">
                    Register Now <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </a>
                <p className="text-xs text-slate-400 mt-4">
                  *By clicking above, you agree to the terms and conditions of HRDA membership.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
}
