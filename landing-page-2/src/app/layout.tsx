import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerCleanup } from "@/components/service-worker-cleanup";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
  ),
  title: "AIマスター2日間集中キャンプ｜経営者・幹部向けAI講座",
  description:
    "時間が無い経営者やシステム開発を目指す方が、ChatGPT、Codex、Claude Code、バイブコーディング、AIエージェント作成まで学ぶ2日間集中強化キャンプ。",
  openGraph: {
    title: "AIマスター2日間集中キャンプ｜経営者・幹部向けAI講座",
    description:
      "ChatGPT、Codex、Claude Codeを使い、AI時代の最先端を短期で学ぶ2日間集中強化キャンプ。",
    type: "website",
    locale: "ja_JP",
    images: ["/images/hero-ceo-ai-advisor.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerCleanup />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
