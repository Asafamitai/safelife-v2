import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeLife — Trusted support for aging parents",
  description:
    "SafeLife helps aging parents avoid scams, manage daily tasks, and get help fast — while giving families peace of mind.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
