import { CartPage } from "@/components/store/cart-page";
import { getFeaturedProducts } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";

export default async function Page() {
  const products = await getProducts();

  return <CartPage recommendations={getFeaturedProducts(products, 4)} />;
}
