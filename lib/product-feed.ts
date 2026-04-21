import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Product } from "@/data/products";
import type { BrowinJsonProduct } from "@/lib/product-feed-transformer";
import { transformBrowinProducts } from "@/lib/product-feed-transformer";

const DEFAULT_PRODUCT_DATA_URL = "https://browin.pl/shop/data-generator";
const DEFAULT_CACHE_TTL_SECONDS = 60 * 15;
const PRODUCT_FETCH_TIMEOUT_MS = 15_000;
const PRODUCT_EXTERNAL_CACHE_FILE = path.join(
  process.cwd(),
  ".cache",
  "browin-products.external.json",
);

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
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), PRODUCT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(PRODUCT_DATA_URL, {
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać katalogu produktów: ${response.status}`);
    }

    const rawProducts = (await response.json()) as BrowinJsonProduct[];

    if (!Array.isArray(rawProducts)) {
      throw new Error("Publiczny feed produktów nie zwrócił tablicy JSON.");
    }

    return transformBrowinProducts(rawProducts);
  } finally {
    clearTimeout(timeout);
  }
};

const readLastExternalProducts = async (reason: unknown) => {
  try {
    const cacheContents = await readFile(PRODUCT_EXTERNAL_CACHE_FILE, "utf8");
    const cachedProducts = JSON.parse(cacheContents) as Product[];

    if (!Array.isArray(cachedProducts) || cachedProducts.length === 0) {
      throw new Error("Cache zewnętrznego katalogu produktów jest pusty albo niepoprawny.");
    }

    const message = reason instanceof Error ? reason.message : String(reason);

    console.warn(
      `Nie udało się pobrać bieżącego katalogu produktów BROWIN (${message}). Używam ostatniego katalogu pobranego z zewnętrznego źródła.`,
    );

    return cachedProducts;
  } catch {
    throw reason;
  }
};

const writeLastExternalProducts = async (products: Product[]) => {
  try {
    await mkdir(path.dirname(PRODUCT_EXTERNAL_CACHE_FILE), { recursive: true });
    await writeFile(PRODUCT_EXTERNAL_CACHE_FILE, JSON.stringify(products));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Nie udało się zapisać cache zewnętrznego katalogu BROWIN (${message}).`);
  }
};

export const getProducts = async (): Promise<Product[]> => {
  if (isCacheFresh()) {
    return cachedProducts!;
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetchAndTransformProducts()
    .catch(readLastExternalProducts)
    .then((products) => {
      cachedProducts = products;
      cachedAt = Date.now();
      void writeLastExternalProducts(products);
      return products;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};
