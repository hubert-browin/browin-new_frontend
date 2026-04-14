"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/store/cart-provider";
import type { Product } from "@/data/products";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";

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
  const primaryVariant = getPrimaryVariant(product);
  const titleClampClass = titleLines === 3 ? "product-card-title-3" : "line-clamp-2";

  return (
    <article className="product-card group flex h-full flex-col rounded-none border border-browin-dark/10 bg-browin-white p-4 shadow-sm transition-colors hover:border-browin-red">
      <Link
        className={`relative mb-4 block w-full overflow-hidden border border-browin-dark/10 bg-browin-gray ${
          squareImage ? "aspect-square flex-none" : "min-h-[15rem] flex-1"
        }`}
        href={`/produkt/${product.slug}`}
      >
        <div
          className={`relative h-full w-full ${
            squareImage ? "aspect-square p-3" : "min-h-[15rem] p-2"
          }`}
        >
          <Image
            alt={product.title}
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            fill
            priority={priority}
            quality={imageQuality}
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            src={product.images[0]}
          />
        </div>

        {product.badge ? (
          <span
            className={`absolute left-2 top-2 px-2 py-1 text-[9px] font-bold uppercase text-browin-white shadow-sharp ${
              product.badge === "Bestseller" ? "bg-browin-dark" : "bg-browin-red"
            }`}
          >
            {product.badge}
          </span>
        ) : null}
      </Link>

      <Link
        className={`${titleClampClass} text-xs font-bold leading-tight text-browin-dark transition-colors group-hover:text-browin-red md:text-sm`}
        href={`/produkt/${product.slug}`}
      >
        {product.title}
      </Link>

      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <div className="font-extrabold text-browin-dark text-lg md:text-xl">
          {formatCurrency(primaryVariant.price)}
        </div>
        <button
          aria-label={`Dodaj ${product.title} do koszyka`}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark transition-colors group-hover:border-browin-red group-hover:bg-browin-red group-hover:text-browin-white md:h-10 md:w-10"
          onClick={() => addItem(product.id, primaryVariant.id)}
          type="button"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </article>
  );
}
