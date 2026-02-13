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
    // We can add other config here as needed
};

export default nextConfig;
