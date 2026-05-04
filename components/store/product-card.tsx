"use client";

import { Heart, ShoppingCart, Star } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { useCart } from "@/components/store/cart-provider";
import { useFavorites } from "@/components/store/favorites-provider";
import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { Product } from "@/data/products";
import { formatCurrency, getDiscountPercent, getPrimaryVariant } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  squareImage?: boolean;
  imageQuality?: number;
  recipeCount?: number;
  titleLines?: 2 | 3;
  actionLabel?: string;
  badgeLabel?: string | null;
  badgeTone?: "dark" | "red";
  metaSlot?: ReactNode;
  progress?: {
    detail?: string;
    label: string;
    value: number;
  };
};

export function ProductCard({
  product,
  priority = false,
  squareImage = true,
  imageQuality,
  recipeCount = 0,
  titleLines = 2,
  actionLabel = "Dodaj",
  badgeLabel,
  badgeTone,
  metaSlot,
  progress,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const primaryVariant = getPrimaryVariant(product);
  const titleClampClass = titleLines === 3 ? "product-card-title-3" : "line-clamp-2";
  const favorite = isFavorite(product.id);
  const reviewsLabel = product.reviews.toLocaleString("pl-PL");
  const discount = getDiscountPercent(primaryVariant);
  const hasReviews = product.reviews > 0 && product.rating > 0;
  const defaultStatusLabel =
    product.status === "nowosc"
      ? "Nowość"
      : product.status === "wyprzedaz" && discount > 0
        ? `-${discount}%`
        : null;
  const statusLabel = badgeLabel === undefined ? defaultStatusLabel : badgeLabel;
  const statusClass =
    badgeTone === "red" || (!badgeTone && product.status === "nowosc")
      ? "bg-browin-red text-browin-white"
      : "bg-browin-dark text-browin-white";
  const progressValue = progress
    ? Math.min(100, Math.max(0, progress.value))
    : 0;
  const defaultMeta = hasReviews ? (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden text-[10px] text-browin-dark/58 md:text-[11px]">
      <Star className="shrink-0 text-browin-red" size={12} weight="fill" />
      <span className="shrink-0 font-semibold text-browin-dark/76">{product.rating.toFixed(1)}</span>
      <span className="truncate">{reviewsLabel} opinii</span>
    </span>
  ) : (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-browin-dark/52 md:text-[11px]">
      <span className="truncate">{product.line}</span>
    </span>
  );

  return (
    <article className="product-card group flex h-full flex-col rounded-none border border-browin-dark/8 bg-browin-white p-3 shadow-[0_10px_26px_rgba(51,51,51,0.05)] transition-colors duration-200 hover:border-browin-red focus-within:border-browin-red md:p-4">
      <div className="relative mb-4">
        <Link
          className={`relative block w-full overflow-hidden bg-browin-gray/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] ${
            squareImage ? "aspect-square flex-none" : "min-h-[15rem] flex-1"
          }`}
          href={`/produkt/${product.slug}`}
        >
          <div
            className={`relative h-full w-full ${
              squareImage ? "aspect-square p-4 md:p-5" : "min-h-[15rem] p-3 md:p-4"
            }`}
          >
            <Image
              alt={product.title}
              className="object-contain"
              fill
              priority={priority}
              quality={imageQuality}
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
              src={product.images[0]}
            />
          </div>
        </Link>
        {statusLabel ? (
          <span
            className={`pointer-events-none absolute left-0 top-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusClass}`}
          >
            {statusLabel}
          </span>
        ) : null}
        {recipeCount > 0 ? (
          <span className="pointer-events-none absolute right-0 top-0 inline-flex items-center gap-1 bg-browin-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-browin-red shadow-sm">
            <RecipebookIcon size={12} weight="fill" />
            {recipeCount} {recipeCount === 1 ? "przepis" : "przepisy"}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-col md:flex-1">
        <Link
          className={`${titleClampClass} text-[13px] font-semibold leading-[1.28] text-browin-dark transition-colors hover:text-browin-red focus-visible:text-browin-red md:text-[15px]`}
          href={`/produkt/${product.slug}`}
        >
          {product.title}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3 md:mt-auto">
          {metaSlot ? (
            <>
              <div className="min-w-0 flex-1 md:hidden">{defaultMeta}</div>
              <div className="hidden min-w-0 flex-1 overflow-hidden md:block">{metaSlot}</div>
            </>
          ) : (
            <div className="min-w-0 flex-1">{defaultMeta}</div>
          )}
          <button
            aria-label={
              favorite
                ? `Usuń ${product.title} z ulubionych`
                : `Dodaj ${product.title} do ulubionych`
            }
            aria-pressed={favorite}
            className={`flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-200 md:h-10 md:w-10 ${
              favorite
                ? "text-browin-red"
                : "text-browin-dark/45 hover:text-browin-red"
            }`}
            onClick={() => toggleFavorite(product.id)}
            type="button"
          >
            <Heart size={18} weight={favorite ? "fill" : "regular"} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="min-h-[0.9rem]">
            {primaryVariant.compareAtPrice ? (
              <p className="text-[11px] font-semibold leading-none text-browin-dark/30 line-through">
                {formatCurrency(primaryVariant.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <div className="font-bold text-[1.12rem] tracking-tight text-browin-dark min-[390px]:text-[1.28rem] md:text-[1.45rem]">
            {formatCurrency(primaryVariant.price)}
          </div>
        </div>
        <button
          aria-label={`Dodaj ${product.title} do koszyka`}
          className="group/addcart flex h-9 w-9 shrink-0 items-center justify-center border border-browin-red bg-browin-red px-0 text-browin-white transition-colors duration-200 hover:border-browin-dark hover:bg-browin-dark focus-visible:border-browin-dark focus-visible:bg-browin-dark md:h-10 md:w-auto md:min-w-[5.2rem] md:gap-2 md:px-3"
          onClick={() => addItem(product.id, primaryVariant.id)}
          type="button"
        >
          <ShoppingCart
            className="shrink-0 transition-transform duration-200 group-hover/addcart:-rotate-3 group-hover/addcart:translate-x-0.5"
            size={18}
          />
          <span className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] md:inline">
            {actionLabel}
          </span>
        </button>
      </div>

      {progress ? (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-browin-dark/55">
            <span className="truncate">{progress.label}</span>
            {progress.detail ? (
              <span className="shrink-0 text-browin-red">{progress.detail}</span>
            ) : null}
          </div>
          <div className="h-1.5 overflow-hidden rounded-none bg-browin-dark/10">
            <div
              className="h-full rounded-none bg-browin-red"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
