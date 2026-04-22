"use client";

import { Heart, ShoppingCart, Star } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/store/cart-provider";
import { useFavorites } from "@/components/store/favorites-provider";
import type { Product } from "@/data/products";
import { formatCurrency, getDiscountPercent, getPrimaryVariant } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  squareImage?: boolean;
  imageQuality?: number;
  titleLines?: 2 | 3;
};

export function ProductCard({
  product,
  priority = false,
  squareImage = true,
  imageQuality,
  titleLines = 2,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const primaryVariant = getPrimaryVariant(product);
  const titleClampClass = titleLines === 3 ? "product-card-title-3" : "line-clamp-2";
  const favorite = isFavorite(product.id);
  const reviewsLabel = product.reviews.toLocaleString("pl-PL");
  const discount = getDiscountPercent(primaryVariant);
  const hasReviews = product.reviews > 0 && product.rating > 0;
  const statusLabel =
    product.status === "nowosc"
      ? "Nowość"
      : product.status === "wyprzedaz" && discount > 0
        ? `-${discount}%`
        : null;
  const statusClass =
    product.status === "nowosc"
      ? "bg-browin-red text-browin-white"
      : "bg-browin-dark text-browin-white";

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
      </div>

      <div className="flex min-h-0 flex-col md:flex-1">
        <Link
          className={`${titleClampClass} text-[13px] font-semibold leading-[1.28] text-browin-dark transition-colors hover:text-browin-red focus-visible:text-browin-red md:text-[15px]`}
          href={`/produkt/${product.slug}`}
        >
          {product.title}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3 md:mt-auto">
          {hasReviews ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-browin-dark/58 md:text-[11px]">
              <Star className="text-browin-red" size={12} weight="fill" />
              <span className="font-semibold text-browin-dark/76">{product.rating.toFixed(1)}</span>
              <span>{reviewsLabel} opinii</span>
            </span>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-browin-dark/52 md:text-[11px]">
              {product.line}
            </span>
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
          <div className="font-bold text-[1.28rem] tracking-tight text-browin-dark md:text-[1.45rem]">
            {formatCurrency(primaryVariant.price)}
          </div>
        </div>
        <button
          aria-label={`Dodaj ${product.title} do koszyka`}
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-browin-dark/10 bg-browin-white text-browin-dark transition-[width,padding,justify-content,gap,background-color,border-color,color] duration-200 hover:border-browin-red hover:bg-browin-red hover:text-browin-white focus-visible:border-browin-red focus-visible:bg-browin-red focus-visible:text-browin-white md:h-10 md:w-10 md:group-hover:w-[6.9rem] md:group-hover:justify-start md:group-hover:gap-2 md:group-hover:border-browin-red md:group-hover:bg-browin-red md:group-hover:px-3 md:group-hover:text-browin-white md:hover:w-[6.9rem] md:hover:justify-start md:hover:gap-2 md:hover:px-3 md:focus-visible:w-[6.9rem] md:focus-visible:justify-start md:focus-visible:gap-2 md:focus-visible:px-3"
          onClick={() => addItem(product.id, primaryVariant.id)}
          type="button"
        >
          <ShoppingCart className="shrink-0" size={18} />
          <span className="hidden max-w-0 -translate-x-1 overflow-hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] opacity-0 transition-[max-width,opacity,transform] duration-200 md:block md:group-hover:max-w-[3.5rem] md:group-hover:translate-x-0 md:group-hover:opacity-100 md:hover:max-w-[3.5rem] md:hover:translate-x-0 md:hover:opacity-100 md:focus-visible:max-w-[3.5rem] md:focus-visible:translate-x-0 md:focus-visible:opacity-100">
            Dodaj
          </span>
        </button>
      </div>
    </article>
  );
}
