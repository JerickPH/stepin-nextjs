/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  async headers() {
    const longCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/uploads/:path*", headers: longCache },
      { source: "/fonts/:path*", headers: longCache },
      { source: "/img/:path*", headers: longCache },
    ];
  },
  async redirects() {
    // keep old WordPress media URLs working
    return [{ source: "/wp-content/uploads/:path*", destination: "/uploads/:path*", permanent: true }];
  },
};
export default nextConfig;
