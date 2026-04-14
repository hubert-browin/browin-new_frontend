import { categories, type CategoryId } from "@/data/store";
import { products, type Product, type ProductVariant } from "@/data/products";

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

export const getPrimaryVariant = (product: Product) => product.variants[0];

export const getVariantById = (product: Product, variantId?: string) =>
  product.variants.find((variant) => variant.id === variantId) ?? getPrimaryVariant(product);

export const getProductPrice = (product: Product) => getPrimaryVariant(product).price;

export const hasPromotion = (product: Product) =>
  product.variants.some((variant) => variant.compareAtPrice);

export const getDiscountPercent = (variant: ProductVariant) => {
  if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) {
    return 0;
  }

  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
};

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getCanonicalProductSlug = (slug: string) => {
  const directMatch = getProductBySlug(slug);

  if (directMatch) {
    return directMatch.slug;
  }

  return (
    products.find(
      (product) =>
        product.baseSlug === slug && product.slug === `${product.baseSlug}-${defaultProductLineSlug}`,
    )?.slug ??
    products.find((product) => product.baseSlug === slug)?.slug ??
    null
  );
};

export const resolveProductSlug = (slug: string) => {
  const canonicalSlug = getCanonicalProductSlug(slug);

  if (!canonicalSlug) {
    return null;
  }

  const product = getProductBySlug(canonicalSlug);

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
      ...product.tags,
      ...product.features,
      ...product.benefits,
    ].join(" "),
  );

  return haystack.includes(normalizedQuery);
};

export const filterProducts = ({
  source = products,
  query = "",
  categoryId,
  dealsOnly = false,
  inStockOnly = false,
  minPrice,
  maxPrice,
}: {
  source?: Product[];
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

export const getFeaturedProducts = (limit = 8) =>
  sortProducts(products, "featured").slice(0, limit);

export const getNewestProducts = (limit = 8) =>
  sortProducts(products, "newest").slice(0, limit);

export const getHomepageShowcaseProducts = (limit = 16) =>
  [...products]
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

export const getHeroRailProducts = (limit = 14) =>
  sortProducts(products, "popular").slice(0, limit);

export const getRelatedProducts = (product: Product, limit = 4) =>
  sortProducts(
    products.filter(
      (candidate) =>
        candidate.baseProductId !== product.baseProductId &&
        candidate.categoryId === product.categoryId,
    ),
    "featured",
  )
    .filter((candidate, index, source) => {
      return (
        source.findIndex(
          (entry) => entry.baseProductId === candidate.baseProductId,
        ) === index
      );
    })
    .slice(0, limit);
