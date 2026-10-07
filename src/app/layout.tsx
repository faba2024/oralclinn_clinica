import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oralclin.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Oralclin | Odontologia e Saúde",
    template: "%s | Oralclin",
  },
  description:
    "Odontologia estética, implantes, alinhadores e reabilitação oral com planejamento digital e atendimento humanizado.",
  applicationName: "Oralclin",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Oralclin",
    title: "Oralclin | Odontologia e Saúde",
    description: "Seu sorriso merece um novo capítulo. Agende sua avaliação.",
    images: [{ url: "/images/og/og-oralclin.jpg", width: 1200, height: 630, alt: "Oralclin — Odontologia e Saúde" }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF9F7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${playfair.variable}`}>
      <head>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
