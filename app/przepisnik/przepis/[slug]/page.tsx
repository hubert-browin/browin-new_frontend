import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeCard } from "@/components/store/recipe-card";
import { RecipeListBackButton } from "@/components/store/recipe-list-back-button";
import { RecipeProductPicker } from "@/components/store/recipe-product-picker";
import { RecipeProductReturnDock } from "@/components/store/recipe-product-return-dock";
import { getPrimaryVariant } from "@/lib/catalog";
import { getProducts } from "@/lib/product-feed";
import {
  getRecipeBySlug,
  getRecipes,
  hydrateRecipe,
  toRecipeSummary,
} from "@/lib/recipes";
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

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const buildRecipeJsonLd = ({
  canonicalUrl,
  recipe,
}: {
  canonicalUrl: string;
  recipe: Awaited<ReturnType<typeof getRecipeBySlug>> extends infer T ? NonNullable<T> : never;
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

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const recipe = await getRecipeBySlug(slug, products);

  if (!recipe) {
    notFound();
  }

  const hydratedRecipe = hydrateRecipe(recipe, products);
  const hasRecipeIngredients = recipe.ingredients.length > 0;
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
  const allRecipes = await getRecipes(products);
  const relatedRecipes = allRecipes
    .filter((entry) => entry.id !== recipe.id && entry.category.slug === recipe.category.slug)
    .slice(0, 3);
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

            <div className="flex flex-wrap gap-2">
              <Link
                className="bg-browin-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-white"
                href={`/przepisnik?category=${recipe.category.slug}`}
              >
                {recipe.category.name}
              </Link>
              <span className="bg-browin-gray px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/62">
                {formatDate(recipe.publishedAt)}
              </span>
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

      {relatedRecipes.length > 0 ? (
        <div className="container mx-auto px-4">
          <div className="border-t border-browin-dark/10 pt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
              Więcej inspiracji
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-browin-dark md:text-3xl">
              Z tej samej kategorii
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedRecipes.map((related) => (
                <RecipeCard compact key={related.id} recipe={toRecipeSummary(related)} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
