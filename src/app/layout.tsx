// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
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

// Central SEO constants reused across metadata, structured data and the manifest.
const SITE_URL = "https://mp3-tool.louisvolant.com";
const SITE_NAME = "MP3 Audio Editor";
const SITE_TITLE = "Audio Editor - Trim and Enhance Your Audio Files";
const SITE_DESCRIPTION =
  "Free online MP3 audio editor: upload a track, visualize its waveform, trim, adjust volume, apply fades and export a new MP3 file — all in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "audio editor",
    "mp3 editor",
    "trim mp3",
    "cut audio",
    "audio trimmer",
    "waveform editor",
    "fade in",
    "fade out",
    "online audio editor",
  ],
  authors: [{ name: "Louis Volant", url: "https://www.louisvolant.com" }],
  creator: "Louis Volant",
  publisher: "Louis Volant",
  category: "Multimedia",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: [
    { rel: "icon", url: "/icon_music.png" },
    { rel: "apple-touch-icon", url: "/icon_music.png" },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// JSON-LD structured data helps search engines understand the app.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/og-image.png`,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Louis Volant",
    url: "https://www.louisvolant.com",
  },
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
            <span className="text-2xl font-bold">MP3 Tool</span>
          </div>
        </header>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />

        {/* Structured data for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
