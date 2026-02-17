import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    // Get region config for sitemap URL
    const region = (process.env.NEXT_PUBLIC_REGION || 'TG').toUpperCase();
    const baseUrl = region === 'TG' ? 'https://hrda-india.org' : 'https://ap.hrda-india.org';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
