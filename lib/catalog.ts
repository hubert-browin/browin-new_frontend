import { categories, type CategoryId } from "@/data/store";
import type { Product, ProductVariant } from "@/data/products";

export type SortOption =
  | "featured"
  | "newest"
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Polecane" },
  { value: "newest", label: "Najnowsze" },
  { value: "popular", label: "Najpopularniejsze" },
  { value: "rating", label: "Najlepiej oceniane" },
  { value: "price-asc", label: "Cena rosnąco" },
  { value: "price-desc", label: "Cena malejąco" },
];

export const freeShippingThreshold = 149;
const defaultProductLineSlug = "classic";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const stableHash = (value: string) =>
  value.split("").reduce((hash, character, index) => {
    return (hash * 33 + character.charCodeAt(0) + index * 17) % 1000003;
  }, 5381);

const homepageImageScore = (image: string) => {
  switch (image) {
    case "/assets/produkt2.webp":
    case "/assets/zestaw.webp":
      return 4;
    case "/assets/szynka.webp":
      return 3;
    case "/assets/baner-27.02-wielkanoc5.webp":
      return 2;
    case "/assets/produkt4.webp":
      return 1;
    default:
      return 0;
  }
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);

type ProductWithVariants = {
  variants: ProductVariant[];
};

export const getPrimaryVariant = <T extends ProductWithVariants>(product: T) => product.variants[0];

export const getVariantById = <T extends ProductWithVariants>(product: T, variantId?: string) =>
  product.variants.find((variant) => variant.id === variantId) ?? getPrimaryVariant(product);

export const getProductPrice = (product: Product) => getPrimaryVariant(product).price;

export const hasPromotion = (product: Product) =>
  product.variants.some((variant) => variant.compareAtPrice) || Boolean(product.badge);

export const getDiscountPercent = (variant: ProductVariant) => {
  if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) {
    return 0;
  }

  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
};

export const getProductDiscountPercent = (product: Product) =>
  product.variants.reduce(
    (maxDiscount, variant) => Math.max(maxDiscount, getDiscountPercent(variant)),
    0,
  );

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const getProductBySlug = (source: Product[], slug: string) =>
  source.find((product) => product.slug === slug);

export const getCanonicalProductSlug = (source: Product[], slug: string) => {
  const directMatch = getProductBySlug(source, slug);

  if (directMatch) {
    return directMatch.slug;
  }

  return (
    source.find(
      (product) =>
        product.baseSlug === slug && product.slug === `${product.baseSlug}-${defaultProductLineSlug}`,
    )?.slug ??
    source.find((product) => product.baseSlug === slug)?.slug ??
    null
  );
};

export const resolveProductSlug = (source: Product[], slug: string) => {
  const canonicalSlug = getCanonicalProductSlug(source, slug);

  if (!canonicalSlug) {
    return null;
  }

  const product = getProductBySlug(source, canonicalSlug);

  if (!product) {
    return null;
  }

  return {
    canonicalSlug,
    isAlias: canonicalSlug !== slug,
    product,
  };
};

export const matchesSearch = (product: Product, query: string) => {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  const categoryLabel =
    categories.find((category) => category.id === product.categoryId)?.label ?? "";
  const haystack = normalizeText(
    [
      product.title,
      product.subtitle,
      product.description,
      product.longDescription,
      categoryLabel,
      product.line,
      ...product.taxonomy.flatMap((taxonomy) => [
        taxonomy.lineName,
        taxonomy.categoryName,
        taxonomy.subcategoryName ?? "",
      ]),
      ...product.tags,
      ...product.features,
      ...product.benefits,
      ...product.bundleItems.map((item) => item.name),
      ...product.specs.flatMap((spec) => [spec.label, spec.value]),
    ].join(" "),
  );

  return haystack.includes(normalizedQuery);
};

export const filterProducts = ({
  source,
  query = "",
  categoryId,
  dealsOnly = false,
  inStockOnly = false,
  minPrice,
  maxPrice,
}: {
  source: Product[];
  query?: string;
  categoryId?: CategoryId;
  dealsOnly?: boolean;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}) =>
  source.filter((product) => {
    const matchesCategory = !categoryId || product.categoryId === categoryId;
    const matchesDeals = !dealsOnly || hasPromotion(product);
    const matchesStock = !inStockOnly || product.variants.some((variant) => variant.stock > 0);
    const price = getProductPrice(product);
    const matchesMinPrice = minPrice === undefined || price >= minPrice;
    const matchesMaxPrice = maxPrice === undefined || price <= maxPrice;

    return (
      matchesCategory &&
      matchesDeals &&
      matchesStock &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesSearch(product, query)
    );
  });

export const sortProducts = (source: Product[], sort: SortOption) => {
  const cloned = [...source];

  switch (sort) {
    case "newest":
      return cloned.sort((left, right) => right.newestOrder - left.newestOrder);
    case "popular":
      return cloned.sort((left, right) => right.popularityScore - left.popularityScore);
    case "rating":
      return cloned.sort(
        (left, right) => right.rating - left.rating || right.reviews - left.reviews,
      );
    case "price-asc":
      return cloned.sort((left, right) => getProductPrice(left) - getProductPrice(right));
    case "price-desc":
      return cloned.sort((left, right) => getProductPrice(right) - getProductPrice(left));
    case "featured":
    default:
      return cloned.sort((left, right) => {
        const leftScore =
          left.popularityScore +
          left.reviews / 10 +
          (left.badge === "Bestseller" ? 20 : 0) +
          (hasPromotion(left) ? 8 : 0);
        const rightScore =
          right.popularityScore +
          right.reviews / 10 +
          (right.badge === "Bestseller" ? 20 : 0) +
          (hasPromotion(right) ? 8 : 0);

        return rightScore - leftScore;
      });
  }
};

export const getFeaturedProducts = (source: Product[], limit = 8) =>
  sortProducts(source, "featured").slice(0, limit);

export const getNewestProducts = (source: Product[], limit = 8) =>
  sortProducts(source, "newest").slice(0, limit);

const getProductDedupeKey = (product: Product) => product.baseProductId || product.id;

const fillHomepageProducts = ({
  excludedProducts = [],
  fallbackProducts,
  limit,
  primaryProducts,
}: {
  excludedProducts?: Product[];
  fallbackProducts: Product[];
  limit: number;
  primaryProducts: Product[];
}) => {
  const seen = new Set(excludedProducts.map(getProductDedupeKey));
  const selected: Product[] = [];

  for (const product of [...primaryProducts, ...fallbackProducts]) {
    const dedupeKey = getProductDedupeKey(product);

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    selected.push(product);

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
};

export const getHomepageNewestProducts = (source: Product[], limit = 12) =>
  fillHomepageProducts({
    fallbackProducts: sortProducts(source, "newest"),
    limit,
    primaryProducts: sortProducts(
      source.filter((product) => product.status === "nowosc"),
      "newest",
    ),
  });

export const getHomepageBestsellerProducts = (source: Product[], limit = 12) =>
  fillHomepageProducts({
    fallbackProducts: sortProducts(source, "featured"),
    limit,
    primaryProducts: [...source].sort((left, right) => {
      const leftBadgeScore = left.badge === "Bestseller" ? 1 : 0;
      const rightBadgeScore = right.badge === "Bestseller" ? 1 : 0;

      return (
        rightBadgeScore - leftBadgeScore ||
        right.soldLast30Days - left.soldLast30Days ||
        right.popularityScore - left.popularityScore ||
        right.rating - left.rating ||
        right.reviews - left.reviews
      );
    }),
  });

export const getHomepageDealProducts = (source: Product[], limit = 12) =>
  fillHomepageProducts({
    fallbackProducts: sortProducts(source, "featured"),
    limit,
    primaryProducts: source
      .filter(
        (product) =>
          product.status === "wyprzedaz" || getProductDiscountPercent(product) > 0,
      )
      .sort((left, right) => {
        const discountDiff =
          getProductDiscountPercent(right) - getProductDiscountPercent(left);

        return (
          discountDiff ||
          right.popularityScore - left.popularityScore ||
          right.soldLast30Days - left.soldLast30Days
        );
      }),
  });

const isBundleProduct = (product: Product) => {
  if (product.bundleItems.length > 0) {
    return true;
  }

  const bundleHaystack = normalizeText(
    [
      product.title,
      product.subtitle,
      product.line,
      ...product.tags,
      ...product.taxonomy.flatMap((taxonomy) => [
        taxonomy.categoryName,
        taxonomy.subcategoryName ?? "",
      ]),
    ].join(" "),
  );

  return (
    bundleHaystack.includes("zestaw") ||
    bundleHaystack.includes("starter") ||
    bundleHaystack.includes("mikrobrowar")
  );
};

export const getHomepageBundleProducts = (source: Product[], limit = 12) =>
  fillHomepageProducts({
    fallbackProducts: sortProducts(source, "featured"),
    limit,
    primaryProducts: source
      .filter(isBundleProduct)
      .sort(
        (left, right) =>
          right.bundleItems.length - left.bundleItems.length ||
          right.popularityScore - left.popularityScore ||
          right.soldLast30Days - left.soldLast30Days,
      ),
  });

export const getHomepageForYouProducts = (
  source: Product[],
  limit = 12,
  excludedProducts: Product[] = [],
) =>
  fillHomepageProducts({
    excludedProducts,
    fallbackProducts: sortProducts(source, "newest"),
    limit,
    primaryProducts: sortProducts(source, "popular"),
  });

export const getHomepageShowcaseProducts = (source: Product[], limit = 16) =>
  [...source]
    .sort((left, right) => {
      const imageScoreDiff =
        homepageImageScore(right.images[0] ?? "") - homepageImageScore(left.images[0] ?? "");

      if (imageScoreDiff !== 0) {
        return imageScoreDiff;
      }

      const leftScore = stableHash(`${left.slug}-browin-home`);
      const rightScore = stableHash(`${right.slug}-browin-home`);

      return leftScore - rightScore;
    })
    .slice(0, limit);

export const getHeroRailProducts = (source: Product[], limit = 14) =>
  sortProducts(source, "popular").slice(0, limit);

export const getRelatedProducts = (source: Product[], product: Product, limit = 4) =>
  (() => {
    const index = new Map(source.map((candidate) => [candidate.id, candidate]));
    const seen = new Set<string>();
    const directMatches: Product[] = [];

    for (const id of product.relatedProductIds) {
      const candidate = index.get(id);

      if (!candidate || seen.has(candidate.baseProductId) || candidate.id === product.id) {
        continue;
      }

      seen.add(candidate.baseProductId);
      directMatches.push(candidate);

      if (directMatches.length >= limit) {
        return directMatches;
      }
    }

    const fallbackMatches = sortProducts(
      source.filter(
        (candidate) =>
          candidate.baseProductId !== product.baseProductId &&
          candidate.categoryId === product.categoryId &&
          !seen.has(candidate.baseProductId),
      ),
      "featured",
    )
      .filter((candidate, candidateIndex, filteredSource) => {
        return (
          filteredSource.findIndex(
            (entry) => entry.baseProductId === candidate.baseProductId,
          ) === candidateIndex
        );
      })
      .slice(0, Math.max(0, limit - directMatches.length));

    return [...directMatches, ...fallbackMatches].slice(0, limit);
  })();

export const getComplementaryProducts = (
  source: Product[],
  product: Product,
  limit = 8,
): Product[] => {
  if (product.complementaryProductIds.length === 0) return [];
  const index = new Map(source.map((candidate) => [candidate.id, candidate]));
  const seen = new Set<string>();
  const result: Product[] = [];

  for (const id of product.complementaryProductIds) {
    const candidate = index.get(id);

    if (!candidate || seen.has(candidate.baseProductId)) {
      continue;
    }

    seen.add(candidate.baseProductId);
    result.push(candidate);

    if (result.length >= limit) {
      break;
    }
  }

  return result;
};
