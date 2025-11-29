import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
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
  openGraph: {
    title: "FinMate - Your Financial Journey Starts Here",
    description: "Plan your path to financial freedom",
    type: "website",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}

