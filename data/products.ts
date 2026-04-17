import type { CategoryId } from "@/data/store";

export type ProductVariant = {
  id: string;
  label: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  leadTime: string;
  badge?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductStatus = "nowosc" | "wyprzedaz" | "standard";

export type ProductFileType =
  | "instrukcja"
  | "bezpieczenstwo"
  | "karta-produktu"
  | "inne";

export type ProductFile = {
  label: string;
  href: string;
  type: ProductFileType;
  sizeLabel?: string;
};

export type Product = {
  id: string;
  baseProductId: string;
  baseSlug: string;
  slug: string;
  symbol: string;
  ean: string;
  title: string;
  subtitle: string;
  line: string;
  categoryId: CategoryId;
  shortDescription: string;
  description: string;
  longDescription: string;
  images: string[];
  badge?: string;
  status: ProductStatus;
  tags: string[];
  rating: number;
  reviews: number;
  soldLast30Days: number;
  viewingNow: number;
  popularityScore: number;
  newestOrder: number;
  benefits: string[];
  features: string[];
  specs: ProductSpec[];
  faq: ProductFaq[];
  files: ProductFile[];
  complementaryProductIds: string[];
  variants: ProductVariant[];
};

type ProductSeed = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categoryId: CategoryId;
  shortDescription: string;
  description: string;
  longDescription: string;
  image: string;
  basePrice: number;
  compareAtPrice?: number;
  badge?: string;
  tags: string[];
  rating: number;
  reviews: number;
  soldBase: number;
  viewingBase: number;
  popularityBase: number;
  benefits: string[];
  features: string[];
  specs: ProductSpec[];
  faq: ProductFaq[];
  variantLabels: string[];
};

type ProductLineProfile = {
  key: string;
  line: string;
  badge?: string;
  multiplier: number;
  reviewBoost: number;
  popularityBoost: number;
  stockBase: number;
};

const mediaPool = [
  "/assets/produkt1.webp",
  "/assets/produkt2.webp",
  "/assets/produkt3.webp",
  "/assets/produkt4.webp",
  "/assets/szynka.webp",
  "/assets/zestaw.webp",
  "/assets/baner-27.02-wielkanoc5.webp",
] as const;

const lineProfiles: ProductLineProfile[] = [
  {
    key: "classic",
    line: "Linia Core",
    multiplier: 1,
    reviewBoost: 0,
    popularityBoost: 0,
    stockBase: 42,
  },
  {
    key: "craft",
    line: "Linia Craft",
    badge: "Nowość",
    multiplier: 1.08,
    reviewBoost: 11,
    popularityBoost: 7,
    stockBase: 34,
  },
  {
    key: "expert",
    line: "Linia Expert",
    badge: "Bestseller",
    multiplier: 1.18,
    reviewBoost: 24,
    popularityBoost: 14,
    stockBase: 21,
  },
  {
    key: "atelier",
    line: "Linia Atelier",
    badge: "Premium",
    multiplier: 1.32,
    reviewBoost: 38,
    popularityBoost: 20,
    stockBase: 13,
  },
];

const roundPrice = (value: number) => Number(value.toFixed(2));

// Deterministyczny hash FNV-1a (32-bit), żeby symbol i EAN nie zmieniały się między builderami.
const fnv1a = (input: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const generateSymbol = (source: string): string =>
  String(fnv1a(`symbol::${source}`) % 1_000_000).padStart(6, "0");

// EAN-13 z prefiksem 590 (Polska) + 9 deterministycznych cyfr + cyfra kontrolna.
const generateEan = (source: string): string => {
  const body = String(fnv1a(`ean::${source}`)).padStart(9, "0").slice(0, 9);
  const digits = `590${body}`;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = digits.charCodeAt(i) - 48;
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checksum = (10 - (sum % 10)) % 10;
  return `${digits}${checksum}`;
};

const resolveStatus = (
  seedBadge: string | undefined,
  profileBadge: string | undefined,
  hasCompareAtPrice: boolean,
): ProductStatus => {
  const combined = `${seedBadge ?? ""}|${profileBadge ?? ""}`.toLowerCase();
  if (combined.includes("nowość") || combined.includes("nowosc")) return "nowosc";
  if (hasCompareAtPrice) return "wyprzedaz";
  return "standard";
};

const buildGallery = (primaryImage: string, seedIndex: number) => [
  primaryImage,
  mediaPool[(seedIndex + 1) % mediaPool.length],
  mediaPool[(seedIndex + 3) % mediaPool.length],
  mediaPool[(seedIndex + 5) % mediaPool.length],
];

const seeds: ProductSeed[] = [
  {
    id: "aromat-dymu",
    slug: "aromat-dymu",
    title: "Aromat dymu wędzarniczego w płynie - wiśniowy",
    subtitle: "Dymny profil do marynat, glazur i sosów",
    categoryId: "wedliniarstwo",
    shortDescription: "Do marynat, glazur i sosów o wyraźnym, dymnym profilu.",
    description:
      "Koncentrat smakowy do szybkiego budowania charakteru grillowego i wędzarniczego.",
    longDescription:
      "Produkt świetnie sprawdza się w prototypie sklepu jako artykuł niskiego progu wejścia, który naturalnie domyka koszyk. Może działać jako samodzielna pozycja lub jako dosprzedaż przy szynkowarach i akcesoriach do wędzenia.",
    image: "/assets/produkt1.webp",
    basePrice: 19.99,
    compareAtPrice: 24.99,
    badge: "Nowość",
    tags: ["aromat", "dym", "marynata", "grill", "wędzenie"],
    rating: 4.7,
    reviews: 126,
    soldBase: 78,
    viewingBase: 12,
    popularityBase: 84,
    benefits: [
      "Szybko podbija smak i kolor marynat.",
      "Łatwy produkt do przetestowania przez nowych klientów.",
      "Świetny kandydat do cross-sellu z akcesoriami do mięsa.",
    ],
    features: [
      "Wiśniowy profil aromatyczny.",
      "Wygodne dozowanie w kuchni domowej.",
      "Kompatybilny z sosami, glazurami i zalewami.",
    ],
    specs: [
      { label: "Typ", value: "aromat spożywczy" },
      { label: "Profil", value: "dym wiśniowy" },
      { label: "Zastosowanie", value: "marynaty i glazury" },
      { label: "Przechowywanie", value: "w suchym i chłodnym miejscu" },
    ],
    faq: [
      {
        question: "Czy nadaje się do mięs i warzyw?",
        answer:
          "Tak, mock zakłada wykorzystanie zarówno przy mięsach, jak i w kuchni roślinnej.",
      },
      {
        question: "Czy to produkt impulsowy?",
        answer:
          "Tak, dzięki cenie i niskiemu ryzyku zakupu dobrze pełni rolę dopinki do koszyka.",
      },
    ],
    variantLabels: ["250 ml", "500 ml", "1 l"],
  },
  {
    id: "jelita-naturalne",
    slug: "jelita-naturalne",
    title: "Jelita naturalne wieprzowe kal. 28/30 mm",
    subtitle: "Osłonki do domowych kiełbas i kabanosów",
    categoryId: "wedliniarstwo",
    shortDescription:
      "Sprawdzone osłonki do domowej produkcji kiełbas i kabanosów.",
    description:
      "Akcesorium z mocnym potencjałem na repeat purchase i bundling z przyprawami.",
    longDescription:
      "Jelita są typowym produktem replenishmentowym. W prototypie sklepu pomagają pokazać, że asortyment nie kończy się na sprzęcie high-ticket, ale wspiera też stałe zakupy eksploatacyjne.",
    image: "/assets/produkt2.webp",
    basePrice: 24.99,
    tags: ["jelita", "kiełbasa", "osłonki", "wędlina"],
    rating: 4.8,
    reviews: 204,
    soldBase: 91,
    viewingBase: 15,
    popularityBase: 88,
    benefits: [
      "Kluczowy produkt powracający w koszykach stałych klientów.",
      "Naturalnie uzupełnia zakup szynkowara i przypraw.",
      "Łatwy do promowania w pakietach sezonowych.",
    ],
    features: [
      "Kaliber 28/30 mm.",
      "Przeznaczone do domowej produkcji kiełbas.",
      "Dobrze pracują w prostych recepturach startowych.",
    ],
    specs: [
      { label: "Rodzaj", value: "wieprzowe" },
      { label: "Kaliber", value: "28/30 mm" },
      { label: "Przeznaczenie", value: "kiełbasy i kabanosy" },
      { label: "Forma sprzedaży", value: "zapas do produkcji domowej" },
    ],
    faq: [
      {
        question: "Dla kogo są te osłonki?",
        answer: "Dla osób zaczynających oraz dla stałych użytkowników domowych nadziewarek.",
      },
      {
        question: "Czy to dobry produkt do dodania w ostatnim kroku?",
        answer: "Tak, świetnie sprawdza się jako upsell przy finalizacji koszyka.",
      },
    ],
    variantLabels: ["20 m", "40 m", "80 m"],
  },
  {
    id: "termometr-soens",
    slug: "termometr-soens",
    title: "Elektroniczny termometr pokojowy marki Soens",
    subtitle: "Czytelny pomiar temperatury w nowoczesnej obudowie",
    categoryId: "termometry",
    shortDescription:
      "Nowoczesny, prosty i czytelny pomiar temperatury w domu.",
    description:
      "Produkt cross-sellowy do procesów fermentacji, dojrzewania i kontroli warunków.",
    longDescription:
      "To przykład małego, ale bardzo konwersyjnego produktu, który dobrze wygląda na kartach, w koszyku i w sekcji 'kup razem'. Ułatwia też pokazanie, że sklep BROWIN wspiera cały proces, a nie tylko sprzedaż pojedynczych narzędzi.",
    image: "/assets/produkt3.webp",
    basePrice: 45.9,
    tags: ["termometr", "temperatura", "dom", "kontrola"],
    rating: 4.6,
    reviews: 89,
    soldBase: 49,
    viewingBase: 9,
    popularityBase: 72,
    benefits: [
      "Podnosi średnią wartość koszyka przy zakupach procesowych.",
      "Dobrze komunikuje dbałość o kontrolę jakości.",
      "Jest uniwersalny i zrozumiały nawet dla nowych klientów.",
    ],
    features: [
      "Duży, czytelny odczyt.",
      "Minimalistyczna forma pasująca do domowej kuchni.",
      "Dobry wybór do fermentacji i przechowywania.",
    ],
    specs: [
      { label: "Rodzaj", value: "elektroniczny" },
      { label: "Zastosowanie", value: "dom i proces fermentacji" },
      { label: "Kolor", value: "czarny" },
      { label: "Atut", value: "czytelny ekran" },
    ],
    faq: [
      {
        question: "Czy sprawdzi się także przy dojrzewaniu?",
        answer:
          "Tak, w mocku jest pozycjonowany jako wsparcie dla mięs, serów i win.",
      },
      {
        question: "Dlaczego warto go pokazywać na PDP innych produktów?",
        answer:
          "Bo odpowiada na częsty lęk klienta: czy kontroluję temperaturę wystarczająco dobrze.",
      },
    ],
    variantLabels: ["Classic", "Biały", "Z sondą"],
  },
  {
    id: "wedzarnia-dragon",
    slug: "wedzarnia-dragon",
    title: "Wędzarnia elektryczna dragON z generatorem dymu",
    subtitle: "Cyfrowy sprzęt premium do wędzenia i suszenia",
    categoryId: "wedliniarstwo",
    shortDescription:
      "Rozbudowany sprzęt premium do domowego wędzenia i suszenia.",
    description:
      "High-ticket anchor dla całej kategorii, idealny do hero i kart kampanijnych.",
    longDescription:
      "Wędzarnia buduje aurę eksperckiego sklepu i świetnie nadaje się do sekcji premium. To produkt, który uzasadnia storytelling, social proof, pokazanie oszczędności czasu oraz sekcji 'kup razem' z dodatkami i termometrami.",
    image: "/assets/produkt4.webp",
    basePrice: 1299,
    compareAtPrice: 1499,
    badge: "Bestseller",
    tags: ["wędzarnia", "premium", "generator dymu", "sprzęt"],
    rating: 4.9,
    reviews: 317,
    soldBase: 33,
    viewingBase: 27,
    popularityBase: 98,
    benefits: [
      "Silny produkt hero do dużych kampanii sprzedażowych.",
      "Naturalnie ciągnie akcesoria i dodatki do koszyka.",
      "Buduje premium perception całego sklepu.",
    ],
    features: [
      "Cyfrowe sterowanie procesem.",
      "Generator dymu w zestawie.",
      "Pojemność dopasowana do ambitnego domowego użycia.",
    ],
    specs: [
      { label: "Sterowanie", value: "cyfrowe" },
      { label: "Typ", value: "elektryczna" },
      { label: "Atut", value: "generator dymu" },
      { label: "Pozycjonowanie", value: "sprzęt premium" },
    ],
    faq: [
      {
        question: "Czy to produkt dla początkujących?",
        answer:
          "Tak, ale najlepiej pokazuje pełnię wartości przy kliencie gotowym wejść poziom wyżej.",
      },
      {
        question: "Jak wspierać jego sprzedaż?",
        answer:
          "Przez social proof, porównanie oszczędności i cross-sell akcesoriów procesowych.",
      },
    ],
    variantLabels: ["65 L", "95 L", "Zestaw z haczykami"],
  },
  {
    id: "zestaw-startowy-szynkowar",
    slug: "zestaw-startowy-szynkowar",
    title: "Zestaw startowy Szynkowar domowy z termometrem",
    subtitle: "Komplet na wejście do domowego wyrobu szynek i pieczeni",
    categoryId: "wedliniarstwo",
    shortDescription:
      "Komplet na wejście do domowego wyrobu szynek i pieczeni.",
    description:
      "Pack gotowy do reklam, kampanii performance i sekcji 'kup jednym kliknięciem'.",
    longDescription:
      "Zestaw startowy to jeden z najbardziej konwersyjnych typów produktów w całym prototypie. Łączy edukację, niski próg wejścia i szybkie zrozumienie wartości, dlatego świetnie nadaje się do kampanii dla nowych klientów.",
    image: "/assets/zestaw.webp",
    basePrice: 119.99,
    compareAtPrice: 149.99,
    badge: "Hit tygodnia",
    tags: ["szynkowar", "zestaw", "termometr", "start"],
    rating: 4.8,
    reviews: 241,
    soldBase: 114,
    viewingBase: 18,
    popularityBase: 94,
    benefits: [
      "Produkt łatwy do zrozumienia i szybkiej decyzji zakupowej.",
      "Otwiera drogę do dalszych zakupów akcesoriów i dodatków.",
      "Dobrze wygląda zarówno w siatce, jak i w hero kampanii.",
    ],
    features: [
      "Gotowy zestaw startowy.",
      "Termometr w komplecie.",
      "Silny kandydat do kampanii 'zacznij w weekend'.",
    ],
    specs: [
      { label: "Format", value: "bundle startowy" },
      { label: "Zawartość", value: "szynkowar i akcesoria" },
      { label: "Poziom", value: "dla początkujących" },
      { label: "Komunikacja", value: "wysoka konwersja" },
    ],
    faq: [
      {
        question: "Czy to dobry pierwszy zakup w kategorii?",
        answer: "Tak, mock traktuje ten produkt jako główny punkt wejścia do kategorii.",
      },
      {
        question: "Czy zestaw nadaje się do promocji sezonowych?",
        answer: "Tak, świetnie działa w kampaniach prezentowych i weekendowych.",
      },
    ],
    variantLabels: ["6 elementów", "8 elementów", "Premium"],
  },
  {
    id: "balon-winiarski-15l",
    slug: "balon-winiarski-15l",
    title: "Balon winiarski z korkiem i rurką fermentacyjną",
    subtitle: "Klasyczny produkt do domowego wina, cydru i fermentacji",
    categoryId: "winiarstwo",
    shortDescription:
      "Praktyczny zestaw dla domowego wina, cydru i fermentacji.",
    description:
      "Silny produkt edukacyjny z dużą czytelnością zastosowania dla nowych klientów.",
    longDescription:
      "Balon winiarski porządkuje kategorię: klient od razu rozumie, czego potrzebuje, a sklep zyskuje punkt do budowania bundle'i z drożdżami, korkami i akcesoriami pomiarowymi.",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    basePrice: 89.99,
    badge: "Oferta dnia",
    tags: ["balon", "wino", "fermentacja", "cydr"],
    rating: 4.7,
    reviews: 168,
    soldBase: 62,
    viewingBase: 14,
    popularityBase: 82,
    benefits: [
      "Bardzo czytelna karta produktowa dla początkujących.",
      "Naturalnie sprzedaje dodatki do procesu fermentacji.",
      "Dobrze działa w mechanizmach pilności i limitowanych akcji.",
    ],
    features: [
      "Korek i rurka w zestawie.",
      "Dobry wybór do domowego wina i cydru.",
      "Nadaje się do komunikacji ofertowej i poradnikowej.",
    ],
    specs: [
      { label: "Zastosowanie", value: "wino i cydr" },
      { label: "Format", value: "zestaw fermentacyjny" },
      { label: "Poziom", value: "starter / hobby" },
      { label: "Atut", value: "łatwy start" },
    ],
    faq: [
      {
        question: "Czy to dobra pozycja dla początkujących winiarzy?",
        answer: "Tak, w mocku jest pokazywana jako najprostszy punkt wejścia do kategorii.",
      },
      {
        question: "Jak zwiększyć konwersję tej karty?",
        answer: "Przez bundling z drożdżami i wyraźne CTA do zakupu pełnego zestawu.",
      },
    ],
    variantLabels: ["15 L", "20 L", "25 L"],
  },
  {
    id: "zestaw-do-nalewek",
    slug: "zestaw-do-nalewek",
    title: "Zestaw startowy do nalewek i destylatów",
    subtitle: "Pakiet sprzętu i dodatków na pierwsze domowe eksperymenty",
    categoryId: "gorzelnictwo",
    shortDescription:
      "Pakiet sprzętu i dodatków na pierwsze domowe eksperymenty.",
    description:
      "Gotowy bundle z mocnym potencjałem kampanii prezentowych i starterowych.",
    longDescription:
      "Zestaw do nalewek to połączenie edukacyjnego produktu wejściowego z bardzo estetycznym formatem prezentowym. Dzięki temu dobrze pracuje zarówno na mobile, jak i w kampaniach sezonowych z emocjonalnym przekazem.",
    image: "/assets/zestaw.webp",
    basePrice: 149,
    tags: ["nalewki", "zestaw", "destylaty", "prezent"],
    rating: 4.8,
    reviews: 152,
    soldBase: 71,
    viewingBase: 17,
    popularityBase: 87,
    benefits: [
      "Łączy wejście do kategorii z dużą czytelnością wartości.",
      "Dobrze wygląda w kampaniach giftingowych.",
      "Buduje średnią wartość koszyka bez dodatkowego wysiłku klienta.",
    ],
    features: [
      "Bundle dla początkujących.",
      "Łatwy do wykorzystania w akcjach promocyjnych.",
      "Silny kandydat do landingów sezonowych.",
    ],
    specs: [
      { label: "Format", value: "zestaw startowy" },
      { label: "Kategoria", value: "nalewki i destylaty" },
      { label: "Poziom", value: "początkujący" },
      { label: "Atut", value: "wysoka konwersja" },
    ],
    faq: [
      {
        question: "Czy zestaw nadaje się na prezent?",
        answer: "Tak, to jedna z jego najmocniejszych przewag w komunikacji sklepu.",
      },
      {
        question: "Czy klient od razu wie, co kupuje?",
        answer:
          "Tak, bundle obniża niepewność i skraca ścieżkę od zainteresowania do zakupu.",
      },
    ],
    variantLabels: ["Starter", "Comfort", "Master"],
  },
  {
    id: "zestaw-serowarski",
    slug: "zestaw-serowarski",
    title: "Zestaw serowarski Home Lab",
    subtitle: "Formy, chusta i kultury starterowe do pierwszych serów",
    categoryId: "serowarstwo",
    shortDescription:
      "Początek przygody z twarogami, serami świeżymi i podpuszczkowymi.",
    description:
      "Produkt edukacyjny, który pomaga rozwijać kategorię wizerunkowo i sprzedażowo.",
    longDescription:
      "Serowarstwo potrzebuje klarownej, przyjaznej prezentacji i mocnego wsparcia merytorycznego. Zestaw startowy robi dokładnie to: prowadzi klienta za rękę i daje gotowy punkt wejścia do niszy, która buduje zaangażowanie i powracalność.",
    image: "/assets/zestaw.webp",
    basePrice: 139,
    tags: ["sery", "zestaw", "starterowe", "home lab"],
    rating: 4.7,
    reviews: 118,
    soldBase: 57,
    viewingBase: 13,
    popularityBase: 79,
    benefits: [
      "Ułatwia start w bardziej eksperckiej kategorii.",
      "Wspiera wizerunek sklepu jako partnera edukacyjnego.",
      "Nadaje się do rozbudowy o poradniki i content sprzedażowy.",
    ],
    features: [
      "Formy i chusta w zestawie.",
      "Kultury starterowe na start.",
      "Czytelny produkt dla początkujących i ambitnych domowych twórców.",
    ],
    specs: [
      { label: "Format", value: "starter bundle" },
      { label: "Poziom", value: "beginner / hobby" },
      { label: "Atut", value: "edukacyjny onboarding" },
      { label: "Komunikacja", value: "content + commerce" },
    ],
    faq: [
      {
        question: "Czy wymaga dużego doświadczenia?",
        answer: "Nie, to właśnie produkt, który ma obniżać barierę wejścia.",
      },
      {
        question: "Dlaczego jest ważny dla prototypu?",
        answer:
          "Pokazuje, że sklep umie prowadzić klienta także w bardziej eksperckich niszach.",
      },
    ],
    variantLabels: ["Home", "Studio", "Farm"],
  },
  {
    id: "mikrobrowar-start",
    slug: "mikrobrowar-start",
    title: "Mikrobrowar Start: fermentor, rurka i kapslownica",
    subtitle: "Pewny zestaw wejściowy do warzenia własnego piwa w domu",
    categoryId: "piwowarstwo",
    shortDescription:
      "Pewny zestaw wejściowy do warzenia własnego piwa w domu.",
    description:
      "Starter produktowy w kategorii, która lubi społeczność i regularne powroty.",
    longDescription:
      "Piwowarstwo dobrze reaguje na język społeczności, postępu i pierwszej udanej warki. Ten produkt jest w prototypie zaprojektowany tak, by wspierać właśnie taki model komunikacji i zachęcać do kolejnych zakupów.",
    image: "/assets/zestaw.webp",
    basePrice: 169,
    tags: ["piwo", "mikrobrowar", "fermentor", "kapslownica"],
    rating: 4.8,
    reviews: 133,
    soldBase: 65,
    viewingBase: 16,
    popularityBase: 83,
    benefits: [
      "Tworzy wyraźny punkt wejścia do piwowarstwa.",
      "Pozwala prowadzić klienta przez cały proces i kolejne zakupy.",
      "Jest wdzięczny do komunikacji społecznościowej i poradnikowej.",
    ],
    features: [
      "Fermentor i kapslownica w komplecie.",
      "Produkt zrozumiały nawet bez specjalistycznego słownictwa.",
      "Dobrze działa w kampaniach 'zacznij dziś'.",
    ],
    specs: [
      { label: "Format", value: "starter set" },
      { label: "Proces", value: "warzenie i butelkowanie" },
      { label: "Poziom", value: "entry-level" },
      { label: "Atut", value: "pełny pierwszy krok" },
    ],
    faq: [
      {
        question: "Czy to wystarczy na start?",
        answer: "Tak, produkt został opisany właśnie jako pierwszy sensowny krok do własnej warki.",
      },
      {
        question: "Jak zwiększyć jego skuteczność?",
        answer:
          "Przez dodanie składników i akcesoriów do sekcji 'kup razem' oraz w koszyku.",
      },
    ],
    variantLabels: ["20 L", "30 L", "40 L"],
  },
  {
    id: "kamien-do-pizzy",
    slug: "kamien-do-pizzy",
    title: "Kamień do pizzy i pieczywa z łopatą startową",
    subtitle: "Dla wypieków o chrupiącej skórce i równym wypieku",
    categoryId: "piekarnictwo",
    shortDescription:
      "Dla domowych wypieków o chrupiącej skórce i równym wypieku.",
    description:
      "Lifestyle'owy produkt, który poprawia wizualną atrakcyjność całej kategorii.",
    longDescription:
      "Kamień do pizzy pomaga sklepowi wyglądać nowocześnie i inspiracyjnie. To dobry kontrapunkt dla bardziej technicznych kategorii i świetny materiał na estetyczne sekcje home, mobile merchandising oraz kampanie rodzinne.",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    basePrice: 109,
    tags: ["pizza", "wypieki", "kamień", "łopata"],
    rating: 4.7,
    reviews: 96,
    soldBase: 54,
    viewingBase: 12,
    popularityBase: 76,
    benefits: [
      "Dodaje sklepowi lifestylowego charakteru.",
      "Świetnie wygląda na home i w kampaniach wizualnych.",
      "Zwiększa szanse na zakupy impulsowe poza główną niszą.",
    ],
    features: [
      "Kamień i łopata w jednym pakiecie.",
      "Jasne zastosowanie dla pizzy i pieczywa.",
      "Nadaje się do komunikacji rodzinnej i weekendowej.",
    ],
    specs: [
      { label: "Zastosowanie", value: "pizza i pieczywo" },
      { label: "Format", value: "kamień + łopata" },
      { label: "Poziom", value: "home cooking" },
      { label: "Atut", value: "efekt wow w kuchni" },
    ],
    faq: [
      {
        question: "Czy to tylko produkt do pizzy?",
        answer: "Nie, mock komunikuje go też jako akcesorium do pieczywa i wypieków rzemieślniczych.",
      },
      {
        question: "Dlaczego warto go mieć w sklepie BROWIN?",
        answer:
          "Bo poszerza język marki o obszary lifestyle, rodzinę i weekendową przyjemność.",
      },
    ],
    variantLabels: ["33 cm", "38 cm", "Premium"],
  },
  {
    id: "pakiet-przetwory",
    slug: "pakiet-przetwory",
    title: "Pakiet do domowych przetworów i sezonowych zapasów",
    subtitle: "Zbiorczy produkt demonstracyjny dla kampanii sezonowych",
    categoryId: "domiogrod",
    shortDescription:
      "Zbiorczy produkt demonstracyjny dla kampanii sezonowych i akcji promocyjnych.",
    description:
      "Kategoria sezonowa z dużym potencjałem częstotliwości i akcji ograniczonych czasowo.",
    longDescription:
      "Pakiet do przetworów pokazuje, jak łatwo można budować sezonowe mikrokampanie w obrębie tego samego storefrontu. To także dobry przykład produktu, który pozwala wzmacniać komunikaty o pilności i dostępności bez sztucznego efektu.",
    image: "/assets/baner-27.02-wielkanoc5.webp",
    basePrice: 79,
    tags: ["przetwory", "sezon", "słoiki", "pakiet"],
    rating: 4.6,
    reviews: 74,
    soldBase: 83,
    viewingBase: 19,
    popularityBase: 81,
    benefits: [
      "Napędza częste wizyty w sezonie i wysoką dynamikę promocji.",
      "Ułatwia komunikację ograniczonej dostępności bez przesady.",
      "Dobrze domyka koszyk przy zakupach impulsowych.",
    ],
    features: [
      "Skierowany pod akcje sezonowe.",
      "Nadaje się do mocnej komunikacji promocyjnej.",
      "Może być rozwijany o lokalne kampanie i bundle'e.",
    ],
    specs: [
      { label: "Format", value: "pakiet sezonowy" },
      { label: "Kategoria", value: "dom i ogród" },
      { label: "Atut", value: "promocje i pilność" },
      { label: "Komunikacja", value: "akcje ograniczone czasowo" },
    ],
    faq: [
      {
        question: "Czy to produkt pod sezon?",
        answer: "Tak, został przygotowany jako modelowa pozycja do kampanii sezonowych.",
      },
      {
        question: "Jak najlepiej go sprzedawać?",
        answer:
          "Poprzez szybkie CTA, komunikat o czasie i zestawienie z kategoriami pomocniczymi.",
      },
    ],
    variantLabels: ["12 słoików", "24 słoiki", "48 słoików"],
  },
];

export const products: Product[] = seeds.flatMap((seed, seedIndex) =>
  lineProfiles.map((profile, profileIndex) => {
    const images = buildGallery(seed.image, seedIndex + profileIndex);
    const productId = `${seed.id}-${profile.key}`;

    const variants = seed.variantLabels.map((label, variantIndex) => {
      const price = roundPrice(
        seed.basePrice * profile.multiplier * (1 + variantIndex * 0.16),
      );
      const compareAtPrice = seed.compareAtPrice
        ? roundPrice(seed.compareAtPrice * profile.multiplier * (1 + variantIndex * 0.16))
        : variantIndex === 0 && profileIndex > 0
          ? roundPrice(price * 1.12)
          : undefined;

      return {
        id: `${productId}-${variantIndex + 1}`,
        label,
        sku: `${seed.id.toUpperCase().slice(0, 8)}-${profile.key.toUpperCase()}-${variantIndex + 1}`,
        price,
        compareAtPrice,
        stock: Math.max(profile.stockBase - variantIndex * 4 + seedIndex, 3),
        leadTime: variantIndex === 2 ? "48h" : "24h",
        badge: compareAtPrice ? "Promocja" : profile.badge,
      };
    });

    const hasCompareAtPrice = variants.some((variant) => variant.compareAtPrice);
    const status = resolveStatus(
      profileIndex === 0 ? seed.badge : profile.badge,
      profile.badge,
      hasCompareAtPrice,
    );

    const symbol = generateSymbol(productId);
    const ean = generateEan(productId);

    // Demo: karta produktu zawsze; instrukcje dla Expert/Atelier (wyższe linie).
    const files: ProductFile[] = [
      {
        label: `Karta produktu ${symbol}`,
        href: `/files/${symbol}-karta-produktu.pdf`,
        type: "karta-produktu",
        sizeLabel: "480 KB",
      },
    ];
    if (profileIndex >= 2) {
      files.push({
        label: "Instrukcja obsługi",
        href: `/files/${symbol}-instrukcja.pdf`,
        type: "instrukcja",
        sizeLabel: "2.4 MB",
      });
      files.push({
        label: "Instrukcja bezpieczeństwa produktów konsumenckich",
        href: `/files/instrukcja-bezpieczenstwa.pdf`,
        type: "bezpieczenstwo",
        sizeLabel: "310 KB",
      });
    }

    return {
      id: productId,
      baseProductId: seed.id,
      baseSlug: seed.slug,
      slug: `${seed.slug}-${profile.key}`,
      symbol,
      ean,
      title: seed.title,
      subtitle: `${seed.subtitle} • ${profile.line}`,
      line: profile.line,
      categoryId: seed.categoryId,
      shortDescription: seed.shortDescription,
      description: seed.description,
      longDescription: seed.longDescription,
      images,
      badge: profileIndex === 0 ? seed.badge : profile.badge,
      status,
      tags: [...seed.tags, profile.line.toLowerCase()],
      rating: Number(Math.min(seed.rating + profileIndex * 0.05, 5).toFixed(1)),
      reviews: seed.reviews + profile.reviewBoost + seedIndex * 3,
      soldLast30Days: seed.soldBase + profileIndex * 12,
      viewingNow: seed.viewingBase + profileIndex * 3,
      popularityScore: seed.popularityBase + profile.popularityBoost,
      newestOrder: profileIndex * 100 + (seeds.length - seedIndex),
      benefits: seed.benefits,
      features: seed.features,
      specs: seed.specs,
      faq: seed.faq,
      files,
      complementaryProductIds: [],
      variants,
    };
  }),
);

// Produkty uzupełniające: resolwowane deterministycznie po zbudowaniu pełnej listy,
// żeby móc odwołać się do id innych produktów (akcesoria z innej kategorii, ten sam
// profil linii). Bez tej separacji byłby problem kurczaka i jaja.
const buildComplementaryIds = (product: Product): string[] => {
  const sameLineDifferentCategory = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.line === product.line &&
      candidate.categoryId !== product.categoryId,
  );
  return sameLineDifferentCategory
    .slice(0, 8)
    .map((candidate) => candidate.id);
};

products.forEach((product) => {
  product.complementaryProductIds = buildComplementaryIds(product);
});
