import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RecipebookFeed } from "@/components/store/recipebook-feed";
import { RECIPEBOOK_PAGE_SIZE, type Recipe, type RecipeSummary } from "@/data/recipes";
import { filterRecipesForRecipebook, getRecipes, toRecipeSummary } from "@/lib/recipes";
import { buildRecipebookCategories } from "@/lib/recipebook-navigation";

type SearchParamRecord = Record<string, string | string[] | undefined>;

const readString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

const getRandomRecipeSummaries = (recipes: Recipe[], limit: number) => {
  const shuffledRecipes = [...recipes];

  for (let index = shuffledRecipes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledRecipes[index], shuffledRecipes[swapIndex]] = [
      shuffledRecipes[swapIndex],
      shuffledRecipes[index],
    ];
  }

  return shuffledRecipes.slice(0, limit).map(toRecipeSummary);
};

function RecipebookHero({
  recipes,
}: {
  recipes: RecipeSummary[];
}) {
  const [leadRecipe, ...supportingRecipes] = recipes;

  return (
    <div className="border-b border-browin-dark/8 bg-browin-white">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(29rem,1fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center py-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
              Przepiśnik BROWIN
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-browin-dark md:text-5xl">
              Domowe rytuały, sprawdzone smaki.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-browin-dark/68 md:text-base">
              Miejsce dla tych, którzy lubią tworzyć powoli, uważnie i po
              swojemu.
              <br />
              Zbieramy tu receptury pachnące sezonem, tradycją i
              radością odkrywania.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="border border-browin-red/20 bg-browin-red/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-red">
                Sprawdzone proporcje
              </span>
              <span className="border border-browin-dark/10 bg-browin-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-dark/62">
                Receptury krok po kroku
              </span>
            </div>
          </div>

          {leadRecipe ? (
            <div
              className={`grid gap-2 ${
                supportingRecipes.length > 0
                  ? "md:grid-cols-[1.35fr_0.9fr]"
                  : ""
              }`}
            >
              <Link
                className="group relative min-h-[12rem] overflow-hidden bg-browin-dark md:min-h-[15.25rem]"
                href={`/przepisnik/przepis/${leadRecipe.slug}`}
              >
                <Image
                  alt={leadRecipe.title}
                  className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.035]"
                  fill
                  priority
                  sizes="(max-width: 767px) 92vw, 42vw"
                  src={leadRecipe.heroImage}
                />
                <span className="absolute left-3 top-3 bg-browin-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-white">
                  Na start
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-browin-dark/90 via-browin-dark/62 to-transparent p-4 text-browin-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-browin-white/72">
                    {leadRecipe.category.name}
                  </span>
                  <span className="mt-1 block text-xl font-bold leading-tight tracking-tight md:text-2xl">
                    {leadRecipe.title}
                  </span>
                </span>
              </Link>

              {supportingRecipes.length > 0 ? (
                <div className="hidden gap-2 md:grid">
                  {supportingRecipes.map((recipe) => (
                    <Link
                      className="group grid min-h-[7.25rem] grid-cols-[6.75rem_minmax(0,1fr)] overflow-hidden border border-browin-dark/10 bg-browin-white transition-colors hover:border-browin-red"
                      href={`/przepisnik/przepis/${recipe.slug}`}
                      key={recipe.id}
                    >
                      <span className="relative overflow-hidden bg-browin-dark">
                        <Image
                          alt={recipe.title}
                          className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
                          fill
                          sizes="108px"
                          src={recipe.heroImage}
                        />
                      </span>
                      <span className="flex min-w-0 flex-col justify-center p-3">
                        <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-browin-red">
                          {recipe.category.name}
                        </span>
                        <span className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-browin-dark transition-colors group-hover:text-browin-red">
                          {recipe.title}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Czytaj, gotuj i twórz domową jakość.",
  description:
    "Przepiśnik BROWIN: sprawdzone receptury, sezonowe inspiracje i domowe rytuały tworzenia.",
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
  const searchQuery = readString(params.search).trim();
  const recipes = await getRecipes();
  const categories = buildRecipebookCategories(recipes, {
    activeCategorySlug: categorySlug,
    searchQuery,
  });
  const filteredRecipes = filterRecipesForRecipebook(
    recipes,
    categorySlug,
    searchQuery,
  );
  const initialRecipes = filteredRecipes
    .slice(0, RECIPEBOOK_PAGE_SIZE)
    .map(toRecipeSummary);
  const heroRecipes = getRandomRecipeSummaries(filteredRecipes, 3);
  const currentCategory = categories.find((category) => category.slug === categorySlug);
  const hasActiveFilters = Boolean(categorySlug || searchQuery);

  return (
    <section className="bg-browin-gray pb-16">
      <RecipebookHero
        recipes={heroRecipes}
      />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
              {currentCategory?.name ?? "Wszystkie kategorie"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
              {filteredRecipes.length} gotowych przepisów
            </h2>
            {searchQuery ? (
              <p className="mt-2 text-sm font-semibold text-browin-dark/58">
                Wyniki dla: <span className="text-browin-dark">{searchQuery}</span>
              </p>
            ) : null}
          </div>
          {hasActiveFilters ? (
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
            searchQuery={searchQuery}
            totalCount={filteredRecipes.length}
          />
        ) : (
          <div className="mt-8 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center">
            <h2 className="text-2xl font-bold text-browin-dark">Brak przepisów</h2>
            <p className="mt-3 text-sm leading-relaxed text-browin-dark/62">
              Zmień kategorię albo frazę, żeby zobaczyć więcej inspiracji.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
