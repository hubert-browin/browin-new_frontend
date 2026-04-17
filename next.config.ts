import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "browin.pl",
      },
    ],
  },
};

export default nextConfig;
