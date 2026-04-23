"use client";

import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  CaretUp,
  ChatCircleText,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { StoreIcon } from "@/components/store/icon-map";
import { ProductCard } from "@/components/store/product-card";
import { ProductRecipeBridge } from "@/components/store/product-recipe-bridge";
import { useProductRecipeNav } from "@/components/store/product-recipe-nav-context";
import { useCart } from "@/components/store/cart-provider";
import type { Product, ProductBundleItem, ProductFile } from "@/data/products";
import type { RecipeSummary } from "@/data/recipes";
import { categories } from "@/data/store";
import {
  formatCurrency,
  freeShippingThreshold,
  getDiscountPercent,
  getPrimaryVariant,
  getVariantById,
} from "@/lib/catalog";

type ProductDetailProps = {
  product: Product;
  relatedProducts: Product[];
  complementaryProducts: Product[];
  recipeInspirations?: RecipeSummary[];
};

type VariantSelectorProps = {
  product: Product;
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
  compact?: boolean;
};

type QuantitySelectorProps = {
  quantity: number;
  quantityInput: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onQuantityInputBlur: () => void;
  onQuantityInputChange: (value: string) => void;
  className?: string;
  compact?: boolean;
};

type ReviewBreakdownItem = {
  stars: number;
  count: number;
  percent: number;
};

type ReviewCard = {
  author: string;
  body: string;
  rating: number;
  title: string;
  verified: boolean;
  meta: string;
};

type TrustSignal = {
  icon: "shield" | "timer" | "truck";
  label: string;
  value: string;
  detail: string;
};

const reviewAuthors = ["Anna K.", "Marek D.", "Julia P."] as const;
const reviewTitles = [
  "Dobry wybor w tej kategorii",
  "Jasna oferta i sprawna realizacja",
  "Warto miec pod reka przy kolejnych zakupach",
] as const;
const reviewMoments = [
  "Kupiono 2 tygodnie temu",
  "Kupiono w ostatnim miesiacu",
  "Kupiono 3 miesiace temu",
] as const;

const resolveImageGestureLock = (deltaX: number, deltaY: number) => {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < 8 && absY < 8) {
    return null;
  }

  return absX >= absY * 0.65 ? "horizontal" : "vertical";
};

const MOBILE_GALLERY_FALLBACK_WIDTH = 256;
const MOBILE_SWIPE_SETTLE_MS = 220;
const DESKTOP_THUMB_WINDOW_SIZE = 5;

const getDesktopThumbMaxStart = (length: number) =>
  Math.max(length - DESKTOP_THUMB_WINDOW_SIZE, 0);

const clampDesktopThumbStart = (start: number, length: number) =>
  Math.min(Math.max(start, 0), getDesktopThumbMaxStart(length));

const getDesktopThumbStartForImage = (
  currentStart: number,
  imageIndex: number,
  length: number,
) => {
  const safeCurrentStart = clampDesktopThumbStart(currentStart, length);
  const maxStart = getDesktopThumbMaxStart(length);

  if (imageIndex < safeCurrentStart) {
    return imageIndex;
  }

  if (imageIndex >= safeCurrentStart + DESKTOP_THUMB_WINDOW_SIZE) {
    return Math.min(imageIndex - DESKTOP_THUMB_WINDOW_SIZE + 1, maxStart);
  }

  return safeCurrentStart;
};

const getWrappedImageIndex = (length: number, index: number) => {
  if (length <= 0) {
    return 0;
  }

  return (index + length) % length;
};

const getLeadTimeDays = (leadTime: string) => {
  const hours = Number.parseInt(leadTime, 10);

  if (Number.isNaN(hours) || hours <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(hours / 24));
};

const getDeliveryEstimateLabel = (leadTime: string) => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + getLeadTimeDays(leadTime));

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(deliveryDate);
};

const buildReviewBreakdown = (totalReviews: number, averageRating: number) => {
  if (totalReviews <= 0) {
    return [
      { stars: 5, count: 0, percent: 0 },
      { stars: 4, count: 0, percent: 0 },
      { stars: 3, count: 0, percent: 0 },
      { stars: 2, count: 0, percent: 0 },
      { stars: 1, count: 0, percent: 0 },
    ] satisfies ReviewBreakdownItem[];
  }

  const ratingDelta = Math.max(-0.6, Math.min(0.9, averageRating - 4.2));
  const weights = [
    0.56 + ratingDelta * 0.34,
    0.24 - ratingDelta * 0.14,
    0.11 - ratingDelta * 0.07,
    0.06 - ratingDelta * 0.08,
    0.03 - ratingDelta * 0.05,
  ];
  const normalizedWeights = (() => {
    const total = weights.reduce((sum, weight) => sum + Math.max(weight, 0.01), 0);

    return weights.map((weight) => Math.max(weight, 0.01) / total);
  })();
  const counts = normalizedWeights.map((weight) => Math.round(weight * totalReviews));
  const difference = totalReviews - counts.reduce((sum, count) => sum + count, 0);

  counts[0] += difference;

  return [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    count: counts[index] ?? 0,
    percent: Math.round(((counts[index] ?? 0) / totalReviews) * 100),
  }));
};

const buildReviewCards = (product: Product) => {
  const reviewBodies = [
    product.shortDescription,
    product.description,
    product.longDescription,
  ];
  const toReviewSnippet = (body: string) => {
    const normalizedBody = body.replace(/\s+/g, " ").trim();

    if (normalizedBody.length <= 164) {
      return normalizedBody;
    }

    return `${normalizedBody.slice(0, 161).trimEnd()}...`;
  };

  return reviewBodies.map((body, index) => ({
    author: reviewAuthors[index] ?? `Klient ${index + 1}`,
    body: toReviewSnippet(body),
    meta: reviewMoments[index] ?? "Kupiono niedawno",
    rating: 5,
    title: reviewTitles[index] ?? "Zweryfikowany zakup",
    verified: true,
  })) satisfies ReviewCard[];
};

function VariantSelector({
  onSelect,
  product,
  selectedVariantId,
  compact = false,
}: VariantSelectorProps) {
  if (product.variants.length <= 1) {
    return null;
  }

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
      {product.variants.map((variant) => {
        const isActive = selectedVariantId === variant.id;

        return (
          <button
            className={`flex w-full flex-col border text-left transition-colors ${
              compact ? "px-3 py-2" : "px-3 py-2.5"
            } ${
              isActive
                ? "border-browin-red bg-browin-red text-browin-white"
                : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red/45"
            }`}
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            type="button"
          >
            {variant.label.trim() ? (
              <p
                className={`leading-tight ${compact ? "text-[0.95rem]" : "text-sm"} font-semibold ${
                  isActive ? "text-browin-white" : "text-browin-dark"
                }`}
              >
                {variant.label}
              </p>
            ) : null}
            <p
              className={`font-semibold ${
                compact ? "text-sm" : "text-sm"
              } ${isActive ? "text-browin-white/85" : "text-browin-dark/60"}`}
            >
              {formatCurrency(variant.price)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function QuantitySelector({
  className = "",
  compact = false,
  onDecrease,
  onIncrease,
  onQuantityInputBlur,
  onQuantityInputChange,
  quantity,
  quantityInput,
}: QuantitySelectorProps) {
  const wrapperSizeClass = compact ? "min-h-11" : "min-h-12 md:min-h-14";
  const buttonWidthClass = compact ? "w-11" : "w-12 md:w-14";
  const valueClass = compact
    ? "min-w-[3.75rem] px-3 text-base"
    : "min-w-[4.5rem] px-4 text-lg md:text-xl";

  return (
    <div
      className={`flex items-stretch border border-browin-dark/10 bg-browin-gray ${wrapperSizeClass} ${className}`}
    >
      <button
        className={`flex h-auto self-stretch items-center justify-center border-r border-browin-dark/10 text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white ${buttonWidthClass}`}
        onClick={onDecrease}
        type="button"
      >
        <Minus size={16} />
      </button>
      <input
        aria-label={`Wpisz ilosc produktu, aktualnie ${quantity}`}
        autoComplete="off"
        className={`appearance-none flex flex-1 self-stretch items-center justify-center bg-transparent text-center font-bold tabular-nums tracking-tight text-browin-dark outline-none ${valueClass}`}
        enterKeyHint="done"
        inputMode="numeric"
        onBlur={onQuantityInputBlur}
        onChange={(event) => onQuantityInputChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        pattern="[0-9]*"
        spellCheck={false}
        type="text"
        value={quantityInput}
      />
      <button
        className={`flex h-auto self-stretch items-center justify-center border-l border-browin-dark/10 text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white ${buttonWidthClass}`}
        onClick={onIncrease}
        type="button"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function TrustSummary({
  compact = false,
  orderValue,
  selectedVariantLeadTime,
}: {
  compact?: boolean;
  orderValue: number;
  selectedVariantLeadTime: string;
}) {
  const deliveryDateLabel = getDeliveryEstimateLabel(selectedVariantLeadTime);
  const amountToFreeShipping = Math.max(freeShippingThreshold - orderValue, 0);
  const qualifiesForFreeShipping = amountToFreeShipping === 0;
  const trustSignals: TrustSignal[] = [
    {
      icon: "truck",
      label: "Dostawa",
      value: compact ? deliveryDateLabel : `Do ${deliveryDateLabel}`,
      detail: qualifiesForFreeShipping
        ? "Darmowa dostawa odblokowana"
        : `Od 9,99 zl • darmowa od ${formatCurrency(freeShippingThreshold)}`,
    },
    {
      icon: "timer",
      label: "Zwrot",
      value: compact ? "14 dni" : "14 dni bez ryzyka",
      detail: "Czytelna polityka zwrotow i szybka obsluga",
    },
    {
      icon: "shield",
      label: compact ? "Sprzedawca" : "Sprzedawca",
      value: "BROWIN",
      detail: "Producent i obsluga w jednym miejscu",
    },
  ];

  return (
    <div
      className={
        compact
          ? ""
          : "rounded-sm border border-browin-dark/10 bg-browin-gray/60 p-4"
      }
    >
      <div className="product-detail-buybox-trust-grid grid gap-3 md:grid-cols-3">
        {trustSignals.map((signal) => (
          <div
            className={`product-detail-buybox-trust-card grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border border-browin-dark/10 bg-browin-white ${
              compact ? "px-3 py-2" : "px-3 py-3"
            }`}
            key={signal.label}
          >
            <div className="product-detail-buybox-trust-icon mt-0.5 text-browin-red">
              <StoreIcon icon={signal.icon} size={18} weight="fill" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                {signal.label}
              </p>
              <p
                className={`mt-1 font-semibold leading-snug text-browin-dark ${
                  compact ? "text-[13px]" : "text-sm"
                }`}
              >
                {signal.value}
              </p>
              {!compact ? (
                <p className="mt-1 text-xs leading-relaxed text-browin-dark/62">
                  {signal.detail}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {!qualifiesForFreeShipping && !compact ? (
        <div className="mt-3 rounded-sm border border-browin-red/18 bg-browin-white px-3 py-3 text-xs leading-relaxed text-browin-dark/72">
          Brakuje <span className="font-bold text-browin-dark">{formatCurrency(amountToFreeShipping)}</span> do darmowej dostawy.
        </div>
      ) : null}

    </div>
  );
}

const fileTypeLabels: Record<string, string> = {
  instrukcja: "PDF · Instrukcja",
  bezpieczenstwo: "PDF · Bezpieczeństwo",
  "karta-produktu": "PDF · Karta produktu",
  deklaracja: "PDF · Deklaracja",
  "karta-charakterystyki": "PDF · Karta charakterystyki",
  inne: "PDF",
};

function ProductDescription({ product }: { product: Product }) {
  if (product.descriptionHtml) {
    return (
      <div
        className="text-sm leading-relaxed text-browin-dark/72 [&_p:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />
    );
  }

  return <p className="text-sm leading-relaxed text-browin-dark/72">{product.longDescription}</p>;
}

function ProductFileTile({ file }: { file: ProductFile }) {
  return (
    <a
      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-browin-dark/10 bg-browin-gray px-4 py-4 transition-colors hover:border-browin-red hover:bg-browin-white sm:flex sm:items-center sm:gap-4"
      download
      href={file.href}
      rel="noopener"
      target="_blank"
    >
      <span
        aria-hidden
        className="grid h-11 w-11 shrink-0 place-items-center border border-browin-dark/10 bg-browin-white font-mono text-[11px] font-semibold tracking-[0.06em] text-browin-red"
      >
        PDF
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
          {fileTypeLabels[file.type] ?? "PDF"}
        </span>
        <span className="mt-1 block break-words text-sm font-semibold text-browin-dark transition-colors group-hover:text-browin-red sm:truncate">
          {file.label}
        </span>
      </span>
      {file.sizeLabel ? (
        <span className="col-start-2 row-start-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-browin-dark/45 sm:col-auto sm:row-auto sm:shrink-0">
          {file.sizeLabel}
        </span>
      ) : null}
      <ArrowRight
        className="shrink-0 text-browin-dark/35 transition-colors group-hover:text-browin-red"
        size={16}
      />
    </a>
  );
}

function BundleItemsList({ items }: { items: ProductBundleItem[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const itemBody = (
          <>
            {item.image ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-browin-dark/10 bg-browin-white">
                <Image
                  alt={item.name}
                  className="object-contain"
                  fill
                  sizes="64px"
                  src={item.image}
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                {item.quantity} szt.
              </p>
              <p className="mt-1 text-sm font-semibold text-browin-dark">{item.name}</p>
            </div>
            {item.slug ? (
              <ArrowRight className="shrink-0 text-browin-dark/35 transition-colors group-hover:text-browin-red" size={16} />
            ) : null}
          </>
        );

        if (item.slug) {
          return (
            <Link
              className="group flex items-center gap-4 border border-browin-dark/10 bg-browin-gray px-4 py-4 transition-colors hover:border-browin-red hover:bg-browin-white"
              href={`/produkt/${item.slug}`}
              key={`${item.id}-${item.slug ?? item.name}`}
            >
              {itemBody}
            </Link>
          );
        }

        return (
          <div
            className="flex items-center gap-4 border border-browin-dark/10 bg-browin-gray px-4 py-4"
            key={`${item.id}-${item.name}`}
          >
            {itemBody}
          </div>
        );
      })}
    </div>
  );
}

function ProductSpecsList({ product }: { product: Product }) {
  return (
    <dl className="divide-y divide-browin-dark/10 border-y border-browin-dark/10">
      {product.specs.map((spec) => (
        <div
          className="grid gap-1.5 py-3 text-sm md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-4"
          key={spec.label}
        >
          <dt className="font-semibold text-browin-dark">{spec.label}</dt>
          <dd className="text-browin-dark/68">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProductQuestionsPrompt() {
  return (
    <button
      className="group flex w-full items-center justify-between gap-4 bg-browin-red px-5 py-4 text-left text-browin-white transition-colors hover:bg-browin-dark md:px-6 md:py-5"
      type="button"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center text-browin-white lg:flex">
          <ChatCircleText size={24} weight="fill" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-white/72">
            Masz pytania?
          </p>
          <p className="mt-1 text-lg font-bold uppercase tracking-tight text-browin-white md:text-xl">
            Zapytaj o ten produkt
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-browin-white/78 transition-colors group-hover:text-browin-white">
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline">
          Czat
        </span>
        <ArrowRight
          className="transition-transform duration-200 group-hover:translate-x-1"
          size={18}
        />
      </div>
    </button>
  );
}

function ComplementaryProductsGrid({ products }: { products: Product[] }) {
  return (
    <section className="mt-12 border-t border-browin-dark/10 pt-10">
      <div className="mb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
            Kompletuj zestaw
          </p>
          <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark md:text-3xl">
            Produkty uzupełniające
          </h2>
        </div>
      </div>
      <div className="product-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={`complementary-${item.id}`} product={item} titleLines={3} />
        ))}
      </div>
    </section>
  );
}

function BuyboxRecommendationRail({
  fallbackToRelated = false,
  products,
}: {
  fallbackToRelated?: boolean;
  products: Product[];
}) {
  const { addItem } = useCart();
  const railRef = useRef<HTMLDivElement | null>(null);

  if (products.length === 0) {
    return null;
  }

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || rail.scrollWidth <= rail.clientWidth) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    rail.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  return (
    <div className="hidden pt-3 2xl:block">
      {!fallbackToRelated ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-red">
          Kompletuj zestaw
        </p>
      ) : null}

      <div
        className={`no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 ${
          fallbackToRelated ? "" : "mt-3"
        }`}
        onWheel={handleWheel}
        ref={railRef}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((item) => {
          const itemVariant = getPrimaryVariant(item);

          return (
            <article
              className="group relative flex w-[8.75rem] shrink-0 snap-start flex-col border border-browin-dark/10 bg-browin-white transition-colors hover:border-browin-red"
              key={`buybox-rail-${item.id}`}
            >
              <Link
                aria-label={`Zobacz produkt ${item.title}`}
                className="flex min-h-full flex-1 flex-col focus-visible:outline-none"
                draggable={false}
                href={`/produkt/${item.slug}`}
              >
                <div className="relative h-[5rem] overflow-hidden bg-browin-white">
                  <Image
                    alt={item.title}
                    className="object-contain p-2"
                    fill
                    sizes="140px"
                    src={item.images[0]}
                  />
                </div>
                <div className="flex min-h-[5rem] flex-1 flex-col px-2 py-2">
                  <span className="line-clamp-2 text-[11px] font-semibold leading-[1.22] text-browin-dark transition-colors group-hover:text-browin-red">
                    {item.title}
                  </span>
                  <div className="mt-auto min-w-0 pr-8 pt-2">
                    {itemVariant.compareAtPrice ? (
                      <p className="text-[8px] font-semibold leading-none text-browin-dark/28 line-through">
                        {formatCurrency(itemVariant.compareAtPrice)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[0.9rem] font-bold tracking-tight text-browin-dark">
                      {formatCurrency(itemVariant.price)}
                    </p>
                  </div>
                </div>
              </Link>

              <button
                aria-label={`Dodaj ${item.title} do koszyka`}
                className="absolute bottom-2 right-2 z-10 flex h-7 w-7 shrink-0 items-center justify-center border border-browin-dark/10 bg-browin-gray/70 text-browin-dark transition-colors hover:border-browin-red hover:bg-browin-red hover:text-browin-white"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addItem(item.id, itemVariant.id);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                type="button"
              >
                <Plus className="pointer-events-none" size={14} weight="bold" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ProductStatusBadge({ product }: { product: Product }) {
  if (product.status === "nowosc") {
    return (
      <span className="inline-flex items-center bg-browin-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-browin-white">
        Nowość
      </span>
    );
  }
  if (product.status === "wyprzedaz") {
    return (
      <span className="inline-flex items-center bg-browin-dark px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-browin-white">
        Wyprzedaż
      </span>
    );
  }
  return null;
}

function ProductCodes({
  className,
  compact = false,
  ean,
  symbol,
}: {
  className?: string;
  compact?: boolean;
  ean: string;
  symbol: string;
}) {
  return (
    <dl
      className={`flex items-center ${compact ? "flex-nowrap gap-x-3 text-[11px] tracking-[0.14em]" : "w-full justify-between gap-x-4 gap-y-1 text-[11px] tracking-[0.14em]"} font-semibold uppercase text-browin-dark/55 ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5">
        <dt>Symbol</dt>
        <dd className="font-mono text-browin-dark/78">{symbol}</dd>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-right">
        <dt>EAN</dt>
        <dd className="font-mono text-browin-dark/78">{ean}</dd>
      </div>
    </dl>
  );
}

function ReviewSummaryRow({
  onReviewClick,
  product,
}: {
  onReviewClick: () => void;
  product: Product;
}) {
  const roundedRating = Math.max(1, Math.min(5, Math.round(product.rating)));

  return (
    <button
      className="product-detail-review-row flex w-full items-center gap-3 text-left transition-opacity hover:opacity-70"
      onClick={onReviewClick}
      type="button"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1 text-browin-red">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={`review-summary-${index}`}
              size={14}
              weight={index < roundedRating ? "fill" : "regular"}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-browin-dark">{product.rating.toFixed(1)}</span>
        <span className="product-detail-review-count text-sm font-semibold text-browin-dark/68">
          {product.reviews} opinii
        </span>
      </div>
    </button>
  );
}

function ReviewsSection({
  product,
  sectionId,
}: {
  product: Product;
  sectionId: string;
}) {
  const reviewBreakdown = buildReviewBreakdown(product.reviews, product.rating);
  const reviewCards = buildReviewCards(product);
  const recommendationPercent = Math.max(
    84,
    Math.min(98, Math.round(product.rating * 18 + 6)),
  );

  return (
    <section className="bg-browin-white" id={sectionId}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
            Opinie klientow
          </p>
          <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark">
            Opinie o produkcie
          </h2>
        </div>

        <div className="border-l-4 border-browin-red bg-browin-gray/80 px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
            Poleca produkt
          </p>
          <p className="mt-1 text-lg font-bold text-browin-dark">
            {recommendationPercent}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="bg-browin-gray/72 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center bg-browin-white text-browin-red">
              <Star size={26} weight="fill" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-browin-dark">
                {product.rating.toFixed(1)}
              </p>
              <p className="text-sm text-browin-dark/65">
                Srednia z {product.reviews} opinii
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {reviewBreakdown.map((item) => (
              <div className="grid grid-cols-[2.2rem_minmax(0,1fr)_3rem] items-center gap-3" key={item.stars}>
                <span className="text-sm font-semibold text-browin-dark">{item.stars}★</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-browin-white">
                  <div
                    className="h-full rounded-full bg-browin-red"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-right text-sm text-browin-dark/65">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Zweryfikowany zakup", "Dostawa zgodna z obietnica", "Czytelna oferta"].map(
              (tag) => (
                <span
                  className="bg-browin-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-browin-dark/72"
                  key={tag}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="divide-y divide-browin-dark/10">
          {reviewCards.map((review) => (
            <article className="py-4 first:pt-0 last:pb-0 md:px-1" key={review.author}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-browin-red">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={`${review.author}-${index}`}
                        size={14}
                        weight={index < review.rating ? "fill" : "regular"}
                      />
                    ))}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-browin-dark">
                    {review.title}
                  </h3>
                </div>

                {review.verified ? (
                  <span className="bg-browin-red/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-browin-red">
                    Zweryfikowany zakup
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-browin-dark/72">{review.body}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-browin-dark/55">
                <span className="font-semibold text-browin-dark">{review.author}</span>
                <span>{review.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileSection({
  children,
  defaultOpen = false,
  title,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className="border border-browin-dark/10 bg-browin-white"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-xl font-semibold uppercase tracking-tight text-browin-dark">
        <span>{title}</span>
        {isOpen ? <CaretUp size={18} /> : <CaretDown size={18} />}
      </summary>
      <div className="border-t border-browin-dark/10 px-4 py-4">{children}</div>
    </details>
  );
}

export function ProductDetail({
  product,
  relatedProducts,
  complementaryProducts,
  recipeInspirations = [],
}: ProductDetailProps) {
  const { addItem } = useCart();
  const { registerProductRecipes } = useProductRecipeNav();
  const defaultVariant = getPrimaryVariant(product);
  const category = categories.find((entry) => entry.id === product.categoryId);
  const categoryHref = category ? `/kategoria/${category.slug}` : "/produkty";
  const buyboxRecommendationProducts =
    complementaryProducts.length > 0 ? complementaryProducts : relatedProducts;
  const buyboxUsesRelatedFallback =
    complementaryProducts.length === 0 && relatedProducts.length > 0;
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);
  const desktopStageRef = useRef<HTMLDivElement | null>(null);
  const mobilePrimaryCtaRef = useRef<HTMLButtonElement | null>(null);
  const desktopPointerStartX = useRef<number | null>(null);
  const desktopPointerId = useRef<number | null>(null);
  const imageTouchStartX = useRef<number | null>(null);
  const imageTouchStartY = useRef<number | null>(null);
  const imageGestureLock = useRef<"horizontal" | "vertical" | null>(null);
  const mobileSwipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopSwipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageTransitionDirection, setImageTransitionDirection] = useState<
    "forward" | "backward"
  >("forward");
  const [desktopStageWidth, setDesktopStageWidth] = useState(MOBILE_GALLERY_FALLBACK_WIDTH);
  const [desktopSwipeOffset, setDesktopSwipeOffset] = useState(0);
  const [desktopSwipeState, setDesktopSwipeState] = useState<
    "idle" | "dragging" | "settling"
  >("idle");
  const [mobileGalleryWidth, setMobileGalleryWidth] = useState(
    MOBILE_GALLERY_FALLBACK_WIDTH,
  );
  const [mobileSwipeOffset, setMobileSwipeOffset] = useState(0);
  const [mobileSwipeState, setMobileSwipeState] = useState<
    "idle" | "dragging" | "settling"
  >("idle");
  const [desktopThumbStartIndex, setDesktopThumbStartIndex] = useState(0);
  const [isMobileStickyVisible, setIsMobileStickyVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant.id);

  const selectedVariant = getVariantById(product, selectedVariantId);
  const discount = getDiscountPercent(selectedVariant);
  const orderValue = selectedVariant.price * quantity;
  const amountToFreeShipping = Math.max(freeShippingThreshold - orderValue, 0);
  const qualifiesForFreeShipping = amountToFreeShipping === 0;
  const shippingProgress = Math.min((orderValue / freeShippingThreshold) * 100, 100);
  const isInStock = selectedVariant.stock > 0;
  const stockLabel =
    isInStock
      ? selectedVariant.availabilityLabel ?? `${selectedVariant.stock} szt.`
      : selectedVariant.availabilityLabel ?? "Chwilowo niedostepny";
  const deliveryDateLabel = getDeliveryEstimateLabel(selectedVariant.leadTime);
  const handleAddToCart = () => addItem(product.id, selectedVariant.id, quantity);
  const safeDesktopStageWidth = Math.max(desktopStageWidth, 1);
  const safeMobileGalleryWidth = Math.max(mobileGalleryWidth, 1);

  useEffect(() => {
    if (recipeInspirations.length === 0) {
      registerProductRecipes(null);

      return () => registerProductRecipes(null);
    }

    registerProductRecipes({
      product: {
        id: product.id,
        images: product.images,
        slug: product.slug,
        title: product.title,
      },
      recipes: recipeInspirations.slice(0, 6),
    });

    return () => registerProductRecipes(null);
  }, [
    product.id,
    product.images,
    product.slug,
    product.title,
    recipeInspirations,
    registerProductRecipes,
  ]);

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const scrollFrame = window.requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [product.id]);

  const applyQuantity = (nextValue: number) => {
    const safeQuantity = Math.max(1, Math.floor(nextValue));
    setQuantity(safeQuantity);
    setQuantityInput(String(safeQuantity));
  };

  const handleQuantityInputChange = (nextValue: string) => {
    const digitsOnly = nextValue.replace(/\D/g, "");
    const normalizedValue = digitsOnly.replace(/^0+(?=\d)/, "");

    setQuantityInput(normalizedValue);

    if (!normalizedValue) {
      return;
    }

    const parsedQuantity = Number.parseInt(normalizedValue, 10);

    if (!Number.isNaN(parsedQuantity) && parsedQuantity >= 1) {
      setQuantity(parsedQuantity);
    }
  };

  const handleQuantityInputBlur = () => {
    if (!quantityInput) {
      setQuantityInput(String(quantity));
      return;
    }

    const parsedQuantity = Number.parseInt(quantityInput, 10);

    if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
      setQuantityInput(String(quantity));
      return;
    }

    applyQuantity(parsedQuantity);
  };

  const clearMobileSwipeTimeout = () => {
    if (mobileSwipeTimeoutRef.current) {
      clearTimeout(mobileSwipeTimeoutRef.current);
      mobileSwipeTimeoutRef.current = null;
    }
  };

  const clearDesktopSwipeTimeout = () => {
    if (desktopSwipeTimeoutRef.current) {
      clearTimeout(desktopSwipeTimeoutRef.current);
      desktopSwipeTimeoutRef.current = null;
    }
  };

  const resetMobileSwipePreview = () => {
    clearMobileSwipeTimeout();
    setMobileSwipeOffset(0);
    setMobileSwipeState("idle");
  };

  const resetDesktopSwipePreview = () => {
    clearDesktopSwipeTimeout();
    setDesktopSwipeOffset(0);
    setDesktopSwipeState("idle");
  };

  const settleMobileSwipe = (
    targetOffset: number,
    onComplete?: () => void,
  ) => {
    clearMobileSwipeTimeout();
    setMobileSwipeState("settling");
    setMobileSwipeOffset(targetOffset);

    mobileSwipeTimeoutRef.current = setTimeout(() => {
      mobileSwipeTimeoutRef.current = null;
      onComplete?.();
      setMobileSwipeOffset(0);
      setMobileSwipeState("idle");
    }, MOBILE_SWIPE_SETTLE_MS);
  };

  const settleDesktopSwipe = (
    targetOffset: number,
    onComplete?: () => void,
  ) => {
    clearDesktopSwipeTimeout();
    setDesktopSwipeState("settling");
    setDesktopSwipeOffset(targetOffset);

    desktopSwipeTimeoutRef.current = setTimeout(() => {
      desktopSwipeTimeoutRef.current = null;
      onComplete?.();
      setDesktopSwipeOffset(0);
      setDesktopSwipeState("idle");
    }, MOBILE_SWIPE_SETTLE_MS);
  };

  const scrollToReviews = () => {
    const targetId =
      window.innerWidth >= 1024 ? "product-reviews-desktop" : "product-reviews-mobile";
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    if (window.innerWidth < 1024) {
      targetElement.closest("details")?.setAttribute("open", "");
    }

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectImage = (nextIndex: number) => {
    if (nextIndex === safeActiveImageIndex) {
      resetMobileSwipePreview();
      resetDesktopSwipePreview();
      return;
    }

    resetMobileSwipePreview();
    resetDesktopSwipePreview();
    setImageTransitionDirection(nextIndex > safeActiveImageIndex ? "forward" : "backward");
    setDesktopThumbStartIndex((current) =>
      getDesktopThumbStartForImage(current, nextIndex, product.images.length),
    );
    setActiveImageIndex(nextIndex);
  };

  const showPreviousImage = () => {
    resetMobileSwipePreview();
    resetDesktopSwipePreview();
    setImageTransitionDirection("backward");
    const nextIndex = getWrappedImageIndex(product.images.length, safeActiveImageIndex - 1);
    setDesktopThumbStartIndex((current) =>
      getDesktopThumbStartForImage(current, nextIndex, product.images.length),
    );
    setActiveImageIndex(nextIndex);
  };

  const showNextImage = () => {
    resetMobileSwipePreview();
    resetDesktopSwipePreview();
    setImageTransitionDirection("forward");
    const nextIndex = getWrappedImageIndex(product.images.length, safeActiveImageIndex + 1);
    setDesktopThumbStartIndex((current) =>
      getDesktopThumbStartForImage(current, nextIndex, product.images.length),
    );
    setActiveImageIndex(nextIndex);
  };

  const showPreviousThumbSet = () => {
    const nextIndex = Math.max(safeActiveImageIndex - 1, 0);

    if (nextIndex === safeActiveImageIndex) {
      return;
    }

    resetDesktopSwipePreview();
    setImageTransitionDirection("backward");
    setDesktopThumbStartIndex((current) =>
      getDesktopThumbStartForImage(current, nextIndex, product.images.length),
    );
    setActiveImageIndex(nextIndex);
  };

  const showNextThumbSet = () => {
    const nextIndex = Math.min(safeActiveImageIndex + 1, product.images.length - 1);

    if (nextIndex === safeActiveImageIndex) {
      return;
    }

    resetDesktopSwipePreview();
    setImageTransitionDirection("forward");
    setDesktopThumbStartIndex((current) =>
      getDesktopThumbStartForImage(current, nextIndex, product.images.length),
    );
    setActiveImageIndex(nextIndex);
  };

  const resetImageGesture = () => {
    imageTouchStartX.current = null;
    imageTouchStartY.current = null;
    imageGestureLock.current = null;
  };

  const handleImageTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (product.images.length <= 1) {
      return;
    }

    clearMobileSwipeTimeout();
    setMobileSwipeOffset(0);
    setMobileSwipeState("idle");
    imageTouchStartX.current = event.touches[0]?.clientX ?? null;
    imageTouchStartY.current = event.touches[0]?.clientY ?? null;
    imageGestureLock.current = null;
  };

  const handleImageTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (imageTouchStartX.current === null || imageTouchStartY.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? imageTouchStartX.current;
    const touchEndY = event.changedTouches[0]?.clientY ?? imageTouchStartY.current;
    const deltaX = touchEndX - imageTouchStartX.current;
    const deltaY = touchEndY - imageTouchStartY.current;
    const gestureLock =
      imageGestureLock.current ?? resolveImageGestureLock(deltaX, deltaY);
    const swipeThreshold = Math.min(
      84,
      Math.max(40, safeMobileGalleryWidth * 0.18),
    );

    resetImageGesture();

    if (gestureLock !== "horizontal" || product.images.length <= 1) {
      if (mobileSwipeState !== "idle" || Math.abs(mobileSwipeOffset) > 0) {
        settleMobileSwipe(0);
      }
      return;
    }

    if (deltaX >= swipeThreshold) {
      settleMobileSwipe(safeMobileGalleryWidth, () => {
        setActiveImageIndex((current) =>
          current === 0 ? product.images.length - 1 : current - 1,
        );
      });
      return;
    }

    if (deltaX <= -swipeThreshold) {
      settleMobileSwipe(-safeMobileGalleryWidth, () => {
        setActiveImageIndex((current) => (current + 1) % product.images.length);
      });
      return;
    }

    settleMobileSwipe(0);
  };

  const handleImageTouchCancel = () => {
    resetImageGesture();

    if (mobileSwipeState !== "idle" || Math.abs(mobileSwipeOffset) > 0) {
      settleMobileSwipe(0);
    }
  };

  const resetDesktopPointerGesture = () => {
    desktopPointerStartX.current = null;
    desktopPointerId.current = null;
  };

  const handleDesktopPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || product.images.length <= 1) {
      return;
    }

    clearDesktopSwipeTimeout();
    setDesktopSwipeOffset(0);
    setDesktopSwipeState("idle");
    desktopPointerStartX.current = event.clientX;
    desktopPointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleDesktopPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      desktopPointerStartX.current === null ||
      desktopPointerId.current !== event.pointerId ||
      product.images.length <= 1
    ) {
      return;
    }

    const deltaX = event.clientX - desktopPointerStartX.current;

    setDesktopSwipeState("dragging");
    setDesktopSwipeOffset(
      Math.max(
        -safeDesktopStageWidth * 0.92,
        Math.min(safeDesktopStageWidth * 0.92, deltaX),
      ),
    );
    event.preventDefault();
  };

  const finishDesktopPointerSwipe = (
    currentX: number,
    currentTarget: HTMLDivElement,
    pointerId: number,
  ) => {
    if (
      desktopPointerStartX.current === null ||
      desktopPointerId.current !== pointerId ||
      product.images.length <= 1
    ) {
      return;
    }

    const deltaX = currentX - desktopPointerStartX.current;
    const swipeThreshold = Math.min(
      120,
      Math.max(56, safeDesktopStageWidth * 0.16),
    );

    if (currentTarget.hasPointerCapture(pointerId)) {
      currentTarget.releasePointerCapture(pointerId);
    }

    resetDesktopPointerGesture();

    if (deltaX >= swipeThreshold) {
      settleDesktopSwipe(safeDesktopStageWidth, () => {
        const nextIndex = getWrappedImageIndex(product.images.length, safeActiveImageIndex - 1);

        setImageTransitionDirection("backward");
        setDesktopThumbStartIndex((current) =>
          getDesktopThumbStartForImage(current, nextIndex, product.images.length),
        );
        setActiveImageIndex(nextIndex);
      });
      return;
    }

    if (deltaX <= -swipeThreshold) {
      settleDesktopSwipe(-safeDesktopStageWidth, () => {
        const nextIndex = getWrappedImageIndex(product.images.length, safeActiveImageIndex + 1);

        setImageTransitionDirection("forward");
        setDesktopThumbStartIndex((current) =>
          getDesktopThumbStartForImage(current, nextIndex, product.images.length),
        );
        setActiveImageIndex(nextIndex);
      });
      return;
    }

    settleDesktopSwipe(0);
  };

  const handleDesktopPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    finishDesktopPointerSwipe(event.clientX, event.currentTarget, event.pointerId);
  };

  const handleDesktopPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    if (
      desktopPointerId.current !== event.pointerId ||
      desktopPointerStartX.current === null
    ) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetDesktopPointerGesture();
    settleDesktopSwipe(0);
  };

  useEffect(() => {
    const gallery = mobileGalleryRef.current;

    if (!gallery || product.images.length <= 1) {
      return;
    }

    const handleNativeTouchMove = (event: globalThis.TouchEvent) => {
      if (imageTouchStartX.current === null || imageTouchStartY.current === null) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - imageTouchStartX.current;
      const deltaY = touch.clientY - imageTouchStartY.current;

      if (imageGestureLock.current === null) {
        imageGestureLock.current = resolveImageGestureLock(deltaX, deltaY);
      }

      if (imageGestureLock.current === "horizontal") {
        event.preventDefault();
        setMobileSwipeState("dragging");
        setMobileSwipeOffset(
          Math.max(
            -safeMobileGalleryWidth * 0.92,
            Math.min(safeMobileGalleryWidth * 0.92, deltaX),
          ),
        );
      }
    };

    gallery.addEventListener("touchmove", handleNativeTouchMove, { passive: false });

    return () => {
      gallery.removeEventListener("touchmove", handleNativeTouchMove);
    };
  }, [product.images.length, safeMobileGalleryWidth]);

  useEffect(() => {
    const gallery = mobileGalleryRef.current;

    if (!gallery) {
      return;
    }

    const syncWidth = () => {
      setMobileGalleryWidth(gallery.clientWidth || MOBILE_GALLERY_FALLBACK_WIDTH);
    };

    syncWidth();
    window.addEventListener("resize", syncWidth);

    return () => {
      window.removeEventListener("resize", syncWidth);
    };
  }, [product.id]);

  useEffect(() => {
    const stage = desktopStageRef.current;

    if (!stage) {
      return;
    }

    const syncWidth = () => {
      setDesktopStageWidth(stage.clientWidth || MOBILE_GALLERY_FALLBACK_WIDTH);
    };

    syncWidth();
    window.addEventListener("resize", syncWidth);

    return () => {
      window.removeEventListener("resize", syncWidth);
    };
  }, [product.id]);

  useEffect(() => {
    return () => {
      clearMobileSwipeTimeout();
      clearDesktopSwipeTimeout();
    };
  }, []);

  useEffect(() => {
    const cta = mobilePrimaryCtaRef.current;

    if (!cta) {
      return;
    }

    let frame = 0;

    const evaluateStickyVisibility = () => {
      frame = 0;

      if (window.innerWidth >= 768) {
        setIsMobileStickyVisible(false);
        return;
      }

      const ctaRect = cta.getBoundingClientRect();
      setIsMobileStickyVisible(ctaRect.bottom < 0);
    };

    const handleViewportChange = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(evaluateStickyVisibility);
    };

    evaluateStickyVisibility();
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [product.id, selectedVariant.id]);

  const safeActiveImageIndex = getWrappedImageIndex(product.images.length, activeImageIndex);
  const safeDesktopThumbStartIndex = clampDesktopThumbStart(
    desktopThumbStartIndex,
    product.images.length,
  );
  const mobilePreviousImageIndex = getWrappedImageIndex(
    product.images.length,
    safeActiveImageIndex - 1,
  );
  const mobileNextImageIndex = getWrappedImageIndex(
    product.images.length,
    safeActiveImageIndex + 1,
  );
  const mobileSwipePreviewActive =
    product.images.length > 1 &&
    (mobileSwipeState !== "idle" || Math.abs(mobileSwipeOffset) > 0);
  const mobileSwipeTransition =
    mobileSwipeState === "settling"
      ? `transform ${MOBILE_SWIPE_SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${MOBILE_SWIPE_SETTLE_MS}ms ease-out`
      : "none";
  const mobileSwipeOpacityProgress = Math.min(
    Math.abs(mobileSwipeOffset) / safeMobileGalleryWidth,
    1,
  );
  const mobileActiveDotIndex =
    mobileSwipeState === "settling" &&
    Math.abs(mobileSwipeOffset) > safeMobileGalleryWidth * 0.5
      ? mobileSwipeOffset > 0
        ? mobilePreviousImageIndex
        : mobileNextImageIndex
      : safeActiveImageIndex;
  const desktopThumbsOverflow = product.images.length > DESKTOP_THUMB_WINDOW_SIZE;
  const desktopPreviousImageIndex = getWrappedImageIndex(
    product.images.length,
    safeActiveImageIndex - 1,
  );
  const desktopNextImageIndex = getWrappedImageIndex(
    product.images.length,
    safeActiveImageIndex + 1,
  );
  const desktopSwipePreviewActive =
    product.images.length > 1 &&
    (desktopSwipeState !== "idle" || Math.abs(desktopSwipeOffset) > 0);
  const desktopSwipeTransition =
    desktopSwipeState === "settling"
      ? `transform ${MOBILE_SWIPE_SETTLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${MOBILE_SWIPE_SETTLE_MS}ms ease-out`
      : "none";
  const desktopSwipeOpacityProgress = Math.min(
    Math.abs(desktopSwipeOffset) / safeDesktopStageWidth,
    1,
  );
  const visibleDesktopImages = product.images.slice(
    safeDesktopThumbStartIndex,
    safeDesktopThumbStartIndex + DESKTOP_THUMB_WINDOW_SIZE,
  );

  return (
    <section className="product-detail-page bg-browin-gray pt-0 pb-3 md:pb-16 md:pt-0">
      <div className="w-full px-0 md:container md:mx-auto md:px-4">
        <div className="product-detail-shell border-y border-browin-dark/10 bg-browin-white px-4 py-4 shadow-sm md:border md:px-6 md:py-6 xl:px-8 xl:py-7">
          <Link
            className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/55 transition-colors hover:text-browin-red md:hidden"
            href={categoryHref}
          >
            <ArrowLeft size={14} />
            {category?.label ?? "Wroc do kategorii"}
          </Link>

          <div className="grid gap-5 lg:hidden">
            <div className="relative flex w-full justify-center">
              <div
                ref={mobileGalleryRef}
                className="product-detail-mobile-gallery relative w-full overflow-hidden bg-browin-white"
                onTouchCancel={handleImageTouchCancel}
                onTouchEnd={handleImageTouchEnd}
                onTouchStart={handleImageTouchStart}
                style={{ touchAction: "pan-y pinch-zoom" }}
              >
                {mobileSwipePreviewActive ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        opacity:
                          mobileSwipeOffset > 0
                            ? 0.72 + mobileSwipeOpacityProgress * 0.28
                            : 0.42,
                        transform: `translate3d(${mobileSwipeOffset - safeMobileGalleryWidth}px, 0, 0)`,
                        transition: mobileSwipeTransition,
                        willChange: "transform, opacity",
                      }}
                    >
                      <Image
                        alt={`${product.title} ${mobilePreviousImageIndex + 1}`}
                        className="object-contain"
                        fill
                        priority
                        sizes="(max-width: 767px) 220px, 100vw"
                        src={product.images[mobilePreviousImageIndex]}
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        opacity: Math.max(0.76, 1 - mobileSwipeOpacityProgress * 0.24),
                        transform: `translate3d(${mobileSwipeOffset}px, 0, 0)`,
                        transition: mobileSwipeTransition,
                        willChange: "transform, opacity",
                      }}
                    >
                      <Image
                        alt={product.title}
                        className="object-contain"
                        fill
                        priority
                        sizes="(max-width: 767px) 220px, 100vw"
                        src={product.images[safeActiveImageIndex]}
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        opacity:
                          mobileSwipeOffset < 0
                            ? 0.72 + mobileSwipeOpacityProgress * 0.28
                            : 0.42,
                        transform: `translate3d(${mobileSwipeOffset + safeMobileGalleryWidth}px, 0, 0)`,
                        transition: mobileSwipeTransition,
                        willChange: "transform, opacity",
                      }}
                    >
                      <Image
                        alt={`${product.title} ${mobileNextImageIndex + 1}`}
                        className="object-contain"
                        fill
                        priority
                        sizes="(max-width: 767px) 220px, 100vw"
                        src={product.images[mobileNextImageIndex]}
                      />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0">
                    <Image
                      alt={product.title}
                      className="object-contain"
                      fill
                      priority
                      sizes="(max-width: 767px) 220px, 100vw"
                      src={product.images[safeActiveImageIndex]}
                    />
                  </div>
                )}
              </div>
              {product.badge ? (
                <span className="absolute left-0 top-3 bg-browin-dark px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-browin-white">
                  {product.badge}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="absolute right-0 top-3 bg-browin-red px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-browin-white">
                  -{discount}%
                </span>
              ) : null}
            </div>

            {product.images.length > 1 ? (
              <div className="flex items-center justify-center gap-2">
                {product.images.map((image, index) => {
                  const isActive = mobileActiveDotIndex === index;

                  return (
                    <button
                      aria-label={`Pokaz zdjecie ${index + 1}`}
                      aria-pressed={isActive}
                      className={`h-2.5 border transition-[width,background-color,border-color] duration-300 ease-out ${
                        isActive
                          ? "w-7 border-browin-red bg-browin-red"
                          : "w-2.5 border-browin-dark/15 bg-browin-white hover:border-browin-dark/35 hover:bg-browin-dark/18"
                      }`}
                      key={`${image}-${index}`}
                      onClick={() => selectImage(index)}
                      type="button"
                    />
                  );
                })}
              </div>
            ) : null}

            <div className="min-w-0">
              <h1 className="text-[1.375rem] font-bold tracking-tight text-browin-dark">
                {product.title}
              </h1>
            </div>

            <div className="space-y-5">
              <VariantSelector
                onSelect={setSelectedVariantId}
                product={product}
                selectedVariantId={selectedVariantId}
              />

              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                <div>
                  {selectedVariant.compareAtPrice ? (
                    <p className="text-sm font-semibold text-browin-dark/35 line-through">
                      {formatCurrency(selectedVariant.compareAtPrice)}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-end gap-2">
                    <p className="text-[2rem] font-bold tracking-tight text-browin-dark">
                      {formatCurrency(selectedVariant.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                    Dostepnosc
                  </p>
                  <p className="mt-1 text-xs font-semibold text-browin-red pb-1">
                    {stockLabel}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <QuantitySelector
                  className="w-full"
                  onDecrease={() => applyQuantity(quantity - 1)}
                  onIncrease={() => applyQuantity(quantity + 1)}
                  onQuantityInputBlur={handleQuantityInputBlur}
                  onQuantityInputChange={handleQuantityInputChange}
                  quantity={quantity}
                  quantityInput={quantityInput}
                />

                <button
                  className="checkout-cta inline-flex h-12 w-full items-center justify-center gap-2 bg-browin-red px-6 text-sm font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
                  onClick={handleAddToCart}
                  ref={mobilePrimaryCtaRef}
                  type="button"
                >
                  <ShoppingCart size={20} />
                  Dodaj do koszyka
                </button>
              </div>

              <div className="rounded-sm border border-browin-dark/10 bg-browin-gray/70 px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mt-1 font-semibold text-browin-dark">
                      Dostawa do {deliveryDateLabel}
                    </p>
                    <p className="mt-1 text-browin-dark/62">
                      Od 9,99 zł • 14 dni na zwrot
                    </p>
                  </div>
                </div>

                {qualifiesForFreeShipping ? (
                  <p className="mt-2 text-xs font-semibold text-browin-red">
                    Darmowa dostawa aktywna.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-browin-dark/62">
                    Brakuje {formatCurrency(amountToFreeShipping)} do darmowej dostawy.
                  </p>
                )}

                <div className="mt-3 h-1.5 w-full overflow-hidden bg-browin-dark/10">
                  <div
                    className="h-full bg-browin-red transition-[width] duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              <ProductCodes ean={product.ean} symbol={product.symbol} />

              <button
                className="flex w-full items-center justify-between gap-3 border border-browin-dark/10 bg-browin-white px-3 py-2.5 text-left transition-colors hover:border-browin-red"
                onClick={scrollToReviews}
                type="button"
              >
                <div className="flex items-center gap-2 text-browin-red">
                  <Star size={15} weight="fill" />
                  <span className="text-base font-semibold text-browin-dark">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-browin-dark">{product.reviews} opinii</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-browin-dark/45">
                    Zobacz recenzje
                  </p>
                </div>
              </button>
            </div>

            <MobileSection title="O produkcie">
              <ProductDescription product={product} />
            </MobileSection>

            <MobileSection title="Specyfikacja">
              <ProductSpecsList product={product} />
            </MobileSection>

            {product.bundleItems.length > 0 ? (
              <MobileSection title="Skład zestawu">
                <BundleItemsList items={product.bundleItems} />
              </MobileSection>
            ) : null}

            {product.files.length > 0 ? (
              <MobileSection title="Pliki do pobrania">
                <div className="grid gap-3">
                  {product.files.map((file) => (
                    <ProductFileTile file={file} key={`mobile-${file.type}-${file.href}`} />
                  ))}
                </div>
              </MobileSection>
            ) : null}

            <MobileSection title="Opinie">
              <ReviewsSection product={product} sectionId="product-reviews-mobile" />
            </MobileSection>

            <ProductQuestionsPrompt />
          </div>

          <div className="product-detail-grid product-detail-fold hidden items-start gap-8 lg:grid lg:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.98fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:gap-10">
            <div className="product-detail-media-stack group grid self-stretch gap-4">
              <div className="product-detail-media-layout">
                <div className="product-detail-media-preview relative flex w-full justify-center">
                  <div className="product-detail-media-frame relative overflow-hidden bg-browin-white">
                    <div
                      className="product-detail-media-stage relative"
                      onDragStart={(event) => event.preventDefault()}
                      onPointerCancel={handleDesktopPointerCancel}
                      onPointerDown={handleDesktopPointerDown}
                      onPointerMove={handleDesktopPointerMove}
                      onPointerUp={handleDesktopPointerUp}
                      ref={desktopStageRef}
                    >
                      {desktopSwipePreviewActive ? (
                        <>
                          <div
                            className="absolute inset-0"
                            style={{
                              opacity:
                                desktopSwipeOffset > 0
                                  ? 0.72 + desktopSwipeOpacityProgress * 0.28
                                  : 0.42,
                              transform: `translate3d(${desktopSwipeOffset - safeDesktopStageWidth}px, 0, 0)`,
                              transition: desktopSwipeTransition,
                              willChange: "transform, opacity",
                            }}
                          >
                            <Image
                              alt={`${product.title} ${desktopPreviousImageIndex + 1}`}
                              className="product-detail-main-image object-contain"
                              fill
                              priority
                              sizes="(max-width: 1279px) 48vw, 42vw"
                              src={product.images[desktopPreviousImageIndex]}
                            />
                          </div>
                          <div
                            className="absolute inset-0"
                            style={{
                              opacity: Math.max(0.76, 1 - desktopSwipeOpacityProgress * 0.24),
                              transform: `translate3d(${desktopSwipeOffset}px, 0, 0)`,
                              transition: desktopSwipeTransition,
                              willChange: "transform, opacity",
                            }}
                          >
                            <Image
                              alt={product.title}
                              className="product-detail-main-image object-contain"
                              fill
                              priority
                              sizes="(max-width: 1279px) 48vw, 42vw"
                              src={product.images[safeActiveImageIndex]}
                            />
                          </div>
                          <div
                            className="absolute inset-0"
                            style={{
                              opacity:
                                desktopSwipeOffset < 0
                                  ? 0.72 + desktopSwipeOpacityProgress * 0.28
                                  : 0.42,
                              transform: `translate3d(${desktopSwipeOffset + safeDesktopStageWidth}px, 0, 0)`,
                              transition: desktopSwipeTransition,
                              willChange: "transform, opacity",
                            }}
                          >
                            <Image
                              alt={`${product.title} ${desktopNextImageIndex + 1}`}
                              className="product-detail-main-image object-contain"
                              fill
                              priority
                              sizes="(max-width: 1279px) 48vw, 42vw"
                              src={product.images[desktopNextImageIndex]}
                            />
                          </div>
                        </>
                      ) : (
                        <div
                          className={`product-image-transition absolute inset-0 ${
                            imageTransitionDirection === "forward"
                              ? "product-image-transition-forward"
                              : "product-image-transition-backward"
                          }`}
                          key={`desktop-${imageTransitionDirection}-${product.images[safeActiveImageIndex]}`}
                        >
                          <Image
                            alt={product.title}
                            className="product-detail-main-image object-contain"
                            fill
                            priority
                            sizes="(max-width: 1279px) 48vw, 42vw"
                            src={product.images[safeActiveImageIndex]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {product.badge ? (
                    <span className="absolute left-0 top-4 bg-browin-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-browin-white">
                      {product.badge}
                    </span>
                  ) : null}
                  {discount > 0 ? (
                    <span className="absolute right-0 top-4 bg-browin-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-browin-white">
                      -{discount}%
                    </span>
                  ) : null}
                  {product.images.length > 1 ? (
                    <div className="product-detail-media-nav flex items-center justify-center gap-3">
                      <button
                        aria-label="Poprzednie zdjecie"
                        className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark/68 transition-colors hover:border-browin-red hover:text-browin-red focus-visible:border-browin-red focus-visible:text-browin-red"
                        onClick={showPreviousImage}
                        type="button"
                      >
                        <ArrowLeft size={14} />
                      </button>

                      <div className="min-w-[4.5rem] text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-browin-dark/55">
                        <span>{safeActiveImageIndex + 1}</span>
                        <span className="px-1.5 text-browin-dark/32">/</span>
                        <span>{product.images.length}</span>
                      </div>

                      <button
                        aria-label="Nastepne zdjecie"
                        className="flex h-9 w-9 shrink-0 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark/68 transition-colors hover:border-browin-red hover:text-browin-red focus-visible:border-browin-red focus-visible:text-browin-red"
                        onClick={showNextImage}
                        type="button"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="product-detail-media-thumbs flex flex-col items-stretch justify-start">
                  {desktopThumbsOverflow ? (
                    <button
                      aria-label="Pokaz wcześniejsze miniatury"
                      className="product-detail-thumb-nav flex h-8 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark/48 transition-colors hover:border-browin-red hover:text-browin-red disabled:cursor-default disabled:border-browin-dark/10 disabled:text-browin-dark/25"
                      disabled={safeActiveImageIndex === 0}
                      onClick={showPreviousThumbSet}
                      type="button"
                    >
                      <CaretUp size={16} />
                    </button>
                  ) : null}

                  <div className="grid gap-[inherit]">
                    {visibleDesktopImages.map((image, visibleIndex) => {
                      const index = safeDesktopThumbStartIndex + visibleIndex;

                      return (
                        <button
                          aria-label={`Pokaz zdjecie ${index + 1}`}
                          aria-pressed={safeActiveImageIndex === index}
                          className={`product-detail-media-thumb relative aspect-square shrink-0 overflow-hidden border bg-browin-white transition-colors ${
                            safeActiveImageIndex === index
                              ? "border-browin-red"
                              : "border-browin-dark/10"
                          }`}
                          key={`${image}-${index}`}
                          onFocus={() => selectImage(index)}
                          onMouseEnter={() => selectImage(index)}
                          type="button"
                        >
                          <Image
                            alt={`${product.title} ${index + 1}`}
                            className="object-contain"
                            fill
                            sizes="96px"
                            src={image}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {desktopThumbsOverflow ? (
                    <button
                      aria-label="Pokaz kolejne miniatury"
                      className="product-detail-thumb-nav flex h-8 items-center justify-center border border-browin-dark/10 bg-browin-white text-browin-dark/48 transition-colors hover:border-browin-red hover:text-browin-red disabled:cursor-default disabled:border-browin-dark/10 disabled:text-browin-dark/25"
                      disabled={safeActiveImageIndex >= product.images.length - 1}
                      onClick={showNextThumbSet}
                      type="button"
                    >
                      <CaretDown size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="self-stretch">
              <div className="product-detail-buybox overflow-hidden border border-browin-dark/10 bg-browin-white">
                <div className="product-detail-buybox-meta border-b border-browin-dark/10 bg-browin-gray/40 px-5 py-3 xl:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      className="product-accent-badge bg-browin-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-white"
                      href={categoryHref}
                    >
                      {category?.label ?? "Kategoria"}
                    </Link>
                    <span className="bg-browin-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/72">
                      {product.line}
                    </span>
                    <ProductStatusBadge product={product} />
                  </div>
                </div>

                <div className="product-detail-buybox-overview px-5 py-5 xl:px-6 xl:py-6">
                  <h1 className="product-detail-title text-[1.95rem] font-bold leading-[1.03] tracking-tight text-browin-dark xl:text-[2.2rem]">
                    {product.title}
                  </h1>

                  <div className="product-detail-overview-meta mt-4">
                    <div className="product-detail-social-signals min-w-0 flex-1">
                      <ReviewSummaryRow onReviewClick={scrollToReviews} product={product} />
                    </div>

                    <ProductCodes
                      className="product-detail-overview-codes shrink-0 justify-end"
                      compact
                      ean={product.ean}
                      symbol={product.symbol}
                    />
                  </div>
                </div>

                <div className="product-detail-buybox-offer grid gap-4 border-t border-browin-dark/10 px-5 py-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:px-6">
                  <div>
                    <div className="min-h-[1.25rem]">
                      <p
                        aria-hidden={!selectedVariant.compareAtPrice}
                        className={`text-base font-semibold leading-none ${
                          selectedVariant.compareAtPrice
                            ? "text-browin-dark/35 line-through"
                            : "invisible"
                        }`}
                      >
                        {formatCurrency(selectedVariant.compareAtPrice ?? selectedVariant.price)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <p className="product-detail-price text-[2.8rem] font-bold leading-none tracking-tight text-browin-dark">
                        {formatCurrency(selectedVariant.price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left xl:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-browin-dark/45">
                      Dostępność
                    </p>
                    <p className="mt-1 text-sm font-semibold text-browin-red">
                      {stockLabel}
                    </p>
                    <p className="mt-1 text-xs text-browin-dark/62">
                      Dostawa do {deliveryDateLabel} • 14 dni na zwrot
                    </p>
                  </div>

                  <div className="product-detail-buybox-variants xl:col-span-2">
                    <VariantSelector
                      onSelect={setSelectedVariantId}
                      product={product}
                      selectedVariantId={selectedVariantId}
                    />
                  </div>
                </div>

                <div className="product-detail-buybox-cta border-t border-browin-dark/10 px-5 py-4 xl:px-6">
                  <div className="product-detail-buybox-actions flex items-stretch gap-4">
                    <QuantitySelector
                      compact
                      className="product-detail-buybox-quantity w-[9.5rem] shrink-0"
                      onDecrease={() => applyQuantity(quantity - 1)}
                      onIncrease={() => applyQuantity(quantity + 1)}
                      onQuantityInputBlur={handleQuantityInputBlur}
                      onQuantityInputChange={handleQuantityInputChange}
                      quantity={quantity}
                      quantityInput={quantityInput}
                    />

                    <button
                      className="checkout-cta inline-flex h-12 flex-1 items-center justify-center gap-2 bg-browin-red px-6 text-base font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
                      onClick={handleAddToCart}
                      type="button"
                    >
                      <ShoppingCart size={20} />
                      Dodaj do koszyka
                    </button>
                  </div>
                </div>

                <div className="product-detail-buybox-trust bg-browin-white px-5 py-4 xl:px-6">
                  <div className="product-detail-buybox-shipping-progress border border-browin-dark/10 bg-browin-white px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                          Darmowa dostawa
                        </p>
                        <p className="mt-1 text-sm font-semibold text-browin-dark">
                          {qualifiesForFreeShipping ? (
                            "Aktywna w tym koszyku"
                          ) : (
                            <>
                              Brakuje <span className="text-browin-red">{formatCurrency(amountToFreeShipping)}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-browin-dark/45">
                        Dostawa do {deliveryDateLabel}
                      </p>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden bg-browin-dark/10">
                      <div
                        className="h-full bg-browin-red transition-[width] duration-300"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>

                  <TrustSummary
                    compact
                    orderValue={orderValue}
                    selectedVariantLeadTime={selectedVariant.leadTime}
                  />

                  <BuyboxRecommendationRail
                    fallbackToRelated={buyboxUsesRelatedFallback}
                    products={buyboxRecommendationProducts}
                  />
                </div>
              </div>
            </div>
          </div>

          <ProductRecipeBridge
            product={product}
            recipes={recipeInspirations}
          />

          <div className="mt-8 hidden border-t border-browin-dark/10 pt-7 lg:block">
            <div className="rounded-sm border border-browin-dark/10 bg-browin-white p-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-browin-dark">
                Opis produktu
              </h2>
              <div className="mt-4">
                <ProductDescription product={product} />
              </div>
            </div>
          </div>

          <div className="mt-12 hidden gap-8 lg:grid">
            <div className="border border-browin-dark/10 bg-browin-white p-6">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-browin-dark">
                Specyfikacja
              </h2>
              <div className="mt-4">
                <ProductSpecsList product={product} />
              </div>
            </div>

            {product.bundleItems.length > 0 ? (
              <div className="border border-browin-dark/10 bg-browin-white p-6">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-browin-dark">
                  Skład zestawu
                </h2>
                <div className="mt-5">
                  <BundleItemsList items={product.bundleItems} />
                </div>
              </div>
            ) : null}

            {product.files.length > 0 ? (
              <div className="border border-browin-dark/10 bg-browin-white p-6">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-browin-dark">
                  Pliki do pobrania
                </h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {product.files.map((file) => (
                    <ProductFileTile file={file} key={`${file.type}-${file.href}`} />
                  ))}
                </div>
              </div>
            ) : null}

            <ProductQuestionsPrompt />

            <div className="border border-browin-dark/10 bg-browin-white p-6">
              <ReviewsSection product={product} sectionId="product-reviews-desktop" />
            </div>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="mt-12 lg:hidden">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                    Dobierz razem
                  </p>
                  <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark md:text-3xl">
                    Powiazane produkty
                  </h2>
                </div>
              </div>
              <div className="product-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          ) : null}

          {relatedProducts.length > 0 ? (
            <div className="mt-12 hidden lg:block">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                    Dobierz razem
                  </p>
                  <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark md:text-3xl">
                    Powiazane produkty
                  </h2>
                </div>
                <Link
                  className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                  href={categoryHref}
                >
                  Zobacz cala kategorie
                </Link>
              </div>
              <div className="product-grid grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          ) : null}

          {complementaryProducts.length > 0 ? (
            <ComplementaryProductsGrid products={complementaryProducts} />
          ) : null}
        </div>
      </div>

      {isMobileStickyVisible ? (
        <div
          className="fixed inset-x-0 z-[45] border-t border-browin-dark/10 bg-browin-white pl-4 md:hidden"
          style={{ bottom: "var(--mobile-bottom-nav-height)" }}
        >
          <div className="mx-auto grid max-w-[32rem] grid-cols-[minmax(0,0.86fr)_minmax(0,1.74fr)] items-stretch">
            <div className="flex min-h-14 min-w-0 items-center pr-3">
              <p className="text-xl font-bold tracking-tight text-browin-dark">
                {formatCurrency(selectedVariant.price)}
              </p>
            </div>

            <button
              className="checkout-cta -mt-px inline-flex min-h-14 w-full items-center justify-center gap-1.5 self-stretch bg-browin-red px-3 text-[0.62rem] font-bold uppercase leading-none tracking-[0.04em] whitespace-nowrap text-browin-white transition-colors hover:bg-browin-dark"
              onClick={handleAddToCart}
              type="button"
            >
              <ShoppingCart className="shrink-0" size={16} />
              Dodaj do koszyka
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
