import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bundles of Joy",
  description: "A shared wall of good moments, kind words, and encouragement.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
