import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  async redirects() {
    return [
      { source: "/desk/demo", destination: "/meridian/demo", permanent: true },
      { source: "/desk/login", destination: "/meridian/login", permanent: true },
      { source: "/desk/login/:path*", destination: "/meridian/login/:path*", permanent: true },
      { source: "/desk/app", destination: "/meridian/app", permanent: true },
      { source: "/desk/app/:path*", destination: "/meridian/app/:path*", permanent: true },
      { source: "/desk", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/meridian/demo", destination: "/desk/demo" },
      { source: "/meridian/login", destination: "/desk/login" },
      { source: "/meridian/login/:path*", destination: "/desk/login/:path*" },
      { source: "/meridian/app", destination: "/desk/app" },
      { source: "/meridian/app/:path*", destination: "/desk/app/:path*" },
    ];
  },
};

export default nextConfig;
