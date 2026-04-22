import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/przepisy",
        destination: "/przepisnik",
        permanent: true,
      },
      {
        source: "/przepisy/:slug",
        destination: "/przepisnik/przepis/:slug",
        permanent: true,
      },
      {
        source: "/przepisnik/przepis",
        destination: "/przepisnik",
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [75, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "browin.pl",
      },
    ],
  },
};

export default nextConfig;
