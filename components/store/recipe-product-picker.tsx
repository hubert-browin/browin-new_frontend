"use client";

import {
  CaretDown,
  CaretUp,
  Check,
  ShoppingCart,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import {
  RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
  type RecipeBridgeContext,
} from "@/components/store/recipe-bridge-context";
import type {
  HydratedRecipeProduct,
  HydratedRecipeProductGroup,
  RecipeIngredient,
} from "@/data/recipes";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";

type RecipeProductPickerProps = {
  groups: HydratedRecipeProductGroup[];
  ingredients: RecipeIngredient[];
  recipeSlug: string;
  recipeTitle: string;
};

const RECIPE_PANEL_NUDGE_TARGET_ID = "recipe-product-picker-nudge-target";
const MOBILE_RECIPE_PANEL_INITIAL_NUDGE_DELAY_MS = 900;
const MOBILE_RECIPE_PANEL_NUDGE_DURATION_MS = 5600;
const MOBILE_RECIPE_PANEL_SHEET_ANIMATION_MS = 420;

const getProductPrice = (entry: HydratedRecipeProduct) =>
  getPrimaryVariant(entry.product).price;

const isPurchasable = (entry: HydratedRecipeProduct) =>
  getPrimaryVariant(entry.product).stock > 0;

const productPluralRules = new Intl.PluralRules("pl-PL");

const getProductCountLabel = (count: number) => {
  const suffixByPlural = {
    few: "produkty",
    many: "produktów",
    one: "produkt",
    other: "produktów",
    two: "produkty",
    zero: "produktów",
  } satisfies Record<Intl.LDMLPluralRule, string>;

  return `${count} ${suffixByPlural[productPluralRules.select(count)]}`;
};

const ingredientPluralRules = new Intl.PluralRules("pl-PL");

const getIngredientCountLabel = (count: number) => {
  const suffixByPlural = {
    few: "składniki",
    many: "składników",
    one: "składnik",
    other: "składników",
    two: "składniki",
    zero: "składników",
  } satisfies Record<Intl.LDMLPluralRule, string>;

  return `${count} ${suffixByPlural[ingredientPluralRules.select(count)]}`;
};

function RecipeIngredientSection({
  availableIngredientProductById,
  ingredients,
  onProductLinkClick,
}: {
  availableIngredientProductById: Map<string, HydratedRecipeProduct>;
  ingredients: RecipeIngredient[];
  onProductLinkClick: () => void;
}) {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="divide-y divide-browin-dark/8 text-sm leading-relaxed text-browin-dark/74">
        {ingredients.map((ingredient) => {
          if (ingredient.kind === "separator") {
            return (
              <p
                className="py-2.5 font-semibold leading-relaxed text-browin-dark/58 first:pt-0 last:pb-0"
                key={ingredient.id}
              >
                {ingredient.text}
              </p>
            );
          }

          const productEntry = ingredient.productId
            ? availableIngredientProductById.get(ingredient.productId)
            : undefined;

          if (!productEntry) {
            return (
              <div className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0" key={ingredient.id}>
                <Check
                  className="mt-0.5 shrink-0"
                  size={14}
                  weight="bold"
                />
                <span>{ingredient.text}</span>
              </div>
            );
          }

          return (
            <div className="py-2.5 text-browin-red first:pt-0 last:pb-0" key={ingredient.id}>
              <Link
                aria-label={`Zobacz produkt dla składnika: ${ingredient.text}`}
                className="flex gap-2.5 text-browin-red"
                href={`/produkt/${productEntry.product.slug}`}
                onClick={onProductLinkClick}
              >
                <Check
                  className="mt-0.5 shrink-0"
                  size={14}
                  weight="bold"
                />
                <span>{ingredient.text}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecipeProductGroupsList({
  groups,
  onProductLinkClick,
  onToggleProduct,
  selectedIds,
}: {
  groups: HydratedRecipeProductGroup[];
  onProductLinkClick: () => void;
  onToggleProduct: (productId: string) => void;
  selectedIds: Set<string>;
}) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.role}>
          <div className="mb-3">
            <h3 className="text-lg font-bold tracking-tight text-browin-dark">
              {group.label}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
              {group.description}
            </p>
          </div>

          <div className="grid gap-3">
            {group.products.map((entry) => {
              const variant = getPrimaryVariant(entry.product);
              const checked = selectedIds.has(entry.product.id);

              return (
                <label
                  className={`grid cursor-pointer grid-cols-[auto_4.25rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border p-3 transition-colors ${
                    checked
                      ? "border-browin-red bg-browin-red/5"
                      : "border-browin-dark/10 bg-browin-white hover:border-browin-red/45"
                  }`}
                  key={entry.product.id}
                >
                  <input
                    checked={checked}
                    className="peer sr-only"
                    onChange={() => onToggleProduct(entry.product.id)}
                    type="checkbox"
                  />
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${
                      checked
                        ? "border-browin-red bg-browin-red text-browin-white"
                        : "border-browin-dark/20 bg-browin-white text-transparent"
                    }`}
                  >
                    <Check size={15} weight="bold" />
                  </span>
                  <span className="relative h-16 w-16 overflow-hidden bg-browin-white">
                    <Image
                      alt={entry.product.title}
                      className="object-contain"
                      fill
                      sizes="64px"
                      src={entry.product.images[0]}
                    />
                  </span>
                  <span className="min-w-0">
                    <Link
                      className="line-clamp-2 text-sm font-bold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                      href={`/produkt/${entry.product.slug}`}
                      onClick={(event) => {
                        onProductLinkClick();
                        event.stopPropagation();
                      }}
                    >
                      {entry.product.title}
                    </Link>
                    {entry.ingredientText ? (
                      <span className="mt-1 block text-xs leading-snug text-browin-dark/55">
                        {entry.ingredientText}
                      </span>
                    ) : null}
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold tracking-tight text-browin-dark">
                        {formatCurrency(variant.price)}
                      </span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function RecipeCompactProductsList({
  onProductLinkClick,
  onToggleProduct,
  products,
  selectedIds,
}: {
  onProductLinkClick: () => void;
  onToggleProduct: (productId: string) => void;
  products: HydratedRecipeProduct[];
  selectedIds: Set<string>;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2.5">
      {products.map((entry) => {
        const variant = getPrimaryVariant(entry.product);
        const checked = selectedIds.has(entry.product.id);

        return (
          <article
            aria-pressed={checked}
            className={`group relative overflow-hidden border bg-browin-white transition-colors ${
              checked
                ? "border-browin-red"
                : "border-browin-dark/10 bg-browin-white hover:border-browin-red/45"
            }`}
            key={entry.product.id}
            onClick={() => onToggleProduct(entry.product.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggleProduct(entry.product.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <button
              aria-label={
                checked
                  ? `Usuń ${entry.product.title} z wybranych`
                  : `Dodaj ${entry.product.title} do wybranych`
              }
              aria-pressed={checked}
              className={`absolute right-2 top-2 z-10 flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${
                checked
                  ? "border-browin-red bg-browin-red text-browin-white"
                  : "border-browin-dark/12 bg-browin-white/95 text-transparent hover:border-browin-red hover:text-browin-red"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleProduct(entry.product.id);
              }}
              onKeyDown={(event) => event.stopPropagation()}
              type="button"
            >
              <Check size={14} weight="bold" />
            </button>

            <div className="grid cursor-pointer grid-cols-[4.25rem_minmax(0,1fr)] gap-3 p-2.5">
              <Link
                aria-label={`Zobacz produkt ${entry.product.title}`}
                className="relative h-[4.25rem] overflow-hidden bg-browin-white"
                href={`/produkt/${entry.product.slug}`}
                onClick={(event) => {
                  onProductLinkClick();
                  event.stopPropagation();
                }}
              >
                <Image
                  alt={entry.product.title}
                  className="object-contain"
                  fill
                  sizes="68px"
                  src={entry.product.images[0]}
                />
              </Link>

              <div className="flex min-w-0 flex-col pr-8">
                <Link
                  className="line-clamp-2 text-[12px] font-bold leading-tight text-browin-dark transition-colors group-hover:text-browin-red"
                  href={`/produkt/${entry.product.slug}`}
                  onClick={(event) => {
                    onProductLinkClick();
                    event.stopPropagation();
                  }}
                >
                  {entry.product.title}
                </Link>
                {entry.ingredientText ? (
                  <span className="mt-1 truncate text-[10px] font-semibold leading-snug text-browin-dark/45">
                    {entry.ingredientText}
                  </span>
                ) : null}
                <span className="mt-auto flex flex-wrap items-end gap-1.5 pt-2">
                  <span className="text-base font-bold leading-none tracking-tight text-browin-dark">
                    {formatCurrency(variant.price)}
                  </span>
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function RecipeProductPicker({
  groups,
  ingredients,
  recipeSlug,
  recipeTitle,
}: RecipeProductPickerProps) {
  const { addItems } = useCart();
  const pathname = usePathname();
  const mobilePanelRef = useRef<HTMLElement | null>(null);
  const mobileNudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileInitialNudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const mobileNudgeFrameRef = useRef<number | null>(null);
  const mobilePanelCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasRequestedInitialNudgeRef = useRef(false);
  const ingredientItemCount = useMemo(
    () => ingredients.filter((ingredient) => ingredient.kind !== "separator").length,
    [ingredients],
  );
  const allProducts = useMemo(
    () => groups.flatMap((group) => group.products).filter(isPurchasable),
    [groups],
  );
  const productDisplayGroups = useMemo<HydratedRecipeProductGroup[]>(
    () =>
      allProducts.length > 0
        ? [
            {
              description: "Produkty dobrane do tego przepisu.",
              label: "Przydatne produkty",
              products: allProducts,
              role: "equipment",
            },
          ]
        : [],
    [allProducts],
  );
  const availableIngredientProductById = useMemo(
    () => new Map(allProducts.map((entry) => [entry.product.id, entry])),
    [allProducts],
  );
  const defaultSelected = useMemo(
    () => new Set(allProducts.filter(isPurchasable).map((entry) => entry.product.id)),
    [allProducts],
  );
  const [selectedIds, setSelectedIds] = useState(defaultSelected);
  const [isMobileProductPanelOpen, setIsMobileProductPanelOpen] = useState(false);
  const [isMobileProductPanelRendered, setIsMobileProductPanelRendered] =
    useState(false);
  const [isMobileProductPanelClosing, setIsMobileProductPanelClosing] =
    useState(false);
  const [isMobilePanelNudgeVisible, setIsMobilePanelNudgeVisible] =
    useState(false);
  const selectedProducts = allProducts.filter((entry) => selectedIds.has(entry.product.id));
  const selectedTotal = selectedProducts.reduce((sum, entry) => sum + getProductPrice(entry), 0);
  const selectedProductCountLabel = getProductCountLabel(selectedProducts.length);
  const ingredientCountLabel = getIngredientCountLabel(ingredientItemCount);
  const allProductCountLabel = getProductCountLabel(allProducts.length);
  const mobileSummaryItems = [
    ingredientItemCount > 0 ? ingredientCountLabel : null,
    allProducts.length > 0 ? allProductCountLabel : null,
  ].filter((item): item is string => Boolean(item));
  const mobileSummaryLabel = mobileSummaryItems.join(" · ");
  const hasPanelContent = mobileSummaryItems.length > 0;
  const panelTitle =
    allProducts.length > 0 ? "Lista składników i produkty" : "Lista składników";

  const clearMobilePanelNudge = useCallback(() => {
    if (mobileNudgeTimerRef.current) {
      clearTimeout(mobileNudgeTimerRef.current);
      mobileNudgeTimerRef.current = null;
    }

    if (mobileNudgeFrameRef.current) {
      window.cancelAnimationFrame(mobileNudgeFrameRef.current);
      mobileNudgeFrameRef.current = null;
    }

    setIsMobilePanelNudgeVisible(false);
  }, []);

  const openMobileProductPanel = useCallback(() => {
    if (mobileInitialNudgeTimerRef.current) {
      clearTimeout(mobileInitialNudgeTimerRef.current);
      mobileInitialNudgeTimerRef.current = null;
    }

    if (mobilePanelCloseTimerRef.current) {
      clearTimeout(mobilePanelCloseTimerRef.current);
      mobilePanelCloseTimerRef.current = null;
    }

    clearMobilePanelNudge();
    setIsMobileProductPanelRendered(true);
    setIsMobileProductPanelClosing(false);
    setIsMobileProductPanelOpen(true);
  }, [clearMobilePanelNudge]);

  const closeMobileProductPanel = useCallback(() => {
    if (!isMobileProductPanelOpen && !isMobileProductPanelRendered) {
      return;
    }

    if (mobilePanelCloseTimerRef.current) {
      clearTimeout(mobilePanelCloseTimerRef.current);
      mobilePanelCloseTimerRef.current = null;
    }

    setIsMobileProductPanelOpen(false);
    setIsMobileProductPanelClosing(true);
    mobilePanelCloseTimerRef.current = setTimeout(() => {
      setIsMobileProductPanelRendered(false);
      setIsMobileProductPanelClosing(false);
      mobilePanelCloseTimerRef.current = null;
    }, MOBILE_RECIPE_PANEL_SHEET_ANIMATION_MS);
  }, [isMobileProductPanelOpen, isMobileProductPanelRendered]);

  const triggerMobilePanelNudge = useCallback(() => {
    if (mobileInitialNudgeTimerRef.current) {
      clearTimeout(mobileInitialNudgeTimerRef.current);
      mobileInitialNudgeTimerRef.current = null;
    }

    if (mobileNudgeTimerRef.current) {
      clearTimeout(mobileNudgeTimerRef.current);
      mobileNudgeTimerRef.current = null;
    }

    setIsMobilePanelNudgeVisible(false);
    mobileNudgeFrameRef.current = window.requestAnimationFrame(() => {
      mobileNudgeFrameRef.current = null;
      setIsMobilePanelNudgeVisible(true);
      mobileNudgeTimerRef.current = setTimeout(
        clearMobilePanelNudge,
        MOBILE_RECIPE_PANEL_NUDGE_DURATION_MS,
      );
    });
  }, [clearMobilePanelNudge]);

  useEffect(() => {
    setSelectedIds(defaultSelected);
  }, [defaultSelected]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (mobilePanelCloseTimerRef.current) {
        clearTimeout(mobilePanelCloseTimerRef.current);
        mobilePanelCloseTimerRef.current = null;
      }

      setIsMobileProductPanelOpen(false);
      setIsMobileProductPanelRendered(false);
      setIsMobileProductPanelClosing(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    hasRequestedInitialNudgeRef.current = false;
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (mobileNudgeTimerRef.current) {
        clearTimeout(mobileNudgeTimerRef.current);
      }

      if (mobileInitialNudgeTimerRef.current) {
        clearTimeout(mobileInitialNudgeTimerRef.current);
      }

      if (mobileNudgeFrameRef.current) {
        window.cancelAnimationFrame(mobileNudgeFrameRef.current);
      }

      if (mobilePanelCloseTimerRef.current) {
        clearTimeout(mobilePanelCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !hasPanelContent ||
      (isMobileProductPanelOpen || isMobileProductPanelRendered) ||
      hasRequestedInitialNudgeRef.current ||
      !window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearMobilePanelNudge();
      return;
    }

    hasRequestedInitialNudgeRef.current = true;
    mobileInitialNudgeTimerRef.current = setTimeout(
      triggerMobilePanelNudge,
      MOBILE_RECIPE_PANEL_INITIAL_NUDGE_DELAY_MS,
    );

    return () => {
      if (mobileInitialNudgeTimerRef.current) {
        clearTimeout(mobileInitialNudgeTimerRef.current);
        mobileInitialNudgeTimerRef.current = null;
      }
    };
  }, [
    clearMobilePanelNudge,
    hasPanelContent,
    isMobileProductPanelOpen,
    isMobileProductPanelRendered,
    pathname,
    triggerMobilePanelNudge,
  ]);

  useEffect(() => {
    if (
      !hasPanelContent ||
      (isMobileProductPanelOpen || isMobileProductPanelRendered) ||
      !window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearMobilePanelNudge();
      return;
    }

    const target = document.getElementById(RECIPE_PANEL_NUDGE_TARGET_ID);

    if (!target || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerMobilePanelNudge();
        }
      },
      {
        rootMargin: "0px 0px -24% 0px",
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [
    clearMobilePanelNudge,
    hasPanelContent,
    isMobileProductPanelOpen,
    isMobileProductPanelRendered,
    pathname,
    triggerMobilePanelNudge,
  ]);

  useEffect(() => {
    if (!isMobileProductPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileProductPanel();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const panel = mobilePanelRef.current;
      const target = event.target;

      if (panel && target instanceof Node && !panel.contains(target)) {
        closeMobileProductPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeMobileProductPanel, isMobileProductPanelOpen]);

  const toggleProduct = (productId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  };

  const addSelectedProducts = (entries = selectedProducts) => {
    addItems(
      entries
        .filter(isPurchasable)
        .map((entry) => ({
          productId: entry.product.id,
          variantId: getPrimaryVariant(entry.product).id,
          quantity: 1,
        })),
    );
  };

  const persistRecipeContext = () => {
    try {
      const context = {
        recipeSlug,
        recipeTitle,
        savedAt: Date.now(),
      } satisfies RecipeBridgeContext;

      window.sessionStorage.setItem(
        RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
        JSON.stringify(context),
      );
    } catch {
      // Session storage is an enhancement only.
    }
  };

  const toggleMobileProductPanel = () => {
    if (isMobileProductPanelOpen) {
      closeMobileProductPanel();
      return;
    }

    openMobileProductPanel();
  };

  return (
    <>
      {hasPanelContent ? (
        <>
          {ingredientItemCount > 0 ? (
            <aside className="recipe-shopbox hidden overflow-hidden border border-browin-dark/10 bg-browin-white shadow-sm lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100dvh-10rem)] lg:flex-col">
              <div className="border-b border-browin-dark/10 bg-browin-white px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
                  Lista składników
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-browin-dark">
                  {ingredientCountLabel}
                </h2>
              </div>

              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
                <RecipeIngredientSection
                  availableIngredientProductById={availableIngredientProductById}
                  ingredients={ingredients}
                  onProductLinkClick={persistRecipeContext}
                />
              </div>
            </aside>
          ) : null}

          {allProducts.length > 0 ? (
            <aside className="recipe-shopbox hidden overflow-hidden border border-browin-dark/10 bg-browin-white shadow-sm lg:sticky lg:top-36 lg:flex lg:max-h-[calc(100dvh-10rem)] lg:flex-col">
              <div className="border-b border-browin-dark/10 bg-browin-white px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
                  Przydatne produkty
                </p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-browin-dark">
                    {allProductCountLabel}
                  </h2>
                  <p className="pb-0.5 text-xs font-bold text-browin-dark/62">
                    {formatCurrency(selectedTotal)}
                  </p>
                </div>
              </div>

              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                <RecipeCompactProductsList
                  onProductLinkClick={persistRecipeContext}
                  onToggleProduct={toggleProduct}
                  products={allProducts}
                  selectedIds={selectedIds}
                />
              </div>

              <div className="border-t border-browin-dark/10 bg-browin-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-browin-dark">
                    Wybrane: {selectedProductCountLabel}
                  </p>
                  <p className="text-sm font-bold tracking-tight text-browin-dark">
                    {formatCurrency(selectedTotal)}
                  </p>
                </div>
                <button
                  className="checkout-cta inline-flex min-h-11 w-full items-center justify-center gap-2 bg-browin-red px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-browin-white transition-colors hover:bg-browin-dark disabled:cursor-not-allowed disabled:bg-browin-dark/35"
                  disabled={selectedProducts.length === 0}
                  onClick={() => addSelectedProducts()}
                  type="button"
                >
                  <ShoppingCart size={16} weight="fill" />
                  Dodaj do koszyka
                </button>
              </div>
            </aside>
          ) : null}
        </>
      ) : null}

      {hasPanelContent ? (
        <div
          className="fixed inset-x-0 z-[55] h-[var(--mobile-recipe-cta-height)] border-t border-browin-dark/10 bg-browin-white md:hidden"
          style={{ bottom: "var(--mobile-bottom-nav-height)" }}
        >
          <button
            aria-expanded={isMobileProductPanelOpen}
            aria-label={`${isMobileProductPanelOpen ? "Ukryj" : "Pokaż"} ${panelTitle.toLowerCase()}`}
            className="mx-auto grid h-full w-full max-w-[34rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 text-left"
            onClick={toggleMobileProductPanel}
            type="button"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red">
                {panelTitle}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold tracking-tight text-browin-dark">
                {mobileSummaryLabel}
              </p>
            </div>
            <span
              className={`recipe-ingredient-panel-handle flex h-9 w-9 items-center justify-center border border-browin-red bg-browin-red text-browin-white ${
                isMobilePanelNudgeVisible ? "is-nudging" : ""
              }`}
            >
              {isMobileProductPanelOpen ? (
                <CaretDown size={18} weight="bold" />
              ) : (
                <CaretUp size={18} weight="bold" />
              )}
            </span>
          </button>
        </div>
      ) : null}

      {isMobileProductPanelRendered && hasPanelContent ? (
        <>
          <button
            aria-label="Zamknij potrzebne produkty"
            className={`recipe-ingredient-panel-backdrop fixed inset-x-0 top-0 z-[58] bg-browin-dark/24 text-left md:hidden ${
              isMobileProductPanelClosing ? "is-closing" : ""
            }`}
            onClick={closeMobileProductPanel}
            style={{
              bottom:
                "calc(var(--mobile-bottom-nav-height) + var(--mobile-recipe-cta-height))",
            }}
            type="button"
          />

          <div
            className="recipe-ingredient-panel-viewport fixed inset-x-0 top-0 z-[65] overflow-hidden md:hidden"
            style={{
              bottom:
                "calc(var(--mobile-bottom-nav-height) + var(--mobile-recipe-cta-height))",
            }}
          >
            <section
              aria-label={panelTitle}
              className={`recipe-ingredient-panel-sheet absolute inset-x-0 bottom-0 flex max-h-[min(78dvh,100%)] flex-col overflow-hidden rounded-t-sm border-t border-browin-dark/10 bg-browin-white ${
                isMobileProductPanelClosing ? "is-closing" : ""
              }`}
              ref={mobilePanelRef}
              role="dialog"
            >
              <div className="flex items-center justify-between gap-3 border-b border-browin-dark/10 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red">
                    {panelTitle}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-browin-dark">
                    {mobileSummaryLabel}
                  </p>
                </div>
                <button
                  aria-label="Zamknij potrzebne produkty"
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 text-browin-dark/62 transition-colors hover:border-browin-red hover:text-browin-red"
                  onClick={closeMobileProductPanel}
                  type="button"
                >
                  <CaretDown size={18} weight="bold" />
                </button>
              </div>

              <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="grid gap-5">
                  {ingredientItemCount > 0 ? (
                    <div className="border border-browin-dark/10 bg-browin-gray/50 p-4">
                      <p className="text-sm font-bold text-browin-dark">
                        Składniki bazowe
                      </p>
                      <div className="mt-3">
                        <RecipeIngredientSection
                          availableIngredientProductById={availableIngredientProductById}
                          ingredients={ingredients}
                          onProductLinkClick={() => {
                            persistRecipeContext();
                            closeMobileProductPanel();
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <RecipeProductGroupsList
                    groups={productDisplayGroups}
                    onProductLinkClick={() => {
                      persistRecipeContext();
                      closeMobileProductPanel();
                    }}
                    onToggleProduct={toggleProduct}
                    selectedIds={selectedIds}
                  />
                </div>
              </div>

              {allProducts.length > 0 ? (
                <div className="border-t border-browin-dark/10 bg-browin-white px-4 py-3">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-browin-dark">
                      Wybrane: {selectedProductCountLabel}
                    </p>
                    <p className="text-lg font-bold tracking-tight text-browin-dark">
                      {formatCurrency(selectedTotal)}
                    </p>
                  </div>
                  <button
                    className="checkout-cta inline-flex min-h-12 w-full items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-dark disabled:cursor-not-allowed disabled:bg-browin-dark/35"
                    disabled={selectedProducts.length === 0}
                    onClick={() => addSelectedProducts()}
                    type="button"
                  >
                    <ShoppingCart size={18} weight="fill" />
                    Dodaj do koszyka
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
