"use client";

import { ArrowRight, BookOpen, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
  RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
  type ProductBridgeContext,
  type RecipeBridgeContext,
} from "@/components/store/recipe-bridge-context";
import type { Product } from "@/data/products";
import type { RecipeSummary } from "@/data/recipes";

type ProductRecipeBridgeProps = {
  product: Product;
  recipes: RecipeSummary[];
};

const recipePluralRules = new Intl.PluralRules("pl-PL");
const MAX_VISIBLE_RECIPES = 6;

const getRecipeCountLabel = (count: number) => {
  const suffixByPlural = {
    few: "przepisy",
    many: "przepisów",
    one: "przepis",
    other: "przepisów",
    two: "przepisy",
    zero: "przepisów",
  } satisfies Record<Intl.LDMLPluralRule, string>;

  return `${count} ${suffixByPlural[recipePluralRules.select(count)]}`;
};

const getProductSearchHref = (product: Product) =>
  `/szukaj?search=${encodeURIComponent(product.title)}`;

const getRecipeHref = (recipe: RecipeSummary) =>
  `/przepisnik/przepis/${recipe.slug}`;

const readStoredRecipeContextSlug = () => {
  try {
    const storedContext = window.sessionStorage.getItem(
      RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
    );

    if (!storedContext) {
      return null;
    }

    const parsedContext = JSON.parse(storedContext) as Partial<RecipeBridgeContext>;

    return typeof parsedContext.recipeSlug === "string"
      ? parsedContext.recipeSlug
      : null;
  } catch {
    return null;
  }
};

function RecipeTile({
  featured = false,
  onSelect,
  recipe,
}: {
  featured?: boolean;
  onSelect?: (recipe: RecipeSummary) => void;
  recipe: RecipeSummary;
}) {
  return (
    <Link
      className={`group block shrink-0 overflow-hidden rounded-sm border transition-colors hover:border-browin-red ${
        featured
          ? "w-[12.5rem] border-browin-red bg-browin-dark text-browin-white sm:w-[14.5rem]"
          : "w-[10.5rem] border-browin-dark/10 bg-browin-white text-browin-dark"
      }`}
      href={getRecipeHref(recipe)}
      onClick={() => onSelect?.(recipe)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-browin-dark">
        <Image
          alt={recipe.title}
          className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
          fill
          sizes={featured ? "232px" : "168px"}
          src={recipe.heroImage}
        />
        <span
          className={`absolute left-0 top-0 max-w-[85%] truncate px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${
            featured
              ? "bg-browin-white text-browin-red"
              : "bg-browin-red text-browin-white"
          }`}
        >
          {recipe.category.name}
        </span>
      </div>
      <div className="p-2.5">
        <p
          className={`line-clamp-2 font-bold leading-snug transition-colors ${
            featured
              ? "text-sm text-browin-white group-hover:text-browin-white"
              : "text-xs text-browin-dark group-hover:text-browin-red"
          }`}
        >
          {recipe.title}
        </p>
      </div>
    </Link>
  );
}

function RecipeDrawer({
  isReturnContext,
  onClose,
  onRecipeSelect,
  product,
  recipes,
}: {
  isReturnContext: boolean;
  onClose: () => void;
  onRecipeSelect: (recipe: RecipeSummary) => void;
  product: Product;
  recipes: RecipeSummary[];
}) {
  const [leadRecipe, ...secondaryRecipes] = recipes;

  if (!leadRecipe) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-sm border border-browin-dark/10 bg-browin-white shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-browin-dark/10 bg-browin-white px-3 py-2.5">
        <div className="min-w-0">
          <p className="line-clamp-1 text-xs font-bold text-browin-dark">
            <span className="mr-2 text-[9px] uppercase tracking-[0.14em] text-browin-red">
              {isReturnContext ? "Wróć" : getRecipeCountLabel(recipes.length)}
            </span>
            {leadRecipe.title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden h-8 items-center gap-1.5 border border-browin-dark/10 px-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-browin-red transition-colors hover:border-browin-red hover:bg-browin-red hover:text-browin-white sm:inline-flex"
            href={getProductSearchHref(product)}
          >
            Wszystkie
            <ArrowRight size={12} />
          </Link>
          <button
            aria-label="Zamknij przepisy"
            className="flex h-8 w-8 items-center justify-center border border-browin-dark/10 text-browin-dark/60 transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={onClose}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-2.5 overflow-x-auto p-2.5">
        <RecipeTile featured onSelect={onRecipeSelect} recipe={leadRecipe} />
        {secondaryRecipes.map((recipe) => (
          <RecipeTile key={recipe.id} onSelect={onRecipeSelect} recipe={recipe} />
        ))}
      </div>

      <Link
        className="flex min-h-9 items-center justify-center gap-2 border-t border-browin-dark/10 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white sm:hidden"
        href={getProductSearchHref(product)}
      >
        Wszystkie
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

export function ProductRecipeBridge({
  product,
  recipes,
}: ProductRecipeBridgeProps) {
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contextSlug, setContextSlug] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    frame = window.requestAnimationFrame(() => {
      setContextSlug(readStoredRecipeContextSlug());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [product.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const bridge = bridgeRef.current;
      const target = event.target;

      if (bridge && target instanceof Node && !bridge.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  const contextRecipe = useMemo(
    () => recipes.find((recipe) => recipe.slug === contextSlug) ?? null,
    [contextSlug, recipes],
  );
  const orderedRecipes = useMemo(() => {
    if (!contextRecipe) {
      return recipes.slice(0, MAX_VISIBLE_RECIPES);
    }

    return [
      contextRecipe,
      ...recipes.filter((recipe) => recipe.id !== contextRecipe.id),
    ].slice(0, MAX_VISIBLE_RECIPES);
  }, [contextRecipe, recipes]);
  const leadRecipe = orderedRecipes[0];

  if (!leadRecipe) {
    return null;
  }

  const countLabel = getRecipeCountLabel(recipes.length);
  const dockText = contextRecipe ? "Wróć do przepisu" : countLabel;
  const rootClass = `product-recipe-bridge-desktop fixed bottom-5 z-[115] hidden transition-[left,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block ${
    isOpen ? "w-[min(40rem,calc(100vw-4rem))]" : "w-auto"
  }`;
  const persistProductContext = (recipe: RecipeSummary) => {
    try {
      const context = {
        productImage: product.images[0],
        productSlug: product.slug,
        productTitle: product.title,
        recipeSlug: recipe.slug,
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

  return (
    <div className={rootClass} data-open={isOpen} ref={bridgeRef}>
      {!isOpen ? (
        <button
          aria-expanded={isOpen}
          aria-label="Otwórz przepisy z produktem"
          className="group inline-grid grid-cols-[auto_auto] items-center gap-2 rounded-sm border border-browin-dark/10 bg-browin-dark/94 p-1.5 pr-3 text-left text-browin-white shadow-2xl backdrop-blur-md transition-colors hover:bg-browin-red"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-browin-white/10 text-browin-white">
            <BookOpen size={18} weight="fill" />
          </span>
          <span className="line-clamp-1 min-w-0 text-[12px] font-bold leading-tight text-browin-white">
            {dockText}
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div>
          <RecipeDrawer
            isReturnContext={Boolean(contextRecipe)}
            onClose={() => setIsOpen(false)}
            onRecipeSelect={persistProductContext}
            product={product}
            recipes={orderedRecipes}
          />
        </div>
      ) : null}
    </div>
  );
}
