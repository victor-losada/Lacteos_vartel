/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i42d9qctgnyy3wqn.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
