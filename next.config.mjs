/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["ddteam-hub.vercel.app", "localhost:3000"],
    },
  },
};

export default nextConfig;
