import { HomePage } from "@/components/store/home-page";
import { getStoreCategories } from "@/data/store";
import { getFeaturedProducts, getHomepageShowcaseProducts, getNewestProducts } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";

export default async function Page() {
  const products = await getProducts();
  const storeCategories = getStoreCategories(products);
  const featuredProducts = getHomepageShowcaseProducts(products, 16);
  const weeklyHit = getFeaturedProducts(products, 1)[0] ?? featuredProducts[0] ?? null;
  const [firstNewest, secondNewest] = getNewestProducts(products, 2);
  const offerDay = secondNewest ?? firstNewest ?? featuredProducts[1] ?? weeklyHit;

  return (
    <HomePage
      featuredProducts={featuredProducts}
      offerDay={offerDay}
      storeCategories={storeCategories}
      weeklyHit={weeklyHit}
    />
  );
}
