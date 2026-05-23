/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "public.blob.vercel-storage.com" },
      { hostname: "b8ecogxhbtdkm9yc.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
