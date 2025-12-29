// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from 'next/image';
import "./globals.css";
import Footer from './Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Editor - Trim and Enhance Your Audio Files",
  description: "A comprehensive tool to edit, trim, and enhance your audio files with ease.",
  keywords: "audio editor, trim audio, enhance audio, waveform editor, audio effects",
  openGraph: {
    title: "Audio Editor - Trim and Enhance Your Audio Files",
    description: "Edit and enhance your audio files effortlessly with our intuitive audio editor.",
    type: "website",
    url: "https://mp3-tool.louisvolant.com",
    images: ['/icon_music.png'],
  },
  icons: [
    { rel: "icon", url: "/icon_music.png" },
    { rel: "apple-touch-icon", url: "/icon_music.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col transition-colors duration-300`}>
        <header className="bg-blue-600 dark:bg-blue-800 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex items-center">
            <Image
              src="/icon_music.png"
              alt="Mp3 Tool Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-2xl font-bold">MP3 Tool</h1>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}