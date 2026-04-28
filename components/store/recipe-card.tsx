"use client";

import Image from "next/image";
import Link from "next/link";

import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { RecipeSummary } from "@/data/recipes";

type RecipeCardProps = {
  recipe: RecipeSummary;
  priority?: boolean;
  compact?: boolean;
};

export function RecipeCard({ compact = false, priority = false, recipe }: RecipeCardProps) {
  return (
    <Link
      className="group block h-full border border-browin-dark/10 bg-browin-white shadow-[0_10px_26px_rgba(51,51,51,0.05)] transition-colors hover:border-browin-red focus-visible:border-browin-red"
      href={`/przepisnik/przepis/${recipe.slug}`}
    >
      <article className="flex h-full flex-col">
        <div
          className={`relative overflow-hidden bg-browin-dark ${
            compact ? "aspect-[4/3]" : "aspect-[16/11]"
          }`}
        >
          <Image
            alt={recipe.title}
            className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.035]"
            fill
            priority={priority}
            sizes={compact ? "(max-width: 767px) 90vw, 320px" : "(max-width: 767px) 90vw, 33vw"}
            src={recipe.heroImage}
          />
          <span className="absolute left-0 top-0 bg-browin-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-white">
            {recipe.category.name}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-browin-dark/45">
            <span className="inline-flex items-center gap-1.5">
              <RecipebookIcon className="text-browin-red" size={14} weight="fill" />
              Przepis
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-browin-dark transition-colors group-hover:text-browin-red md:text-xl">
            {recipe.title}
          </h3>

          {!compact ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-browin-dark/68">
              {recipe.excerpt}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
