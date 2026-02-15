import { Layout } from "@/components/Layout";

export default function PrivacyPolicy() {
    return (
        <Layout>
            <div className="bg-slate-50 py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">Privacy Policy</h1>

                    <div className="bg-white rounded-xl shadow-sm p-8 space-y-6 text-slate-700">
                        <p className="text-sm text-slate-500">Last Updated: February 2026</p>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                            <p>
                                Healthcare Reforms Doctors Association ("HRDA", "we", "our", or "us") respects the privacy of our members and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or register as a member.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect includes:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, telephone number, medical registration number (TGMC ID), and professional details that you voluntarily give to us when you register for membership.</li>
                                <li><strong>Payment Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you pay for membership. Note that we store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor (Razorpay).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Use of Your Information</h2>
                            <p className="mb-2">We use the information we collect to:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Create and manage your membership account.</li>
                                <li>Process your payments and issue receipts.</li>
                                <li>Send you administrative information, such as updates, security alerts, and support messages.</li>
                                <li>Send you newsletters, election notices, and information about association activities.</li>
                                <li>Verify your professional credentials as a registered medical practitioner.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Disclosure of Your Information</h2>
                            <p>
                                We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), data analysis, email delivery (Brevo/SMTP), and hosting services.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Security of Your Information</h2>
                            <p>
                                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact Us</h2>
                            <p>
                                If you have questions or comments about this Privacy Policy, please contact us at:
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
