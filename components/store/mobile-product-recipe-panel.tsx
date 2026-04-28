"use client";

import { ArrowRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import {
  PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
  type ProductBridgeContext,
} from "@/components/store/recipe-bridge-context";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { ProductRecipeNavEntry } from "@/components/store/product-recipe-nav-context";
import type { RecipeSummary } from "@/data/recipes";

type MobileProductRecipePanelProps = {
  context: ProductRecipeNavEntry | null;
  isOpen: boolean;
  onClose: () => void;
};

const MAX_PANEL_RECIPES = 6;

const getRecipeHref = (recipe: RecipeSummary) =>
  `/przepisnik/przepis/${recipe.slug}`;

const persistProductContext = (
  product: ProductRecipeNavEntry["product"],
  recipe: RecipeSummary,
) => {
  try {
    const context = {
      productImage: product.images[0],
      productSlug: product.slug,
      productTitle: product.title,
      recipeSlug: recipe.slug,
      recipeTitle: recipe.title,
      savedAt: Date.now(),
    } satisfies ProductBridgeContext;

    window.sessionStorage.setItem(
      PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
      JSON.stringify(context),
    );
  } catch {
    // Session storage is an enhancement only.
  }
};

export function MobileProductRecipePanel({
  context,
  isOpen,
  onClose,
}: MobileProductRecipePanelProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!context || context.recipes.length === 0 || !isOpen) {
    return null;
  }

  const recipes = context.recipes.slice(0, MAX_PANEL_RECIPES);

  return (
    <>
      <button
        aria-label="Zamknij przepisy"
        className="fixed inset-x-0 top-0 z-[58] bg-browin-dark/24 text-left md:hidden"
        onClick={onClose}
        style={{ bottom: "var(--mobile-bottom-nav-height)" }}
        type="button"
      />

      <section
        aria-label="Przepisy do produktu"
        className="fixed inset-x-0 z-[65] max-h-[72dvh] overflow-hidden rounded-t-sm border-y border-browin-dark/10 bg-browin-white md:hidden"
        role="dialog"
        style={{ bottom: "var(--mobile-bottom-nav-height)" }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-browin-dark/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center text-browin-red">
              <RecipebookIcon size={18} weight="fill" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red">
              Przepisy do produktu
            </p>
          </div>
          <button
            aria-label="Zamknij przepisy"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 text-browin-dark/62 transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 py-3">
          {recipes.map((recipe) => (
            <Link
              className="group block w-[11.5rem] shrink-0 overflow-hidden rounded-sm border border-browin-dark/10 bg-browin-white transition-colors hover:border-browin-red"
              href={getRecipeHref(recipe)}
              key={recipe.id}
              onClick={() => {
                persistProductContext(context.product, recipe);
                onClose();
              }}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-browin-dark">
                <Image
                  alt={recipe.title}
                  className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
                  fill
                  sizes="184px"
                  src={recipe.heroImage}
                />
                <span className="absolute left-0 top-0 max-w-[85%] truncate bg-browin-red px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-browin-white">
                  {recipe.category.name}
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-bold leading-snug text-browin-dark transition-colors group-hover:text-browin-red">
                  {recipe.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          className="flex min-h-11 items-center justify-center gap-2 border-t border-browin-dark/10 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white"
          href="/przepisnik"
          onClick={onClose}
        >
          Zobacz wszystkie przepisy
          <ArrowRight size={13} />
        </Link>
      </section>
    </>
  );
}
