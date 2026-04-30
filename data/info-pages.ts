import { infoPageHtml } from "./info-page-html";

export type InfoFormType = "bug-report" | "complaint";

export type InfoTocItem = {
  id: string;
  label: string;
};

export type InfoPage = {
  slug: string;
  path: `/${string}`;
  eyebrow: string;
  title: string;
  footerLabel: string;
  lead: string;
  updatedAt: string;
  sourceUrl: string;
  contentHtml: string;
  toc: InfoTocItem[];
  heroImage?: string | null;
  form?: InfoFormType;
};

const sourceBaseUrl = "https://browin.pl";

const htmlFor = (slug: keyof typeof infoPageHtml) => infoPageHtml[slug].html;
const tocFor = (slug: keyof typeof infoPageHtml) => [...infoPageHtml[slug].toc];
const heroFor = (slug: keyof typeof infoPageHtml) => infoPageHtml[slug].heroImage;

export const infoPages: InfoPage[] = [
  {
    slug: "praca",
    path: "/praca",
    eyebrow: "Informacje",
    title: "Praca",
    footerLabel: "Praca",
    lead: "Poznaj BROWIN jako pracodawcę: rodzinny charakter firmy, kulturę pracy i wartości zespołu.",
    updatedAt: "2019-02-04",
    sourceUrl: `${sourceBaseUrl}/praca`,
    contentHtml: htmlFor("praca"),
    toc: tocFor("praca"),
    heroImage: heroFor("praca"),
  },
  {
    slug: "wspolpraca",
    path: "/wspolpraca",
    eyebrow: "Informacje",
    title: "Współpraca",
    footerLabel: "Współpraca",
    lead: "Zaproszenie do współpracy dla firm, sieci handlowych i punktów sprzedaży zainteresowanych ofertą BROWIN.",
    updatedAt: "2018-12-06",
    sourceUrl: `${sourceBaseUrl}/wspolpraca`,
    contentHtml: htmlFor("wspolpraca"),
    toc: tocFor("wspolpraca"),
    heroImage: heroFor("wspolpraca"),
  },
  {
    slug: "misja-wizja-wartosci",
    path: "/misja-wizja-wartosci",
    eyebrow: "Nasza firma",
    title: "Misja, wizja, wartości",
    footerLabel: "Misja, wizja, wartości",
    lead: "Misja, wizja i wartości, które porządkują sposób działania firmy oraz codzienną współpracę zespołu BROWIN.",
    updatedAt: "2021-01-27",
    sourceUrl: `${sourceBaseUrl}/misja-wizja-wartosci`,
    contentHtml: htmlFor("misja-wizja-wartosci"),
    toc: tocFor("misja-wizja-wartosci"),
    heroImage: heroFor("misja-wizja-wartosci"),
  },
  {
    slug: "nasz-browin",
    path: "/nasz-browin",
    eyebrow: "Nasza firma",
    title: "Nasz Browin",
    footerLabel: "Nasz Browin",
    lead: "Historia, symbolika i codzienność BROWIN: firmy tworzonej wokół domowego przetwórstwa, wiedzy i pasji.",
    updatedAt: "2019-01-03",
    sourceUrl: `${sourceBaseUrl}/nasz-browin`,
    contentHtml: htmlFor("nasz-browin"),
    toc: tocFor("nasz-browin"),
    heroImage: heroFor("nasz-browin"),
  },
  {
    slug: "certyfikaty",
    path: "/certyfikaty",
    eyebrow: "Nasza firma",
    title: "Certyfikaty",
    footerLabel: "Certyfikaty",
    lead: "Aktualne certyfikaty i dokumenty jakościowe BROWIN dostępne do wglądu i pobrania.",
    updatedAt: "2024-01-03",
    sourceUrl: `${sourceBaseUrl}/certyfikaty`,
    contentHtml: htmlFor("certyfikaty"),
    toc: tocFor("certyfikaty"),
    heroImage: heroFor("certyfikaty"),
  },
  {
    slug: "od-pomyslu-do-produktu",
    path: "/od-pomyslu-do-produktu",
    eyebrow: "Nasza firma",
    title: "Od pomysłu do produktu",
    footerLabel: "Od pomysłu do produktu",
    lead: "Jak BROWIN zamienia pomysły, potrzeby klientów i potencjał produkcyjny w gotowe produkty.",
    updatedAt: "2019-01-07",
    sourceUrl: `${sourceBaseUrl}/od-pomyslu-do-produktu`,
    contentHtml: htmlFor("od-pomyslu-do-produktu"),
    toc: tocFor("od-pomyslu-do-produktu"),
    heroImage: heroFor("od-pomyslu-do-produktu"),
  },
  {
    slug: "nasze-marki",
    path: "/nasze-marki",
    eyebrow: "Nasza firma",
    title: "Nasze marki",
    footerLabel: "Nasze Marki",
    lead: "Informacje o markach należących do BROWIN oraz zasadach korzystania z materiałów firmowych.",
    updatedAt: "2019-01-07",
    sourceUrl: `${sourceBaseUrl}/nasze-marki`,
    contentHtml: htmlFor("nasze-marki"),
    toc: tocFor("nasze-marki"),
    heroImage: heroFor("nasze-marki"),
  },
  {
    slug: "projekty-unijne",
    path: "/projekty-unijne",
    eyebrow: "Nasza firma",
    title: "Projekty unijne",
    footerLabel: "Projekty unijne",
    lead: "Informacje o projektach BROWIN realizowanych przy wsparciu funduszy Unii Europejskiej.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/projekty-unijne`,
    contentHtml: htmlFor("projekty-unijne"),
    toc: tocFor("projekty-unijne"),
    heroImage: heroFor("projekty-unijne"),
  },
  {
    slug: "zapytania-ofertowe",
    path: "/zapytania-ofertowe",
    eyebrow: "Nasza firma",
    title: "Zapytania ofertowe",
    footerLabel: "Zapytania ofertowe",
    lead: "Aktualne i archiwalne zapytania ofertowe publikowane przez BROWIN.",
    updatedAt: "2023-11-30",
    sourceUrl: `${sourceBaseUrl}/zapytania-ofertowe`,
    contentHtml: htmlFor("zapytania-ofertowe"),
    toc: tocFor("zapytania-ofertowe"),
    heroImage: heroFor("zapytania-ofertowe"),
  },
  {
    slug: "wysylka-i-dostawa",
    path: "/wysylka-i-dostawa",
    eyebrow: "Zakupy",
    title: "Wysyłka i dostawa",
    footerLabel: "Wysyłka i dostawa",
    lead: "Cenniki, formy dostawy, progi darmowej wysyłki oraz informacje o przesyłkach krajowych i zagranicznych.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/wysylka-i-dostawa`,
    contentHtml: htmlFor("wysylka-i-dostawa"),
    toc: tocFor("wysylka-i-dostawa"),
    heroImage: heroFor("wysylka-i-dostawa"),
  },
  {
    slug: "regulamin",
    path: "/regulamin",
    eyebrow: "Zakupy",
    title: "Regulamin",
    footerLabel: "Regulamin",
    lead: "Regulamin sklepu internetowego BROWIN: zasady zakupów, płatności, dostaw, odstąpienia od umowy i reklamacji.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/regulamin`,
    contentHtml: htmlFor("regulamin"),
    toc: tocFor("regulamin"),
    heroImage: heroFor("regulamin"),
  },
  {
    slug: "polityka-prywatnosci",
    path: "/polityka-prywatnosci",
    eyebrow: "Zakupy",
    title: "Polityka prywatności i plików cookies",
    footerLabel: "Polityka prywatności",
    lead: "Zasady przetwarzania danych osobowych, korzystania z plików cookies oraz prawa użytkowników serwisu.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/polityka-prywatnosci`,
    contentHtml: htmlFor("polityka-prywatnosci"),
    toc: tocFor("polityka-prywatnosci"),
    heroImage: heroFor("polityka-prywatnosci"),
  },
  {
    slug: "porady-i-faq",
    path: "/porady-i-faq",
    eyebrow: "Zakupy",
    title: "Porady i FAQ",
    footerLabel: "Porady i FAQ",
    lead: "Najczęściej zadawane pytania dotyczące winiarstwa, piwowarstwa, termometrów, higrometrów i procesu zakupowego.",
    updatedAt: "2019-03-07",
    sourceUrl: `${sourceBaseUrl}/porady-i-faq`,
    contentHtml: htmlFor("porady-i-faq"),
    toc: tocFor("porady-i-faq"),
    heroImage: heroFor("porady-i-faq"),
  },
  {
    slug: "reklamacje",
    path: "/reklamacje",
    eyebrow: "Dla klientów",
    title: "Złóż reklamację",
    footerLabel: "Zgłaszanie reklamacji",
    lead: "Formularz zgłoszenia reklamacyjnego przygotowany w nowym sklepie. Na tym etapie zapis działa lokalnie bez wysyłki do systemu BROWIN.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/reklamacje`,
    contentHtml: htmlFor("reklamacje"),
    toc: tocFor("reklamacje"),
    heroImage: heroFor("reklamacje"),
    form: "complaint",
  },
  {
    slug: "zglos-blad",
    path: "/zglos-blad",
    eyebrow: "Dla klientów",
    title: "Zgłoś błąd",
    footerLabel: "Zgłoś błąd",
    lead: "Krótki formularz zgłoszenia błędu na stronie. Po integracji będzie można podpiąć go pod docelowy kanał obsługi.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/zglos-blad`,
    contentHtml: htmlFor("zglos-blad"),
    toc: tocFor("zglos-blad"),
    heroImage: heroFor("zglos-blad"),
    form: "bug-report",
  },
  {
    slug: "odbior-zuzytego-sprzetu",
    path: "/odbior-zuzytego-sprzetu",
    eyebrow: "Dla klientów",
    title: "Informacja o zużytym sprzęcie elektrycznym i elektronicznym",
    footerLabel: "Odbiór zużytego sprzętu",
    lead: "Informacja o zasadach oddawania zużytego sprzętu elektrycznego i elektronicznego.",
    updatedAt: "2019-01-02",
    sourceUrl: `${sourceBaseUrl}/odbior-zuzytego-sprzetu`,
    contentHtml: htmlFor("odbior-zuzytego-sprzetu"),
    toc: tocFor("odbior-zuzytego-sprzetu"),
    heroImage: heroFor("odbior-zuzytego-sprzetu"),
  },
  {
    slug: "tablica-oznaczen-opakowan",
    path: "/tablica-oznaczen-opakowan",
    eyebrow: "Dla klientów",
    title: "Oznaczenia opakowań",
    footerLabel: "Oznaczenia opakowań",
    lead: "Tablica oznaczeń opakowań i link do dodatkowych informacji o opakowaniach.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/tablica-oznaczen-opakowan`,
    contentHtml: htmlFor("tablica-oznaczen-opakowan"),
    toc: tocFor("tablica-oznaczen-opakowan"),
    heroImage: heroFor("tablica-oznaczen-opakowan"),
  },
  {
    slug: "dane-firmy",
    path: "/dane-firmy",
    eyebrow: "Dla klientów",
    title: "Dane firmy",
    footerLabel: "Dane firmy",
    lead: "Dane rejestrowe, adres, kontakt oraz mapa dojazdu do siedziby i salonu sprzedaży BROWIN w Łodzi.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/dane-firmy`,
    contentHtml: htmlFor("dane-firmy"),
    toc: tocFor("dane-firmy"),
    heroImage: heroFor("dane-firmy"),
  },
  {
    slug: "gpsr",
    path: "/gpsr",
    eyebrow: "Dla klientów",
    title: "Ogólne bezpieczeństwo produktów (GPSR)",
    footerLabel: "Ogólne bezpieczeństwo produktów (GPSR)",
    lead: "Informacje dotyczące ogólnego bezpieczeństwa produktów i kontaktu w sprawach związanych z GPSR.",
    updatedAt: "2026-04-30",
    sourceUrl: `${sourceBaseUrl}/gpsr`,
    contentHtml: htmlFor("gpsr"),
    toc: tocFor("gpsr"),
    heroImage: heroFor("gpsr"),
  },
];

const normalizePath = (path: string) => {
  const withoutQuery = path.split("?")[0]?.split("#")[0] ?? "/";
  const prefixed = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;

  return prefixed.length > 1 ? prefixed.replace(/\/+$/, "") : prefixed;
};

const slugIndex = new Map(infoPages.map((page) => [page.slug, page]));
const pathIndex = new Map(infoPages.map((page) => [normalizePath(page.path), page]));

export const getInfoPage = (slug: string): InfoPage | undefined => slugIndex.get(slug);

export const getInfoPageByPath = (path: string): InfoPage | undefined =>
  pathIndex.get(normalizePath(path));

export const getTopLevelInfoSlugs = () =>
  infoPages
    .map((page) => page.path.split("/").filter(Boolean))
    .filter((segments) => segments.length === 1)
    .map(([slug]) => ({ slug: slug ?? "" }));

export const localInfoPaths = infoPages.map((page) => page.path);
