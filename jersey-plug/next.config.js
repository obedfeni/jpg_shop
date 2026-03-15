/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
  serverExternalPackages: ['google-spreadsheet', 'google-auth-library', 'cloudinary'],
};

module.exports = nextConfig;
