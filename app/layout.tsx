import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

// Import app config for region-specific metadata
// This runs at build time, so the metadata is static per deployment
const getMetadata = (): Metadata => {
    // For build-time metadata, we need to read the env directly
    const region = (process.env.NEXT_PUBLIC_REGION || 'TG').toUpperCase();
    const isTG = region === 'TG';

    const stateName = isTG ? 'Telangana' : 'Andhra Pradesh';
    const orgName = `Healthcare Reforms Doctors Association - ${stateName}`;
    const domain = isTG ? 'hrda-india.org' : 'ap.hrda-india.org';
    const medicalCouncil = isTG ? 'TGMC' : 'APMC';

    return {
        title: {
            template: `%s | ${orgName}`,
            default: orgName,
        },
        description: `Healthcare Reforms Doctors Association (HRDA) - ${stateName}. Advocating for doctors' rights, healthcare reform, and public health. Join ${medicalCouncil} doctors in our mission.`,
        keywords: ['HRDA', 'doctors association', stateName, medicalCouncil, 'healthcare reform', 'medical council', 'doctors rights', 'India'],
        authors: [{ name: 'HRDA' }],
        creator: 'HRDA',
        publisher: 'HRDA',
        openGraph: {
            type: 'website',
            locale: 'en_IN',
            url: `https://${domain}`,
            title: orgName,
            description: `Advocating for healthcare reform and professional rights in ${stateName}`,
            siteName: orgName,
            images: [
                {
                    url: '/hrda_full_logo.png',
                    width: 1200,
                    height: 630,
                    alt: `${orgName} Logo`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: orgName,
            description: `Advocating for healthcare reform in ${stateName}`,
            images: ['/hrda_full_logo.png'],
        },
        icons: {
            icon: '/hrda_logo.png',
            shortcut: '/hrda_logo.png',
            apple: '/hrda_logo.png',
        },
        manifest: '/site.webmanifest',
    };
};

export const metadata: Metadata = getMetadata();

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
