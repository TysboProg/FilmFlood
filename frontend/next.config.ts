import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
    output: "standalone",

    images: {
        remotePatterns: [
            {
            protocol: "https",
            hostname: "s3.ru-1.storage.selcloud.ru"
        },
            {
                protocol: "https",
                hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com"
            }]
    }
};

export default nextConfig;
