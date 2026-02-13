import type { Metadata } from "next";
import { cn } from "@/lib/utils"
import { Inter, Playfair_Display } from "next/font/google"; // Import Inter and Playfair Display
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poeticus | Blog de Poesia e Escrita Criativa",
  description: "Um espaço digital para poemas, poesias, textos autorais e reflexões profundas.",
};

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { AdBanner } from "@/components/ui/ad-banner"
import { PublicLayoutWrapper } from "@/components/layout/public-layout-wrapper"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-black font-sans antialiased",
        inter.variable,
        playfair.variable
      )}>
        <PublicLayoutWrapper>
          <NotificationBanner />
          <Header />
        </PublicLayoutWrapper>

        <main className="min-h-screen pt-20">
          <PublicLayoutWrapper>
            <AdBanner location="header" />
          </PublicLayoutWrapper>
          {children}
        </main>

        <PublicLayoutWrapper>
          <Footer />
        </PublicLayoutWrapper>
      </body>
    </html>
  );
}
