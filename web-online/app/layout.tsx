import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloodCare",
  description: "Bilingual flood assistance with citizen and staff portals.",
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
