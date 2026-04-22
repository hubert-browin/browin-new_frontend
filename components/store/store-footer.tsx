import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { categories, supportInfo, type FooterColumn } from "@/data/store";
import { infoPages } from "@/data/info-pages";

const footerColumns: FooterColumn[] = [
  {
    title: "Kupuj",
    links: [
      { label: "Wszystkie produkty", href: "/produkty" },
      { label: "Promocje", href: "/produkty?deal=true" },
      { label: "Bestsellery", href: "/produkty?sort=popular" },
      { label: "Koszyk", href: "/koszyk" },
    ],
  },
  {
    title: "Kategorie",
    links: categories.slice(0, 4).map((category) => ({
      label: category.label,
      href: `/kategoria/${category.slug}`,
    })),
  },
  {
    title: "Obsługa",
    links: [
      { label: "Dostawa i płatności", href: "/checkout" },
      { label: "Status zamówienia", href: "/checkout" },
      { label: "Zwroty i reklamacje", href: "/checkout" },
      { label: "Kontakt handlowy", href: "/checkout" },
    ],
  },
  {
    title: "Informacje",
    links: infoPages.map((page) => ({
      label: page.footerLabel,
      href: `/info/${page.slug}`,
    })),
  },
];

const currentYear = new Date().getFullYear();

export function StoreFooter() {
  return (
    <footer className="store-footer mt-16 border-t border-browin-dark/10 bg-browin-dark text-browin-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_repeat(4,1fr)]">
          <div>
            <Image
              alt="BROWIN"
              className="h-[2.1rem] w-auto max-w-[140px] brightness-0 invert"
              height={36}
              src="/assets/logo_BROWIN.svg"
              width={140}
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-browin-white/65">
              Producent akcesoriów do domowego winiarstwa, gorzelnictwa, wędliniarstwa i serowarstwa — od 1973 roku.
            </p>
            <dl className="mt-6 space-y-3 text-sm text-browin-white/80">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 shrink-0 text-browin-red" size={16} weight="fill" />
                <div>
                  <dt className="sr-only">Telefon</dt>
                  <dd>
                    <a className="transition-colors hover:text-browin-white" href={`tel:${supportInfo.phone.replace(/\s+/g, "")}`}>
                      {supportInfo.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EnvelopeSimple className="mt-0.5 shrink-0 text-browin-red" size={16} weight="fill" />
                <div>
                  <dt className="sr-only">E-mail</dt>
                  <dd>
                    <a className="transition-colors hover:text-browin-white" href={`mailto:${supportInfo.email}`}>
                      {supportInfo.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-browin-red" size={16} weight="fill" />
                <div>
                  <dt className="sr-only">Godziny pracy biura</dt>
                  <dd>{supportInfo.hours}</dd>
                </div>
              </div>
            </dl>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-browin-white">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-browin-white/65">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      className="inline-block transition-colors hover:text-browin-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-browin-white/10 pb-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] md:pb-0">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-browin-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} BROWIN Sp. z o.o. — Wszystkie prawa zastrzeżone.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {infoPages.map((page) => (
              <li key={`legal-${page.slug}`}>
                <Link
                  className="transition-colors hover:text-browin-white"
                  href={`/info/${page.slug}`}
                >
                  {page.footerLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
