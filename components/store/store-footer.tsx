import {
  Buildings,
  CaretDown,
  Clock,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  IdentificationBadge,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  PinterestLogo,
  Storefront,
  TwitterLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type FooterContactCard = {
  title: string;
  icon: Icon;
  body: ReactNode;
  actions?: FooterLink[];
};

type FooterSocialLink = FooterLink & {
  icon: Icon;
};

type FooterMarketLink = FooterLink & {
  code: string;
  active?: boolean;
};

const mapUrl = "https://goo.gl/maps/HpofxDH6iJveHaaa8";

const footerColumns: FooterColumn[] = [
  {
    title: "Informacje",
    links: [
      { label: "Nowości", href: "https://browin.pl/sklep/nowosci" },
      { label: "Koniec serii", href: "https://browin.pl/sklep/wyprzedaze" },
      { label: "Usługa wędzenia", href: "https://browin.pl/blog/wedzenie-na-godziny" },
      { label: "Praca", href: "https://browin.pl/praca" },
      { label: "Współpraca", href: "https://browin.pl/wspolpraca" },
      { label: "Zostań naszym partnerem", href: "https://browin.pl/blog/zostan-naszym-partnerem" },
      {
        label: "Katalog produktów Browin (pdf)",
        href: "https://browin.pl/static/download/katalog_browin.pdf",
      },
    ],
  },
  {
    title: "Nasza firma",
    links: [
      { label: "Misja, wizja, wartości", href: "https://browin.pl/misja-wizja-wartosci" },
      { label: "Nasz Browin", href: "https://browin.pl/nasz-browin" },
      { label: "Certyfikaty", href: "https://browin.pl/certyfikaty" },
      { label: "Od pomysłu do produktu", href: "https://browin.pl/od-pomyslu-do-produktu" },
      { label: "Nasze Marki", href: "https://browin.pl/nasze-marki" },
      { label: "Usługi parku maszyn", href: "https://browin.pl/blog/uslugi-parku-maszyn" },
      { label: "Projekty unijne", href: "https://browin.pl/projekty-unijne" },
      { label: "Zapytania ofertowe", href: "https://browin.pl/zapytania-ofertowe" },
    ],
  },
  {
    title: "Zakupy",
    links: [
      { label: "Płatności", href: "https://browin.pl/blog/bezpieczne-formy-platnosci" },
      {
        label: "Płatności odroczone Twisto",
        href: "https://browin.pl/blog/poznajmy-sie-jestem-twisto",
      },
      { label: "Wysyłka i dostawa", href: "https://browin.pl/wysylka-i-dostawa" },
      { label: "Regulamin", href: "https://browin.pl/regulamin" },
      { label: "Reklamacje i zwroty", href: "https://browin.pl/regulamin#reklamacje" },
      { label: "Polityka prywatności", href: "https://browin.pl/polityka-prywatnosci" },
      { label: "Porady i FAQ", href: "https://browin.pl/porady-i-faq" },
    ],
  },
  {
    title: "Dla klientów",
    links: [
      { label: "Zgłaszanie reklamacji", href: "https://browin.pl/reklamacje" },
      { label: "Zgłoś błąd", href: "https://browin.pl/zglos-blad" },
      { label: "Odbiór zużytego sprzętu", href: "https://browin.pl/odbior-zuzytego-sprzetu" },
      {
        label: "Oznaczenia opakowań",
        href: "https://browin.pl/tablica-oznaczen-opakowan",
      },
      { label: "Dane firmy", href: "https://browin.pl/dane-firmy" },
      { label: "Ogólne bezpieczeństwo produktów (GPSR)", href: "https://browin.pl/gpsr" },
      { label: "Mapa dojazdu", href: "https://browin.pl/dane-firmy#plan" },
      { label: "Kalkulator winiarski", href: "/kalkulator-winiarski" },
      { label: "Kalkulator nalewek", href: "/kalkulator-nalewkowy" },
      { label: "Kalkulator serowarski", href: "/kalkulator-serowarski" },
      { label: "Kalkulator wędliniarski", href: "/kalkulator-wedliniarski" },
    ],
  },
];

const contactCards: FooterContactCard[] = [
  {
    title: "Siedziba i recepcja",
    icon: Buildings,
    body: (
      <>
        <p>BROWIN</p>
        <p className="mt-0.5 text-browin-dark/50">BDO: 000008185</p>
        <p className="mt-2">
          ul. Pryncypalna 129/141
          <br />
          93-373 Łódź
        </p>
        <p className="mt-2">
          Recepcja:{" "}
          <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href="tel:+48422323200">
            +48 42 23 23 200
          </a>
          <br />
          <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href="mailto:browin@browin.pl">
            browin@browin.pl
          </a>
        </p>
      </>
    ),
    actions: [{ label: "Mapa dojazdu", href: mapUrl }],
  },
  {
    title: "Salon sprzedaży",
    icon: Storefront,
    body: (
      <>
        <p>
          ul. Pryncypalna 129/141
          <br />
          93-373 Łódź
        </p>
        <p className="mt-2">
          Pn-Czw 9:00-17:00
          <br />
          Pt 9:00-18:00
          <br />
          Sb 8:00-15:00
        </p>
      </>
    ),
    actions: [{ label: "Zobacz lokalizację", href: mapUrl }],
  },
  {
    title: "Biuro obsługi klienta",
    icon: Phone,
    body: (
      <>
        <p>Klient detaliczny</p>
        <p className="mt-0.5 text-browin-dark/50">Pn-Pt 8:00-16:00</p>
        <p className="mt-2">
          <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href="tel:+48422323230">
            tel.: +48 42 23 23 230
          </a>
          <br />
          <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href="tel:+48422323295">
            fax: +48 42 23 23 295
          </a>
          <br />
          <a className="font-bold text-browin-dark transition-colors hover:text-browin-red" href="mailto:support@browin.pl">
            support@browin.pl
          </a>
        </p>
      </>
    ),
  },
];

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

export function StoreFooter() {
  return (
    <footer className="store-footer mt-10 border-t border-browin-dark/10 bg-browin-white text-browin-dark">
      <div className="container mx-auto px-4 py-6 lg:py-7">
        <div className="grid gap-4 border-b border-browin-dark/10 pb-5 lg:grid-cols-[minmax(14rem,0.5fr)_minmax(0,1fr)] lg:items-center">
          <div className="max-w-xl">
            <Image
              alt="BROWIN"
              className="footer-brand-logo object-contain"
              height={36}
              src="/assets/logo_BROWIN.svg"
              width={140}
            />
            <p className="mt-2 max-w-xl text-xs font-semibold leading-relaxed text-browin-dark/58">
              Producent akcesoriów do domowego winiarstwa, gorzelnictwa, wędliniarstwa,
              serowarstwa, piwowarstwa i przetwórstwa.
            </p>
          </div>

          <div className="grid gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-browin-dark/68 sm:grid-cols-3">
            <a
              className="flex min-h-10 items-center gap-2 border border-browin-dark/10 bg-browin-gray px-3 py-2 transition-colors hover:border-browin-red hover:bg-browin-white hover:text-browin-red"
              href="tel:+48422323230"
            >
              <Phone className="text-browin-red" size={16} weight="fill" />
              BOK: 42 23 23 230
            </a>
            <a
              className="flex min-h-10 items-center gap-2 border border-browin-dark/10 bg-browin-gray px-3 py-2 transition-colors hover:border-browin-red hover:bg-browin-white hover:text-browin-red"
              href="mailto:support@browin.pl"
            >
              <EnvelopeSimple className="text-browin-red" size={16} weight="fill" />
              support@browin.pl
            </a>
            <span className="flex min-h-10 items-center gap-2 border border-browin-dark/10 bg-browin-gray px-3 py-2">
              <Clock className="text-browin-red" size={16} weight="fill" />
              Pn-Pt 8:00-16:00
            </span>
          </div>
        </div>

        <div className="grid gap-6 py-6 xl:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.9fr)]">
          <div className="grid overflow-hidden border border-browin-dark/10 bg-browin-gray sm:grid-cols-3 xl:grid-cols-1">
            {contactCards.map((card) => {
              const Icon = card.icon;

              return (
                <address
                  className="border-b border-browin-dark/10 p-3 text-xs font-semibold leading-relaxed text-browin-dark/66 not-italic last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 xl:border-r-0 xl:border-b xl:last:border-b-0"
                  key={card.title}
                >
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark">
                    <Icon className="text-browin-red" size={17} weight="fill" />
                    {card.title}
                  </div>
                  {card.body}
                  {card.actions ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {card.actions.map((action) => (
                        <FooterTextLink
                          className="inline-flex items-center gap-1.5 border border-browin-dark/12 bg-browin-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/62 transition-colors hover:border-browin-red hover:text-browin-red"
                          href={action.href}
                          key={`${card.title}-${action.href}`}
                        >
                          <MapPin size={13} weight="fill" />
                          {action.label}
                        </FooterTextLink>
                      ))}
                    </div>
                  ) : null}
                </address>
              );
            })}
          </div>

          <nav aria-label="Linki w stopce" className="grid gap-2 sm:hidden">
            {footerColumns.map((column) => (
              <details className="group border border-browin-dark/10 bg-browin-gray" key={column.title}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
                  {column.title}
                  <CaretDown
                    className="shrink-0 text-browin-dark/35 transition-transform group-open:rotate-180 group-open:text-browin-red"
                    size={14}
                    weight="bold"
                  />
                </summary>
                <ul className="space-y-2 border-t border-browin-dark/10 bg-browin-white p-3 text-xs font-semibold leading-tight text-browin-dark/58">
                  {column.links.map((link) => (
                    <li key={`mobile-${column.title}-${link.href}-${link.label}`}>
                      <FooterTextLink
                        className="inline-block transition-colors hover:text-browin-red"
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
            className="hidden gap-x-5 gap-y-5 sm:grid sm:grid-cols-2 lg:grid-cols-4"
          >
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
                  {column.title}
                </h2>
                <ul className="mt-3 space-y-1.5 text-[12px] font-semibold leading-tight text-browin-dark/58">
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

        <div className="grid gap-4 border-t border-browin-dark/10 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)] lg:items-start">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
                BROWIN w social media
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <li key={social.href}>
                      <a
                        aria-label={`BROWIN ${social.label}`}
                        className="flex h-8 w-8 items-center justify-center border border-browin-dark/10 bg-browin-gray text-browin-dark/55 transition-colors hover:border-browin-red hover:bg-browin-red hover:text-browin-white"
                        href={social.href}
                        rel="noopener"
                        target="_blank"
                      >
                        <Icon size={18} weight="fill" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="flex items-center gap-2 text-[11px] font-semibold leading-relaxed text-browin-dark/45">
              <IdentificationBadge className="shrink-0 text-browin-red" size={16} weight="fill" />
              &copy; {currentYear} BROWIN Sp. z o.o. Wszystkie prawa zastrzeżone.
            </p>
          </div>

          <details className="group border border-browin-dark/10 bg-browin-gray">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-left">
              <span className="flex min-w-0 items-center gap-2">
                <Globe className="shrink-0 text-browin-red" size={17} weight="fill" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark">
                    Wybierz język
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-browin-dark/50">
                    Polski i pozostałe rynki BROWIN
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark/40 group-open:text-browin-red">
                {marketLinks.length} wersje
              </span>
            </summary>
            <ul className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto border-t border-browin-dark/10 p-2 text-[11px] sm:grid-cols-3">
              {marketLinks.map((market) => (
                <li key={market.href}>
                  <a
                    className={`flex items-center gap-2 px-2.5 py-2 font-semibold transition-colors ${
                      market.active
                        ? "bg-browin-red text-browin-white"
                        : "text-browin-dark/58 hover:bg-browin-white hover:text-browin-red"
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

      <div className="border-t border-browin-dark/10 bg-browin-gray pb-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] md:pb-0">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-browin-dark/42 sm:flex-row sm:items-center sm:justify-between">
          <span>BROWIN - domowe wyroby, sprawdzone receptury i akcesoria</span>
          <a className="transition-colors hover:text-browin-red" href="https://browin.pl/dane-firmy">
            Dane firmy
          </a>
        </div>
      </div>
    </footer>
  );
}
