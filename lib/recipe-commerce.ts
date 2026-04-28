import type { Product } from "@/data/products";
import type {
  HydratedRecipe,
  HydratedRecipeProduct,
  HydratedRecipeProductGroup,
  Recipe,
  RecipeCartCrossSellOffer,
  RecipeCommerceEntry,
  RecipeProductRole,
} from "@/data/recipes";
import { getPrimaryVariant } from "@/lib/catalog";

const equipmentRoleOverrides: Record<string, RecipeProductRole> = {
  "132903": "equipment",
  "139044": "equipment",
  "139055": "equipment",
  "139056": "equipment",
  "313015": "equipment",
  "313016": "equipment",
  "411215": "equipment",
  "411302": "equipment",
};

const consumableRoleOverrides: Record<string, RecipeProductRole> = {
  "310002": "consumable",
  "410002": "consumable",
  "411200": "consumable",
  "411240": "consumable",
};

const recipeRoleOverrides: Record<string, Record<string, RecipeProductRole>> = {
  "jogurt-skyr": {
    "411200": "consumable",
    "411240": "consumable",
    "411215": "equipment",
    "411302": "equipment",
  },
  "kiszony-kalafior-z-granatem": {
    "132903": "equipment",
    "139044": "equipment",
    "139055": "equipment",
    "362014": "consumable",
  },
  "udziec-z-indyka-z-pistacjami-szynkowar": {
    "310002": "consumable",
    "312024": "equipment",
    "313015": "equipment",
    "313016": "equipment",
  },
};

const equipmentKeywords = [
  "balon",
  "beczka",
  "butelka",
  "destylator",
  "docisk",
  "fermentor",
  "forma",
  "garnek",
  "gąsior",
  "generator",
  "jogurtownica",
  "kociołek",
  "maszynka",
  "nadziewarka",
  "pojemnik",
  "prasa",
  "sito",
  "słoik",
  "słój",
  "szynkowar",
  "termometr",
  "wędzarnia",
];

const consumableKeywords = [
  "aromat",
  "chmiel",
  "drożd",
  "enzym",
  "esencja",
  "frukta",
  "jelita",
  "korek",
  "kultury",
  "kwasomix",
  "mieszanka",
  "osłonka",
  "peklo",
  "podpuszcz",
  "pożywka",
  "przypraw",
  "siatka",
  "sól",
  "słód",
  "worek",
  "worki",
  "zrębki",
  "żel",
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const productHaystack = (product: Product) =>
  normalize(
    [
      product.title,
      product.subtitle,
      product.line,
      product.categoryId,
      ...product.tags,
      ...product.features,
      ...product.taxonomy.flatMap((entry) => [
        entry.lineName,
        entry.categoryName,
        entry.subcategoryName ?? "",
      ]),
    ].join(" "),
  );

export const classifyRecipeProduct = (
  recipe: Pick<Recipe, "slug">,
  product: Product,
): RecipeProductRole => {
  const recipeOverride = recipeRoleOverrides[recipe.slug]?.[product.id];

  if (recipeOverride) {
    return recipeOverride;
  }

  if (consumableRoleOverrides[product.id]) {
    return consumableRoleOverrides[product.id];
  }

  if (equipmentRoleOverrides[product.id]) {
    return equipmentRoleOverrides[product.id];
  }

  const haystack = productHaystack(product);

  if (consumableKeywords.some((keyword) => haystack.includes(normalize(keyword)))) {
    return "consumable";
  }

  if (equipmentKeywords.some((keyword) => haystack.includes(normalize(keyword)))) {
    return "equipment";
  }

  return getPrimaryVariant(product).price >= 45 ? "equipment" : "consumable";
};

export const buildRecipeCountsByProductId = (recipes: Recipe[]) => {
  const counts: Record<string, number> = {};

  for (const recipe of recipes) {
    for (const productId of new Set(recipe.relatedProductIds)) {
      counts[productId] = (counts[productId] ?? 0) + 1;
    }
  }

  return counts;
};

export const findRecipesByProductId = (recipes: Recipe[], productId: string) =>
  recipes.filter((recipe) => recipe.relatedProductIds.includes(productId));

export const hydrateRecipeProducts = (
  recipe: Recipe,
  products: Product[],
): HydratedRecipe => {
  const productIndex = new Map(products.map((product) => [product.id, product]));
  const ingredientByProductId = new Map(
    recipe.ingredients
      .filter((ingredient) => ingredient.kind !== "separator" && ingredient.productId)
      .map((ingredient) => [ingredient.productId!, ingredient.text]),
  );
  const seenBaseProductIds = new Set<string>();
  const availableProducts: HydratedRecipeProduct[] = [];

  for (const productId of recipe.relatedProductIds) {
    const product = productIndex.get(productId);

    if (!product || seenBaseProductIds.has(product.baseProductId)) {
      continue;
    }

    seenBaseProductIds.add(product.baseProductId);
    availableProducts.push({
      product,
      role: classifyRecipeProduct(recipe, product),
      ...(ingredientByProductId.get(product.id)
        ? { ingredientText: ingredientByProductId.get(product.id) }
        : {}),
    });
  }

  const equipment = availableProducts.filter((entry) => entry.role === "equipment");
  const consumables = availableProducts.filter((entry) => entry.role === "consumable");
  const productGroups: HydratedRecipeProductGroup[] = [
    {
      role: "equipment",
      label: "Przydatne produkty",
      description: "Najważniejsze narzędzia i akcesoria, które ułatwią przygotowanie przepisu.",
      products: equipment,
    },
    {
      role: "consumable",
      label: "Uzupełnij zapasy",
      description: "Składniki, przyprawy i dodatki, które domykają ten konkretny przepis.",
      products: consumables,
    },
  ];

  return {
    ...recipe,
    availableProducts,
    productGroups: productGroups.filter((group) => group.products.length > 0),
  };
};

export const createRecipeCommerceEntries = (
  recipes: Recipe[],
  products: Product[],
): RecipeCommerceEntry[] =>
  recipes
    .map((recipe) => {
      const hydrated = hydrateRecipeProducts(recipe, products);
      const equipmentProductIds = hydrated.availableProducts
        .filter((entry) => entry.role === "equipment")
        .map((entry) => entry.product.id);
      const consumableProductIds = hydrated.availableProducts
        .filter((entry) => entry.role === "consumable")
        .map((entry) => entry.product.id);

      if (equipmentProductIds.length === 0 || consumableProductIds.length === 0) {
        return null;
      }

      return {
        recipeId: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        image: recipe.heroImage,
        categoryName: recipe.category.name,
        categorySlug: recipe.category.slug,
        equipmentProductIds,
        consumableProductIds,
      };
    })
    .filter((entry): entry is RecipeCommerceEntry => Boolean(entry));

export const getRecipeCartCrossSellOffers = ({
  cartProductIds,
  entries,
  limit = 2,
}: {
  cartProductIds: string[];
  entries: RecipeCommerceEntry[];
  limit?: number;
}): RecipeCartCrossSellOffer[] => {
  const cartSet = new Set(cartProductIds);

  return entries
    .map((entry) => {
      const triggerProductIds = entry.equipmentProductIds.filter((id) => cartSet.has(id));
      const missingProductIds = entry.consumableProductIds.filter((id) => !cartSet.has(id));

      if (triggerProductIds.length === 0 || missingProductIds.length === 0) {
        return null;
      }

      return {
        recipe: entry,
        triggerProductIds,
        missingProductIds,
      };
    })
    .filter((offer): offer is RecipeCartCrossSellOffer => Boolean(offer))
    .sort(
      (left, right) =>
        right.triggerProductIds.length - left.triggerProductIds.length ||
        right.missingProductIds.length - left.missingProductIds.length,
    )
    .slice(0, limit);
};
