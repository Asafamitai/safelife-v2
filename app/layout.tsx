import type { Metadata } from "next";
import { Suspense } from "react";
import { FirstRunGate } from "@/components/first-run-gate";
import { Toaster } from "@/components/toaster";
import "./globals.css";

const SITE_URL = "https://safelife-v2.vercel.app";
const TITLE = "SafeLife — Trusted support for aging parents";
const DESCRIPTION =
  "Make sure they're okay — without managing everything. One interface. Every task. Fully protected.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SafeLife",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: "SafeLife — the life operating system for seniors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <FirstRunGate>{children}</FirstRunGate>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
