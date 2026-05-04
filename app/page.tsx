import { HomePage } from "@/components/store/home-page";
import { getStoreCategories } from "@/data/store";
import {
  getFeaturedProducts,
  getHomepageBestsellerProducts,
  getHomepageDealProducts,
  getHomepageForYouProducts,
  getHomepageNewestProducts,
  getHomepageShowcaseProducts,
  getNewestProducts,
} from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import { getRecipes, toRecipeSummary } from "@/lib/recipes";

export default async function Page() {
  const products = await getProducts();
  const recipes = await getRecipes(products);
  const storeCategories = getStoreCategories(products);
  const featuredProducts = getHomepageShowcaseProducts(products, 16);
  const newestProducts = getHomepageNewestProducts(products, 12);
  const bestsellerProducts = getHomepageBestsellerProducts(products, 12);
  const dealProducts = getHomepageDealProducts(products, 12);
  const forYouProducts = getHomepageForYouProducts(products, 12, [
    ...newestProducts.slice(0, 4),
    ...bestsellerProducts.slice(0, 4),
    ...dealProducts.slice(0, 4),
  ]);
  const recipeInspirations = [...recipes]
    .sort((left, right) => right.newestOrder - left.newestOrder)
    .slice(0, 6)
    .map(toRecipeSummary);
  const weeklyHit =
    bestsellerProducts[0] ?? getFeaturedProducts(products, 1)[0] ?? featuredProducts[0] ?? null;
  const [firstNewest, secondNewest] = getNewestProducts(products, 2);
  const offerDay =
    dealProducts[0] ?? secondNewest ?? firstNewest ?? featuredProducts[1] ?? weeklyHit;

  return (
    <HomePage
      bestsellerProducts={bestsellerProducts}
      dealProducts={dealProducts}
      forYouProducts={forYouProducts}
      newestProducts={newestProducts}
      offerDay={offerDay}
      recipeInspirations={recipeInspirations}
      recipeInspirationsTotalCount={recipes.length}
      storeCategories={storeCategories}
      weeklyHit={weeklyHit}
    />
  );
}
