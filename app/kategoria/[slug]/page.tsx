import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogView } from "@/components/store/catalog-view";
import { products } from "@/data/products";
import { getCategoryBySlug, type SortOption } from "@/lib/catalog";

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

export async function generateStaticParams() {
  return [
    "wedliniarstwo",
    "gorzelnictwo",
    "winiarstwo",
    "serowarstwo",
    "piwowarstwo",
    "piekarnictwo",
    "domiogrod",
    "termometry",
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Kategoria nie istnieje",
    };
  }

  return {
    title: category.label,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamRecord>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const paramsRecord = await searchParams;
  const sortCandidate = readString(paramsRecord.sort) as SortOption;
  const sort = sortOptions.has(sortCandidate) ? sortCandidate : "featured";
  const initialSearch = readString(paramsRecord.search);
  const initialDealsOnly = readBoolean(paramsRecord.deal);
  const initialInStockOnly = readBoolean(paramsRecord.stock);
  const viewKey = [
    category.slug,
    initialSearch,
    sort,
    initialDealsOnly ? "deal" : "nodeal",
    initialInStockOnly ? "stock" : "nostock",
  ].join(":");

  return (
    <CatalogView
      key={viewKey}
      description={category.heroTitle}
      eyebrow="Kategoria"
      initialDealsOnly={initialDealsOnly}
      initialInStockOnly={initialInStockOnly}
      initialSearch={initialSearch}
      initialSort={sort}
      lockedCategoryId={category.id}
      products={products}
      title={category.label}
    />
  );
}
