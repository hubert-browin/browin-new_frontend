"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
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

export function RecipebookCategoryRail({
  activeCategorySlug = "",
  allActive = false,
  categories,
  searchQuery = "",
  showScrollControls = true,
}: RecipebookCategoryRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const totalCount = categories.reduce((sum, category) => sum + category.count, 0);

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

  const scrollRail = (direction: "left" | "right") => {
    railRef.current?.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -260 : 260,
    });
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-browin-dark/8 bg-browin-white/96 backdrop-blur-md">
      <div
        className={`container mx-auto grid items-center gap-1.5 px-4 py-2 md:gap-2 md:py-3 ${
          showScrollControls
            ? "grid-cols-[minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto]"
            : "grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {showScrollControls ? (
          <button
            aria-label="Przewiń kategorie przepisów w lewo"
            className={`hidden h-10 w-10 shrink-0 items-center justify-center text-browin-dark/42 transition-colors hover:text-browin-red md:flex ${
              canScrollLeft ? "" : "pointer-events-none opacity-20"
            }`}
            onClick={() => scrollRail("left")}
            type="button"
          >
            <CaretLeft size={17} weight="bold" />
          </button>
        ) : null}

        <div
          className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto scroll-smooth md:gap-2"
          onScroll={updateScrollState}
          ref={railRef}
        >
          <Link
            className={`min-w-[7.35rem] shrink-0 border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.1em] transition-colors md:min-w-[8.75rem] md:px-4 md:py-2.5 md:text-xs md:tracking-[0.12em] ${
              allActive
                ? "border-browin-red bg-browin-red text-browin-white"
                : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
            }`}
            href={buildRecipebookCategoryHref({ searchQuery })}
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
                className={`min-w-[7.35rem] shrink-0 border px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.1em] transition-colors md:min-w-[8.75rem] md:px-4 md:py-2.5 md:text-xs md:tracking-[0.12em] ${
                  isActive
                    ? "border-browin-red bg-browin-red text-browin-white"
                    : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
                }`}
                href={buildRecipebookCategoryHref({
                  categorySlug: category.slug,
                  searchQuery,
                })}
                key={category.slug}
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
            className={`hidden h-10 w-10 shrink-0 items-center justify-center text-browin-dark/42 transition-colors hover:text-browin-red md:flex ${
              canScrollRight ? "" : "pointer-events-none opacity-20"
            }`}
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
