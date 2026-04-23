"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/data/products";
import type { RecipeSummary } from "@/data/recipes";

export type ProductRecipeNavProduct = Pick<
  Product,
  "id" | "slug" | "title" | "images"
>;

export type ProductRecipeNavEntry = {
  product: ProductRecipeNavProduct;
  recipes: RecipeSummary[];
};

type ProductRecipeNavContextValue = {
  closeProductRecipePanel: () => void;
  currentProductRecipeContext: ProductRecipeNavEntry | null;
  isProductRecipePanelOpen: boolean;
  openProductRecipePanel: () => void;
  registerProductRecipes: (context: ProductRecipeNavEntry | null) => void;
};

const ProductRecipeNavContext = createContext<ProductRecipeNavContextValue | null>(
  null,
);

export function ProductRecipeNavProvider({ children }: { children: ReactNode }) {
  const [currentProductRecipeContext, setCurrentProductRecipeContext] =
    useState<ProductRecipeNavEntry | null>(null);
  const [isProductRecipePanelOpen, setIsProductRecipePanelOpen] = useState(false);

  const closeProductRecipePanel = useCallback(() => {
    setIsProductRecipePanelOpen(false);
  }, []);

  const openProductRecipePanel = useCallback(() => {
    setIsProductRecipePanelOpen(true);
  }, []);

  const registerProductRecipes = useCallback(
    (context: ProductRecipeNavEntry | null) => {
      setCurrentProductRecipeContext(context);
      setIsProductRecipePanelOpen(false);
    },
    [],
  );

  const value = useMemo(
    () => ({
      closeProductRecipePanel,
      currentProductRecipeContext,
      isProductRecipePanelOpen,
      openProductRecipePanel,
      registerProductRecipes,
    }),
    [
      closeProductRecipePanel,
      currentProductRecipeContext,
      isProductRecipePanelOpen,
      openProductRecipePanel,
      registerProductRecipes,
    ],
  );

  return (
    <ProductRecipeNavContext.Provider value={value}>
      {children}
    </ProductRecipeNavContext.Provider>
  );
}

export function useProductRecipeNav() {
  const context = useContext(ProductRecipeNavContext);

  if (!context) {
    throw new Error(
      "useProductRecipeNav must be used inside ProductRecipeNavProvider",
    );
  }

  return context;
}
