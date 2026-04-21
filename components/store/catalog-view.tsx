"use client";

import {
  ArrowsDownUp,
  CaretDown,
  Check,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { categories, type CategoryId } from "@/data/store";
import type { Product } from "@/data/products";
import {
  formatCurrency,
  filterProducts,
  getProductPrice,
  sortOptions,
  sortProducts,
  type SortOption,
} from "@/lib/catalog";

type CatalogViewProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  lockedCategoryId?: CategoryId;
  initialSearch?: string;
  initialSort?: SortOption;
  initialDealsOnly?: boolean;
  initialInStockOnly?: boolean;
};

type PriceBounds = {
  min: number;
  max: number;
};

type PriceRangeControlProps = {
  minBound: number;
  maxBound: number;
  minPrice: number;
  maxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

const PRODUCT_BATCH_SIZE = 16;

const getPriceBounds = (source: Product[], categoryId?: CategoryId): PriceBounds => {
  const scopedProducts = categoryId
    ? source.filter((product) => product.categoryId === categoryId)
    : source;
  const prices = scopedProducts.map((product) => getProductPrice(product));

  if (!prices.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
};

function PriceRangeControl({
  maxBound,
  maxPrice,
  minBound,
  minPrice,
  onMaxChange,
  onMinChange,
}: PriceRangeControlProps) {
  const safeMaxBound = maxBound <= minBound ? minBound + 1 : maxBound;
  const range = safeMaxBound - minBound;
  const minPercent = ((minPrice - minBound) / range) * 100;
  const maxPercent = ((maxPrice - minBound) / range) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 border border-browin-dark/10 bg-browin-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
            Od
          </p>
          <p className="mt-1 text-base font-extrabold tracking-tight text-browin-dark">
            {formatCurrency(minPrice)}
          </p>
        </div>
        <div className="min-w-0 flex-1 border border-browin-dark/10 bg-browin-white px-4 py-3 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
            Do
          </p>
          <p className="mt-1 text-base font-extrabold tracking-tight text-browin-dark">
            {formatCurrency(maxPrice)}
          </p>
        </div>
      </div>

      <div className="relative mt-5 h-10">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-browin-dark/10" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-browin-red"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        <input
          aria-label="Minimalna cena"
          className="catalog-range-input pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
          max={safeMaxBound}
          min={minBound}
          onChange={(event) => onMinChange(Number(event.target.value))}
          step={1}
          type="range"
          value={minPrice}
        />
        <input
          aria-label="Maksymalna cena"
          className="catalog-range-input pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
          max={safeMaxBound}
          min={minBound}
          onChange={(event) => onMaxChange(Number(event.target.value))}
          step={1}
          type="range"
          value={maxPrice}
        />
      </div>
    </div>
  );
}

function InfiniteProductGrid({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(PRODUCT_BATCH_SIZE);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const renderedProducts = products.slice(0, visibleCount);
  const loadedProductsCount = Math.min(visibleCount, products.length);
  const hasMoreProducts = loadedProductsCount < products.length;

  useEffect(() => {
    if (!hasMoreProducts || !loadMoreTriggerRef.current) {
      return;
    }

    const trigger = loadMoreTriggerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting) {
          return;
        }

        observer.unobserve(trigger);
        setVisibleCount((current) => Math.min(current + PRODUCT_BATCH_SIZE, products.length));
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreProducts, loadedProductsCount, products.length]);

  return (
    <>
      <div className="product-grid mt-5 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        {renderedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            priority={index < 4}
            product={product}
            titleLines={3}
          />
        ))}
      </div>

      {hasMoreProducts ? (
        <div
          className="mt-8 flex items-center justify-center border border-dashed border-browin-dark/12 bg-browin-white/80 px-5 py-4 text-center text-sm font-semibold text-browin-dark/62"
          ref={loadMoreTriggerRef}
        >
          Ładowanie kolejnych produktów podczas scrolla...
        </div>
      ) : products.length > PRODUCT_BATCH_SIZE ? (
        <div className="mt-8 flex items-center justify-center border border-dashed border-browin-dark/12 bg-browin-white/80 px-5 py-4 text-center text-sm font-semibold text-browin-dark/62">
          Wyświetlono wszystkie {products.length} produkty.
        </div>
      ) : null}
    </>
  );
}

export function CatalogView({
  description,
  eyebrow,
  initialDealsOnly = false,
  initialInStockOnly = false,
  initialSearch = "",
  initialSort = "featured",
  lockedCategoryId,
  products,
  title,
}: CatalogViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [dealsOnly, setDealsOnly] = useState(initialDealsOnly);
  const [inStockOnly, setInStockOnly] = useState(initialInStockOnly);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);
  const [desktopSortOpen, setDesktopSortOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(
    lockedCategoryId ?? "all",
  );
  const desktopControlsRef = useRef<HTMLDivElement | null>(null);
  const categoryId =
    lockedCategoryId ?? (selectedCategory === "all" ? undefined : selectedCategory);
  const priceBounds = getPriceBounds(products, categoryId);
  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const deferredSearch = useDeferredValue(search);
  const activeSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ?? "Polecane";
  const hasCustomPriceRange =
    minPrice > priceBounds.min || maxPrice < priceBounds.max;
  const hasActiveFilters =
    Boolean(search) ||
    dealsOnly ||
    inStockOnly ||
    selectedCategory !== (lockedCategoryId ?? "all") ||
    hasCustomPriceRange;
  const hasActiveControls = hasActiveFilters || sort !== "featured";
  const mobileSheetOpen = mobileFiltersOpen || mobileSortOpen;
  const selectedCategoryLabel =
    lockedCategoryId || selectedCategory === "all"
      ? null
      : categories.find((category) => category.id === selectedCategory)?.label;
  const priceFilterLabel = hasCustomPriceRange
    ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
    : null;

  const handleMinPriceChange = (nextValue: number) => {
    setMinPrice(Math.min(nextValue, maxPrice));
  };

  const handleMaxPriceChange = (nextValue: number) => {
    setMaxPrice(Math.max(nextValue, minPrice));
  };

  const handleCategorySelection = (nextCategory: CategoryId | "all") => {
    const nextCategoryId =
      lockedCategoryId ?? (nextCategory === "all" ? undefined : nextCategory);
    const nextPriceBounds = getPriceBounds(products, nextCategoryId);

    setSelectedCategory(nextCategory);
    setMinPrice(nextPriceBounds.min);
    setMaxPrice(nextPriceBounds.max);
  };

  const filtered = filterProducts({
    source: products,
    query: deferredSearch,
    categoryId,
    dealsOnly,
    inStockOnly,
    minPrice,
    maxPrice,
  });
  const visibleProducts = sortProducts(filtered, sort);
  const infiniteListKey = [
    lockedCategoryId ?? "listing",
    categoryId ?? "all",
    deferredSearch,
    sort,
    dealsOnly ? "deal" : "nodeal",
    inStockOnly ? "stock" : "nostock",
    minPrice,
    maxPrice,
    visibleProducts.length,
  ].join(":");

  const resetFilters = () => {
    setSearch("");
    setSort("featured");
    setDealsOnly(false);
    setInStockOnly(false);
    handleCategorySelection(lockedCategoryId ?? "all");
  };

  const closeMobileSheets = () => {
    setMobileFiltersOpen(false);
    setMobileSortOpen(false);
  };

  const closeDesktopPanels = () => {
    setDesktopFiltersOpen(false);
    setDesktopSortOpen(false);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (mobileSheetOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSheetOpen]);

  useEffect(() => {
    if (!desktopFiltersOpen && !desktopSortOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!desktopControlsRef.current) {
        return;
      }

      if (!desktopControlsRef.current.contains(event.target as Node)) {
        closeDesktopPanels();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDesktopPanels();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopFiltersOpen, desktopSortOpen]);

  return (
    <section className="bg-browin-gray pb-6 pt-0 md:pb-16 md:pt-0">
      <div className="container mx-auto px-4">
        <div className="border-b border-browin-dark/10 pb-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
            {eyebrow}
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-browin-dark md:text-3xl">
                {title}
              </h1>
              <p
                className={`mt-3 text-sm leading-relaxed text-browin-dark/68 md:text-base ${
                  lockedCategoryId ? "hidden md:block" : ""
                }`}
              >
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
          <button
            className="inline-flex items-center justify-center gap-2 border border-browin-dark/10 bg-browin-white px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={() => {
              setMobileSortOpen(false);
              setMobileFiltersOpen(true);
            }}
            type="button"
          >
            <SlidersHorizontal size={18} />
            Filtry
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 border border-browin-dark/10 bg-browin-white px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={() => {
              setMobileFiltersOpen(false);
              setMobileSortOpen(true);
            }}
            type="button"
          >
            <ArrowsDownUp size={18} />
            Sortuj
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 md:hidden">
          <div className="text-sm text-browin-dark/68">
            <p>
              Znaleziono <strong className="text-browin-dark">{visibleProducts.length}</strong>{" "}
              produktów.
            </p>
            {search ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-browin-red">
                Wyniki dla: {search}
              </p>
            ) : null}
          </div>

          {hasActiveControls ? (
            <button
              className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
              onClick={resetFilters}
              type="button"
            >
              Wyczyść filtry
            </button>
          ) : null}
        </div>

        <div className="mt-6 hidden md:block" ref={desktopControlsRef}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="relative">
                <button
                  className={`inline-flex min-h-12 items-center justify-center gap-2 border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    desktopFiltersOpen
                      ? "border-browin-red bg-browin-red/5 text-browin-red"
                      : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                  }`}
                  onClick={() => {
                    setDesktopSortOpen(false);
                    setDesktopFiltersOpen((current) => !current);
                  }}
                  type="button"
                >
                  <SlidersHorizontal size={18} />
                  Filtry
                  <span
                    className={`h-2 w-2 rounded-full ${
                      hasActiveFilters ? "bg-browin-red" : "bg-browin-dark/15"
                    }`}
                  />
                  <CaretDown
                    className={`transition-transform ${desktopFiltersOpen ? "rotate-180" : ""}`}
                    size={14}
                  />
                </button>

                {desktopFiltersOpen ? (
                  <div className="absolute left-0 top-full z-20 mt-3 w-[42rem] max-w-[calc(100vw-4rem)] border border-browin-dark/10 bg-browin-white p-5 shadow-panel">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
                      <div>
                        {search ? (
                          <div className="border border-browin-dark/10 bg-browin-gray px-4 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                              Aktywne wyszukiwanie
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-browin-dark">{search}</p>
                              <button
                                className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                                onClick={() => setSearch("")}
                                type="button"
                              >
                                Wyczyść
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {!lockedCategoryId ? (
                          <div className={`${search ? "mt-5" : ""}`}>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                              Kategoria
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <button
                                className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                                  selectedCategory === "all"
                                    ? "border-browin-red bg-browin-red text-browin-white"
                                    : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                                }`}
                                onClick={() => handleCategorySelection("all")}
                                type="button"
                              >
                                Wszystkie
                              </button>
                              {categories.map((category) => (
                                <button
                                  className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                                    selectedCategory === category.id
                                      ? "border-browin-red bg-browin-red text-browin-white"
                                      : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                                  }`}
                                  key={category.id}
                                  onClick={() => handleCategorySelection(category.id)}
                                  type="button"
                                >
                                  {category.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className={`${search || !lockedCategoryId ? "mt-5" : ""}`}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                            Zakres cen
                          </p>
                          <div className="mt-3 border border-browin-dark/10 bg-browin-gray px-4 py-4">
                            <PriceRangeControl
                              maxBound={priceBounds.max}
                              maxPrice={maxPrice}
                              minBound={priceBounds.min}
                              minPrice={minPrice}
                              onMaxChange={handleMaxPriceChange}
                              onMinChange={handleMinPriceChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                          Dostępność i promocje
                        </p>
                        <div className="mt-3 space-y-3">
                          <button
                            className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                              dealsOnly
                                ? "border-browin-red bg-browin-red/5 text-browin-red"
                                : "border-browin-dark/10 bg-browin-gray text-browin-dark hover:border-browin-red hover:text-browin-red"
                            }`}
                            onClick={() => setDealsOnly((current) => !current)}
                            type="button"
                          >
                            <span className="text-sm font-bold uppercase tracking-[0.16em]">
                              Tylko promocje
                            </span>
                            {dealsOnly ? <Check size={18} weight="bold" /> : null}
                          </button>

                          <button
                            className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                              inStockOnly
                                ? "border-browin-red bg-browin-red/5 text-browin-red"
                                : "border-browin-dark/10 bg-browin-gray text-browin-dark hover:border-browin-red hover:text-browin-red"
                            }`}
                            onClick={() => setInStockOnly((current) => !current)}
                            type="button"
                          >
                            <span className="text-sm font-bold uppercase tracking-[0.16em]">
                              Tylko dostępne
                            </span>
                            {inStockOnly ? <Check size={18} weight="bold" /> : null}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-browin-dark/10 pt-5">
                      <button
                        className="border border-browin-dark/10 bg-browin-white px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
                        onClick={resetFilters}
                        type="button"
                      >
                        Reset
                      </button>
                      <button
                        className="bg-browin-red px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark"
                        onClick={closeDesktopPanels}
                        type="button"
                      >
                        Pokaż produkty
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  className={`inline-flex min-h-12 items-center justify-center gap-2 border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                    desktopSortOpen
                      ? "border-browin-red bg-browin-red/5 text-browin-red"
                      : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                  }`}
                  onClick={() => {
                    setDesktopFiltersOpen(false);
                    setDesktopSortOpen((current) => !current);
                  }}
                  type="button"
                >
                  <ArrowsDownUp size={18} />
                  Sortuj
                  <CaretDown
                    className={`transition-transform ${desktopSortOpen ? "rotate-180" : ""}`}
                    size={14}
                  />
                </button>

                {desktopSortOpen ? (
                  <div className="absolute left-0 top-full z-20 mt-3 w-80 max-w-[calc(100vw-4rem)] border border-browin-dark/10 bg-browin-white p-5 shadow-panel">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                          Sortowanie
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-browin-dark">
                          {activeSortLabel}
                        </h2>
                      </div>
                      <button
                        className="flex h-10 w-10 items-center justify-center bg-browin-dark/5 text-browin-dark transition-colors hover:text-browin-red"
                        onClick={closeDesktopPanels}
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {sortOptions.map((option) => (
                        <button
                          className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                            sort === option.value
                              ? "border-browin-red bg-browin-red/5 text-browin-red"
                              : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                          }`}
                          key={option.value}
                          onClick={() => {
                            setSort(option.value);
                            closeDesktopPanels();
                          }}
                          type="button"
                        >
                          <span className="text-sm font-bold uppercase tracking-[0.16em]">
                            {option.label}
                          </span>
                          {sort === option.value ? <Check size={18} weight="bold" /> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 pt-1 text-sm text-browin-dark/62">
              <p>
                <strong className="text-browin-dark">{visibleProducts.length}</strong> produktów
              </p>
              <p>
                Sortowanie: <strong className="text-browin-dark">{activeSortLabel}</strong>
              </p>
              {priceFilterLabel ? (
                <p>
                  Cena: <strong className="text-browin-dark">{priceFilterLabel}</strong>
                </p>
              ) : null}
              {hasActiveControls ? (
                <button
                  className="font-semibold text-browin-red transition-colors hover:text-browin-dark"
                  onClick={resetFilters}
                  type="button"
                >
                  Wyczyść filtry
                </button>
              ) : null}
            </div>
          </div>

          {(search ||
            selectedCategoryLabel ||
            dealsOnly ||
            inStockOnly ||
            priceFilterLabel ||
            sort !== "featured") ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {search ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Wyszukiwanie: {search}
                </span>
              ) : null}
              {selectedCategoryLabel ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Kategoria: {selectedCategoryLabel}
                </span>
              ) : null}
              {dealsOnly ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Tylko promocje
                </span>
              ) : null}
              {inStockOnly ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Tylko dostępne
                </span>
              ) : null}
              {priceFilterLabel ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Cena: {priceFilterLabel}
                </span>
              ) : null}
              {sort !== "featured" ? (
                <span className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                  Sortowanie: {activeSortLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {visibleProducts.length ? (
          <InfiniteProductGrid key={infiniteListKey} products={visibleProducts} />
        ) : (
          <div className="mt-8 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-browin-dark">Brak dopasowanych produktów</h2>
            <p className="mt-3 text-sm leading-relaxed text-browin-dark/65">
              Spróbuj zmienić kategorię, usunąć ograniczenia lub wpisać szerszą frazę.
            </p>
            <button
              className="mt-5 bg-browin-red px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark"
              onClick={resetFilters}
              type="button"
            >
              Pokaż cały katalog
            </button>
          </div>
        )}

        <div
          className={`fixed inset-0 z-[58] bg-browin-dark/35 transition-opacity duration-300 md:hidden ${
            mobileSheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeMobileSheets}
        />

        <div
          className={`pb-safe fixed inset-x-0 bottom-0 z-[59] max-h-[82dvh] overflow-y-auto rounded-t-[1.75rem] border-t border-browin-dark/10 bg-browin-white p-5 shadow-panel transition-transform duration-300 md:hidden ${
            mobileFiltersOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                Filtry
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-browin-dark">
                Zawęź listing
              </h2>
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center bg-browin-dark/5 text-browin-dark transition-colors hover:text-browin-red"
              onClick={closeMobileSheets}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {search ? (
            <div className="mb-4 border border-browin-dark/10 bg-browin-gray px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                Aktywne wyszukiwanie
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-browin-dark">{search}</p>
                <button
                  className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-5">
            {!lockedCategoryId ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                  Kategoria
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      selectedCategory === "all"
                        ? "border-browin-red bg-browin-red text-browin-white"
                        : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                    }`}
                    onClick={() => handleCategorySelection("all")}
                    type="button"
                  >
                    Wszystkie
                  </button>
                  {categories.map((category) => (
                    <button
                      className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                        selectedCategory === category.id
                          ? "border-browin-red bg-browin-red text-browin-white"
                          : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                      }`}
                      key={category.id}
                      onClick={() => handleCategorySelection(category.id)}
                      type="button"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                Zakres cen
              </p>
              <div className="mt-3 border border-browin-dark/10 bg-browin-gray px-4 py-4">
                <PriceRangeControl
                  maxBound={priceBounds.max}
                  maxPrice={maxPrice}
                  minBound={priceBounds.min}
                  minPrice={minPrice}
                  onMaxChange={handleMaxPriceChange}
                  onMinChange={handleMinPriceChange}
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-dark/45">
                Dostępność i promocje
              </p>
              <div className="mt-3 space-y-3">
                <label className="flex items-center justify-between border border-browin-dark/10 bg-browin-gray px-4 py-4 text-sm font-bold text-browin-dark">
                  <span>Tylko promocje</span>
                  <input
                    checked={dealsOnly}
                    className="h-4 w-4 accent-[#942940]"
                    onChange={(event) => setDealsOnly(event.target.checked)}
                    type="checkbox"
                  />
                </label>

                <label className="flex items-center justify-between border border-browin-dark/10 bg-browin-gray px-4 py-4 text-sm font-bold text-browin-dark">
                  <span>Tylko dostępne</span>
                  <input
                    checked={inStockOnly}
                    className="h-4 w-4 accent-[#942940]"
                    onChange={(event) => setInStockOnly(event.target.checked)}
                    type="checkbox"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              className="border border-browin-dark/10 bg-browin-white px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
              onClick={resetFilters}
              type="button"
            >
              Reset
            </button>
            <button
              className="bg-browin-red px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark"
              onClick={closeMobileSheets}
              type="button"
            >
              Pokaż produkty
            </button>
          </div>
        </div>

        <div
          className={`pb-safe fixed inset-x-0 bottom-0 z-[59] max-h-[82dvh] overflow-y-auto rounded-t-[1.75rem] border-t border-browin-dark/10 bg-browin-white p-5 shadow-panel transition-transform duration-300 md:hidden ${
            mobileSortOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                Sortowanie
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-browin-dark">
                {activeSortLabel}
              </h2>
            </div>
            <button
              className="flex h-10 w-10 items-center justify-center bg-browin-dark/5 text-browin-dark transition-colors hover:text-browin-red"
              onClick={closeMobileSheets}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {sortOptions.map((option) => (
              <button
                className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                  sort === option.value
                    ? "border-browin-red bg-browin-red/5 text-browin-red"
                    : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                }`}
                key={option.value}
                onClick={() => {
                  setSort(option.value);
                  closeMobileSheets();
                }}
                type="button"
              >
                <span className="text-sm font-bold uppercase tracking-[0.16em]">
                  {option.label}
                </span>
                {sort === option.value ? <Check size={18} weight="bold" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
