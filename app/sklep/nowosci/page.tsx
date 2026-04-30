import type { Metadata } from "next";

import { CatalogView } from "@/components/store/catalog-view";
import { getProducts } from "@/lib/product-feed";
import { getRecipeCountsByProductId } from "@/lib/recipes";

export const metadata: Metadata = {
  title: "Nowości",
  description: "Nowe produkty BROWIN dostępne w katalogu nowego sklepu.",
  alternates: { canonical: "/sklep/nowosci" },
};

export default async function NewProductsPage() {
  const [products, recipeCountsByProductId] = await Promise.all([
    getProducts(),
    getRecipeCountsByProductId(),
  ]);
  const newProducts = products.filter((product) => product.status === "nowosc");

  return (
    <CatalogView
      description="Nowe produkty BROWIN z pełnymi kartami, wariantami i możliwością dodania do koszyka."
      eyebrow="Nowości"
      initialSort="newest"
      products={newProducts}
      recipeCountsByProductId={recipeCountsByProductId}
      title="Nowości"
    />
  );
}
