"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
  RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
  type ProductBridgeContext,
  type RecipeBridgeContext,
} from "@/components/store/recipe-bridge-context";

type RecipeProductReturnDockProps = {
  recipeSlug: string;
  recipeTitle: string;
};

const readStoredProductContext = (recipeSlug: string) => {
  try {
    const storedContext = window.sessionStorage.getItem(
      PRODUCT_BRIDGE_CONTEXT_STORAGE_KEY,
    );

    if (!storedContext) {
      return null;
    }

    const parsedContext = JSON.parse(storedContext) as Partial<ProductBridgeContext>;

    if (
      parsedContext.recipeSlug !== recipeSlug ||
      typeof parsedContext.productSlug !== "string" ||
      typeof parsedContext.productTitle !== "string"
    ) {
      return null;
    }

    return {
      productImage:
        typeof parsedContext.productImage === "string"
          ? parsedContext.productImage
          : undefined,
      productSlug: parsedContext.productSlug,
      productTitle: parsedContext.productTitle,
      recipeSlug,
      savedAt:
        typeof parsedContext.savedAt === "number"
          ? parsedContext.savedAt
          : Date.now(),
    } satisfies ProductBridgeContext;
  } catch {
    return null;
  }
};

function ReturnLink({
  context,
  onReturn,
}: {
  context: ProductBridgeContext;
  onReturn: () => void;
}) {
  return (
    <Link
      className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-sm border border-browin-dark/10 bg-browin-dark/94 p-1.5 pr-2 text-left text-browin-white shadow-2xl backdrop-blur-md transition-colors hover:bg-browin-red"
      href={`/produkt/${context.productSlug}`}
      onClick={onReturn}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-browin-white/10 text-browin-white">
        {context.productImage ? (
          <Image
            alt={context.productTitle}
            className="object-contain p-1"
            fill
            sizes="36px"
            src={context.productImage}
          />
        ) : (
          <ArrowLeft size={17} weight="bold" />
        )}
      </span>
      <span className="line-clamp-1 min-w-0 text-[12px] font-bold leading-tight text-browin-white">
        Wróć · {context.productTitle}
      </span>
      <ArrowLeft className="shrink-0 text-browin-white" size={16} />
    </Link>
  );
}

export function RecipeProductReturnDock({
  recipeSlug,
  recipeTitle,
}: RecipeProductReturnDockProps) {
  const [context, setContext] = useState<ProductBridgeContext | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setContext(readStoredProductContext(recipeSlug));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [recipeSlug]);

  if (!context) {
    return null;
  }

  const persistRecipeContext = () => {
    try {
      const recipeContext = {
        recipeSlug,
        recipeTitle,
        savedAt: Date.now(),
      } satisfies RecipeBridgeContext;

      window.sessionStorage.setItem(
        RECIPE_BRIDGE_CONTEXT_STORAGE_KEY,
        JSON.stringify(recipeContext),
      );
    } catch {
      // Session storage is an enhancement only.
    }
  };

  return (
    <>
      <div className="product-recipe-return-dock-desktop fixed bottom-5 z-[115] hidden w-[min(21rem,calc(100vw-2rem))] transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block">
        <ReturnLink context={context} onReturn={persistRecipeContext} />
      </div>
      <div
        className="fixed inset-x-4 z-[44] md:hidden"
        style={{
          bottom:
            "calc(var(--mobile-bottom-nav-height) + var(--mobile-recipe-cta-height) + 0.5rem)",
        }}
      >
        <ReturnLink context={context} onReturn={persistRecipeContext} />
      </div>
    </>
  );
}
