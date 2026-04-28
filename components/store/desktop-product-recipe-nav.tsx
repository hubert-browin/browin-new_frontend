"use client";

import { ArrowRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
  RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
  type ProductBridgeContext,
  type RecipeBridgeContext,
} from "@/components/store/recipe-bridge-context";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { ProductRecipeNavEntry } from "@/components/store/product-recipe-nav-context";
import type { RecipeSummary } from "@/data/recipes";

type DesktopProductRecipeNavProps = {
  context: ProductRecipeNavEntry | null;
  isOpen: boolean;
  isRecipePage: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onToggle: () => void;
};

type DesktopRecipeProductReturnNavProps = {
  context: ProductBridgeContext;
  isRecipePage: boolean;
  onRecipebookClick: () => void;
  onReturn: (context: ProductBridgeContext) => void;
};

const MAX_PANEL_RECIPES = 6;
const recipePluralRules = new Intl.PluralRules("pl-PL");

const isDesktopViewport = () => window.matchMedia("(min-width: 768px)").matches;

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

function DesktopProductRecipePanel({
  context,
  isReturnContext,
  onClose,
  recipes,
}: {
  context: ProductRecipeNavEntry;
  isReturnContext: boolean;
  onClose: () => void;
  recipes: RecipeSummary[];
}) {
  return (
    <section
      aria-label="Przepisy do produktu"
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(35rem,calc(100vw-7rem))] overflow-hidden rounded-b-md border border-browin-dark/10 bg-browin-white shadow-[0_18px_32px_-18px_rgba(51,51,51,0.34)]"
      role="dialog"
    >
      <div className="flex items-center justify-between gap-3 border-b border-browin-dark/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
            {isReturnContext
              ? "Wróć do przepisu"
              : getRecipeCountLabel(context.recipes.length)}
          </p>
          <p className="mt-1 line-clamp-1 text-sm font-bold text-browin-dark">
            {context.product.title}
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

      <div className="max-h-[24rem] overflow-y-auto p-2">
        {recipes.map((recipe) => (
          <Link
            className="group grid min-h-[5.75rem] grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-sm p-2 transition-colors hover:bg-browin-red/5"
            href={getRecipeHref(recipe)}
            key={recipe.id}
            onClick={() => {
              persistProductContext(context.product, recipe);
              onClose();
            }}
          >
            <span className="relative overflow-hidden bg-browin-dark">
              <Image
                alt={recipe.title}
                className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
                fill
                sizes="88px"
                src={recipe.heroImage}
              />
            </span>
            <span className="flex min-w-0 flex-col justify-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-browin-red">
                {recipe.category.name}
              </span>
              <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-browin-dark transition-colors group-hover:text-browin-red">
                {recipe.title}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <Link
        className="flex min-h-11 items-center justify-center gap-2 border-t border-browin-dark/10 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white"
        href="/przepisnik"
        onClick={onClose}
      >
        Zobacz wszystkie przepisy
        <ArrowRight size={13} />
      </Link>
    </section>
  );
}

export function DesktopRecipeProductReturnNav({
  context,
  isRecipePage,
  onRecipebookClick,
  onReturn,
}: DesktopRecipeProductReturnNavProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        className="group inline-flex max-w-[22rem] items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-semibold text-browin-dark/72 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
        href={`/produkt/${context.productSlug}`}
        onClick={() => onReturn(context)}
      >
        {context.productImage ? (
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-browin-white">
            <Image
              alt={context.productTitle}
              className="object-contain p-1"
              fill
              sizes="28px"
              src={context.productImage}
            />
          </span>
        ) : null}
        <span className="hidden min-w-0 md:block">
          <span className="block text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-browin-dark/45 transition-colors group-hover:text-browin-red/70">
            Wróć do produktu
          </span>
          <span className="mt-1 block truncate text-[12px] font-bold leading-tight">
            {context.productTitle}
          </span>
        </span>
      </Link>

      <Link
        aria-current={isRecipePage ? "page" : undefined}
        className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-browin-dark/72 transition-colors hover:bg-browin-dark/5 hover:text-browin-red"
        href="/przepisnik"
        onClick={onRecipebookClick}
      >
        <RecipebookIcon
          className="shrink-0 text-browin-red"
          size={16}
          weight={isRecipePage ? "fill" : "regular"}
        />
        <span className="hidden lg:inline">Przepiśnik</span>
      </Link>
    </div>
  );
}

export function DesktopProductRecipeNav({
  context,
  isOpen,
  isRecipePage,
  onClose,
  onNavigate,
  onToggle,
}: DesktopProductRecipeNavProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [contextSlug, setContextSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!context) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setContextSlug(readStoredRecipeContextSlug());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [context]);

  useEffect(() => {
    if (!context || !isOpen || !isDesktopViewport()) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target;

      if (root && target instanceof Node && !root.contains(target)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [context, isOpen, onClose]);

  const contextRecipe = useMemo(
    () => context?.recipes.find((recipe) => recipe.slug === contextSlug) ?? null,
    [context, contextSlug],
  );
  const orderedRecipes = useMemo(() => {
    if (!context) {
      return [];
    }

    if (!contextRecipe) {
      return context.recipes.slice(0, MAX_PANEL_RECIPES);
    }

    return [
      contextRecipe,
      ...context.recipes.filter((recipe) => recipe.id !== contextRecipe.id),
    ].slice(0, MAX_PANEL_RECIPES);
  }, [context, contextRecipe]);

  if (!context || context.recipes.length === 0) {
    return (
      <Link
        aria-current={isRecipePage ? "page" : undefined}
        className={`group inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors ${
          isRecipePage
            ? "bg-browin-red/8 text-browin-red"
            : "text-browin-dark/72 hover:bg-browin-dark/5 hover:text-browin-red"
        }`}
        href="/przepisnik"
        onClick={onNavigate}
      >
        <RecipebookIcon
          className="shrink-0 text-browin-red"
          size={16}
          weight={isRecipePage ? "fill" : "regular"}
        />
        <span>Przepiśnik</span>
      </Link>
    );
  }

  const isHighlighted = isRecipePage || isOpen;

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-label={`Otwórz ${getRecipeCountLabel(context.recipes.length)} do produktu`}
        className={`desktop-recipe-nav-ring group relative inline-flex items-center gap-2 overflow-visible rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors ${
          isHighlighted
            ? "bg-browin-red/8 text-browin-red"
            : "text-browin-dark/72 hover:bg-browin-dark/5 hover:text-browin-red"
        }`}
        onClick={onToggle}
        type="button"
      >
        <span
          className="desktop-recipe-nav-icon-buzz relative flex"
          key={context.product.id}
        >
          <RecipebookIcon
            className="shrink-0 text-browin-red"
            size={16}
            weight={isHighlighted ? "fill" : "regular"}
          />
        </span>
        <span>Przepiśnik</span>
        <span className="rounded-full bg-browin-red/10 px-2 py-0.5 text-[10px] font-bold leading-none text-browin-red transition-colors group-hover:bg-browin-red group-hover:text-browin-white">
          {getRecipeCountLabel(context.recipes.length)}
        </span>
      </button>

      {isOpen ? (
        <DesktopProductRecipePanel
          context={context}
          isReturnContext={Boolean(contextRecipe)}
          onClose={onClose}
          recipes={orderedRecipes}
        />
      ) : null}
    </div>
  );
}
