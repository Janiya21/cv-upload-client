/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
      },
      eslint: {
        // Ignore ESLint errors
        ignoreDuringBuilds: true,
      }
};

export default nextConfig;
