import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";

import { CartProvider } from "@/components/store/cart-provider";
import { StoreChrome } from "@/components/store/store-chrome";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://browin-demo.local"),
  title: {
    default: "BROWIN - Stwórz własne arcydzieło | Sklep",
    template: "%s | BROWIN",
  },
  description:
    "Interaktywny storefront BROWIN w Next.js z draftowym layoutem, koszykiem, PDP i katalogiem produktów.",
  keywords: [
    "BROWIN",
    "Next.js",
    "e-commerce",
    "storefront",
    "winiarstwo",
    "wędliniarstwo",
    "serowarstwo",
  ],
  openGraph: {
    title: "BROWIN - Stwórz własne arcydzieło | Sklep",
    description:
      "Draft-faithful storefront BROWIN z katalogiem, wyszukiwarką, koszykiem i routingiem App Router.",
    locale: "pl_PL",
    type: "website",
    siteName: "BROWIN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${montserrat.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased selection:bg-browin-red selection:text-white">
        <CartProvider>
          <StoreChrome>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}
