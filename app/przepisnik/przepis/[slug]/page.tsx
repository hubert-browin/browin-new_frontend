import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeCard } from "@/components/store/recipe-card";
import { RecipeListBackButton } from "@/components/store/recipe-list-back-button";
import { RecipeProductPicker } from "@/components/store/recipe-product-picker";
import { RecipeProductReturnDock } from "@/components/store/recipe-product-return-dock";
import type { Recipe } from "@/data/recipes";
import { getPrimaryVariant } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import {
  getRecipeBySlug,
  getRecipes,
  hydrateRecipe,
} from "@/lib/recipes";
import {
  buildRecipebookCategoryHref,
  buildRecipebookNavigationContext,
  type RecipebookRecipeNavItem,
} from "@/lib/recipebook-navigation";
import { getMetadataBase } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return {
      title: "Przepis nie istnieje",
    };
  }

  return {
    title: recipe.title,
    description: recipe.metaDescription,
    alternates: {
      canonical: `/przepisnik/przepis/${recipe.slug}`,
    },
    openGraph: {
      title: recipe.title,
      description: recipe.metaDescription,
      images: [{ url: recipe.heroImage }],
      type: "article",
      publishedTime: recipe.publishedAt,
    },
  };
}

const buildRecipeJsonLd = ({
  canonicalUrl,
  recipe,
}: {
  canonicalUrl: string;
  recipe: Recipe;
}) => ({
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: recipe.title,
  description: recipe.metaDescription,
  image: recipe.images,
  author: {
    "@type": "Organization",
    name: "BROWIN",
  },
  datePublished: recipe.publishedAt,
  recipeCategory: recipe.category.name,
  keywords: recipe.tags.join(", "),
  recipeIngredient: recipe.ingredientLines,
  recipeInstructions: [
    {
      "@type": "HowToStep",
      text: recipe.contentText,
    },
  ],
  mainEntityOfPage: canonicalUrl,
});

const buildBreadcrumbJsonLd = ({
  canonicalUrl,
  title,
}: {
  canonicalUrl: string;
  title: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "BROWIN",
      item: getMetadataBase().toString(),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Przepiśnik",
      item: new URL("/przepisnik", getMetadataBase()).toString(),
    },
    {
      "@type": "ListItem",
      position: 3,
      name: title,
      item: canonicalUrl,
    },
  ],
});

function RecipeStepLink({
  direction,
  recipe,
}: {
  direction: "next" | "previous";
  recipe: RecipebookRecipeNavItem;
}) {
  return (
    <Link
      className="group grid min-h-28 grid-cols-[5.75rem_minmax(0,1fr)] gap-4 border border-browin-dark/10 bg-browin-white p-3 transition-colors hover:border-browin-red md:grid-cols-[7rem_minmax(0,1fr)] md:p-4"
      href={recipe.href}
    >
      <span className="relative h-20 overflow-hidden bg-browin-dark md:h-24">
        <Image
          alt={recipe.title}
          className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
          fill
          sizes="112px"
          src={recipe.heroImage}
        />
      </span>
      <span className="flex min-w-0 flex-col justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
          {direction === "previous" ? "Poprzedni przepis" : "Następny przepis"}
        </span>
        <span className="mt-2 line-clamp-2 text-base font-bold leading-tight tracking-tight text-browin-dark transition-colors group-hover:text-browin-red md:text-lg">
          {recipe.title}
        </span>
        <span className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-browin-dark/45">
          {recipe.category.name}
        </span>
      </span>
    </Link>
  );
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const recipes = await getRecipes(products);
  const recipe = recipes.find((entry) => entry.slug === slug) ?? null;

  if (!recipe) {
    notFound();
  }

  const hydratedRecipe = hydrateRecipe(recipe, products);
  const hasRecipeIngredients = recipe.ingredients.some(
    (ingredient) => ingredient.kind !== "separator",
  );
  const hasRecipeProducts = hydratedRecipe.productGroups.some(
    (group) =>
      group.products.some((entry) => getPrimaryVariant(entry.product).stock > 0),
  );
  const hasRecipeProductPickerContent =
    hasRecipeIngredients || hasRecipeProducts;
  const recipeGridColumnsClass =
    hasRecipeIngredients && hasRecipeProducts
      ? "lg:grid-cols-[minmax(0,1fr)_14rem_15rem] xl:grid-cols-[minmax(0,1fr)_16rem_17rem] 2xl:grid-cols-[minmax(0,1fr)_18rem_19rem]"
      : hasRecipeIngredients
        ? "lg:grid-cols-[minmax(0,1fr)_18rem]"
        : hasRecipeProducts
          ? "lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:grid-cols-[minmax(0,1fr)_19rem]"
          : "lg:grid-cols-1";
  const recipebookNavigation = buildRecipebookNavigationContext(recipes, {
    currentRecipeSlug: recipe.slug,
    relatedLimit: 3,
  });
  const recipeCategoryHref = buildRecipebookCategoryHref({
    categorySlug: recipe.category.slug,
  });
  const canonicalUrl = new URL(
    `/przepisnik/przepis/${recipe.slug}`,
    getMetadataBase(),
  ).toString();
  const jsonLd = [
    buildRecipeJsonLd({ canonicalUrl, recipe }),
    buildBreadcrumbJsonLd({ canonicalUrl, title: recipe.title }),
  ];

  return (
    <section className="bg-browin-gray pb-[calc(var(--mobile-bottom-nav-height)+var(--mobile-recipe-cta-height)+2rem)] lg:pb-16">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <RecipeProductReturnDock recipeSlug={recipe.slug} recipeTitle={recipe.title} />

      <div className={`recipe-detail-layout grid gap-6 px-0 py-0 ${recipeGridColumnsClass}`}>
        <article className="min-w-0 bg-browin-white lg:shadow-sm">
          <div className="border-b border-browin-dark/10 p-4 md:p-8 lg:border">
            <RecipeListBackButton />

            <nav
              aria-label="Nawigacja przepisu"
              className="mb-4 hidden min-w-0 flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-dark/45 md:flex"
            >
              <Link
                aria-label="Wróć do listy przepisów"
                className="rounded-md border border-transparent px-2 py-1 transition-colors hover:border-browin-red/20 hover:bg-browin-red/5 hover:text-browin-red focus-visible:border-browin-red focus-visible:bg-browin-red/5 focus-visible:text-browin-red"
                href="/przepisnik"
              >
                Przepiśnik
              </Link>
              <span className="text-browin-dark/25">/</span>
              <Link
                aria-label={`Zobacz przepisy z kategorii ${recipe.category.name}`}
                className="rounded-md border border-transparent px-2 py-1 transition-colors hover:border-browin-red/20 hover:bg-browin-red/5 hover:text-browin-red focus-visible:border-browin-red focus-visible:bg-browin-red/5 focus-visible:text-browin-red"
                href={recipeCategoryHref}
              >
                {recipe.category.name}
              </Link>
              <span className="text-browin-dark/25">/</span>
              <span
                aria-current="page"
                className="max-w-full truncate rounded-md bg-browin-dark/5 px-2 py-1 text-browin-dark/62"
              >
                {recipe.title}
              </span>
            </nav>

            <div className="flex flex-wrap gap-2">
              <Link
                className="bg-browin-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-white"
                href={recipeCategoryHref}
              >
                {recipe.category.name}
              </Link>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-[1.06] tracking-tight text-browin-dark md:text-5xl">
              {recipe.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-browin-dark/68 md:text-lg">
              {recipe.excerpt}
            </p>

            <div className="relative mt-6 aspect-[5/2] max-h-[22rem] overflow-hidden bg-browin-dark">
              <Image
                alt={recipe.title}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 56vw"
                src={recipe.heroImage}
              />
            </div>
          </div>

          {recipe.introHtml ? (
            <div className="border-b border-browin-dark/10 bg-browin-gray/55 p-4 md:p-7 lg:border-x">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-red">
                Wprowadzenie
              </p>
              <div
                className="recipe-rich-text text-base leading-relaxed text-browin-dark/74 md:text-lg"
                dangerouslySetInnerHTML={{ __html: recipe.introHtml }}
              />
            </div>
          ) : null}

          <div className="border-b border-browin-dark/10 p-4 md:p-8 lg:border-x">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-red">
              Przygotowanie
            </p>
            <div
              className="recipe-rich-text mt-5 text-base leading-relaxed text-browin-dark/74"
              dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
            />

            {recipe.footer ? (
              <p className="mt-8 border-l-4 border-browin-red bg-browin-gray px-5 py-4 text-base font-bold text-browin-dark">
                {recipe.footer}
              </p>
            ) : null}
          </div>
        </article>

        {hasRecipeProductPickerContent ? (
          <RecipeProductPicker
            groups={hydratedRecipe.productGroups}
            ingredients={recipe.ingredients}
            recipeSlug={recipe.slug}
            recipeTitle={recipe.title}
          />
        ) : null}
      </div>

      {recipebookNavigation.previousRecipe || recipebookNavigation.nextRecipe ? (
        <div className="container mx-auto px-4">
          <div className="grid gap-4 pt-8 md:grid-cols-2">
            {recipebookNavigation.previousRecipe ? (
              <RecipeStepLink
                direction="previous"
                recipe={recipebookNavigation.previousRecipe}
              />
            ) : null}
            {recipebookNavigation.nextRecipe ? (
              <RecipeStepLink
                direction="next"
                recipe={recipebookNavigation.nextRecipe}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {recipebookNavigation.relatedRecipes.length > 0 ? (
        <div className="container mx-auto px-4">
          <div className="pt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
              Więcej inspiracji
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
              Podobne przepisy
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {recipebookNavigation.relatedRecipes.map((related) => (
                <RecipeCard compact key={related.id} recipe={related} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
