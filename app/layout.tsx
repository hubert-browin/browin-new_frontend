import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";

import { CartProvider } from "@/components/store/cart-provider";
import { FavoritesProvider } from "@/components/store/favorites-provider";
import { StoreChrome } from "@/components/store/store-chrome";
import { getStoreCategories } from "@/data/store";
import { getProducts } from "@/lib/product-feed";
import { getRecipeCommerceEntries } from "@/lib/recipes";
import { getMetadataBase } from "@/lib/site-url";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
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

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getProducts();
  const recipeCommerceEntries = await getRecipeCommerceEntries(products);
  const storeCategories = getStoreCategories(products);
  const cartProducts = products.map(({ id, slug, title, subtitle, images, variants }) => ({
    id,
    slug,
    title,
    subtitle,
    images,
    variants,
  }));

  return (
    <html lang="pl" className={`${montserrat.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased selection:bg-browin-red selection:text-white">
        <CartProvider products={cartProducts}>
          <FavoritesProvider>
            <StoreChrome
              recipeCommerceEntries={recipeCommerceEntries}
              storeCategories={storeCategories}
            >
              {children}
            </StoreChrome>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
