import type { Metadata, Viewport } from "next";
import { externalStylesheets } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stepinrecruitment.com.au"),
  title: { default: "Step In Recruitment", template: "%s – Step In Recruitment" },
  icons: {
    icon: [
      { url: "/uploads/2026/10/cropped-Navy-Blue-Favicon-1-32x32.png", sizes: "32x32" },
      { url: "/uploads/2026/10/cropped-Navy-Blue-Favicon-1-192x192.png", sizes: "192x192" },
    ],
    apple: "/uploads/2026/10/cropped-Navy-Blue-Favicon-1-180x180.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Same stylesheet order as the WordPress site: theme + Elementor bundle, then Google Fonts */}
        <link rel="stylesheet" href="/css/site.css" />
        {externalStylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      {/* Elementor adjusts body classes at runtime, so hydration differences on <body> are expected */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
