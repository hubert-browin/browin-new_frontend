"use client";

import { ArrowRight, ShoppingCart, Trash, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/store/cart-provider";
import { RecipeCartCrossSell } from "@/components/store/recipe-cart-cross-sell";
import type { RecipeCommerceEntry } from "@/data/recipes";
import { formatCurrency } from "@/lib/catalog";

export function CartDrawer({
  recipeCommerceEntries = [],
}: {
  recipeCommerceEntries?: RecipeCommerceEntry[];
}) {
  const {
    closeCart,
    count,
    isOpen,
    items,
    removeItem,
    shippingProgress,
    shippingRemaining,
    subtotal,
    updateQuantity,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-[var(--mobile-bottom-nav-height)] top-0 z-[70] bg-browin-dark/50 transition-opacity duration-300 md:inset-0 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        id="cart-drawer-overlay"
        onClick={closeCart}
      />

      <aside
        className={`fixed bottom-[var(--mobile-bottom-nav-height)] right-0 top-0 z-[80] flex w-full max-w-[400px] flex-col bg-browin-white shadow-none transition-transform duration-300 md:bottom-0 md:h-full md:shadow-panel ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        id="cart-drawer"
      >
        <div className="flex items-center justify-between border-b border-browin-dark/10 bg-browin-white p-5 shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-wide text-browin-dark">
            Twój koszyk ({count})
          </h2>
          <button
            className="bg-browin-dark/5 p-2 text-browin-dark transition-colors hover:text-browin-red focus:outline-none"
            onClick={closeCart}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-browin-dark/10 bg-browin-gray p-5 shrink-0">
          {shippingRemaining > 0 ? (
            <p className="mb-3 text-[13px] font-semibold text-browin-dark">
              Brakuje Ci{" "}
              <span className="text-browin-red">{formatCurrency(shippingRemaining)}</span>{" "}
              do darmowej dostawy!
            </p>
          ) : (
            <p className="mb-3 text-[13px] font-semibold text-browin-red">
              Masz już darmową dostawę.
            </p>
          )}

          <div className="h-2 w-full overflow-hidden rounded-none bg-browin-dark/10">
            <div
              className="h-full bg-browin-red transition-[width] duration-300"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto p-5 space-y-6">
          {items.length ? (
            <>
              {items.map(({ product, quantity, variant }) => (
                <article className="flex gap-4 group" key={`${product.id}-${variant.id}`}>
                  <Link
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-browin-dark/10 bg-browin-white"
                    href={`/produkt/${product.slug}`}
                    onClick={closeCart}
                  >
                    <Image
                      alt={product.title}
                      className="object-contain"
                      fill
                      sizes="80px"
                      src={product.images[0]}
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="pr-2">
                        <Link
                          className="text-[13px] font-semibold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                          href={`/produkt/${product.slug}`}
                          onClick={closeCart}
                        >
                          {product.title}
                        </Link>
                        {variant.label.trim() ? (
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-browin-dark/45">
                            {variant.label}
                          </p>
                        ) : null}
                      </div>

                      <button
                        className="text-browin-dark/30 transition-colors hover:text-browin-red"
                        onClick={() => removeItem(product.id, variant.id)}
                        type="button"
                      >
                        <Trash size={18} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div className="flex items-center border border-browin-dark/10 bg-browin-gray">
                        <button
                          className="flex h-7 w-7 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white"
                          onClick={() => updateQuantity(product.id, variant.id, quantity - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-[13px] font-bold text-browin-dark">
                          {quantity}
                        </span>
                        <button
                          className="flex h-7 w-7 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white"
                          onClick={() => updateQuantity(product.id, variant.id, quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[15px] font-bold text-browin-dark">
                        {formatCurrency(variant.price * quantity)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              <RecipeCartCrossSell entries={recipeCommerceEntries} />
            </>
          ) : (
            <div className="border border-dashed border-browin-dark/15 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center bg-browin-dark/5 text-browin-red">
                <ShoppingCart size={22} />
              </div>
              <p className="mt-4 font-semibold text-browin-dark">Koszyk jest pusty.</p>
              <p className="mt-2 text-sm text-browin-dark/65">
                Dodaj kilka produktów, żeby zobaczyć pełny przepływ zakupowy.
              </p>
              <Link
                className="mt-5 inline-flex items-center justify-center border border-browin-red px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] !text-browin-red transition-colors hover:bg-browin-red hover:!text-browin-white"
                href="/produkty"
                onClick={closeCart}
              >
                Przejdź do oferty
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-browin-dark/10 bg-browin-white p-5 shrink-0 md:bg-browin-gray">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-browin-dark/70">
              Suma
            </span>
            <span className="text-2xl font-bold tracking-tight text-browin-dark">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Link
            className="checkout-cta inline-flex w-full items-center justify-center gap-2 bg-browin-red py-4 text-sm font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark"
            href="/checkout"
            onClick={closeCart}
          >
            Przejdź do kasy
            <ArrowRight size={18} />
          </Link>
          <Link
            className="mt-3 hidden text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-browin-dark/65 transition-colors hover:text-browin-red md:block"
            href="/koszyk"
            onClick={closeCart}
          >
            Zobacz pełny koszyk
          </Link>
        </div>
      </aside>
    </>
  );
}
