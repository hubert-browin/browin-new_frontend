"use client";

import { CaretDown, CaretUp, Check, ShoppingCart, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export function RecipeProductPicker({
  groups,
  ingredients,
  recipeSlug,
  recipeTitle,
}: RecipeProductPickerProps) {
  const { addItems } = useCart();
  const allProducts = useMemo(() => groups.flatMap((group) => group.products), [groups]);
  const defaultSelected = useMemo(
    () => new Set(allProducts.filter(isPurchasable).map((entry) => entry.product.id)),
    [allProducts],
  );
  const [selectedIds, setSelectedIds] = useState(defaultSelected);
  const [isMobileProductPanelOpen, setIsMobileProductPanelOpen] = useState(false);
  const selectedProducts = allProducts.filter((entry) => selectedIds.has(entry.product.id));
  const selectedTotal = selectedProducts.reduce((sum, entry) => sum + getProductPrice(entry), 0);
  const selectedProductCountLabel = getProductCountLabel(selectedProducts.length);

  useEffect(() => {
    setSelectedIds(defaultSelected);
  }, [defaultSelected]);

  useEffect(() => {
    if (!isMobileProductPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileProductPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileProductPanelOpen]);

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

  return (
    <>
      <aside className="recipe-shopbox hidden border border-browin-dark/10 bg-browin-white shadow-sm lg:block">
        <div className="border-b border-browin-dark/10 bg-browin-gray/70 px-4 py-4 md:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-red">
            Czego potrzebujesz
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-browin-dark">
            Skompletuj przepis
          </h2>
        </div>

        <div className="grid gap-5 p-4 md:p-5">
          {ingredients.length > 0 ? (
            <div className="border border-browin-dark/10 bg-browin-gray/50 p-4">
              <p className="text-sm font-bold text-browin-dark">Składniki bazowe</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-browin-dark/70">
                {ingredients.slice(0, 9).map((ingredient) => (
                  <li className="flex gap-2" key={ingredient.id}>
                    <Check className="mt-0.5 shrink-0 text-browin-red" size={15} weight="bold" />
                    <span>{ingredient.text}</span>
                  </li>
                ))}
              </ul>
              {ingredients.length > 9 ? (
                <p className="mt-3 text-xs font-semibold text-browin-dark/45">
                  + {ingredients.length - 9} kolejnych pozycji w treści przepisu
                </p>
              ) : null}
            </div>
          ) : null}

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
                  const purchasable = isPurchasable(entry);

                  return (
                    <label
                      className={`grid cursor-pointer grid-cols-[auto_4.25rem_minmax(0,1fr)] items-center gap-3 border p-3 transition-colors ${
                        checked
                          ? "border-browin-red bg-browin-red/5"
                          : "border-browin-dark/10 bg-browin-white hover:border-browin-red/45"
                      } ${!purchasable ? "opacity-60" : ""}`}
                      key={entry.product.id}
                    >
                      <input
                        checked={checked}
                        className="peer sr-only"
                        disabled={!purchasable}
                        onChange={() => toggleProduct(entry.product.id)}
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
                      <span className="relative h-16 w-16 overflow-hidden border border-browin-dark/10 bg-browin-white p-1">
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
                            persistRecipeContext();
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
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              purchasable ? "text-browin-red" : "text-browin-dark/42"
                            }`}
                          >
                            {purchasable ? "Dostępny" : "Niedostępny"}
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="border-t border-browin-dark/10 pt-4">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                  Zaznaczone
                </p>
                <p className="mt-1 text-sm font-semibold text-browin-dark">
                  {selectedProducts.length} produktów
                </p>
              </div>
              <p className="text-2xl font-bold tracking-tight text-browin-dark">
                {formatCurrency(selectedTotal)}
              </p>
            </div>
            <button
              className="checkout-cta inline-flex min-h-14 w-full items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark disabled:cursor-not-allowed disabled:bg-browin-dark/35"
              disabled={selectedProducts.length === 0}
              onClick={() => addSelectedProducts()}
              type="button"
            >
              <ShoppingCart size={20} weight="fill" />
              Dodaj do koszyka
            </button>
          </div>
        </div>
      </aside>

      {allProducts.length > 0 ? (
        <div
          className="fixed inset-x-0 z-[45] border-t border-browin-dark/10 bg-browin-white md:hidden"
          style={{ bottom: "var(--mobile-bottom-nav-height)" }}
        >
          <button
            aria-expanded={isMobileProductPanelOpen}
            aria-label="Pokaż potrzebne produkty"
            className="mx-auto grid min-h-[3.6rem] w-full max-w-[34rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 text-left"
            onClick={() => setIsMobileProductPanelOpen(true)}
            type="button"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red">
                Potrzebne produkty
              </p>
              <p className="mt-0.5 truncate text-sm font-bold tracking-tight text-browin-dark">
                {selectedProductCountLabel} · {formatCurrency(selectedTotal)}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center border border-browin-dark/10 text-browin-red">
              <CaretUp size={18} weight="bold" />
            </span>
          </button>
        </div>
      ) : null}

      {isMobileProductPanelOpen && allProducts.length > 0 ? (
        <>
          <button
            aria-label="Zamknij potrzebne produkty"
            className="fixed inset-x-0 top-0 z-[58] bg-browin-dark/24 text-left md:hidden"
            onClick={() => setIsMobileProductPanelOpen(false)}
            style={{ bottom: "var(--mobile-bottom-nav-height)" }}
            type="button"
          />

          <section
            aria-label="Potrzebne produkty"
            className="fixed inset-x-0 z-[65] flex max-h-[78dvh] flex-col overflow-hidden rounded-t-sm border-t border-browin-dark/10 bg-browin-white md:hidden"
            role="dialog"
            style={{ bottom: "var(--mobile-bottom-nav-height)" }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-browin-dark/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red">
                  Potrzebne produkty
                </p>
                <p className="mt-0.5 text-sm font-bold text-browin-dark">
                  {selectedProductCountLabel} · {formatCurrency(selectedTotal)}
                </p>
              </div>
              <button
                aria-label="Zamknij potrzebne produkty"
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 text-browin-dark/62 transition-colors hover:border-browin-red hover:text-browin-red"
                onClick={() => setIsMobileProductPanelOpen(false)}
                type="button"
              >
                <CaretDown size={18} weight="bold" />
              </button>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-5">
                {ingredients.length > 0 ? (
                  <div className="border border-browin-dark/10 bg-browin-gray/50 p-4">
                    <p className="text-sm font-bold text-browin-dark">
                      Składniki bazowe
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-browin-dark/70">
                      {ingredients.slice(0, 9).map((ingredient) => (
                        <li className="flex gap-2" key={ingredient.id}>
                          <Check
                            className="mt-0.5 shrink-0 text-browin-red"
                            size={15}
                            weight="bold"
                          />
                          <span>{ingredient.text}</span>
                        </li>
                      ))}
                    </ul>
                    {ingredients.length > 9 ? (
                      <p className="mt-3 text-xs font-semibold text-browin-dark/45">
                        + {ingredients.length - 9} kolejnych pozycji w treści przepisu
                      </p>
                    ) : null}
                  </div>
                ) : null}

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
                        const purchasable = isPurchasable(entry);

                        return (
                          <label
                            className={`grid cursor-pointer grid-cols-[auto_4.25rem_minmax(0,1fr)] items-center gap-3 border p-3 transition-colors ${
                              checked
                                ? "border-browin-red bg-browin-red/5"
                                : "border-browin-dark/10 bg-browin-white hover:border-browin-red/45"
                            } ${!purchasable ? "opacity-60" : ""}`}
                            key={entry.product.id}
                          >
                            <input
                              checked={checked}
                              className="peer sr-only"
                              disabled={!purchasable}
                              onChange={() => toggleProduct(entry.product.id)}
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
                            <span className="relative h-16 w-16 overflow-hidden border border-browin-dark/10 bg-browin-white p-1">
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
                                  persistRecipeContext();
                                  setIsMobileProductPanelOpen(false);
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
                                <span
                                  className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                    purchasable ? "text-browin-red" : "text-browin-dark/42"
                                  }`}
                                >
                                  {purchasable ? "Dostępny" : "Niedostępny"}
                                </span>
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

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
                Dodaj zaznaczone
              </button>
            </div>
          </section>
        </>
      ) : null}

      {allProducts.length === 0 ? (
        <div className="border border-dashed border-browin-dark/15 bg-browin-white p-5 text-sm leading-relaxed text-browin-dark/62">
          <div className="mb-3 flex h-10 w-10 items-center justify-center bg-browin-dark/5 text-browin-red">
            <X size={18} />
          </div>
          Ten przepis nie ma obecnie produktów możliwych do skompletowania w sklepie.
        </div>
      ) : null}
    </>
  );
}
