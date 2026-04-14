"use client";

import { ArrowRight, ShoppingCart, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/components/store/cart-provider";
import { formatCurrency, getFeaturedProducts } from "@/lib/catalog";

const recommendations = getFeaturedProducts(4);

export function CartPage() {
  const {
    clearCart,
    items,
    shippingProgress,
    shippingRemaining,
    subtotal,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <section className="bg-browin-gray py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="cart-page-grid grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          <div className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
                  Koszyk
                </p>
                <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-browin-dark md:text-3xl">
                  Podgląd zamówienia
                </h1>
              </div>
              {items.length ? (
                <button
                  className="self-start text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                  onClick={clearCart}
                  type="button"
                >
                  Wyczyść koszyk
                </button>
              ) : null}
            </div>

            <div className="mt-6 border border-browin-dark/10 bg-browin-gray p-5">
              {shippingRemaining > 0 ? (
                <p className="text-sm font-bold text-browin-dark">
                  Brakuje Ci{" "}
                  <span className="text-browin-red">{formatCurrency(shippingRemaining)}</span>{" "}
                  do darmowej dostawy.
                </p>
              ) : (
                <p className="text-sm font-bold text-browin-red">
                  Masz już odblokowaną darmową dostawę.
                </p>
              )}
              <div className="mt-3 h-2 overflow-hidden rounded-none bg-browin-dark/10">
                <div
                  className="h-full bg-browin-red"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {items.length ? (
              <div className="mt-6 space-y-4">
                {items.map(({ product, quantity, variant }) => (
                  <article
                    className="border border-browin-dark/10 bg-browin-white p-4"
                    key={`${product.id}-${variant.id}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row">
                      <Link
                        className="relative block h-36 overflow-hidden border border-browin-dark/10 bg-browin-white p-2 md:h-28 md:w-28"
                        href={`/produkt/${product.slug}`}
                      >
                        <Image
                          alt={product.title}
                          className="object-contain"
                          fill
                          sizes="112px"
                          src={product.images[0]}
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <Link
                              className="block text-lg font-bold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                              href={`/produkt/${product.slug}`}
                            >
                              {product.title}
                            </Link>
                            <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                              {product.subtitle}
                            </p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                              {variant.label}
                            </p>
                          </div>

                          <button
                            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-browin-dark/45 transition-colors hover:text-browin-red"
                            onClick={() => removeItem(product.id, variant.id)}
                            type="button"
                          >
                            <Trash size={16} />
                            Usuń
                          </button>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div className="flex items-center border border-browin-dark/10 bg-browin-gray">
                            <button
                              className="flex h-9 w-9 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white"
                              onClick={() => updateQuantity(product.id, variant.id, quantity - 1)}
                              type="button"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-base font-bold text-browin-dark">
                              {quantity}
                            </span>
                            <button
                              className="flex h-9 w-9 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white"
                              onClick={() => updateQuantity(product.id, variant.id, quantity + 1)}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-2xl font-extrabold tracking-tight text-browin-dark">
                            {formatCurrency(variant.price * quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 border border-dashed border-browin-dark/15 bg-browin-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-browin-dark/5 text-browin-red">
                  <ShoppingCart size={26} />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-browin-dark">
                  Koszyk czeka na pierwsze produkty
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-browin-dark/65">
                  Przejdź do katalogu, dodaj kilka produktów i wróć tutaj, aby zobaczyć
                  pełny checkout flow.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 bg-browin-red px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark"
                  href="/produkty"
                >
                  Otwórz katalog
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>

          <aside className="cart-page-sidebar h-max border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-6 lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
              Podsumowanie
            </p>
            <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-browin-dark">
              Finalizacja zamówienia
            </h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between text-browin-dark/68">
                <span>Produkty</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-browin-dark/68">
                <span>Dostawa</span>
                <span>{subtotal >= 149 ? "0,00 zł" : "od 14,90 zł"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-browin-dark/10 pt-3 text-lg font-extrabold tracking-tight text-browin-dark">
                <span>Suma</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <Link
              className="checkout-cta mt-6 inline-flex w-full items-center justify-center gap-2 bg-browin-red py-4 text-sm font-extrabold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
              href="/checkout"
            >
              Przejdź do checkoutu
              <ArrowRight size={18} />
            </Link>

            <div className="mt-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h3 className="text-xl font-bold tracking-tight text-browin-dark">
                  Dobierz jeszcze
                </h3>
                <Link
                  className="text-sm font-semibold text-browin-red transition-colors hover:text-browin-dark"
                  href="/produkty"
                >
                  Więcej
                </Link>
              </div>
              <div className="space-y-4">
                {recommendations.slice(0, 2).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
