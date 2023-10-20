import "./src/env/server.mjs";
import "./src/env/client.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/classic",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
