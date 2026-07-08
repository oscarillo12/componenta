import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import SupportAgent from "@/components/SupportAgent";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "Componenta — Gestión de repuestos",
  description: "Fotografía, digitaliza y publica tus repuestos en segundos",
  verification: {
    google: "eYYWBuHnJIf1IOcBP_7uvl1mntycP-gX3cXjDUs9fw4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <meta name="google-site-verification" content="eYYWBuHnJIf1IOcBP_7uvl1mntycP-gX3cXjDUs9fw4" />
        </head>
        <body className="min-h-full flex flex-col">
          <CartProvider>
            {children}
            <SupportAgent />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
