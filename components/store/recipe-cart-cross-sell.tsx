"use client";

import { Plus } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/store/cart-provider";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { RecipeCommerceEntry } from "@/data/recipes";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";
import { getRecipeCartCrossSellOffers } from "@/lib/recipe-commerce";

type RecipeCartCrossSellProps = {
  entries: RecipeCommerceEntry[];
  variant?: "drawer" | "page";
};

export function RecipeCartCrossSell({
  entries,
  variant = "drawer",
}: RecipeCartCrossSellProps) {
  const { addItems, items, products } = useCart();
  const cartProductIds = items.map((item) => item.product.id);
  const productIndex = new Map(products.map((product) => [product.id, product]));
  const [offer] = getRecipeCartCrossSellOffers({
    cartProductIds,
    entries,
    limit: 1,
  });

  if (!offer) {
    return null;
  }

  const missingProducts = offer.missingProductIds
    .map((productId) => productIndex.get(productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .filter((product) => getPrimaryVariant(product).stock > 0)
    .slice(0, variant === "drawer" ? 2 : 3);

  if (missingProducts.length === 0) {
    return null;
  }

  const total = missingProducts.reduce(
    (sum, product) => sum + getPrimaryVariant(product).price,
    0,
  );

  return (
    <section
      className={`border border-browin-red/20 bg-browin-red/5 ${
        variant === "drawer" ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-white text-browin-red">
          <RecipebookIcon size={21} weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-red">
            Dobierz do przepisu
          </p>
          <h3 className="mt-1 text-sm font-bold leading-tight text-browin-dark">
            Masz sprzęt? Uzupełnij zapasy do{" "}
            <Link
              className="text-browin-red hover:text-browin-dark"
              href={`/przepisnik/przepis/${offer.recipe.slug}`}
            >
              {offer.recipe.title}
            </Link>
          </h3>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {missingProducts.map((product) => {
          const variant = getPrimaryVariant(product);

          return (
            <article
              className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 border border-browin-dark/10 bg-browin-white p-2"
              key={product.id}
            >
              <Link
                className="relative h-12 w-12 overflow-hidden bg-browin-white"
                href={`/produkt/${product.slug}`}
              >
                <Image
                  alt={product.title}
                  className="object-contain"
                  fill
                  sizes="48px"
                  src={product.images[0]}
                />
              </Link>
              <div className="min-w-0">
                <Link
                  className="line-clamp-2 text-[12px] font-bold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                  href={`/produkt/${product.slug}`}
                >
                  {product.title}
                </Link>
                <p className="mt-1 text-sm font-bold text-browin-dark">
                  {formatCurrency(variant.price)}
                </p>
              </div>
              <button
                aria-label={`Dodaj ${product.title} do koszyka`}
                className="flex h-9 w-9 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark transition-colors hover:border-browin-red hover:bg-browin-red hover:text-browin-white"
                onClick={() =>
                  addItems([
                    {
                      productId: product.id,
                      variantId: variant.id,
                      quantity: 1,
                    },
                  ])
                }
                type="button"
              >
                <Plus size={17} weight="bold" />
              </button>
            </article>
          );
        })}
      </div>

      <button
        className="checkout-cta mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-browin-red px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-white transition-colors hover:bg-browin-dark"
        onClick={() =>
          addItems(
            missingProducts.map((product) => ({
              productId: product.id,
              variantId: getPrimaryVariant(product).id,
              quantity: 1,
            })),
          )
        }
        type="button"
      >
        <Plus size={16} weight="bold" />
        Dodaj brakujące · {formatCurrency(total)}
      </button>
    </section>
  );
}
