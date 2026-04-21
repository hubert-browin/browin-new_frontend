"use client";

import { ArrowRight, CheckCircle, LockKey } from "@phosphor-icons/react";
import Link from "next/link";

import { useCart } from "@/components/store/cart-provider";
import { formatCurrency } from "@/lib/catalog";

const checkoutSteps = [
  "Dane kontaktowe",
  "Dostawa i płatność",
  "Podsumowanie zamówienia",
];

export function CheckoutPlaceholder() {
  const { count, items, subtotal } = useCart();

  return (
    <section className="bg-browin-gray py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="checkout-grid grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          <div className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
              Checkout placeholder
            </p>
            <h1 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-browin-dark md:text-3xl">
              Finalizacja zamówienia w wersji demonstracyjnej
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-browin-dark/68 md:text-base">
              Ten ekran pokazuje gotowe miejsce pod dalsze etapy integracji z systemem
              płatności, adresowaniem i ERP. Prototyp skupia się na nawigacji, koszyku,
              PDP oraz merchandisingu sklepu.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {checkoutSteps.map((step, index) => (
                <div className="border border-browin-dark/10 bg-browin-gray px-5 py-5" key={step}>
                  <span className="inline-flex h-10 w-10 items-center justify-center bg-browin-red text-sm font-extrabold text-browin-white">
                    {index + 1}
                  </span>
                  <h2 className="mt-4 text-lg font-bold uppercase tracking-tight text-browin-dark">
                    {step}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-browin-dark/62">
                    Miejsce na formularz i walidację w docelowej implementacji.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 border border-browin-dark/10 bg-browin-gray p-6">
              <div className="flex items-center gap-3 text-browin-red">
                <LockKey size={22} />
                <h2 className="text-xl font-bold uppercase tracking-tight text-browin-dark">
                  Co dalej w realnym wdrożeniu
                </h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-browin-dark/68">
                <p>1. Podpięcie sesji klienta i adresów dostawy.</p>
                <p>2. Integracja metod płatności oraz punktów odbioru.</p>
                <p>3. Zasilenie stanów magazynowych i cen z wewnętrznych systemów BROWIN.</p>
              </div>
              <Link
                className="mt-5 inline-flex items-center gap-2 bg-browin-dark px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-red"
                href="/produkty"
              >
                Wróć do zakupów
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <aside className="checkout-sidebar h-max border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-6 lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-browin-red">
              Zamówienie
            </p>
            <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-browin-dark">
              Snapshot koszyka
            </h2>

            <div className="mt-5 space-y-3">
              {items.length ? (
                items.map(({ product, quantity, variant }) => (
                  <div className="border border-browin-dark/10 bg-browin-gray px-4 py-4" key={`${product.id}-${variant.id}`}>
                    <p className="text-sm font-bold text-browin-dark">{product.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-browin-dark/45">
                      {variant.label.trim() ? `${variant.label} • ` : ""}
                      {quantity} szt.
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-browin-dark">
                      {formatCurrency(variant.price * quantity)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border border-browin-dark/10 bg-browin-gray px-4 py-4 text-sm text-browin-dark/62">
                  Koszyk jest pusty. Dodaj produkty, aby zobaczyć pełne podsumowanie.
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between text-browin-dark/68">
                <span>Liczba pozycji</span>
                <span>{count}</span>
              </div>
              <div className="flex items-center justify-between border-t border-browin-dark/10 pt-3 text-lg font-extrabold tracking-tight text-browin-dark">
                <span>Suma</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <div className="mt-6 border border-browin-dark/10 bg-browin-gray px-4 py-4 text-sm leading-relaxed text-browin-dark/68">
              <div className="flex items-center gap-2 font-bold text-browin-dark">
                <CheckCircle className="text-browin-red" size={18} weight="fill" />
                Prototyp gotowy pod rozszerzenie
              </div>
              <p className="mt-2">
                Koszyk, listing i PDP są już zorganizowane tak, aby później podpiąć realne checkout API.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
