import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { PWAMeta } from "@/components/pwa-meta";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "FinMate - Your Financial Journey Starts Here",
  description:
    "A fun, gamified budget planning and goal-setting tool. Plan your path to financial freedom with smart savings goals and AI-powered business analysis.",
  keywords: [
    "budget",
    "finance",
    "savings",
    "goals",
    "financial planning",
    "budgeting app",
  ],
  authors: [{ name: "FinMate Team" }],
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinMate",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "FinMate - Your Financial Journey Starts Here",
    description: "Plan your path to financial freedom",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <PWAMeta />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

