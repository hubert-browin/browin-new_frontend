"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RECIPEBOOK_PAGE_SIZE, type RecipeSummary } from "@/data/recipes";
import { RecipeCard } from "@/components/store/recipe-card";

type RecipebookFeedProps = {
  categorySlug: string;
  initialRecipes: RecipeSummary[];
  searchQuery: string;
  totalCount: number;
};

const dedupeRecipes = (recipes: RecipeSummary[]) => {
  const seen = new Set<string>();
  const result: RecipeSummary[] = [];

  for (const recipe of recipes) {
    if (seen.has(recipe.id)) {
      continue;
    }

    seen.add(recipe.id);
    result.push(recipe);
  }

  return result;
};

export function RecipebookFeed({
  categorySlug,
  initialRecipes,
  searchQuery,
  totalCount,
}: RecipebookFeedProps) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const loadedRecipesCount = recipes.length;
  const hasMoreRecipes = loadedRecipesCount < totalCount;

  const loadMoreRecipes = useCallback(async () => {
    if (isLoading || !hasMoreRecipes) {
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    try {
      const searchParams = new URLSearchParams({
        limit: String(RECIPEBOOK_PAGE_SIZE),
        offset: String(loadedRecipesCount),
      });

      if (categorySlug) {
        searchParams.set("category", categorySlug);
      }

      if (searchQuery) {
        searchParams.set("search", searchQuery);
      }

      const response = await fetch(`/api/recipes?${searchParams.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Nie udało się pobrać kolejnych przepisów: ${response.status}`);
      }

      const payload = (await response.json()) as {
        recipes?: RecipeSummary[];
      };

      setRecipes((current) =>
        dedupeRecipes([...current, ...((payload.recipes ?? []).filter(Boolean) as RecipeSummary[])]),
      );
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, hasMoreRecipes, isLoading, loadedRecipesCount, searchQuery]);

  useEffect(() => {
    setRecipes(initialRecipes);
    setIsLoading(false);
    setLoadError(false);
  }, [categorySlug, initialRecipes, searchQuery, totalCount]);

  useEffect(() => {
    if (!hasMoreRecipes || isLoading || loadError || !loadMoreTriggerRef.current) {
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
        void loadMoreRecipes();
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreRecipes, isLoading, loadError, loadMoreRecipes]);

  return (
    <>
      <div className="mt-4 grid gap-5 md:mt-6 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            priority={index < 2}
            recipe={recipe}
          />
        ))}
      </div>

      {hasMoreRecipes ? (
        <div
          className="mt-8 flex items-center justify-center border border-dashed border-browin-dark/12 bg-browin-white/80 px-5 py-4 text-center text-sm font-semibold text-browin-dark/62"
          ref={loadMoreTriggerRef}
        >
          {loadError ? (
            <button
              className="font-semibold text-browin-red transition-colors hover:text-browin-dark"
              onClick={() => void loadMoreRecipes()}
              type="button"
            >
              Nie udało się pobrać kolejnych przepisów. Spróbuj ponownie.
            </button>
          ) : (
            "Ładowanie kolejnych przepisów..."
          )}
        </div>
      ) : totalCount > RECIPEBOOK_PAGE_SIZE ? (
        <div className="mt-8 flex items-center justify-center border border-dashed border-browin-dark/12 bg-browin-white/80 px-5 py-4 text-center text-sm font-semibold text-browin-dark/62">
          Wyświetlono wszystkie {totalCount} przepisy.
        </div>
      ) : null}
    </>
  );
}
