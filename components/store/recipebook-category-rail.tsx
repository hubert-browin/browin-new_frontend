"use client";

import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildRecipebookCategoryHref,
  type RecipebookCategoryNav,
} from "@/lib/recipebook-navigation";

type RecipebookCategoryRailProps = {
  activeCategorySlug?: string;
  allActive?: boolean;
  categories: RecipebookCategoryNav[];
  searchQuery?: string;
  showScrollControls?: boolean;
};

const recipePluralRules = new Intl.PluralRules("pl-PL");

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

const categoryItemClass =
  "block min-w-[7.35rem] shrink-0 border border-transparent px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.1em] outline outline-1 -outline-offset-1 transition-colors md:min-w-[8.75rem] md:px-4 md:py-2.5 md:text-xs md:tracking-[0.12em]";

const mobileCategoryItemClass =
  "block w-full border border-transparent px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.1em] outline outline-1 -outline-offset-1 transition-colors";

const getCategoryItemClass = (isActive: boolean) =>
  `${categoryItemClass} ${
    isActive
      ? "bg-browin-red text-browin-white outline-browin-red"
      : "bg-browin-white text-browin-dark outline-browin-dark/10 hover:text-browin-red hover:outline-browin-red"
  }`;

const getMobileCategoryItemClass = (isActive: boolean) =>
  `${mobileCategoryItemClass} ${
    isActive
      ? "bg-browin-red text-browin-white outline-browin-red"
      : "bg-browin-white text-browin-dark outline-browin-dark/10 hover:text-browin-red hover:outline-browin-red"
  }`;

const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

export function RecipebookCategoryRail({
  activeCategorySlug = "",
  allActive = false,
  categories,
  searchQuery = "",
  showScrollControls = true,
}: RecipebookCategoryRailProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalCount = categories.reduce((sum, category) => sum + category.count, 0);
  const activeCategory = categories.find(
    (category) => category.slug === activeCategorySlug,
  );
  const activeItemKey =
    !activeCategorySlug || allActive || !activeCategory
      ? "all"
      : activeCategory.slug;
  const mobileActiveLabel =
    activeItemKey === "all" ? "Wszystkie" : activeCategory?.name ?? "Wszystkie";
  const mobileActiveCount =
    activeItemKey === "all" ? totalCount : activeCategory?.count ?? totalCount;

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;

    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft < maxScrollLeft - 4);
  }, []);

  const registerItemRef = useCallback(
    (key: string, node: HTMLAnchorElement | null) => {
      if (node) {
        itemRefs.current.set(key, node);
        return;
      }

      itemRefs.current.delete(key);
    },
    [],
  );

  useEffect(() => {
    const rail = railRef.current;
    const frame = window.requestAnimationFrame(updateScrollState);

    if (!rail) {
      return () => window.cancelAnimationFrame(frame);
    }

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories.length, updateScrollState]);

  useEffect(() => {
    const rail = railRef.current;
    const activeItem = itemRefs.current.get(activeItemKey);

    if (!rail || !activeItem) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      const itemCenter = activeItem.offsetLeft + activeItem.offsetWidth / 2;
      const targetScrollLeft =
        activeItemKey === "all"
          ? 0
          : Math.min(
              Math.max(0, itemCenter - rail.clientWidth / 2),
              Math.max(0, maxScrollLeft),
            );

      rail.scrollTo({
        behavior: getScrollBehavior(),
        left: targetScrollLeft,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeItemKey, categories.length]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target;

      if (root && target instanceof Node && !root.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeCategorySlug, searchQuery]);

  const scrollRail = (direction: "left" | "right") => {
    railRef.current?.scrollBy({
      behavior: getScrollBehavior(),
      left: direction === "left" ? -260 : 260,
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div
      className="relative z-40 border-b border-browin-dark/8 bg-browin-white/96 backdrop-blur-md"
      ref={rootRef}
    >
      <div className="container mx-auto px-4 py-2 md:hidden">
        <button
          aria-expanded={isMobileMenuOpen}
          className="flex min-h-12 w-full items-center justify-between gap-3 border border-browin-dark/10 bg-browin-white px-4 py-2.5 text-left transition-colors hover:border-browin-red"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
              Wybierz kategorię
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold text-browin-dark">
              {mobileActiveLabel}
              <span className="font-semibold text-browin-dark/55">
                {" "}
                · {getRecipeCountLabel(mobileActiveCount)}
              </span>
            </span>
          </span>
          <CaretDown
            className={`shrink-0 text-browin-red transition-transform ${
              isMobileMenuOpen ? "rotate-180" : ""
            }`}
            size={18}
            weight="bold"
          />
        </button>

        {isMobileMenuOpen ? (
          <div className="absolute inset-x-4 top-[calc(100%-0.25rem)] z-[60] max-h-[70dvh] overflow-y-auto border border-browin-dark/10 bg-browin-white p-2 shadow-[0_18px_34px_-22px_rgba(51,51,51,0.4)]">
            <Link
              className={getMobileCategoryItemClass(activeItemKey === "all")}
              href={buildRecipebookCategoryHref({ searchQuery })}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="block">Wszystkie</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70">
                {getRecipeCountLabel(totalCount)}
              </span>
            </Link>

            <div className="mt-1.5 grid gap-1.5">
              {categories.map((category) => {
                const isActive = category.slug === activeCategorySlug;

                return (
                  <Link
                    className={getMobileCategoryItemClass(isActive)}
                    href={buildRecipebookCategoryHref({
                      categorySlug: category.slug,
                      searchQuery,
                    })}
                    key={category.slug}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="block truncate">{category.name}</span>
                    <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70">
                      {getRecipeCountLabel(category.count)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={`container mx-auto hidden items-center gap-1.5 px-4 py-2 md:grid md:gap-2 md:py-3 ${
          showScrollControls
            ? canScrollLeft
              ? "md:grid-cols-[auto_minmax(0,1fr)_auto]"
              : "md:grid-cols-[minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {showScrollControls && canScrollLeft ? (
          <button
            aria-label="Przewiń kategorie przepisów w lewo"
            className="hidden h-10 w-10 shrink-0 items-center justify-center text-browin-dark/42 transition-colors hover:text-browin-red md:flex"
            onClick={() => scrollRail("left")}
            type="button"
          >
            <CaretLeft size={17} weight="bold" />
          </button>
        ) : null}

        <div
          className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto px-px py-px scroll-smooth md:gap-2"
          onScroll={updateScrollState}
          ref={railRef}
        >
          <Link
            className={getCategoryItemClass(allActive)}
            href={buildRecipebookCategoryHref({ searchQuery })}
            ref={(node) => registerItemRef("all", node)}
          >
            <span className="block">Wszystkie</span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70 md:mt-1 md:text-[10px] md:tracking-[0.08em]">
              {getRecipeCountLabel(totalCount)}
            </span>
          </Link>

          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug;

            return (
              <Link
                className={getCategoryItemClass(isActive)}
                href={buildRecipebookCategoryHref({
                  categorySlug: category.slug,
                  searchQuery,
                })}
                key={category.slug}
                ref={(node) => registerItemRef(category.slug, node)}
              >
                <span className="block truncate">{category.name}</span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70 md:mt-1 md:text-[10px] md:tracking-[0.08em]">
                  {getRecipeCountLabel(category.count)}
                </span>
              </Link>
            );
          })}
        </div>

        {showScrollControls ? (
          <button
            aria-label="Przewiń kategorie przepisów w prawo"
            className="hidden h-10 w-10 shrink-0 items-center justify-center text-browin-dark/42 transition-colors hover:text-browin-red disabled:pointer-events-none disabled:opacity-25 md:flex"
            disabled={!canScrollRight}
            onClick={() => scrollRail("right")}
            type="button"
          >
            <CaretRight size={17} weight="bold" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
