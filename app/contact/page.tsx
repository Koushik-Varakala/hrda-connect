"use client";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { apiRequest } from "@/lib/queryClient";
import { appConfig } from "@/lib/app-config";

export default function Contact() {
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await apiRequest("POST", "/api/contact", data);
            toast({
                title: "Message Sent",
                description: "We have received your message and will get back to you shortly.",
            });
            reset();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Strip spaces/+/- for WhatsApp/tel link
    const phoneDigits = appConfig.phone.replace(/[\s+\-]/g, '');

    return (
        <Layout>
            <div className="bg-slate-50 py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold text-center mb-4">Contact Us</h1>
                    <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                        Get in touch with us for inquiries, support, or to volunteer.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        <div className="space-y-4">

                            {/* Email */}
                            <Card>
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary flex-shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <a
                                            href={`mailto:${appConfig.email}`}
                                            className="text-primary hover:underline break-all"
                                        >
                                            {appConfig.email}
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Phone / WhatsApp */}
                            <Card>
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-700 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">
                                            {appConfig.whatsappOnly ? 'WhatsApp' : 'Phone'}
                                        </h3>
                                        <a
                                            href={appConfig.whatsappOnly
                                                ? `https://wa.me/${phoneDigits}`
                                                : `tel:${phoneDigits}`}
                                            target={appConfig.whatsappOnly ? '_blank' : undefined}
                                            rel={appConfig.whatsappOnly ? 'noopener noreferrer' : undefined}
                                            className="text-green-700 hover:underline font-medium"
                                        >
                                            {appConfig.phone}
                                        </a>
                                        {appConfig.whatsappOnly && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                WhatsApp only — tap to open chat
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location */}
                            <Card>
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-lg text-primary flex-shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Location</h3>
                                        <p className="text-muted-foreground">
                                            {appConfig.capital}, {appConfig.stateName}, India
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                        <h2 className="text-2xl font-bold mb-6">Send Message</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input {...register("firstName")} placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input {...register("lastName")} placeholder="Doe" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input {...register("email")} type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input {...register("subject")} placeholder="Membership Inquiry" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea {...register("message")} placeholder="How can we help you?" className="min-h-[120px]" required />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
