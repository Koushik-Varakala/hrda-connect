import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Healthcare Reforms Doctors Association",
    description: "Healthcare Reforms Doctors Association (HRDA) - Telangana",
    icons: {
        icon: '/hrda_logo.png',
        shortcut: '/hrda_logo.png',
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </body>
        </html>
    );
}
