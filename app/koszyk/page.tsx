import { CartPage } from "@/components/store/cart-page";
import { getFeaturedProducts } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import { getRecipeCommerceEntries } from "@/lib/recipes";

export default async function Page() {
  const products = await getProducts();
  const recipeCommerceEntries = await getRecipeCommerceEntries(products);

  return (
    <CartPage
      recipeCommerceEntries={recipeCommerceEntries}
      recommendations={getFeaturedProducts(products, 4)}
    />
  );
}
