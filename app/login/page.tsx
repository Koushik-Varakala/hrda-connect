"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    Loader2, 
    ArrowLeft, 
    Lock, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    CheckCircle2, 
    Stethoscope, 
    Scale, 
    Building2,
    AlertCircle
} from "lucide-react";
import { signIn } from "next-auth/react";
import { appConfig } from "@/lib/app-config";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid username or password. Please verify your credentials.");
            }

            toast({
                title: "Authentication Successful",
                description: "Welcome back to the HRDA Administration Portal.",
            });

            router.push("/admin/dashboard");
            router.refresh();

        } catch (error: any) {
            toast({
                title: "Authentication Failed",
                description: error.message || "Invalid login credentials.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-12 bg-slate-50 font-sans">
            {/* Left Column - Official Medical Association Branding Panel */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#1a237e] via-[#0d47a1] to-[#1565c0] text-white p-12 flex-col justify-between relative overflow-hidden">
                {/* Subtle Decorative Background Element */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Official Website
                    </Link>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-white p-2.5 rounded-xl shadow-md">
                            <img
                                src="/hrda_full_logo.png"
                                alt="HRDA Logo"
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold tracking-wider mb-6">
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        SECURE ADMINISTRATION PORTAL
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-serif font-bold leading-tight mb-6 text-white drop-shadow-sm">
                        Advocating for Doctors &amp; Healthcare Excellence
                    </h1>

                    <p className="text-blue-100 text-lg leading-relaxed max-w-xl mb-10">
                        Official state management portal for the Healthcare Reforms Doctors Association ({appConfig.stateName}). Access state election panels, member registries, and legal verification systems.
                    </p>

                    {/* Key Capabilities */}
                    <div className="space-y-4 max-w-lg">
                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="p-2 rounded-lg bg-white/15 shrink-0">
                                <Stethoscope className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">State Medical Council Verification</h3>
                                <p className="text-xs text-blue-200 mt-0.5">Automated registration cross-verification with official medical registers.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="p-2 rounded-lg bg-white/15 shrink-0">
                                <Scale className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">Legal &amp; Anti-Quackery Enforcement</h3>
                                <p className="text-xs text-blue-200 mt-0.5">Section 8 Inspection records and statutory compliance management.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="p-2 rounded-lg bg-white/15 shrink-0">
                                <Building2 className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">Secure Electoral &amp; Document Management</h3>
                                <p className="text-xs text-blue-200 mt-0.5">End-to-end encrypted nomination audits and election portal governance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
                    <span>&copy; {new Date().getFullYear()} HRDA {appConfig.stateName}. All rights reserved.</span>
                    <span className="flex items-center gap-1.5 font-medium">
                        <Lock className="w-3.5 h-3.5 text-emerald-300" /> 256-Bit SSL Encrypted
                    </span>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="col-span-12 lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Back Link */}
                    <div className="lg:hidden flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Website
                        </Link>
                    </div>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3">
                        <img
                            src="/hrda_full_logo.png"
                            alt="HRDA Logo"
                            className="h-10 w-auto"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                            <Lock className="w-3.5 h-3.5" /> OFFICIAL ACCESS
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                            Admin Portal Sign In
                        </h2>
                        <p className="text-slate-600 text-sm">
                            Enter your official administrator credentials to securely access the HRDA command panel.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                                    Username or Email
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter authorized username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-11 px-3.5 border-slate-300 rounded-lg focus-visible:ring-blue-600 bg-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 px-3.5 pr-10 border-slate-300 rounded-lg focus-visible:ring-blue-600 bg-white"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating Session...
                                </>
                            ) : (
                                "Sign In to Admin Portal"
                            )}
                        </Button>
                    </form>

                    {/* Security Compliance Box */}
                    <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Authorized Personnel Only
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            This system is restricted to authorized officers and administrators of HRDA {appConfig.stateName}. Unauthorized access attempts are logged and monitored under statutory data protection guidelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
