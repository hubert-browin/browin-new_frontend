import type { Product } from "./products";

export const RECIPEBOOK_PAGE_SIZE = 12;

export type BrowinJsonRecipeCategory = {
  nazwa?: string | null;
  slug?: string | null;
};

export type BrowinJsonRecipe = {
  asortymenty?: Array<string | number | null> | null;
  autor?: string | null;
  datapublikacji?: string | null;
  datazakonczenia?: string | null;
  id?: string | null;
  innezdjecia?: string[] | null;
  kategoria?: BrowinJsonRecipeCategory | null;
  metadescription?: string | null;
  nadkategoria?: string | null;
  podkategoria?: BrowinJsonRecipeCategory | null;
  skladniki?: string | null;
  slug?: string | null;
  stopka?: string | null;
  tagi?: string | null;
  tresc?: string | null;
  tytul?: string | null;
  wstep?: string | null;
  zdjecie?: string | null;
};

export type RecipeCategory = {
  name: string;
  slug: string;
};

export type RecipeIngredient = {
  id: string;
  text: string;
  kind?: "item" | "separator";
  productId?: string;
};

export type RecipeProductRole = "equipment" | "consumable";

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  author: string;
  category: RecipeCategory;
  subcategory?: RecipeCategory;
  publishedAt: string;
  endedAt?: string;
  heroImage: string;
  images: string[];
  introHtml: string;
  ingredientsHtml: string;
  contentHtml: string;
  footer: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  ingredientLines: string[];
  relatedProductIds: string[];
  contentText: string;
  introText: string;
  newestOrder: number;
};

export type RecipeSummary = Pick<
  Recipe,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "publishedAt"
  | "heroImage"
  | "tags"
  | "relatedProductIds"
>;

export type HydratedRecipeProduct = {
  product: Product;
  role: RecipeProductRole;
  ingredientText?: string;
};

export type HydratedRecipeProductGroup = {
  role: RecipeProductRole;
  label: string;
  description: string;
  products: HydratedRecipeProduct[];
};

export type HydratedRecipe = Recipe & {
  availableProducts: HydratedRecipeProduct[];
  productGroups: HydratedRecipeProductGroup[];
};

export type RecipeCommerceEntry = {
  recipeId: string;
  slug: string;
  title: string;
  image: string;
  categoryName: string;
  equipmentProductIds: string[];
  consumableProductIds: string[];
};

export type RecipeCartCrossSellOffer = {
  recipe: RecipeCommerceEntry;
  triggerProductIds: string[];
  missingProductIds: string[];
};
