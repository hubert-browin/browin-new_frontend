import type { Metadata } from "next";

import { CatalogView } from "@/components/store/catalog-view";
import { hasPromotion } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import { getRecipeCountsByProductId } from "@/lib/recipes";

export const metadata: Metadata = {
  title: "Koniec serii",
  description: "Produkty BROWIN w promocjach, wyprzedażach i końcówkach serii.",
  alternates: { canonical: "/sklep/wyprzedaze" },
};

export default async function SaleProductsPage() {
  const [products, recipeCountsByProductId] = await Promise.all([
    getProducts(),
    getRecipeCountsByProductId(),
  ]);
  const saleProducts = products.filter(
    (product) => product.status === "wyprzedaz" || hasPromotion(product),
  );

  return (
    <CatalogView
      description="Promocje i końcówki serii BROWIN z filtrowaniem, sortowaniem oraz szybkim przejściem do produktu."
      eyebrow="Koniec serii"
      products={saleProducts}
      recipeCountsByProductId={recipeCountsByProductId}
      title="Koniec serii"
    />
  );
}
