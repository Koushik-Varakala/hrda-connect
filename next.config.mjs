/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow loading images from external sources
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/index.php/new-registration-2',
                destination: '/register',
                permanent: true,
            },
        ];
    },
    // We can add other config here as needed
};

export default nextConfig;
