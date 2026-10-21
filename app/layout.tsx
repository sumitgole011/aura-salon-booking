import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA | Salon & Studio",
  description: "A little time for yourself. Book your next appointment with AURA.",
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
