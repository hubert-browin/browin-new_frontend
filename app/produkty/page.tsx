import { CatalogView } from "@/components/store/catalog-view";
import type { SortOption } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import { getRecipeCountsByProductId } from "@/lib/recipes";

type SearchParamRecord = Record<string, string | string[] | undefined>;

const sortOptions = new Set<SortOption>([
  "featured",
  "newest",
  "popular",
  "rating",
  "price-asc",
  "price-desc",
]);

const readString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const readBoolean = (value: string | string[] | undefined) => {
  const normalized = readString(value);

  return normalized === "true" || normalized === "1";
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const [products, recipeCountsByProductId] = await Promise.all([
    getProducts(),
    getRecipeCountsByProductId(),
  ]);
  const params = await searchParams;
  const search = readString(params.search);
  const sortCandidate = readString(params.sort) as SortOption;
  const sort = sortOptions.has(sortCandidate) ? sortCandidate : "featured";
  const initialDealsOnly = readBoolean(params.deal);
  const initialInStockOnly = readBoolean(params.stock);
  const viewKey = [
    "produkty",
    search,
    sort,
    initialDealsOnly ? "deal" : "nodeal",
    initialInStockOnly ? "stock" : "nostock",
  ].join(":");

  return (
    <CatalogView
      key={viewKey}
      description="Pełny katalog produktów zasilany publicznym JSON-em BROWIN i gotowy do dalszej integracji sklepowej."
      eyebrow="Pełny listing"
      initialDealsOnly={initialDealsOnly}
      initialInStockOnly={initialInStockOnly}
      initialSearch={search}
      initialSort={sort}
      products={products}
      recipeCountsByProductId={recipeCountsByProductId}
      title="Katalog produktów"
    />
  );
}
