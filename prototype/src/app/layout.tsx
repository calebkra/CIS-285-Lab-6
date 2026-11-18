import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { Flash } from "@/components/Flash";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitSmart (prototype)",
  description: "Demo prototype: share expenses, approve them, and settle up.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">
          Skip to content
        </a>
        <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
          <strong>Prototype demo.</strong> Sign-in is a user switcher, notifications are in-app only, and payments
          are records only — no real authentication or money movement.
        </div>
        <SiteNav />
        <main id="main" className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 md:pb-10">
          <Suspense>
            <Flash />
          </Suspense>
          {children}
        </main>
      </body>
    </html>
  );
}
