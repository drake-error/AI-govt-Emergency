/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all pages are rendered on demand (not statically generated)
  // This prevents build-time fetch() calls to API routes failing on Vercel
  experimental: {},
};

export default nextConfig;
