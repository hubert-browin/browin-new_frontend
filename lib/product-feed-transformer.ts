import type {
  Product,
  ProductBundleItem,
  ProductFile,
  ProductSpec,
  ProductStatus,
  ProductTaxonomy,
  ProductVariant,
} from "../data/products";
import type { CategoryId } from "../data/store";

const BROWIN_BASE_URL = "https://browin.pl";
const DEFAULT_PRODUCT_PLACEHOLDER = "/assets/produkt1.webp";

const categoryAliasMap: Record<string, CategoryId | null> = {
  "black-week": null,
  "dom-i-ogrod": "domiogrod",
  "domowe-wino-must-have": null,
  "dzien-matki": null,
  gorzelnictwo: "gorzelnictwo",
  okazje: "domiogrod",
  "oferta-swiateczna": null,
  piekarnictwo: "piekarnictwo",
  piwowarstwo: "piwowarstwo",
  "produkty-spozywcze": "domiogrod",
  przetworstwo: "domiogrod",
  serowarstwo: "serowarstwo",
  "stacje-pogody": "termometry",
  termometry: "termometry",
  wedliniarstwo: "wedliniarstwo",
  winiarstwo: "winiarstwo",
  "wyrob-jogurtu": "serowarstwo",
  "wyrob-masla": "serowarstwo",
  "wyrob-sera": "serowarstwo",
};

type BrowinJsonPhoto = {
  large?: string | null;
  medium?: string | null;
  small?: string | null;
};

type BrowinJsonDocument = {
  dokument?: string | null;
  nazwa?: string | null;
};

type BrowinJsonAttribute = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  value?: unknown;
};

type BrowinJsonCategoryEntry = {
  kategoria?: {
    nazwa?: string | null;
    slug?: string | null;
  } | null;
  linia?: {
    nazwa?: string | null;
    slug?: string | null;
  } | null;
  podkategoria?: {
    nazwa?: string | null;
    slug?: string | null;
  } | null;
};

type BrowinJsonBundleItem = {
  id?: string | null;
  ilosc?: number | null;
  nazwa?: string | null;
  slug?: string | null;
  zdjecie?: string | null;
};

export type BrowinJsonProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  attributes?: BrowinJsonAttribute[] | null;
  base_price?: number | null;
  brand?: string | null;
  categories?: BrowinJsonCategoryEntry[] | null;
  dane_zestawu?: BrowinJsonBundleItem[] | null;
  deklaracjazgodnosci?: string | null;
  description?: string | null;
  description_text?: string | null;
  documents?: BrowinJsonDocument[] | null;
  ean?: string | null;
  img?: string | null;
  instrukcja?: string[] | null;
  instrukcja_bezpieczenstwa_pl?: string | null;
  jednostka_opj?: string | null;
  karta_charakterystyki?: string | null;
  kartaproduktu?: string | null;
  komplementarne?: string[] | null;
  name_keyword?: string | null;
  photos?: BrowinJsonPhoto[] | null;
  promo?: string[] | null;
  similar_products?: string[] | null;
  status?: string | null;
  tags?: string[] | null;
  ukryty_na_www?: boolean | null;
  unit?: string | null;
  zawartosc_opj?: number | null;
  zawartosc_opz?: number | null;
  zdjecie?: string | null;
  zestaw?: boolean | null;
};

const normalizeWhitespace = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/([.!?;:])(?=[^\s])/g, "$1 ")
    .replace(/([a-z0-9ąćęłńóśźż])([A-ZĄĆĘŁŃÓŚŹŻ])/g, "$1 $2")
    .replace(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const normalizeValue = (value: string) =>
  value
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ");

const takeFirstSentence = (value: string) => {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return sentences[0] ?? normalized;
};

const slugify = (value: string) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const stableHash = (value: string) =>
  value.split("").reduce((hash, character, index) => {
    return (hash * 33 + character.charCodeAt(0) + index * 17) % 1_000_003;
  }, 5381);

const toAbsoluteUrl = (value: string) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `${BROWIN_BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};

const buildStaticImageUrl = (fileName?: string | null) => {
  const normalized = normalizeValue(fileName ?? "");

  if (!normalized) {
    return "";
  }

  return `${BROWIN_BASE_URL}/static/images/1600/${normalized.replace(/^\/+/, "")}`;
};

const buildApiImageUrl = (fileName?: string | null) => {
  const normalized = normalizeValue(fileName ?? "");

  if (!normalized) {
    return undefined;
  }

  return `${BROWIN_BASE_URL}/api/image-link/${normalized.replace(/^\/+/, "")}`;
};

const buildDocUrl = (folder: string, fileName?: string | null) => {
  const normalized = normalizeValue(fileName ?? "");

  if (!normalized) {
    return undefined;
  }

  return `${BROWIN_BASE_URL}/static/docs/${folder}/${normalized.replace(/^\/+/, "")}`;
};

const humanizeFileName = (value: string) => {
  const withoutExtension = value.replace(/\.[^.]+$/, "");
  const normalized = normalizeWhitespace(
    withoutExtension.replace(/[_-]+/g, " ").replace(/\s{2,}/g, " "),
  );

  if (!normalized) {
    return "Dokument PDF";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatQuantity = (value?: number | null) => {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 1;
  }

  return Number.isInteger(numericValue) ? numericValue : Number(numericValue.toFixed(2));
};

const formatAttributeValue = (value: unknown) => {
  if (value === null || value === undefined || value === false || value === "") {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Tak" : "";
  }

  if (Array.isArray(value)) {
    return normalizeWhitespace(
      value
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean)
        .join(", "),
    );
  }

  return normalizeWhitespace(String(value));
};

const sanitizeDescriptionHtml = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const withoutEmbeds = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[\[yt:[^\]]+\]\]/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "");

  const sanitized = withoutEmbeds.replace(/<\s*\/?\s*([a-z0-9-]+)([^>]*)>/gi, (match, tagName) => {
    const normalizedTag = String(tagName).toLowerCase();
    const isClosing = /^<\s*\//.test(match);

    if (!["p", "br", "ul", "ol", "li", "strong", "em", "h2", "h3"].includes(normalizedTag)) {
      return "";
    }

    if (normalizedTag === "br") {
      return "<br />";
    }

    const tagClasses: Record<string, string> = {
      em: "italic",
      h2: "mb-3 mt-6 text-lg font-extrabold uppercase tracking-tight text-browin-dark",
      h3: "mb-3 mt-5 text-base font-extrabold text-browin-dark",
      li: "leading-relaxed",
      ol: "mb-4 list-decimal space-y-2 pl-5",
      p: "mb-4",
      strong: "font-semibold text-browin-dark",
      ul: "mb-4 list-disc space-y-2 pl-5",
    };

    if (isClosing) {
      return `</${normalizedTag}>`;
    }

    return `<${normalizedTag} class="${tagClasses[normalizedTag]}">`;
  });

  const cleaned = sanitized
    .replace(/<p class="mb-4">\s*(<br \/>|\s)*<\/p>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned || undefined;
};

const resolveCategoryId = (lineSlug?: string | null) => {
  if (!lineSlug) {
    return undefined;
  }

  const normalizedLineSlug = slugify(lineSlug);
  const resolved = categoryAliasMap[normalizedLineSlug];

  return resolved ?? undefined;
};

const normalizeTaxonomy = (
  categories: BrowinJsonCategoryEntry[] | null | undefined,
): ProductTaxonomy[] => {
  const taxonomy: ProductTaxonomy[] = [];

  for (const entry of categories ?? []) {
    const lineName = normalizeWhitespace(entry.linia?.nazwa ?? "");
    const lineSlug = slugify(entry.linia?.slug ?? entry.linia?.nazwa ?? "");
    const categoryName = normalizeWhitespace(entry.kategoria?.nazwa ?? "");
    const categorySlug = slugify(entry.kategoria?.slug ?? entry.kategoria?.nazwa ?? "");
    const subcategoryName = normalizeWhitespace(entry.podkategoria?.nazwa ?? "");
    const subcategorySlug = slugify(entry.podkategoria?.slug ?? entry.podkategoria?.nazwa ?? "");

    if (!lineName || !categoryName) {
      continue;
    }

    taxonomy.push({
      lineName,
      lineSlug,
      categoryId: resolveCategoryId(lineSlug),
      categoryName,
      categorySlug,
      ...(subcategoryName ? { subcategoryName, subcategorySlug } : {}),
    });
  }

  return taxonomy;
};

const pickPrimaryTaxonomy = (taxonomy: ProductTaxonomy[]) =>
  taxonomy.find((entry) => entry.categoryId) ?? taxonomy[0] ?? null;

const dedupeStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeValue(value ?? "");

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const getImageDeduplicationKey = (value: string) => {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized, BROWIN_BASE_URL);

    return url.pathname.replace(/\/static\/images\/\d+\//, "/static/images/").toLowerCase();
  } catch {
    return normalized
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/\/static\/images\/\d+\//, "/static/images/")
      .toLowerCase();
  }
};

const dedupeImageUrls = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeValue(value ?? "");

    if (!normalized) {
      continue;
    }

    const key = getImageDeduplicationKey(normalized) || normalized;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const buildTags = (rawProduct: BrowinJsonProduct, taxonomy: ProductTaxonomy[]) =>
  dedupeStrings([
    ...(rawProduct.tags ?? []),
    rawProduct.name_keyword ?? undefined,
    ...taxonomy.flatMap((entry) => [
      entry.lineName,
      entry.categoryName,
      entry.subcategoryName,
    ]),
  ]);

const buildImages = (rawProduct: BrowinJsonProduct) => {
  const resolvedImages = dedupeImageUrls(
    (rawProduct.photos ?? []).map((photo) => {
      const preferredPhotoUrl = photo.large ?? photo.medium ?? photo.small;

      return preferredPhotoUrl ? toAbsoluteUrl(preferredPhotoUrl) : undefined;
    }),
  );

  if (resolvedImages.length > 0) {
    return resolvedImages;
  }

  const fallbackImage = buildStaticImageUrl(rawProduct.img ?? rawProduct.zdjecie);

  return fallbackImage ? [fallbackImage] : [DEFAULT_PRODUCT_PLACEHOLDER];
};

const buildBundleItems = (rawProduct: BrowinJsonProduct): ProductBundleItem[] =>
  (rawProduct.dane_zestawu ?? [])
    .map((item) => {
      const name = normalizeWhitespace(item.nazwa ?? "");

      if (!name) {
        return null;
      }

      return {
        id: normalizeValue(item.id ?? "") || slugify(name),
        ...(item.slug ? { slug: normalizeValue(item.slug) } : {}),
        ...(buildApiImageUrl(item.zdjecie) ? { image: buildApiImageUrl(item.zdjecie) } : {}),
        name,
        quantity: formatQuantity(item.ilosc),
      };
    })
    .filter((item): item is ProductBundleItem => Boolean(item));

const buildFiles = (rawProduct: BrowinJsonProduct): ProductFile[] => {
  const files: ProductFile[] = [];
  const seen = new Set<string>();

  const pushFile = (file: ProductFile | null) => {
    if (!file || seen.has(file.href)) {
      return;
    }

    seen.add(file.href);
    files.push(file);
  };

  for (const fileName of rawProduct.instrukcja ?? []) {
    const href = buildDocUrl("instrukcje", fileName);

    pushFile(
      href
        ? {
            label: "Instrukcja obsługi",
            href,
            type: "instrukcja",
          }
        : null,
    );
  }

  if (rawProduct.instrukcja_bezpieczenstwa_pl) {
    const href = buildDocUrl("instrukcje", rawProduct.instrukcja_bezpieczenstwa_pl);

    pushFile(
      href
        ? {
            label: "Instrukcja bezpieczeństwa",
            href,
            type: "bezpieczenstwo",
          }
        : null,
    );
  }

  if (rawProduct.deklaracjazgodnosci) {
    const href = buildDocUrl("deklaracje", rawProduct.deklaracjazgodnosci);

    pushFile(
      href
        ? {
            label: "Deklaracja zgodności",
            href,
            type: "deklaracja",
          }
        : null,
    );
  }

  if (rawProduct.kartaproduktu) {
    const href = buildDocUrl("karty", rawProduct.kartaproduktu);

    pushFile(
      href
        ? {
            label: "Karta produktu",
            href,
            type: "karta-produktu",
          }
        : null,
    );
  }

  if (rawProduct.karta_charakterystyki) {
    const href = buildDocUrl("karty", rawProduct.karta_charakterystyki);

    pushFile(
      href
        ? {
            label: "Karta charakterystyki",
            href,
            type: "karta-charakterystyki",
          }
        : null,
    );
  }

  for (const document of rawProduct.documents ?? []) {
    const href = buildDocUrl("karty", document.dokument);

    pushFile(
      href
        ? {
            label: normalizeWhitespace(document.nazwa ?? "") || humanizeFileName(document.dokument ?? ""),
            href,
            type: "inne",
          }
        : null,
    );
  }

  return files;
};

const buildCategoryLabel = (taxonomy: ProductTaxonomy[]) => {
  const primaryTaxonomy = pickPrimaryTaxonomy(taxonomy);

  if (!primaryTaxonomy) {
    return "";
  }

  return primaryTaxonomy.subcategoryName ?? primaryTaxonomy.categoryName;
};

const buildCategoryPath = (taxonomy: ProductTaxonomy[]) => {
  const primaryTaxonomy = pickPrimaryTaxonomy(taxonomy);

  if (!primaryTaxonomy) {
    return "";
  }

  return [primaryTaxonomy.lineName, primaryTaxonomy.categoryName, primaryTaxonomy.subcategoryName]
    .filter(Boolean)
    .join(" > ");
};

const buildSpecs = ({
  rawProduct,
  categoryPath,
  compareAtPrice,
  bundleItems,
  taxonomy,
}: {
  rawProduct: BrowinJsonProduct;
  categoryPath: string;
  compareAtPrice?: number;
  bundleItems: ProductBundleItem[];
  taxonomy: ProductTaxonomy[];
}) => {
  const specs: ProductSpec[] = [];
  const seen = new Set<string>();

  const pushSpec = (label: string, value?: string) => {
    const normalizedLabel = normalizeWhitespace(label);
    const normalizedValue = normalizeWhitespace(value ?? "");
    const key = `${normalizedLabel}::${normalizedValue}`;

    if (!normalizedLabel || !normalizedValue || seen.has(key)) {
      return;
    }

    seen.add(key);
    specs.push({ label: normalizedLabel, value: normalizedValue });
  };

  pushSpec("Marka", rawProduct.brand ?? undefined);
  pushSpec("EAN", rawProduct.ean ?? undefined);
  pushSpec("Linia", pickPrimaryTaxonomy(taxonomy)?.lineName);
  pushSpec("Kategoria", categoryPath);
  pushSpec("Jednostka", rawProduct.jednostka_opj ?? rawProduct.unit ?? undefined);

  if (Number.isFinite(rawProduct.zawartosc_opj)) {
    pushSpec(
      "Zawartość opakowania",
      `${Number(rawProduct.zawartosc_opj).toLocaleString("pl-PL")} ${normalizeWhitespace(rawProduct.jednostka_opj ?? rawProduct.unit ?? "")}`.trim(),
    );
  }

  if (Number.isFinite(rawProduct.zawartosc_opz)) {
    pushSpec(
      "Minimalna ilość zbiorcza",
      `${Number(rawProduct.zawartosc_opz).toLocaleString("pl-PL")} ${normalizeWhitespace(rawProduct.jednostka_opj ?? rawProduct.unit ?? "")}`.trim(),
    );
  }

  if (compareAtPrice && compareAtPrice > rawProduct.price) {
    pushSpec("Cena katalogowa", `${compareAtPrice.toFixed(2)} zł`);
  }

  if (bundleItems.length > 0 || rawProduct.zestaw) {
    pushSpec("Typ oferty", "Zestaw");
  }

  for (const attribute of rawProduct.attributes ?? []) {
    const label = normalizeWhitespace(attribute.name ?? "");
    const value = formatAttributeValue(attribute.value);

    pushSpec(label, value);
  }

  return specs;
};

const buildFaq = ({
  bundleItems,
  categoryPath,
  compareAtPrice,
  files,
}: {
  bundleItems: ProductBundleItem[];
  categoryPath: string;
  compareAtPrice?: number;
  files: ProductFile[];
}) => {
  const faq = [
    {
      question: "Do jakiej kategorii należy ten produkt?",
      answer: categoryPath || "Produkt jest dostępny w katalogu BROWIN.",
    },
  ];

  if (bundleItems.length > 0) {
    faq.push({
      question: "Co znajduje się w zestawie?",
      answer: bundleItems
        .map((item) => `${item.quantity} × ${item.name}`)
        .join(", "),
    });
  }

  if (compareAtPrice) {
    faq.push({
      question: "Czy produkt jest obecnie przeceniony?",
      answer: "Tak, karta produktu zawiera aktualną cenę oraz cenę katalogową do porównania.",
    });
  }

  if (files.length > 0) {
    faq.push({
      question: "Czy do produktu są dostępne pliki do pobrania?",
      answer: `Tak, przygotowaliśmy ${files.length} plik${files.length === 1 ? "" : files.length < 5 ? "i" : "ów"} do pobrania na karcie produktu.`,
    });
  }

  return faq;
};

const buildVariant = (rawProduct: BrowinJsonProduct, compareAtPrice?: number): ProductVariant => {
  const hash = stableHash(rawProduct.id);
  const stockProfile = hash % 7;
  const stock = stockProfile === 0 ? 0 : 4 + (hash % 19);

  return {
    id: `${rawProduct.id}-default`,
    label: "",
    sku: rawProduct.id,
    price: Number(rawProduct.price.toFixed(2)),
    ...(compareAtPrice ? { compareAtPrice: Number(compareAtPrice.toFixed(2)) } : {}),
    stock,
    leadTime: stock > 0 ? (stockProfile > 3 ? "48" : "24") : "168",
    availabilityLabel:
      stock > 0
        ? stockProfile > 4
          ? "Ograniczona dostępność"
          : "Dostępny"
        : "Czasowo niedostępny",
  };
};

const resolveStatus = (rawStatus?: string | null): ProductStatus => {
  const normalizedStatus = normalizeWhitespace(rawStatus ?? "").toUpperCase();

  if (normalizedStatus === "NOWOSC") {
    return "nowosc";
  }

  if (normalizedStatus === "WYPRZEDAZ") {
    return "wyprzedaz";
  }

  return "standard";
};

const buildMetrics = ({
  rawProduct,
  status,
  bundleItemsCount,
  documentsCount,
  index,
  totalItems,
}: {
  rawProduct: BrowinJsonProduct;
  status: ProductStatus;
  bundleItemsCount: number;
  documentsCount: number;
  index: number;
  totalItems: number;
}) => {
  const hash = stableHash(rawProduct.id);
  const rating = Number((4.1 + (hash % 9) / 10).toFixed(1));
  const reviews = 12 + (hash % 240);
  const soldLast30Days = 4 + (hash % 90);
  const viewingNow = 1 + (hash % 14);
  const popularityScore =
    reviews +
    soldLast30Days * 2 +
    documentsCount * 4 +
    bundleItemsCount * 6 +
    (status === "nowosc" ? 40 : 0);

  return {
    rating,
    reviews,
    soldLast30Days,
    viewingNow,
    popularityScore,
    newestOrder: totalItems - index + (status === "nowosc" ? 50 : 0),
  };
};

const buildLongDescription = (rawProduct: BrowinJsonProduct) =>
  normalizeWhitespace(
    (rawProduct.description_text ?? stripHtml(rawProduct.description ?? "")).replace(
      /\[\[yt:[^\]]+\]\]/gi,
      " ",
    ),
  );

export const transformBrowinProduct = (
  rawProduct: BrowinJsonProduct,
  index: number,
  totalItems: number,
): Product | null => {
  if (!rawProduct.id || !rawProduct.slug || !rawProduct.name || typeof rawProduct.price !== "number") {
    return null;
  }

  if (rawProduct.ukryty_na_www === true) {
    return null;
  }

  const taxonomy = normalizeTaxonomy(rawProduct.categories);
  const primaryTaxonomy = pickPrimaryTaxonomy(taxonomy);
  const categoryId = primaryTaxonomy?.categoryId;

  if (!categoryId) {
    return null;
  }

  const compareAtPrice =
    typeof rawProduct.base_price === "number" && rawProduct.base_price > rawProduct.price
      ? rawProduct.base_price
      : undefined;
  const bundleItems = buildBundleItems(rawProduct);
  const files = buildFiles(rawProduct);
  const status = resolveStatus(rawProduct.status);
  const longDescription = buildLongDescription(rawProduct);
  const shortDescription = takeFirstSentence(longDescription) || normalizeWhitespace(rawProduct.name);
  const categoryPath = buildCategoryPath(taxonomy);
  const variant = buildVariant(rawProduct, compareAtPrice);
  const metrics = buildMetrics({
    rawProduct,
    status,
    bundleItemsCount: bundleItems.length,
    documentsCount: files.length,
    index,
    totalItems,
  });
  const relatedProductIds = dedupeStrings(rawProduct.similar_products ?? []).filter(
    (id) => id !== rawProduct.id,
  );
  const complementaryProductIds = dedupeStrings(rawProduct.komplementarne ?? []).filter(
    (id) => id !== rawProduct.id,
  );
  const tags = buildTags(rawProduct, taxonomy);
  const attributeTokens = dedupeStrings(
    (rawProduct.attributes ?? []).flatMap((attribute) => [
      attribute.name ?? undefined,
      formatAttributeValue(attribute.value),
    ]),
  );
  const bundleTokens = bundleItems.map((item) => item.name);
  const descriptionHtml = sanitizeDescriptionHtml(rawProduct.description);

  return {
    id: rawProduct.id,
    baseProductId: rawProduct.id,
    baseSlug: normalizeValue(rawProduct.slug),
    slug: normalizeValue(rawProduct.slug),
    symbol: normalizeValue(rawProduct.id),
    ean: normalizeValue(rawProduct.ean ?? rawProduct.id),
    title: normalizeWhitespace(rawProduct.name),
    subtitle: [buildCategoryLabel(taxonomy), normalizeWhitespace(rawProduct.brand ?? "BROWIN")]
      .filter(Boolean)
      .join(" · "),
    line: primaryTaxonomy.lineName,
    categoryId,
    shortDescription,
    description: shortDescription,
    longDescription,
    ...(descriptionHtml ? { descriptionHtml } : {}),
    images: buildImages(rawProduct),
    ...(status === "nowosc" ? { badge: "Nowość" } : {}),
    status,
    tags,
    ...metrics,
    benefits: bundleTokens,
    features: attributeTokens,
    specs: buildSpecs({
      rawProduct,
      categoryPath,
      compareAtPrice,
      bundleItems,
      taxonomy,
    }),
    faq: buildFaq({
      bundleItems,
      categoryPath,
      compareAtPrice,
      files,
    }),
    files,
    bundleItems,
    relatedProductIds,
    complementaryProductIds,
    taxonomy,
    variants: [variant],
  };
};

export const transformBrowinProducts = (rawProducts: BrowinJsonProduct[]) =>
  rawProducts
    .map((product, index, source) => transformBrowinProduct(product, index, source.length))
    .filter((product): product is Product => Boolean(product));
