import type { Icon } from "@phosphor-icons/react";
import {
  Calculator,
  ChartPieSlice,
  Fire,
  Flask,
  Gift,
  Grains,
  Handshake,
  House,
  Package,
  PintGlass,
  ShieldCheck,
  Thermometer,
  Truck,
  Users,
  Wine,
} from "@phosphor-icons/react";

export type CategoryId =
  | "wedliniarstwo"
  | "gorzelnictwo"
  | "winiarstwo"
  | "serowarstwo"
  | "piwowarstwo"
  | "piekarnictwo"
  | "domiogrod"
  | "termometry";

export type CategoryMenuSection = {
  title: string;
  links: string[];
};

export type CategoryPromo = {
  eyebrow?: string;
  title: string;
  description: string;
  cta: string;
  image?: string;
  productId?: string;
  icon?: Icon;
};

export type StoreCategory = {
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: Icon;
  menuSections: CategoryMenuSection[];
  promo: CategoryPromo;
};

export type UtilityLink = {
  id: string;
  label: string;
  icon: Icon;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  categoryId: CategoryId;
  align?: "left" | "right";
  emphasis?: "primary" | "light";
};

export type ValuePoint = {
  title: string;
  description: string;
  icon: Icon;
};

export type StoreProduct = {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: CategoryId;
  badge?: string;
  description: string;
};

export type CartSeedItem = {
  productId: string;
  quantity: number;
};

export type FooterColumn = {
  title: string;
  links: string[];
};

export const trustBadges = [
  { label: "Darmowa dostawa od 149 zł", icon: Truck },
  { label: "Zamów do 14:00 - wysyłka dziś", icon: Package },
  { label: "Polski producent od 1979", icon: ShieldCheck },
] as const;

export const utilityLinks: UtilityLink[] = [
  { id: "gift-cards", label: "Karty podarunkowe", icon: Gift },
  { id: "configurator", label: "Konfigurator", icon: Package },
  { id: "calculators", label: "Kalkulatory", icon: Calculator },
  { id: "services", label: "Usługi", icon: Handshake },
];

export const valuePoints: ValuePoint[] = [
  {
    title: "Ogromny asortyment",
    description: "Wszystko w jednym miejscu",
    icon: Package,
  },
  {
    title: "Gwarancja jakości",
    description: "Sprawdzone materiały i sprzęt",
    icon: ShieldCheck,
  },
  {
    title: "Strefa porad",
    description: "Eksperckie wsparcie dla domowego craftu",
    icon: Users,
  },
  {
    title: "Zaufane zwroty",
    description: "14 dni na zmianę decyzji",
    icon: Truck,
  },
] as const;

export const categories: StoreCategory[] = [
  {
    id: "wedliniarstwo",
    label: "Wędliniarstwo",
    shortLabel: "Wędliny",
    icon: Fire,
    menuSections: [
      {
        title: "Sprzęt wędliniarski",
        links: [
          "Zestawy startowe",
          "Szynkowary i worki",
          "Wędzarnie i haki",
          "Paleniska i kociołki",
          "Nadziewarki",
          "Pakowanie próżniowe",
        ],
      },
      {
        title: "Dodatki i akcesoria",
        links: [
          "Jelita i osłonki",
          "Pekle, marynaty i zioła",
          "Kultury bakterii",
          "Zrębki wędzarnicze",
          "Kalkulator wędliniarski",
          "Literatura",
        ],
      },
    ],
    promo: {
      eyebrow: "Dla Początkujących",
      title: "Wędzarnia elektryczna dragON 65 L",
      description:
        "Mocny punkt draftu: produkt premium dla osób, które chcą zacząć domowe wędzenie na serio.",
      cta: "Zobacz produkt",
      image: "/assets/produkt4.webp",
      productId: "wedzarnia-dragon",
    },
  },
  {
    id: "gorzelnictwo",
    label: "Gorzelnictwo",
    shortLabel: "Gorzelnictwo",
    icon: Flask,
    menuSections: [
      {
        title: "Sprzęt",
        links: [
          "Destylatory i kolumny",
          "Pojemniki fermentacyjne",
          "Mierniki i wskaźniki",
          "Gąsiory i damy",
          "Butelki i zakrętki",
          "Karafki i beczki",
        ],
      },
      {
        title: "Dodatki",
        links: [
          "Drożdże gorzelnicze",
          "Węgiel aktywny",
          "Zaprawki i esencje",
          "Dodatki smakowe",
          "Etykiety",
          "Kalkulator nalewek",
        ],
      },
    ],
    promo: {
      title: "Zestaw startowy do nalewek",
      description:
        "Przykładowy bundle dla osób, które chcą wejść w świat domowych destylatów i nalewek.",
      cta: "Dodaj do koszyka",
      image: "/assets/zestaw.webp",
      productId: "zestaw-do-nalewek",
    },
  },
  {
    id: "winiarstwo",
    label: "Winiarstwo",
    shortLabel: "Wino",
    icon: Wine,
    menuSections: [
      {
        title: "Sprzęt",
        links: [
          "Zestawy winiarskie",
          "Balony i kosze",
          "Rurki fermentacyjne",
          "Prasy i rozdrabniarki",
          "Filtrowanie i korkowanie",
          "Mierniki i wskaźniki",
        ],
      },
      {
        title: "Dodatki",
        links: [
          "Drożdże winiarskie",
          "Pożywki",
          "Środki klarujące",
          "Aromatyzacja wina",
          "Kalkulator winiarski",
          "Oferta dla winnic",
        ],
      },
    ],
    promo: {
      eyebrow: "Oferta Dnia",
      title: "Balon winiarski 15 L",
      description:
        "Klasyczny produkt dla kategorii winiarskiej, wykorzystany jako gotowa karta sprzedażowa w draftcie.",
      cta: "Dodaj do koszyka",
      image: "/assets/baner-27.02-wielkanoc5.webp",
      productId: "balon-winiarski-15l",
    },
  },
  {
    id: "serowarstwo",
    label: "Serowarstwo",
    shortLabel: "Sery",
    icon: ChartPieSlice,
    menuSections: [
      {
        title: "Zestawy i podstawy",
        links: [
          "Zestawy serowarskie",
          "Podpuszczki i kultury",
          "Formy do sera",
          "Prasy",
          "Chusty serowarskie",
          "Pakowanie próżniowe",
        ],
      },
      {
        title: "Mleczarstwo i inne",
        links: [
          "Wyrób jogurtu",
          "Jogurtownice",
          "Wyrób masła",
          "Przyprawy do masła",
          "Literatura",
          "Kalkulator serowarski",
        ],
      },
    ],
    promo: {
      title: "Zestaw serowarski home lab",
      description:
        "Sekcja z przykładami dla domowego rzemiosła. Dane produktowe są realistyczne i spójne z charakterem sklepu.",
      cta: "Sprawdź zestaw",
      image: "/assets/zestaw.webp",
      productId: "zestaw-serowarski",
    },
  },
  {
    id: "piwowarstwo",
    label: "Piwowarstwo",
    shortLabel: "Piwo",
    icon: PintGlass,
    menuSections: [
      {
        title: "Sprzęt",
        links: [
          "Zestawy startowe",
          "Pojemniki fermentacyjne",
          "Rurki fermentacyjne",
          "Kapslownice i kapsle",
          "Butelki",
          "Akcesoria piwowarskie",
        ],
      },
      {
        title: "Składniki",
        links: [
          "Brewkity",
          "Ekstrakty",
          "Chmiele",
          "Drożdże piwowarskie",
          "Dodatki do piwa",
          "Badania piwa",
        ],
      },
    ],
    promo: {
      title: "Mikrobrowar start",
      description:
        "Prosty przykład zestawu dla początkujących piwowarów, dodany jako rozszerzenie źródłowego draftu.",
      cta: "Przejdź do oferty",
      image: "/assets/zestaw.webp",
      productId: "mikrobrowar-start",
    },
  },
  {
    id: "piekarnictwo",
    label: "Piekarnictwo",
    shortLabel: "Wypieki",
    icon: Grains,
    menuSections: [
      {
        title: "Podstawy wypieków",
        links: [
          "Drożdże piekarskie",
          "Zakwasy",
          "Kamienie do pizzy",
          "Formy rzymskie",
        ],
      },
      {
        title: "Akcesoria",
        links: [
          "Łopaty i skrobki",
          "Pojemniki do wyrastania",
          "Koszyki do chleba",
          "Termometry piekarnicze",
        ],
      },
    ],
    promo: {
      title: "Kamień do pizzy z łopatą",
      description:
        "Przykładowy produkt kategorii piekarniczej, dobrany do charakteru sklepu i domowego craftu.",
      cta: "Sprawdź akcesoria",
      image: "/assets/baner-27.02-wielkanoc5.webp",
      productId: "kamien-do-pizzy",
    },
  },
  {
    id: "domiogrod",
    label: "Dom i ogród",
    shortLabel: "Dom i ogród",
    icon: House,
    menuSections: [
      {
        title: "Przetwórstwo i kuchnia",
        links: [
          "Słoiki i zakrętki",
          "Szatkownice i drylownice",
          "Maszynki do pomidorów",
          "Sokowniki i szybkowary",
          "Suszarki",
          "Akcesoria do przetworów",
        ],
      },
      {
        title: "Ogród",
        links: [
          "Kiełkowanie",
          "Nawadnianie",
          "Mierniki glebowe",
          "Szklarnie i tunele",
          "Akcesoria ogrodnicze",
          "Domki i karmniki",
        ],
      },
    ],
    promo: {
      title: "Pakiet do domowych przetworów",
      description:
        "Sekcja na produkty sezonowe i pakiety promocyjne związane z domowymi zapasami oraz ogrodem.",
      cta: "Zobacz pakiet",
      image: "/assets/baner-27.02-wielkanoc5.webp",
      productId: "pakiet-przetwory",
    },
  },
  {
    id: "termometry",
    label: "Termometry",
    shortLabel: "Termometry",
    icon: Thermometer,
    menuSections: [
      {
        title: "Pomiar temperatury",
        links: [
          "Do mięsa i wędlin",
          "Do wina i piwa",
          "Pokojowe i zaokienne",
          "Lodówkowe",
          "Kąpielowe",
          "Specjalistyczne",
        ],
      },
      {
        title: "Stacje pogody",
        links: [
          "Elektroniczne",
          "Retro",
          "Czujniki bezprzewodowe",
          "Modele do ogrodu",
        ],
      },
    ],
    promo: {
      title: "Termometr pokojowy Soens",
      description:
        "Mały, praktyczny produkt z kategorii termometrów, dodany jako wiarygodny przykład asortymentu.",
      cta: "Dodaj do koszyka",
      image: "/assets/produkt3.webp",
      productId: "termometr-soens",
    },
  },
] as const;

export const heroSlides: HeroSlide[] = [
  {
    id: "craft-masterpiece",
    eyebrow: "+50 000 pasjonatów domowego craftu",
    title: "Prawdziwe arcydzieło. Z Twojej kuchni.",
    description:
      "Sprzęt, dodatki i wiedza do wędlin, nalewek, win, serów i wypieków w jednym miejscu.",
    cta: "Zobacz bestsellery",
    image: "/assets/szynka.webp",
    categoryId: "wedliniarstwo",
    emphasis: "primary",
  },
  {
    id: "starter-sets",
    eyebrow: "Zestawy startowe",
    title: "Ruszasz od zera? Zacznij od gotowego kompletu.",
    description:
      "Draft sklepu jest gotowy pod sprzedaż pakietów wejściowych i produktów o wysokiej marży.",
    cta: "Odkryj zestawy",
    image: "/assets/zestaw.webp",
    categoryId: "gorzelnictwo",
    emphasis: "light",
  },
  {
    id: "seasonal-promo",
    eyebrow: "Sezonowe inspiracje",
    title: "Domowe przetwory, święta i prezenty w jednym ekosystemie.",
    description:
      "Szablon przewiduje kampanie sezonowe i szerokie wykorzystanie banerów sprzedażowych.",
    cta: "Sprawdź promocje",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    categoryId: "domiogrod",
    align: "right",
    emphasis: "primary",
  },
] as const;

export const products: StoreProduct[] = [
  {
    id: "aromat-dymu",
    title: "Aromat dymu wędzarniczego w płynie - wiśniowy, 250 ml",
    price: 19.99,
    image: "/assets/produkt1.webp",
    category: "wedliniarstwo",
    badge: "Nowość",
    description: "Do marynat, glazur i sosów o wyraźnym, dymnym profilu.",
  },
  {
    id: "jelita-naturalne",
    title: "Jelita naturalne wieprzowe kal. 28/30 mm, 20 m",
    price: 24.99,
    image: "/assets/produkt2.webp",
    category: "wedliniarstwo",
    description: "Sprawdzone osłonki do domowej produkcji kiełbas i kabanosów.",
  },
  {
    id: "termometr-soens",
    title: "Elektroniczny termometr pokojowy marki Soens, czarny",
    price: 45.9,
    image: "/assets/produkt3.webp",
    category: "termometry",
    description: "Nowoczesny, prosty i czytelny pomiar temperatury w domu.",
  },
  {
    id: "wedzarnia-dragon",
    title: "Wędzarnia elektryczna dragON z generatorem dymu, cyfrowa 65 L",
    price: 1299,
    image: "/assets/produkt4.webp",
    category: "wedliniarstwo",
    badge: "Bestseller",
    description: "Rozbudowany sprzęt premium do domowego wędzenia i suszenia.",
  },
  {
    id: "zestaw-startowy-szynkowar",
    title: "Zestaw startowy Szynkowar domowy z termometrem i akcesoriami",
    price: 119.99,
    compareAtPrice: 149.99,
    image: "/assets/zestaw.webp",
    category: "wedliniarstwo",
    badge: "Hit tygodnia",
    description: "Komplet na wejście do domowego wyrobu szynek i pieczeni.",
  },
  {
    id: "balon-winiarski-15l",
    title: "Balon winiarski 15 L z korkiem i rurką fermentacyjną",
    price: 89.99,
    image: "/assets/baner-27.02-wielkanoc5.webp",
    category: "winiarstwo",
    badge: "Oferta dnia",
    description: "Praktyczny zestaw dla domowego wina, cydru i fermentacji.",
  },
  {
    id: "zestaw-do-nalewek",
    title: "Zestaw startowy do nalewek i destylatów dla początkujących",
    price: 149,
    image: "/assets/zestaw.webp",
    category: "gorzelnictwo",
    description: "Pakiet sprzętu i dodatków na pierwsze domowe eksperymenty.",
  },
  {
    id: "zestaw-serowarski",
    title: "Zestaw serowarski home lab: formy, chusta i kultury starterowe",
    price: 139,
    image: "/assets/zestaw.webp",
    category: "serowarstwo",
    description: "Początek przygody z twarogami, serami świeżymi i podpuszczkowymi.",
  },
  {
    id: "mikrobrowar-start",
    title: "Mikrobrowar start: fermentor, rurka i kapslownica",
    price: 169,
    image: "/assets/zestaw.webp",
    category: "piwowarstwo",
    description: "Pewny zestaw wejściowy do warzenia własnego piwa w domu.",
  },
  {
    id: "kamien-do-pizzy",
    title: "Kamień do pizzy i pieczywa z łopatą startową",
    price: 109,
    image: "/assets/baner-27.02-wielkanoc5.webp",
    category: "piekarnictwo",
    description: "Dla domowych wypieków o chrupiącej skórce i równym wypieku.",
  },
  {
    id: "pakiet-przetwory",
    title: "Pakiet do domowych przetworów i sezonowych zapasów",
    price: 79,
    image: "/assets/baner-27.02-wielkanoc5.webp",
    category: "domiogrod",
    description: "Zbiorczy produkt demonstracyjny dla kampanii sezonowych i akcji promocyjnych.",
  },
] as const;

export const initialCart: CartSeedItem[] = [
  { productId: "aromat-dymu", quantity: 1 },
  { productId: "jelita-naturalne", quantity: 1 },
] as const;

export const footerColumns: FooterColumn[] = [
  {
    title: "Oferta",
    links: [
      "Wędliniarstwo",
      "Gorzelnictwo",
      "Winiarstwo",
      "Serowarstwo",
      "Piwowarstwo",
    ],
  },
  {
    title: "Obsługa klienta",
    links: [
      "Dostawa i płatności",
      "Zwroty i reklamacje",
      "Kontakt",
      "FAQ",
      "Status zamówienia",
    ],
  },
  {
    title: "Inspiracje",
    links: [
      "Przepiśnik",
      "Poradniki",
      "Kalkulatory",
      "Konfigurator",
      "Blog produktowy",
    ],
  },
] as const;

export const supportSummary = {
  phone: "+48 42 123 45 67",
  email: "kontakt@browin-demo.pl",
  hours: "Pon.-Pt. 8:00-16:00",
} as const;
