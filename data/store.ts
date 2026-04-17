import type { Product } from "./products";

export type IconKey =
  | "beer"
  | "book"
  | "cheese"
  | "fire"
  | "flask"
  | "gift"
  | "grain"
  | "house"
  | "package"
  | "shield"
  | "sparkle"
  | "star"
  | "thermometer"
  | "timer"
  | "truck"
  | "users"
  | "wine";

export type CategoryId =
  | "wedliniarstwo"
  | "gorzelnictwo"
  | "winiarstwo"
  | "serowarstwo"
  | "piwowarstwo"
  | "piekarnictwo"
  | "domiogrod"
  | "termometry";

export type CategoryTopic = {
  label: string;
  query?: string;
};

export type CategoryMenuSection = {
  title: string;
  topics: CategoryTopic[];
};

export type CategoryPromo = {
  type?: "product" | "editorial";
  eyebrow?: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  image?: string;
  icon?: IconKey;
  productSlug?: string;
};

export type StoreCategory = {
  id: CategoryId;
  slug: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconKey;
  heroTitle: string;
  menuSections: CategoryMenuSection[];
  promo: CategoryPromo;
};

export type TrustBadge = {
  label: string;
  detail: string;
  icon: IconKey;
};

export type UtilityLink = {
  label: string;
  href: string;
  icon: IconKey;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type CampaignCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
  accent: "dark" | "red" | "sand";
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type InsightCard = {
  title: string;
  description: string;
  icon: IconKey;
};

export const categories: StoreCategory[] = [
  {
    id: "wedliniarstwo",
    slug: "wedliniarstwo",
    label: "Wędliniarstwo",
    shortLabel: "Wędliny",
    description:
      "Szynkowary, generatory dymu, osłonki i dodatki do domowych wyrobów premium.",
    icon: "fire",
    heroTitle: "Wędliny i szynki o jakości, którą chce się pokazywać gościom.",
    menuSections: [
      {
        title: "Sprzęt wędliniarski",
        topics: [
          { label: "Zestawy startowe", query: "zestaw startowy" },
          { label: "Szynkowary i worki", query: "szynkowar" },
          { label: "Wędzarnie i haki", query: "wędzarnia" },
          { label: "Paleniska i kociołki żeliwne", query: "kociołek" },
          { label: "Nadziewarki", query: "nadziewarka" },
          { label: "Maszynki do mielenia", query: "maszynka do mielenia" },
          { label: "Pakowanie próżniowe", query: "pakowanie próżniowe" },
          { label: "Aplikatory, zaciskarki", query: "zaciskarka" },
        ],
      },
      {
        title: "Dodatki i Akcesoria",
        topics: [
          { label: "Jelita i osłonki", query: "jelita" },
          { label: "Pekle, marynaty i zioła", query: "marynata" },
          { label: "Kultury bakterii", query: "kultury bakterii" },
          { label: "Zrębki wędzarnicze", query: "zrębki" },
          { label: "Nici, sznurki, siatki", query: "siatki" },
          { label: "Akcesoria do peklowania", query: "peklowanie" },
          { label: "Kalkulator wędliniarski", query: "kalkulator wedliniarski" },
          { label: "Literatura wędliniarstwo", query: "literatura wedliniarstwo" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      eyebrow: "Kategoria premium",
      title: "Wędzarnia dragON 65 L",
      description:
        "Sprzęt, który daje efekt wow już przy pierwszym weekendowym dymieniu.",
      cta: "Zobacz produkt",
      href: "/kategoria/wedliniarstwo?search=wędzarnia",
      image: "/assets/produkt4.webp",
    },
  },
  {
    id: "gorzelnictwo",
    slug: "gorzelnictwo",
    label: "Gorzelnictwo",
    shortLabel: "Nalewki",
    description:
      "Destylacja, nalewki i domowe maceracje w estetyce gotowej na prezent i gifting.",
    icon: "flask",
    heroTitle: "Nalewki, destylaty i zestawy, które sprzedają się prezentowo.",
    menuSections: [
      {
        title: "Sprzęt",
        topics: [
          { label: "Destylatory hawkSTILL", query: "hawkstill" },
          { label: "Destylatory i kolumny", query: "destylator" },
          { label: "Pojemniki i rurki fermentacyjne", query: "fermentacja" },
          { label: "Mierniki, wskaźniki", query: "miernik" },
          { label: "Gąsiory i damy", query: "gąsior" },
          { label: "Butelki i zakrętki", query: "butelki" },
          { label: "Beczki i karafki", query: "karafka" },
          { label: "Zaciskarki", query: "zaciskarka" },
        ],
      },
      {
        title: "Dodatki i Akcesoria",
        topics: [
          { label: "Drożdże gorzelnicze", query: "drożdże gorzelnicze" },
          { label: "Węgiel aktywny", query: "węgiel aktywny" },
          { label: "Dodatki smakowe", query: "dodatki smakowe" },
          { label: "Substancje dodatkowe", query: "substancje dodatkowe" },
          { label: "Etykiety", query: "etykiety" },
          { label: "Badania alkoholu", query: "badania alkoholu" },
          { label: "Literatura", query: "literatura" },
          { label: "Kalkulator nalewek", query: "kalkulator nalewek" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Destylatory hawkSTILL",
      description:
        "Poznaj naszą flagową linię sprzętu do czystych destylatów i domowych nalewek.",
      cta: "Sprawdź ofertę",
      href: "/kategoria/gorzelnictwo?search=hawkstill",
      icon: "flask",
    },
  },
  {
    id: "winiarstwo",
    slug: "winiarstwo",
    label: "Winiarstwo",
    shortLabel: "Wino",
    description:
      "Balony, korkowanie i akcesoria, które budują poczucie profesjonalnego procesu.",
    icon: "wine",
    heroTitle: "Domowe wino z narzędziami, które wyglądają równie dobrze jak smakują.",
    menuSections: [
      {
        title: "Sprzęt",
        topics: [
          { label: "Zestawy winiarskie", query: "zestaw winiarski" },
          { label: "Balony do wina i kosze", query: "balon" },
          { label: "Pojemniki i słoiki do fermentacji", query: "fermentacja" },
          { label: "Prasy i rozdrabniarki", query: "prasa" },
          { label: "Filtrowanie i korkowanie", query: "korkowanie" },
          { label: "Gąsiory, butelki i regały", query: "gąsior" },
          { label: "Mierniki i wskaźniki", query: "miernik" },
          { label: "Korki i kapturki", query: "korki" },
        ],
      },
      {
        title: "Składniki i akcesoria",
        topics: [
          { label: "Drożdże winiarskie i pożywki", query: "drożdże winiarskie" },
          { label: "Środki do klarowania", query: "klarowanie" },
          { label: "Środki dodatkowe", query: "środki dodatkowe" },
          { label: "Aromatyzacja wina", query: "aromatyzacja wina" },
          { label: "Rurki fermentacyjne", query: "rurki fermentacyjne" },
          { label: "Badania wina", query: "badania wina" },
          { label: "Oferta dla winnic", query: "winnic" },
          { label: "Kalkulator winiarski", query: "kalkulator winiarski" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Sezon na wino",
      description:
        "Gotowe zestawy balonów i akcesoriów, żeby zacząć własny rocznik bez zbędnego komplikowania.",
      cta: "Przeglądaj ofertę",
      href: "/kategoria/winiarstwo",
      icon: "wine",
    },
  },
  {
    id: "serowarstwo",
    slug: "serowarstwo",
    label: "Serowarstwo",
    shortLabel: "Sery",
    description:
      "Zestawy i kultury starterowe zaprojektowane pod edukację, upsell i szybki start.",
    icon: "cheese",
    heroTitle: "Domowe sery w estetyce laboratoryjnej, ale bez bariery wejścia.",
    menuSections: [
      {
        title: "Serowarstwo",
        topics: [
          { label: "Zestawy serowarskie", query: "serowarski" },
          { label: "Formy do sera i chusty", query: "forma do sera" },
          { label: "Prasy serowarskie", query: "prasa serowarska" },
          { label: "Podpuszczki", query: "podpuszczka" },
          { label: "Kultury bakterii", query: "kultury bakterii" },
          { label: "Substancje pomocnicze", query: "substancje pomocnicze" },
          { label: "Dodatkowe akcesoria", query: "akcesoria serowarskie" },
          { label: "Kalkulator serowarski", query: "kalkulator serowarski" },
        ],
      },
      {
        title: "Mleczarstwo i Inne",
        topics: [
          { label: "Wyrób jogurtu", query: "jogurt" },
          { label: "Jogurtownice", query: "jogurtownica" },
          { label: "Wyrób masła", query: "masło" },
          { label: "Przyprawy do masła", query: "przyprawy do masła" },
          { label: "Pakowanie próżniowe", query: "pakowanie próżniowe" },
          { label: "Wędzenie i grillowanie", query: "grillowanie" },
          { label: "Literatura", query: "literatura" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Zrób własny ser",
      description:
        "Wszystko, czego potrzebujesz, by zacząć przygodę z serowarstwem w domu.",
      cta: "Przeglądaj ofertę",
      href: "/kategoria/serowarstwo",
      icon: "cheese",
    },
  },
  {
    id: "piwowarstwo",
    slug: "piwowarstwo",
    label: "Piwowarstwo",
    shortLabel: "Piwo",
    description:
      "Fermentacja, kapslowanie i zestawy startowe dla klientów szukających efektu craft.",
    icon: "beer",
    heroTitle: "Brewery look & feel dla domowego warzenia, bez zbędnej złożoności.",
    menuSections: [
      {
        title: "Sprzęt",
        topics: [
          { label: "Zestawy (mikrobrowar)", query: "mikrobrowar" },
          { label: "Pojemniki fermentacyjne", query: "fermentacja" },
          { label: "Rurki fermentacyjne", query: "rurki fermentacyjne" },
          { label: "Kapslownice i kapsle", query: "kapslownica" },
          { label: "Butelki", query: "butelka" },
          { label: "Areometry", query: "areometr" },
          { label: "Akcesoria piwowarskie", query: "akcesoria piwowarskie" },
        ],
      },
      {
        title: "Składniki",
        topics: [
          { label: "Brewkity Coopers", query: "coopers" },
          { label: "Nienachmielone ekstrakty", query: "ekstrakt" },
          { label: "Chmiele", query: "chmiel" },
          { label: "Drożdże piwowarskie", query: "drożdże piwowarskie" },
          { label: "Dodatki do piwa", query: "dodatki do piwa" },
          { label: "Specjały łódzkie", query: "specjały łódzkie" },
          { label: "Badania piwa", query: "badania piwa" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Brewkity Coopers",
      description:
        "Australijska klasyka, dzięki której pierwsza domowa warka jest naprawdę prosta.",
      cta: "Sprawdź ofertę",
      href: "/kategoria/piwowarstwo?search=coopers",
      icon: "beer",
    },
  },
  {
    id: "piekarnictwo",
    slug: "piekarnictwo",
    label: "Piekarnictwo",
    shortLabel: "Wypieki",
    description:
      "Akcesoria do chleba, pizzy i fermentacji z mocnym potencjałem lifestyle'owym.",
    icon: "grain",
    heroTitle: "Wypieki, które robią klimat kuchni i dobrze wyglądają w e-commerce.",
    menuSections: [
      {
        title: "Podstawy Wypieków",
        topics: [
          { label: "Drożdże piekarskie", query: "drożdże piekarskie" },
          { label: "Zakwasy", query: "zakwas" },
          { label: "Kamienie do pizzy", query: "kamień do pizzy" },
        ],
      },
      {
        title: "Akcesoria",
        topics: [{ label: "Garnki i formy rzymskie", query: "formy rzymskie" }],
      },
    ],
    promo: {
      type: "editorial",
      title: "Formy rzymskie",
      description:
        "Idealnie chrupiące pieczywo i wypieki z naturalnej gliny, które robią klimat domowej piekarni.",
      cta: "Przeglądaj ofertę",
      href: "/kategoria/piekarnictwo?search=formy%20rzymskie",
      icon: "grain",
    },
  },
  {
    id: "domiogrod",
    slug: "domiogrod",
    label: "Dom i ogród",
    shortLabel: "Dom i ogród",
    description:
      "Przetwory, kuchnia i sezonowe akcje sprzedażowe z dużym udziałem pakietów.",
    icon: "house",
    heroTitle: "Kategorie sezonowe, które budują częstotliwość zakupów przez cały rok.",
    menuSections: [
      {
        title: "Przetwórstwo i Kuchnia",
        topics: [
          { label: "Słoiki i zakrętki", query: "słoiki" },
          { label: "Szatkownice, drylownice i ubijaki", query: "drylownica" },
          { label: "Maszynki do pomidorów", query: "pomidor" },
          { label: "Sokowniki, szybkowary, suszarki", query: "sokownik" },
          { label: "Beczki, kamionki i worki", query: "kamionki" },
          { label: "Środki dodatkowe do przetworów", query: "przetwory" },
          { label: "Akcesoria do przetworów, Etykiety", query: "etykiety" },
          { label: "Młynki, moździerze, Gadżety domowe", query: "młynki" },
        ],
      },
      {
        title: "Ogród",
        topics: [
          { label: "Kiełkowanie", query: "kiełkowanie" },
          { label: "Nawadnianie i podłoża", query: "nawadnianie" },
          { label: "Mierniki glebowe", query: "mierniki glebowe" },
          { label: "Mocowanie roślin", query: "mocowanie roślin" },
          { label: "Odstraszacze", query: "odstraszacze" },
          { label: "Szklarnie, tunele", query: "szklarnia" },
          { label: "Akcesoria i narzędzia ogrodnicze", query: "narzędzia ogrodnicze" },
          { label: "Domki i karmniki", query: "karmniki" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Słoiki i przetwory",
      description:
        "Przygotuj domowe zapasy i sezonowe przetwory z akcesoriami, które porządkują cały proces.",
      cta: "Sprawdź akcesoria",
      href: "/kategoria/domiogrod?search=s%C5%82oiki",
      icon: "house",
    },
  },
  {
    id: "termometry",
    slug: "termometry",
    label: "Termometry",
    shortLabel: "Termometry",
    description:
      "Modele kuchenne, pokojowe i specjalistyczne z wysokim potencjałem na cross-sell.",
    icon: "thermometer",
    heroTitle: "Pomiar i kontrola procesu, czyli spokojniejszy zakup i mniej zwrotów.",
    menuSections: [
      {
        title: "Termometry",
        topics: [
          { label: "Temperatura otoczenia", query: "temperatura otoczenia" },
          { label: "Termometry kuchenne", query: "termometr kuchenny" },
          { label: "Termometry lodówkowe", query: "termometr lodówkowy" },
          { label: "Termometry kąpielowe", query: "termometr kąpielowy" },
          { label: "Termometry specjalistyczne", query: "termometr specjalistyczny" },
          { label: "Termometry zoologiczne", query: "termometr zoologiczny" },
        ],
      },
      {
        title: "Stacje pogody",
        topics: [
          { label: "Elektroniczne", query: "stacja pogody elektroniczna" },
          { label: "Retro", query: "stacja pogody retro" },
          { label: "Czujniki bezprzewodowe", query: "czujnik bezprzewodowy" },
          { label: "Pokojowe i zaokienne", query: "zaokienne" },
        ],
      },
    ],
    promo: {
      type: "editorial",
      title: "Stacje pogody",
      description:
        "Precyzyjny pomiar w domu i ogrodzie, gdy chcesz mieć temperaturę i warunki zawsze pod kontrolą.",
      cta: "Sprawdź ofertę",
      href: "/kategoria/termometry?search=stacja%20pogody",
      icon: "thermometer",
    },
  },
];

const topicCollator = new Intl.Collator("pl", { sensitivity: "base" });
const dynamicTopicLimit = 8;

const sortTopicEntries = (entries: Array<{ label: string; count: number }>) =>
  [...entries].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return topicCollator.compare(left.label, right.label);
  });

const buildDynamicMenuSections = (
  source: Pick<Product, "categoryId" | "taxonomy">[],
  categoryId: CategoryId,
  fallbackSections: CategoryMenuSection[],
) => {
  const categoryCounts = new Map<string, number>();
  const subcategoryCounts = new Map<string, number>();

  for (const product of source) {
    if (product.categoryId !== categoryId) {
      continue;
    }

    const taxonomyForCategory = product.taxonomy.filter(
      (entry) => entry.categoryId === categoryId,
    );

    for (const entry of taxonomyForCategory) {
      categoryCounts.set(
        entry.categoryName,
        (categoryCounts.get(entry.categoryName) ?? 0) + 1,
      );

      if (entry.subcategoryName) {
        subcategoryCounts.set(
          entry.subcategoryName,
          (subcategoryCounts.get(entry.subcategoryName) ?? 0) + 1,
        );
      }
    }
  }

  const categoryTopics = sortTopicEntries(
    [...categoryCounts.entries()].map(([label, count]) => ({ label, count })),
  )
    .slice(0, dynamicTopicLimit)
    .map(({ label }) => ({ label, query: label }));
  const subcategoryTopics = sortTopicEntries(
    [...subcategoryCounts.entries()].map(([label, count]) => ({ label, count })),
  )
    .slice(0, dynamicTopicLimit)
    .map(({ label }) => ({ label, query: label }));

  const dynamicSections: CategoryMenuSection[] = [];

  if (categoryTopics.length > 0) {
    dynamicSections.push({
      title: "Kategorie",
      topics: categoryTopics,
    });
  }

  if (subcategoryTopics.length > 0) {
    dynamicSections.push({
      title: "Podkategorie",
      topics: subcategoryTopics,
    });
  }

  return dynamicSections.length > 0 ? dynamicSections : fallbackSections;
};

export const getStoreCategories = (
  source: Pick<Product, "categoryId" | "taxonomy">[],
): StoreCategory[] =>
  categories.map((category) => ({
    ...category,
    menuSections: buildDynamicMenuSections(source, category.id, category.menuSections),
  }));

export const trustBadges: TrustBadge[] = [
  {
    label: "Darmowa dostawa od 149 zł",
    detail: "Próg ustawiony tak, by naturalnie dosprzedawać dodatki i akcesoria.",
    icon: "truck",
  },
  {
    label: "Wysyłka tego samego dnia",
    detail: "Dla zamówień złożonych do 14:00 w dni robocze.",
    icon: "package",
  },
  {
    label: "Polski producent od 1979",
    detail: "Mocny element zaufania, który powinien być widoczny w całym funnelu.",
    icon: "shield",
  },
];

export const utilityLinks: UtilityLink[] = [
  { label: "Nowości", href: "/produkty?search=nowość", icon: "sparkle" },
  { label: "Bestsellery", href: "/produkty?sort=popular", icon: "star" },
  { label: "Promocje", href: "/produkty?deal=true", icon: "gift" },
  { label: "Przepiśnik", href: "/produkty?search=zestaw", icon: "book" },
  { label: "Checkout demo", href: "/checkout", icon: "package" },
];

export const heroStats: HeroStat[] = [
  { value: "44", label: "produktowe mocki z wariantami" },
  { value: "8", label: "głównych kategorii sklepowych" },
  { value: "4.8/5", label: "średnia ocena bestsellerów" },
];

export const campaignCards: CampaignCard[] = [
  {
    eyebrow: "Social proof",
    title: "Pakiety startowe kupowane razem z akcesoriami",
    description:
      "Struktura sklepu premiuje bundle'e i szybkie decyzje zakupowe na mobile.",
    href: "/produkty?search=zestaw",
    image: "/assets/zestaw.webp",
    accent: "red",
  },
  {
    eyebrow: "Sezonowość",
    title: "Wielkanoc, lato i przetwory w jednym systemie promocji",
    description:
      "Kampanie można przepinać między kategoriami bez zmiany warstwy danych.",
    href: "/kategoria/domiogrod",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    accent: "sand",
  },
  {
    eyebrow: "High-ticket",
    title: "Sprzęt premium z mocnym CTA i poczuciem pilności",
    description:
      "Duże produkty dostają przestrzeń, storytelling i wyraźną ścieżkę do koszyka.",
    href: "/produkt/wedzarnia-dragon-classic",
    image: "/assets/produkt4.webp",
    accent: "dark",
  },
];

export const insightCards: InsightCard[] = [
  {
    title: "Układ mobile-first",
    description:
      "Najważniejsze CTA, cena i wariant są zawsze w pierwszym widoku na telefonie.",
    icon: "timer",
  },
  {
    title: "Poczucie jakości",
    description:
      "Kontrastowe CTA, premium spacing i dopracowane karty zamiast surowej siatki katalogowej.",
    icon: "sparkle",
  },
  {
    title: "Spójne cross-selle",
    description:
      "Termometry, akcesoria i zestawy są gotowe do dokładania w koszyku oraz na PDP.",
    icon: "users",
  },
];

export const footerColumns: FooterColumn[] = [
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
      { label: "Zwroty i reklamacje", href: "/checkout" },
      { label: "Kontakt handlowy", href: "/checkout" },
      { label: "Status zamówienia", href: "/checkout" },
    ],
  },
];

export const supportInfo = {
  phone: "+48 42 123 45 67",
  email: "kontakt@browin-demo.pl",
  hours: "Pon.-Pt. 8:00-16:00",
};
