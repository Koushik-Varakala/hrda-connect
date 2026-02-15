import { Layout } from "@/components/Layout";

export default function TermsOfService() {
    return (
        <Layout>
            <div className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">Terms of Service</h1>

                    <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-slate-700">
                        <p className="text-sm text-slate-500">Last Updated: February 2026</p>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
                            <p>
                                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Healthcare Reforms Doctors Association ("HRDA", “we”, “us”, or “our”), concerning your access to and use of the HRDA website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                            </p>
                            <p className="mt-2">
                                You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms of Service. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Membership Eligibility</h2>
                            <p>
                                Membership to HRDA is generally restricted to registered medical practitioners. By registering as a member, you represent and warrant that:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                <li>You maintain a valid registration with the Telangana Medical Council (or appropriate medical council as required).</li>
                                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Intellectual Property Rights</h2>
                            <p>
                                Unless otherwise indicated, the Site and its contents, including source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Representations</h2>
                            <p>
                                By using the Site, you represent and warrant that: (1) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise; (2) you will not use the Site for any illegal or unauthorized purpose; and (3) your use of the Site will not violate any applicable law or regulation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Modifications and Interruptions</h2>
                            <p>
                                We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the services without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and defined following the laws of India and the state of Telangana. Healthcare Reforms Doctors Association and yourself irrevocably consent that the courts of Telangana shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact Us</h2>
                            <p>
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                <p className="font-bold">Healthcare Reforms Doctors Association</p>
                                <p>Hyderabad, Telangana</p>
                                <p>Email: hrda4people@gmail.com</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
