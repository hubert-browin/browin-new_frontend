import "server-only";

import type { Product } from "@/data/products";
import type { BrowinJsonProduct } from "@/lib/product-feed-transformer";
import { transformBrowinProducts } from "@/lib/product-feed-transformer";

const DEFAULT_PRODUCT_DATA_URL = "https://browin.pl/shop/data-generator";
const DEFAULT_CACHE_TTL_SECONDS = 60 * 15;

const resolveProductDataUrl = () => {
  if (process.env.BROWIN_PRODUCT_DATA_URL) {
    return process.env.BROWIN_PRODUCT_DATA_URL;
  }

  const legacyUrl = process.env.BROWIN_PRODUCT_FEED_URL;

  if (legacyUrl && /data-generator|\.json($|\?)/i.test(legacyUrl)) {
    return legacyUrl;
  }

  return DEFAULT_PRODUCT_DATA_URL;
};

const PRODUCT_DATA_URL = resolveProductDataUrl();
const PRODUCT_CACHE_TTL_SECONDS = Math.max(
  30,
  Number.parseInt(process.env.BROWIN_PRODUCT_CACHE_TTL_SECONDS ?? "", 10) ||
    DEFAULT_CACHE_TTL_SECONDS,
);

let cachedProducts: Product[] | null = null;
let cachedAt = 0;
let inflightPromise: Promise<Product[]> | null = null;

const isCacheFresh = () =>
  Boolean(cachedProducts) && Date.now() - cachedAt < PRODUCT_CACHE_TTL_SECONDS * 1000;

const fetchAndTransformProducts = async () => {
  const response = await fetch(PRODUCT_DATA_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać katalogu produktów: ${response.status}`);
  }

  const rawProducts = (await response.json()) as BrowinJsonProduct[];

  if (!Array.isArray(rawProducts)) {
    throw new Error("Publiczny feed produktów nie zwrócił tablicy JSON.");
  }

  return transformBrowinProducts(rawProducts);
};

export const getProducts = async (): Promise<Product[]> => {
  if (isCacheFresh()) {
    return cachedProducts!;
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetchAndTransformProducts()
    .then((products) => {
      cachedProducts = products;
      cachedAt = Date.now();
      return products;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};
