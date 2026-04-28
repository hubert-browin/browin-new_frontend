import type { Recipe, RecipeCategory, RecipeSummary } from "@/data/recipes";

export const RECIPEBOOK_LAST_HREF_STORAGE_KEY = "browin.recipebook.lastHref";
export const RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY =
  "browin.recipebook.lastListHref";
export const RECIPEBOOK_SCROLL_STORAGE_KEY_PREFIX = "browin.recipebook.scroll:";

export type RecipebookCategoryNav = RecipeCategory & {
  count: number;
  href: string;
  isActive: boolean;
};

export type RecipebookRecipeNavItem = RecipeSummary & {
  href: string;
};

export type RecipebookNavigationContext = {
  activeCategory: RecipebookCategoryNav | null;
  categories: RecipebookCategoryNav[];
  highlightedCategories: RecipebookCategoryNav[];
  nextRecipe: RecipebookRecipeNavItem | null;
  previousRecipe: RecipebookRecipeNavItem | null;
  relatedRecipes: RecipebookRecipeNavItem[];
};

export const isRecipebookPathname = (pathname: string) =>
  pathname === "/przepisnik" || pathname.startsWith("/przepisnik/");

export const isRecipebookHref = (href: string) =>
  href === "/przepisnik" ||
  href.startsWith("/przepisnik?") ||
  href.startsWith("/przepisnik/");

export const isRecipebookListHref = (href: string) =>
  href === "/przepisnik" || href.startsWith("/przepisnik?");

export const normalizeRecipebookHref = (href: string | null) => {
  const trimmedHref = href?.trim() ?? "";

  return isRecipebookHref(trimmedHref) ? trimmedHref : "/przepisnik";
};

export const normalizeRecipebookListHref = (href: string | null) => {
  const trimmedHref = href?.trim() ?? "";

  return isRecipebookListHref(trimmedHref) ? trimmedHref : "/przepisnik";
};

export const buildCurrentRouteHref = (pathname: string, search: string) =>
  search ? `${pathname}?${search}` : pathname;

export const getRecipebookScrollStorageKey = (href: string) =>
  `${RECIPEBOOK_SCROLL_STORAGE_KEY_PREFIX}${href}`;

export const normalizeRecipebookSearchQuery = (value = "") =>
  value.trim().replace(/\s+/g, " ");

const normalizeSearchValue = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export const buildRecipebookCategoryHref = ({
  categorySlug = "",
  searchQuery = "",
}: {
  categorySlug?: string;
  searchQuery?: string;
} = {}) => {
  const params = new URLSearchParams();
  const normalizedSearchQuery = normalizeRecipebookSearchQuery(searchQuery);

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  if (normalizedSearchQuery) {
    params.set("search", normalizedSearchQuery);
  }

  const query = params.toString();

  return query ? `/przepisnik?${query}` : "/przepisnik";
};

const toRecipebookRecipeNavItem = (recipe: Recipe): RecipebookRecipeNavItem => ({
  id: recipe.id,
  slug: recipe.slug,
  title: recipe.title,
  excerpt: recipe.excerpt,
  category: recipe.category,
  publishedAt: recipe.publishedAt,
  heroImage: recipe.heroImage,
  tags: recipe.tags,
  relatedProductIds: recipe.relatedProductIds,
  href: `/przepisnik/przepis/${recipe.slug}`,
});

export const sortRecipebookRecipes = (recipes: Recipe[]) =>
  [...recipes].sort((left, right) => right.newestOrder - left.newestOrder);

export const matchesRecipebookSearch = (recipe: Recipe, searchQuery = "") => {
  const normalizedSearchQuery = normalizeRecipebookSearchQuery(searchQuery);

  if (!normalizedSearchQuery) {
    return true;
  }

  const terms = normalizeSearchValue(normalizedSearchQuery)
    .split(" ")
    .filter(Boolean);
  const haystack = normalizeSearchValue(
    [
      recipe.title,
      recipe.excerpt,
      recipe.metaDescription,
      recipe.category.name,
      recipe.subcategory?.name ?? "",
      recipe.contentText,
      recipe.introText,
      ...recipe.tags,
      ...recipe.ingredientLines,
    ].join(" "),
  );

  return terms.every((term) => haystack.includes(term));
};

export const filterRecipebookRecipes = (
  recipes: Recipe[],
  {
    categorySlug = "",
    searchQuery = "",
  }: {
    categorySlug?: string;
    searchQuery?: string;
  } = {},
) =>
  sortRecipebookRecipes(recipes).filter(
    (recipe) =>
      (!categorySlug || recipe.category.slug === categorySlug) &&
      matchesRecipebookSearch(recipe, searchQuery),
  );

export const buildRecipebookCategories = (
  recipes: Recipe[],
  {
    activeCategorySlug = "",
    searchQuery = "",
  }: {
    activeCategorySlug?: string;
    searchQuery?: string;
  } = {},
): RecipebookCategoryNav[] => {
  const categoriesBySlug = new Map<string, RecipebookCategoryNav>();

  for (const recipe of recipes) {
    const current = categoriesBySlug.get(recipe.category.slug);

    if (current) {
      categoriesBySlug.set(recipe.category.slug, {
        ...current,
        count: current.count + 1,
      });
      continue;
    }

    categoriesBySlug.set(recipe.category.slug, {
      name: recipe.category.name,
      slug: recipe.category.slug,
      count: 1,
      href: buildRecipebookCategoryHref({
        categorySlug: recipe.category.slug,
        searchQuery,
      }),
      isActive: recipe.category.slug === activeCategorySlug,
    });
  }

  return [...categoriesBySlug.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "pl"),
  );
};

export const getHighlightedRecipebookCategories = (
  categories: RecipebookCategoryNav[],
  limit = 4,
) =>
  [...categories]
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name, "pl"),
    )
    .slice(0, limit);

const getRelatedRecipeItems = ({
  currentRecipe,
  limit,
  recipes,
}: {
  currentRecipe: Recipe;
  limit: number;
  recipes: Recipe[];
}) => {
  const seenIds = new Set([currentRecipe.id]);
  const relatedRecipes: Recipe[] = [];
  const addCandidates = (candidates: Recipe[]) => {
    for (const candidate of candidates) {
      if (seenIds.has(candidate.id) || relatedRecipes.length >= limit) {
        continue;
      }

      seenIds.add(candidate.id);
      relatedRecipes.push(candidate);
    }
  };

  addCandidates(
    sortRecipebookRecipes(
      recipes.filter((recipe) => recipe.category.slug === currentRecipe.category.slug),
    ),
  );
  addCandidates(sortRecipebookRecipes(recipes));

  return relatedRecipes.map(toRecipebookRecipeNavItem);
};

export const buildRecipebookNavigationContext = (
  recipes: Recipe[],
  {
    activeCategorySlug = "",
    currentRecipeSlug = "",
    relatedLimit = 3,
    searchQuery = "",
  }: {
    activeCategorySlug?: string;
    currentRecipeSlug?: string;
    relatedLimit?: number;
    searchQuery?: string;
  } = {},
): RecipebookNavigationContext => {
  const currentRecipe =
    recipes.find((recipe) => recipe.slug === currentRecipeSlug) ?? null;
  const resolvedCategorySlug =
    currentRecipe?.category.slug ?? activeCategorySlug;
  const categories = buildRecipebookCategories(recipes, {
    activeCategorySlug: resolvedCategorySlug,
    searchQuery,
  });
  const activeCategory =
    categories.find((category) => category.slug === resolvedCategorySlug) ?? null;
  const categoryRecipes = resolvedCategorySlug
    ? sortRecipebookRecipes(
        recipes.filter((recipe) => recipe.category.slug === resolvedCategorySlug),
      )
    : [];
  const currentRecipeIndex = currentRecipe
    ? categoryRecipes.findIndex((recipe) => recipe.id === currentRecipe.id)
    : -1;
  const previousRecipe =
    currentRecipeIndex > 0
      ? categoryRecipes[currentRecipeIndex - 1]
      : null;
  const nextRecipe =
    currentRecipeIndex >= 0 && currentRecipeIndex < categoryRecipes.length - 1
      ? categoryRecipes[currentRecipeIndex + 1]
    : null;

  return {
    activeCategory,
    categories,
    highlightedCategories: getHighlightedRecipebookCategories(categories),
    nextRecipe: nextRecipe ? toRecipebookRecipeNavItem(nextRecipe) : null,
    previousRecipe: previousRecipe
      ? toRecipebookRecipeNavItem(previousRecipe)
      : null,
    relatedRecipes: currentRecipe
      ? getRelatedRecipeItems({
          currentRecipe,
          limit: relatedLimit,
          recipes,
        })
      : [],
  };
};
