/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip type checking and linting during build to speed up recruitment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
