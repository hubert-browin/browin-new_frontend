import { CatalogView } from "@/components/store/catalog-view";
import { products } from "@/data/products";
import type { SortOption } from "@/lib/catalog";

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
      description="Działająca wyszukiwarka, filtrowanie i sortowanie po mock danych z wariantami gotowymi do podmiany na realne API."
      eyebrow="Pełny listing"
      initialDealsOnly={initialDealsOnly}
      initialInStockOnly={initialInStockOnly}
      initialSearch={search}
      initialSort={sort}
      products={products}
      title="Katalog produktów"
    />
  );
}
