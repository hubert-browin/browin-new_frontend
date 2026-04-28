export const RECIPE_BRIDGE_CONTEXT_STORAGE_KEY = "browin.recipeBridgeContext";
export const PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY = "browin.productBridgeContext";

export type RecipeBridgeContext = {
  recipeSlug: string;
  recipeTitle: string;
  savedAt: number;
};

export type ProductBridgeContext = {
  productImage?: string;
  productSlug: string;
  productTitle: string;
  recipeSlug: string;
  recipeTitle?: string;
  savedAt: number;
};
