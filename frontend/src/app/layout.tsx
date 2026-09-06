import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SUTRIXA AI - Build With AI",
    template: "%s | SUTRIXA AI",
  },
  description:
    "Discover premium website templates, source code, AI prompts, and digital resources crafted for modern builders. Professionally designed websites for creators, businesses, and agencies.",
  keywords: ["website templates", "source code", "AI prompts", "digital products", "web development", "Next.js", "React", "Tailwind CSS"],
  authors: [{ name: "SUTRIXA AI" }],
  creator: "SUTRIXA AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sutrixa.ai",
    siteName: "SUTRIXA AI",
    title: "SUTRIXA AI - Build With AI",
    description: "Premium website templates, source code, and digital resources crafted for modern builders.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUTRIXA AI - Build With AI",
    description: "Premium website templates, source code, and digital resources crafted for modern builders.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
