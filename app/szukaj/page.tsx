import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { RecipeCard } from "@/components/store/recipe-card";
import type { Product } from "@/data/products";
import {
  filterProducts,
  getFeaturedProducts,
  sortProducts,
} from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import {
  getRecipeCountsByProductId,
  getRecipes,
  toRecipeSummary,
  type Recipe,
} from "@/lib/recipes";

type SearchParamRecord = Record<string, string | string[] | undefined>;

const readString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const matchesRecipeSearch = (recipe: Recipe, query: string) => {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return true;
  }

  return normalize(
    [
      recipe.title,
      recipe.excerpt,
      recipe.metaDescription,
      recipe.category.name,
      recipe.contentText,
      ...recipe.tags,
      ...recipe.ingredientLines,
    ].join(" "),
  ).includes(normalizedQuery);
};

const getSearchProducts = (products: Product[], query: string) => {
  if (!query) {
    return getFeaturedProducts(products, 12);
  }

  return sortProducts(
    filterProducts({
      source: products,
      query,
    }),
    "featured",
  ).slice(0, 24);
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}): Promise<Metadata> {
  const query = readString((await searchParams).search).trim();

  return {
    title: query ? `Szukaj: ${query}` : "Szukaj",
    description:
      "Wyniki wyszukiwania BROWIN łączą produkty, akcesoria i przepisy w jednym miejscu.",
    alternates: {
      canonical: query ? `/szukaj?search=${encodeURIComponent(query)}` : "/szukaj",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const query = readString((await searchParams).search).trim();
  const products = await getProducts();
  const [recipes, recipeCountsByProductId] = await Promise.all([
    getRecipes(products),
    getRecipeCountsByProductId(),
  ]);
  const productResults = getSearchProducts(products, query);
  const recipeResults = recipes
    .filter((recipe) => matchesRecipeSearch(recipe, query))
    .sort((left, right) => right.newestOrder - left.newestOrder)
    .slice(0, query ? 18 : 9);

  return (
    <section className="bg-browin-gray pb-16">
      <div className="bg-browin-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
            Wyszukiwarka BROWIN
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-browin-dark md:text-5xl">
            {query ? `Wyniki dla „${query}”` : "Szukaj produktów i przepisów"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-browin-dark/68">
            Jeden pasek wyszukiwania pokazuje teraz zarówno produkty ze sklepu, jak i przepisy
            z Przepiśnika.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-10">
          <section>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                  Produkty
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
                  {productResults.length} wyników produktowych
                </h2>
              </div>
              <Link
                className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                href={query ? `/produkty?search=${encodeURIComponent(query)}` : "/produkty"}
              >
                Zobacz katalog
              </Link>
            </div>

            {productResults.length > 0 ? (
              <div className="product-grid mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                {productResults.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    priority={index < 4}
                    product={product}
                    recipeCount={recipeCountsByProductId[product.id] ?? 0}
                    titleLines={3}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center">
                <h3 className="text-xl font-bold text-browin-dark">Brak produktów</h3>
                <p className="mt-2 text-sm text-browin-dark/62">
                  Spróbuj krótszej frazy albo sprawdź przepisy poniżej.
                </p>
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                  Przepisy
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
                  {recipeResults.length} inspiracji z Przepiśnika
                </h2>
              </div>
              <Link
                className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                href="/przepisnik"
              >
                Otwórz Przepiśnik
              </Link>
            </div>

            {recipeResults.length > 0 ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recipeResults.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    priority={index < 2}
                    recipe={toRecipeSummary(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center">
                <h3 className="text-xl font-bold text-browin-dark">Brak przepisów</h3>
                <p className="mt-2 text-sm text-browin-dark/62">
                  Zmień frazę albo przejdź do wszystkich kategorii Przepiśnika.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
