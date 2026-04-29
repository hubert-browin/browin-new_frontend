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
      {
        source: "/kalkulator-winiarski",
        destination: "/kalkulatory?calculator=wine",
        permanent: true,
      },
      {
        source: "/kalkulator-nalewkowy",
        destination: "/kalkulatory?calculator=tincture",
        permanent: true,
      },
      {
        source: "/kalkulator-serowarski",
        destination: "/kalkulatory?calculator=cheese",
        permanent: true,
      },
      {
        source: "/kalkulator-wedliniarski",
        destination: "/kalkulatory?calculator=meat",
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
