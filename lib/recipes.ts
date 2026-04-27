import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { mockBrowinRecipes } from "@/data/mock-recipes";
import { RECIPEBOOK_PAGE_SIZE, type BrowinJsonRecipe, type Recipe } from "@/data/recipes";
import type { Product } from "@/data/products";
import {
  buildRecipeCountsByProductId,
  createRecipeCommerceEntries,
  findRecipesByProductId,
  hydrateRecipeProducts,
} from "@/lib/recipe-commerce";
import { enrichRecipeIngredientMatches } from "@/lib/recipe-ingredient-matcher";
import { toRecipeSummary, transformBrowinRecipes } from "@/lib/recipe-transformer";

export type {
  HydratedRecipe,
  HydratedRecipeProduct,
  HydratedRecipeProductGroup,
  Recipe,
  RecipeCartCrossSellOffer,
  RecipeCommerceEntry,
  RecipeIngredient,
  RecipeProductRole,
  RecipeSummary,
} from "@/data/recipes";
export {
  buildRecipeCountsByProductId,
  createRecipeCommerceEntries,
  findRecipesByProductId,
  getRecipeCartCrossSellOffers,
  hydrateRecipeProducts,
} from "@/lib/recipe-commerce";
export { toRecipeSummary } from "@/lib/recipe-transformer";

const DEFAULT_RECIPE_DATA_URL = "https://browin.pl/recipes.json";
const DEFAULT_CACHE_TTL_SECONDS = 60 * 15;
const RECIPE_FETCH_TIMEOUT_MS = 15_000;
const RECIPE_EXTERNAL_CACHE_FILE = path.join(
  process.cwd(),
  ".cache",
  "browin-recipes.external.json",
);

const RECIPE_DATA_URL = process.env.BROWIN_RECIPE_DATA_URL ?? DEFAULT_RECIPE_DATA_URL;
const RECIPE_CACHE_TTL_SECONDS = Math.max(
  30,
  Number.parseInt(process.env.BROWIN_RECIPE_CACHE_TTL_SECONDS ?? "", 10) ||
    DEFAULT_CACHE_TTL_SECONDS,
);

let cachedRawRecipes: BrowinJsonRecipe[] | null = null;
let cachedAt = 0;
let inflightPromise: Promise<BrowinJsonRecipe[]> | null = null;

const isCacheFresh = () =>
  Boolean(cachedRawRecipes) && Date.now() - cachedAt < RECIPE_CACHE_TTL_SECONDS * 1000;

const getProductSlugMap = (products?: Product[]) =>
  new Map((products ?? []).map((product) => [product.id, product.slug]));

const fetchRawRecipes = async () => {
  if (process.env.BROWIN_RECIPE_MOCK_MODE === "true") {
    return mockBrowinRecipes;
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), RECIPE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(RECIPE_DATA_URL, {
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać przepisów: ${response.status}`);
    }

    const rawRecipes = (await response.json()) as BrowinJsonRecipe[];

    if (!Array.isArray(rawRecipes)) {
      throw new Error("Publiczny feed przepisów nie zwrócił tablicy JSON.");
    }

    return rawRecipes;
  } finally {
    clearTimeout(timeout);
  }
};

const readLastExternalRecipes = async (reason: unknown) => {
  try {
    const cacheContents = await readFile(RECIPE_EXTERNAL_CACHE_FILE, "utf8");
    const cachedRecipes = JSON.parse(cacheContents) as BrowinJsonRecipe[];

    if (!Array.isArray(cachedRecipes) || cachedRecipes.length === 0) {
      throw new Error("Cache zewnętrznego feedu przepisów jest pusty albo niepoprawny.");
    }

    const message = reason instanceof Error ? reason.message : String(reason);

    console.warn(
      `Nie udało się pobrać bieżącego feedu przepisów BROWIN (${message}). Używam ostatniego feedu pobranego z zewnętrznego źródła.`,
    );

    return cachedRecipes;
  } catch {
    const message = reason instanceof Error ? reason.message : String(reason);

    console.warn(
      `Nie udało się pobrać ani odczytać cache przepisów BROWIN (${message}). Używam lokalnych przepisów testowych.`,
    );

    return mockBrowinRecipes;
  }
};

const writeLastExternalRecipes = async (recipes: BrowinJsonRecipe[]) => {
  if (process.env.BROWIN_RECIPE_MOCK_MODE === "true") {
    return;
  }

  try {
    await mkdir(path.dirname(RECIPE_EXTERNAL_CACHE_FILE), { recursive: true });
    await writeFile(RECIPE_EXTERNAL_CACHE_FILE, JSON.stringify(recipes));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Nie udało się zapisać cache zewnętrznego feedu przepisów BROWIN (${message}).`);
  }
};

const getRawRecipes = async (): Promise<BrowinJsonRecipe[]> => {
  if (isCacheFresh()) {
    return cachedRawRecipes!;
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetchRawRecipes()
    .catch(readLastExternalRecipes)
    .then((recipes) => {
      cachedRawRecipes = recipes;
      cachedAt = Date.now();
      void writeLastExternalRecipes(recipes);
      return recipes;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

export const getRecipes = async (products?: Product[]): Promise<Recipe[]> => {
  const rawRecipes = await getRawRecipes();
  const recipes = transformBrowinRecipes(rawRecipes, getProductSlugMap(products));

  return products ? enrichRecipeIngredientMatches(recipes, products) : recipes;
};

export const filterRecipesForRecipebook = (recipes: Recipe[], categorySlug = "") =>
  recipes
    .filter((recipe) => !categorySlug || recipe.category.slug === categorySlug)
    .sort((left, right) => right.newestOrder - left.newestOrder);

export const getRecipebookPage = async ({
  categorySlug = "",
  limit = RECIPEBOOK_PAGE_SIZE,
  offset = 0,
}: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
}) => {
  const recipes = filterRecipesForRecipebook(await getRecipes(), categorySlug.trim());
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);
  const visibleRecipes = recipes.slice(safeOffset, safeOffset + safeLimit).map(toRecipeSummary);

  return {
    recipes: visibleRecipes,
    totalCount: recipes.length,
    hasMore: safeOffset + safeLimit < recipes.length,
  };
};

export const getRecipeBySlug = async (slug: string, products?: Product[]) => {
  const recipes = await getRecipes(products);

  return recipes.find((recipe) => recipe.slug === slug) ?? null;
};

export const getRecipesByProductId = async (productId: string, products?: Product[]) => {
  const recipes = await getRecipes(products);

  return findRecipesByProductId(recipes, productId);
};

export const getRecipeCountsByProductId = async () => {
  const recipes = await getRecipes();

  return buildRecipeCountsByProductId(recipes);
};

export const getRecipeCommerceEntries = async (products: Product[]) => {
  const recipes = await getRecipes(products);

  return createRecipeCommerceEntries(recipes, products);
};

export const hydrateRecipe = hydrateRecipeProducts;
