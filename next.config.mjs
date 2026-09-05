/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    // Explicit env (Docker build-arg, platform dashboard var, .env.production)
    // always wins. Absent that, production builds default to the live API
    // rather than silently pointing at localhost; dev keeps localhost.
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://api.pahariyatri.com' : 'http://localhost:4000'),
  },
};

export default nextConfig;
