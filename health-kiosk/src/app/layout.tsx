import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { BackgroundServiceInitializer } from "@/components/background-service-initializer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "eKonsulTech Health Kiosk",
  description: "A healthcare kiosk application for remote consultations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <BackgroundServiceInitializer />
          <main className="w-full min-h-screen">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
