import type { Metadata } from "next";
import Link from "next/link";

import { RecipebookFeed } from "@/components/store/recipebook-feed";
import { RECIPEBOOK_PAGE_SIZE } from "@/data/recipes";
import { filterRecipesForRecipebook, getRecipes, toRecipeSummary } from "@/lib/recipes";

type SearchParamRecord = Record<string, string | string[] | undefined>;

const readString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export const metadata: Metadata = {
  title: "Czytaj, gotuj i twórz domową jakość.",
  description:
    "Przepisy BROWIN z gotową listą sprzętu, składników i dodatków do kupienia jednym kliknięciem.",
  alternates: {
    canonical: "/przepisnik",
  },
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const params = await searchParams;
  const categorySlug = readString(params.category).trim();
  const recipes = await getRecipes();
  const categories = [...new Map(recipes.map((recipe) => [recipe.category.slug, recipe.category])).values()]
    .sort((left, right) => left.name.localeCompare(right.name, "pl"));
  const filteredRecipes = filterRecipesForRecipebook(recipes, categorySlug);
  const initialRecipes = filteredRecipes
    .slice(0, RECIPEBOOK_PAGE_SIZE)
    .map(toRecipeSummary);
  const currentCategory = categories.find((category) => category.slug === categorySlug);

  return (
    <section className="bg-browin-gray pb-16">
      <div className="bg-browin-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                Przepiśnik BROWIN
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-browin-dark md:text-6xl">
                Czytaj, gotuj i twórz domową jakość.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-browin-dark/68 md:text-lg">
                Każdy przepis łączy inspirację z konkretnymi produktami BROWIN:
                przydatnymi akcesoriami i zapasami, które można dodać do koszyka jednym kliknięciem.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          <Link
            className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
              !categorySlug
                ? "border-browin-red bg-browin-red text-browin-white"
                : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
            }`}
            href="/przepisnik"
          >
            Wszystkie
          </Link>
          {categories.map((category) => {
            const hrefParams = new URLSearchParams();

            hrefParams.set("category", category.slug);

            return (
              <Link
                className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                  categorySlug === category.slug
                    ? "border-browin-red bg-browin-red text-browin-white"
                    : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                }`}
                href={`/przepisnik?${hrefParams.toString()}`}
                key={category.slug}
              >
                {category.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
              {currentCategory?.name ?? "Wszystkie kategorie"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
              {filteredRecipes.length} przepisów gotowych do zakupów
            </h2>
          </div>
          {categorySlug ? (
            <Link
              className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
              href="/przepisnik"
            >
              Wyczyść filtry
            </Link>
          ) : null}
        </div>

        {filteredRecipes.length > 0 ? (
          <RecipebookFeed
            categorySlug={categorySlug}
            initialRecipes={initialRecipes}
            totalCount={filteredRecipes.length}
          />
        ) : (
          <div className="mt-8 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center">
            <h2 className="text-2xl font-bold text-browin-dark">Brak przepisów</h2>
            <p className="mt-3 text-sm leading-relaxed text-browin-dark/62">
              Zmień kategorię, żeby zobaczyć więcej inspiracji.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
