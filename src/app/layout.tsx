import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HAMS - Lead City University Hostel Portal",
  description:
    "Automated rule-based Hostel Allocation Management System (HAMS) for Lead City University, Ibadan.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-lcu-pink selection:text-slate-900 relative">
        {/* Animated ambient backdrop blobs for WOW premium aesthetic */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-lcu-blue/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lcu-pink/15 blur-[120px] animate-blob" />
        </div>
        
        <Providers>
          <div className="relative z-10 flex flex-col flex-grow min-h-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
