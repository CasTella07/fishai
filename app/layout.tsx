import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fishai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FishAI — 湘南の釣りAI",
    template: "%s | FishAI",
  },
  description: "潮汐グラフ・今日行くべき度・魚種ランキングを毎朝チェック。湘南エリア専属の釣りAIアシスタント。",
  applicationName: "FishAI",
  keywords: ["釣り", "湘南", "AI", "タイドグラフ", "潮汐", "ヒラメ", "シーバス", "茅ヶ崎"],
  authors: [{ name: "FishAI" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: APP_URL,
    siteName: "FishAI",
    title: "FishAI — 湘南の釣りAI",
    description: "潮汐グラフ・今日行くべき度・魚種ランキングを毎朝チェック。湘南エリア専属の釣りAIアシスタント。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FishAI — 湘南の釣りAIアシスタント",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FishAI — 湘南の釣りAI",
    description: "潮汐グラフ・今日行くべき度・魚種ランキングを毎朝チェック。湘南エリア専属の釣りAIアシスタント。",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FishAI",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: "#030b16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
