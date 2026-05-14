import {
  CaretDown,
  Clock,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  PinterestLogo,
  TwitterLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { footerColumns, type FooterLink } from "@/data/footer-links";

type FooterSocialLink = FooterLink & {
  icon: Icon;
};

type FooterMarketLink = FooterLink & {
  code: string;
  active?: boolean;
};

const mapUrl = "https://goo.gl/maps/HpofxDH6iJveHaaa8";

const socialLinks: FooterSocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/browinpl/", icon: FacebookLogo },
  { label: "Instagram", href: "https://www.instagram.com/browin.pl", icon: InstagramLogo },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC86cLAxXBiDzlzUHm8MVp_Q",
    icon: YoutubeLogo,
  },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/browin/", icon: LinkedinLogo },
  { label: "Twitter", href: "https://twitter.com/browin_pl", icon: TwitterLogo },
  { label: "Pinterest", href: "https://pl.pinterest.com/BROWINpl/", icon: PinterestLogo },
];

const marketLinks: FooterMarketLink[] = [
  { code: "BG", label: "Български", href: "https://browin.bg" },
  { code: "CZ", label: "Čeština", href: "https://browin.cz" },
  { code: "DK", label: "Dansk", href: "https://browin.dk" },
  { code: "AT", label: "Deutsch (AT)", href: "https://browin.at" },
  { code: "DE", label: "Deutsch (DE)", href: "https://browin.de" },
  { code: "EE", label: "Eesti", href: "https://browin.ee" },
  { code: "GR", label: "Ελληνικά", href: "https://browin.gr" },
  { code: "EN", label: "English", href: "https://browin.com" },
  { code: "ES", label: "Español", href: "https://browin.es" },
  { code: "FR", label: "Française", href: "https://browin.fr" },
  { code: "HR", label: "Hrvatski", href: "https://browin.hr" },
  { code: "IT", label: "Italiano", href: "https://browin.it" },
  { code: "LV", label: "Latviešu", href: "https://browin.lv" },
  { code: "LT", label: "Lietuvių", href: "https://browin.lt" },
  { code: "HU", label: "Magyar", href: "https://browin.hu" },
  { code: "NL", label: "Nederlands", href: "https://browinnederland.nl" },
  { code: "PL", label: "Polski", href: "https://browin.pl", active: true },
  { code: "PT", label: "Português", href: "https://browin.pt" },
  { code: "RO", label: "Română", href: "https://browin.ro" },
  { code: "RU", label: "Русский", href: "https://browin.ru" },
  { code: "SK", label: "Slovák", href: "https://browin.sk" },
  { code: "SI", label: "Slovenščina", href: "https://browin.si" },
  { code: "FI", label: "Suomi", href: "https://browin.fi" },
  { code: "SE", label: "Svenska", href: "https://browin.se" },
];

const currentYear = new Date().getFullYear();

function FooterTextLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function FooterContactLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href={href}>
      {children}
    </a>
  );
}

export function StoreFooter() {
  return (
    <footer className="store-footer mt-8 border-t border-browin-dark/10 bg-browin-white text-browin-dark">
      <div className="container mx-auto px-4 py-5 lg:py-6">
        <div className="grid gap-3 border-b border-browin-dark/10 pb-4 lg:grid-cols-[minmax(12rem,0.58fr)_repeat(3,minmax(0,1fr))]">
          <div className="min-w-0 p-3">
            <Image
              alt="BROWIN"
              className="footer-brand-logo object-contain"
              height={36}
              src="/assets/logo_BROWIN.svg"
              width={140}
            />
            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-browin-dark/58">
              Akcesoria do domowego winiarstwa, wędliniarstwa, serowarstwa,
              piwowarstwa i przetwórstwa.
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-browin-dark/45">
              NIP: 729 268 73 25
              <br />
              BDO: 000008185
            </p>
          </div>

          <address className="min-w-0 border border-browin-dark/10 bg-browin-gray p-3 text-[11px] font-semibold leading-relaxed text-browin-dark/66 not-italic">
            <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-browin-dark">
              <MapPin className="shrink-0 text-browin-red" size={15} weight="fill" />
              Siedziba i recepcja
            </h2>
            <p className="font-bold text-browin-dark">BROWIN</p>
            <p>
              ul. Pryncypalna 129/141
              <br />
              93-373 Łódź
            </p>
            <p className="mt-2">
              Recepcja:
              <br />
              <FooterContactLink href="tel:+48422323200">tel.: +48 42 23 23 200</FooterContactLink>
              <br />
              <FooterContactLink href="mailto:browin@browin.pl">browin@browin.pl</FooterContactLink>
            </p>
          </address>

          <address className="min-w-0 border border-browin-dark/10 bg-browin-gray p-3 text-[11px] font-semibold leading-relaxed text-browin-dark/66 not-italic">
            <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-browin-dark">
              <Clock className="shrink-0 text-browin-red" size={15} weight="fill" />
              Salon sprzedaży
            </h2>
            <p>
              ul. Pryncypalna 129/141
              <br />
              93-373 Łódź
            </p>
            <p className="mt-2">
              Otwarty w godzinach:
              <br />
              Pn-Czw 9:00-17:00
              <br />
              Pt 9:00-18:00
              <br />
              Sb 8:00-15:00
            </p>
            <a
              className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:text-browin-dark"
              href={mapUrl}
            >
              Mapa dojazdu
            </a>
          </address>

          <address className="min-w-0 border border-browin-dark/10 bg-browin-gray p-3 text-[11px] font-semibold leading-relaxed text-browin-dark/66 not-italic">
            <h2 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-browin-dark">
              <Phone className="shrink-0 text-browin-red" size={15} weight="fill" />
              BOK detaliczny
            </h2>
            <p>Pn-Pt 8:00-16:00</p>
            <p className="mt-2">
              <FooterContactLink href="tel:+48422323230">tel.: +48 42 23 23 230</FooterContactLink>
              <br />
              <FooterContactLink href="tel:+48422323295">fax: +48 42 23 23 295</FooterContactLink>
              <br />
              <FooterContactLink href="mailto:support@browin.pl">
                <span className="inline-flex items-center gap-1.5">
                  <EnvelopeSimple className="text-browin-red" size={13} weight="fill" />
                  support@browin.pl
                </span>
              </FooterContactLink>
            </p>
          </address>
        </div>

        <div className="border-b border-browin-dark/10 py-4">
          <nav aria-label="Linki w stopce" className="grid gap-1.5 sm:hidden">
            {footerColumns.map((column) => (
              <details className="group border border-browin-dark/10 bg-browin-white" key={column.title}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark transition-colors hover:text-browin-red">
                  {column.title}
                  <CaretDown
                    className="shrink-0 text-browin-dark/35 transition-transform group-open:rotate-180 group-open:text-browin-red"
                    size={13}
                    weight="bold"
                  />
                </summary>
                <ul className="grid gap-1.5 border-t border-browin-dark/10 bg-browin-gray px-3 py-2.5 text-xs font-semibold leading-tight text-browin-dark/58">
                  {column.links.map((link) => (
                    <li key={`mobile-${column.title}-${link.href}-${link.label}`}>
                      <FooterTextLink
                        className="inline-block py-0.5 transition-colors hover:text-browin-red"
                        href={link.href}
                      >
                        {link.label}
                      </FooterTextLink>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>

          <nav
            aria-label="Linki w stopce"
            className="hidden gap-x-6 gap-y-4 sm:grid sm:grid-cols-2 md:grid-cols-4"
          >
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
                  {column.title}
                </h2>
                <ul className="mt-2 grid gap-1 text-[12px] font-semibold leading-tight text-browin-dark/58">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <FooterTextLink
                        className="inline-block transition-colors hover:text-browin-red"
                        href={link.href}
                      >
                        {link.label}
                      </FooterTextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <ul className="flex flex-wrap gap-1">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <li key={social.href}>
                    <a
                      aria-label={`BROWIN ${social.label}`}
                      className="flex h-8 w-8 items-center justify-center border border-transparent text-browin-dark/55 transition-colors hover:border-browin-dark/10 hover:text-browin-red"
                      href={social.href}
                      rel="noopener"
                      target="_blank"
                    >
                      <Icon size={17} weight="fill" />
                    </a>
                  </li>
                );
              })}
            </ul>

            <p className="text-[11px] font-semibold leading-relaxed text-browin-dark/45">
              &copy; {currentYear} BROWIN Sp. z o.o. Wszystkie prawa zastrzeżone.
            </p>
          </div>

          <details className="group relative w-fit">
            <summary className="flex cursor-pointer list-none items-center gap-2 border border-browin-dark/10 bg-browin-white px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red">
              <Globe className="shrink-0 text-browin-red" size={15} weight="fill" />
              Polski
              <CaretDown
                className="shrink-0 text-browin-dark/35 transition-transform group-open:rotate-180 group-open:text-browin-red"
                size={12}
                weight="bold"
              />
            </summary>
            <ul className="absolute bottom-full left-0 z-20 mb-2 grid max-h-56 min-w-[17rem] grid-cols-2 gap-1 overflow-y-auto border border-browin-dark/10 bg-browin-white p-2 text-[11px] shadow-sm sm:grid-cols-3 md:left-auto md:right-0">
              {marketLinks.map((market) => (
                <li key={market.href}>
                  <a
                    className={`flex items-center gap-2 px-2.5 py-2 font-semibold transition-colors ${
                      market.active
                        ? "bg-browin-red text-browin-white"
                        : "text-browin-dark/58 hover:bg-browin-gray hover:text-browin-red"
                    }`}
                    href={market.href}
                    rel="noopener"
                    target="_blank"
                  >
                    <span className="w-6 shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                      {market.code}
                    </span>
                    <span className="min-w-0 truncate">{market.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </footer>
  );
}
