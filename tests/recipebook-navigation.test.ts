import assert from "node:assert/strict";
import test from "node:test";

import type { Recipe } from "../data/recipes";
import {
  buildRecipebookCategories,
  buildRecipebookCategoryHref,
  buildRecipebookNavigationContext,
  filterRecipebookRecipes,
} from "../lib/recipebook-navigation";

const makeRecipe = ({
  categoryName = "Mięso i wędliny",
  categorySlug = "mieso-i-wedliny",
  id,
  ingredientLines = [],
  newestOrder,
  tags = [],
  title,
}: {
  categoryName?: string;
  categorySlug?: string;
  id: string;
  ingredientLines?: string[];
  newestOrder: number;
  tags?: string[];
  title: string;
}): Recipe => ({
  id,
  slug: id,
  title,
  excerpt: title,
  metaDescription: title,
  author: "BROWIN",
  category: {
    name: categoryName,
    slug: categorySlug,
  },
  publishedAt: "2026-04-27",
  heroImage: "/assets/recipe.webp",
  images: ["/assets/recipe.webp"],
  introHtml: "",
  ingredientsHtml: "",
  contentHtml: "",
  footer: "",
  tags,
  ingredients: ingredientLines.map((line, index) => ({
    id: `ingredient-${index}`,
    text: line,
  })),
  ingredientLines,
  relatedProductIds: [],
  contentText: title,
  introText: title,
  newestOrder,
});

const recipes = [
  makeRecipe({
    id: "szynkowar",
    ingredientLines: ["indyk", "peklosól"],
    newestOrder: 30,
    tags: ["wędliny"],
    title: "Udziec z indyka z szynkowaru",
  }),
  makeRecipe({
    id: "kielbasa",
    ingredientLines: ["wieprzowina"],
    newestOrder: 20,
    title: "Kiełbasa domowa",
  }),
  makeRecipe({
    categoryName: "Przetwory",
    categorySlug: "przetwory",
    id: "kiszonki",
    ingredientLines: ["kalafior", "granat"],
    newestOrder: 10,
    tags: ["kiszonki"],
    title: "Kiszony kalafior",
  }),
] satisfies Recipe[];

test("buduje linki przepiśnika bez nowych tras SEO", () => {
  assert.equal(buildRecipebookCategoryHref(), "/przepisnik");
  assert.equal(
    buildRecipebookCategoryHref({ categorySlug: "przetwory" }),
    "/przepisnik?category=przetwory",
  );
  assert.equal(
    buildRecipebookCategoryHref({
      categorySlug: "przetwory",
      searchQuery: "  kiszony   kalafior ",
    }),
    "/przepisnik?category=przetwory&search=kiszony+kalafior",
  );
});

test("liczy kategorie i oznacza aktywną kategorię", () => {
  const categories = buildRecipebookCategories(recipes, {
    activeCategorySlug: "mieso-i-wedliny",
  });

  assert.deepEqual(
    categories.map((category) => ({
      count: category.count,
      isActive: category.isActive,
      name: category.name,
      slug: category.slug,
    })),
    [
      {
        count: 2,
        isActive: true,
        name: "Mięso i wędliny",
        slug: "mieso-i-wedliny",
      },
      {
        count: 1,
        isActive: false,
        name: "Przetwory",
        slug: "przetwory",
      },
    ],
  );
});

test("filtruje przepisy po kategorii i frazie ze składników", () => {
  const filteredRecipes = filterRecipebookRecipes(recipes, {
    categorySlug: "mieso-i-wedliny",
    searchQuery: "peklosol",
  });

  assert.deepEqual(
    filteredRecipes.map((recipe) => recipe.slug),
    ["szynkowar"],
  );
});

test("wybiera sąsiednie i podobne przepisy z fallbackiem", () => {
  const context = buildRecipebookNavigationContext(recipes, {
    currentRecipeSlug: "kielbasa",
    relatedLimit: 2,
  });

  assert.equal(context.activeCategory?.slug, "mieso-i-wedliny");
  assert.equal(context.previousRecipe?.slug, "szynkowar");
  assert.equal(context.nextRecipe, null);
  assert.deepEqual(
    context.relatedRecipes.map((recipe) => recipe.slug),
    ["szynkowar", "kiszonki"],
  );
});
