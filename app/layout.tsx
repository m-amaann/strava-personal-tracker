import type { Metadata } from "next";

import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { NavigationPreloader } from "@/components/layout/navigation-preloader";
import { AppReadyProvider } from "@/components/layout/app-ready-provider";

const jakarta =
  Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin"],
    weight: [
      "400",
      "500",
      "600",
      "700",
      "800",
    ],
  });

export const metadata: Metadata = {
  title: "EndrivoIQ",
  description:
    "Personal performance journal for tracking running, cycling, training, and progress through real activity data and performance analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppReadyProvider>
          <NavigationPreloader />

          {children}
        </AppReadyProvider>
      </body>
    </html>
  );
}