import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/noto-sans-bengali";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AutoLogout } from "@/components/auto-logout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friends Development Society (FDS)",
  description: "Friends Development Society (FDS) - বন্ধুত্ব, সহযোগিতা ও সমৃদ্ধির প্রতীক",
  keywords: ["FDS", "Society", "Finance", "Cooperation", "Friends"],
  authors: [{ name: "FDS Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
        style={{ fontFamily: "'Noto Sans Bengali', var(--font-geist-sans), sans-serif" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoLogout />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
