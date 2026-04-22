import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "../data/products";
import { mockBrowinRecipes } from "../data/mock-recipes";
import {
  buildRecipeCountsByProductId,
  findRecipesByProductId,
  hydrateRecipeProducts,
} from "../lib/recipe-commerce";
import { transformBrowinRecipes } from "../lib/recipe-transformer";

const makeProduct = ({
  id,
  price,
  title,
}: {
  id: string;
  price: number;
  title: string;
}): Product => ({
  id,
  baseProductId: id,
  baseSlug: title.toLowerCase().replace(/\s+/g, "-"),
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  symbol: id,
  ean: id,
  title,
  subtitle: "BROWIN",
  line: "Linia testowa",
  categoryId: "wedliniarstwo",
  shortDescription: title,
  description: title,
  longDescription: title,
  images: ["/assets/produkt1.webp"],
  status: "standard",
  tags: [],
  rating: 4.8,
  reviews: 12,
  soldLast30Days: 3,
  viewingNow: 1,
  popularityScore: 10,
  newestOrder: 1,
  benefits: [],
  features: [],
  specs: [],
  faq: [],
  files: [],
  bundleItems: [],
  relatedProductIds: [],
  complementaryProductIds: [],
  taxonomy: [],
  variants: [
    {
      id: `${id}-default`,
      label: "",
      sku: id,
      price,
      stock: 8,
      leadTime: "24",
      availabilityLabel: "Dostępny",
    },
  ],
});

test("transformuje przepisy, SEO pola, składniki i bezpieczny HTML", () => {
  const recipes = transformBrowinRecipes(
    mockBrowinRecipes,
    new Map([["310002", "receptura-babci-leokadii-do-peklowania-35-g"]]),
  );
  const recipe = recipes.find(
    (entry) => entry.slug === "udziec-z-indyka-z-pistacjami-szynkowar",
  );

  assert.ok(recipe);
  assert.equal(recipe.title, "Udziec z indyka z pistacjami - szynkowar");
  assert.equal(recipe.category.slug, "mieso-i-wedliny");
  assert.deepEqual(recipe.relatedProductIds, ["313016", "313015", "312024", "310002"]);
  assert.ok(recipe.metaDescription.includes("udziec"));
  assert.ok(recipe.ingredients.some((ingredient) => ingredient.productId === "310002"));
  assert.ok(
    recipe.ingredientsHtml.includes(
      '/produkt/receptura-babci-leokadii-do-peklowania-35-g',
    ),
  );
  assert.ok(!recipe.ingredientsHtml.includes("style="));
  assert.ok(recipe.contentHtml.includes('class="mb-4 mt-8'));
});

test("buduje odwrotny indeks przepisów po ID produktu", () => {
  const recipes = transformBrowinRecipes(mockBrowinRecipes);
  const counts = buildRecipeCountsByProductId(recipes);
  const szynkowarRecipes = findRecipesByProductId(recipes, "313016");

  assert.equal(counts["313016"], 1);
  assert.equal(counts["411240"], 1);
  assert.equal(szynkowarRecipes[0]?.slug, "udziec-z-indyka-z-pistacjami-szynkowar");
});

test("klasyfikuje produkty przepisu na sprzęt i zapasy", () => {
  const [recipe] = transformBrowinRecipes(mockBrowinRecipes);

  assert.ok(recipe);

  const hydrated = hydrateRecipeProducts(recipe, [
    makeProduct({ id: "313016", title: "Szynkowar ze stali nierdzewnej", price: 119.99 }),
    makeProduct({ id: "310002", title: "Receptura Babci Leokadii do peklowania", price: 7.99 }),
  ]);

  assert.equal(
    hydrated.productGroups.find((group) => group.role === "equipment")?.products[0]?.product.id,
    "313016",
  );
  assert.equal(
    hydrated.productGroups.find((group) => group.role === "consumable")?.products[0]?.product.id,
    "310002",
  );
});
