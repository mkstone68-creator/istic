/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "isticvote.online", "www.isticvote.online"],
    },
  },
  async headers() {
    return [
      // Pages publiques + OG : accessibles à tous les crawlers
      {
        source: "/((?!admin).*)",
        headers: [
          { key: "X-Robots-Tag",                value: "all" },
          { key: "Access-Control-Allow-Origin",  value: "*" },
        ],
      },
      // Routes OG images : cache long, CORS ouvert
      {
        source: "/og/:path*",
        headers: [
          { key: "Cache-Control",               value: "public, max-age=3600, s-maxage=3600" },
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "X-Robots-Tag",                value: "all" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
