import type {
  BrowinJsonRecipe,
  Recipe,
  RecipeCategory,
  RecipeIngredient,
} from "@/data/recipes";

const BROWIN_BASE_URL = "https://browin.pl";
const DEFAULT_RECIPE_IMAGE = "/assets/baner-27.02-wielkanoc5.webp";

const allowedRecipeTags = new Set([
  "a",
  "br",
  "em",
  "h2",
  "h3",
  "h4",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);

const tagClasses: Record<string, string> = {
  a: "font-semibold text-browin-red underline decoration-browin-red/25 underline-offset-4 transition-colors hover:text-browin-dark",
  em: "italic",
  h2: "mb-4 mt-8 text-2xl font-bold tracking-tight text-browin-dark",
  h3: "mb-3 mt-6 text-xl font-bold tracking-tight text-browin-dark",
  h4: "mb-3 mt-5 text-base font-bold uppercase tracking-[0.12em] text-browin-dark/72",
  li: "leading-relaxed",
  ol: "mb-5 list-decimal space-y-2 pl-5",
  p: "mb-4",
  strong: "font-bold text-browin-dark",
  ul: "mb-5 list-disc space-y-2 pl-5",
};

export const normalizeRecipeWhitespace = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[\u00a0\u2007\u202f\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeValue = (value?: string | null) =>
  normalizeRecipeWhitespace(String(value ?? ""));

const stripHtml = (value: string) =>
  normalizeRecipeWhitespace(
    value
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h2|h3|h4)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );

const slugify = (value: string) =>
  normalizeRecipeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const dedupeStrings = (values: Array<string | number | null | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeValue(value === undefined || value === null ? "" : String(value));

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const takeFirstSentences = (value: string, maxLength = 210) => {
  const normalized = normalizeRecipeWhitespace(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  let result = "";

  for (const sentence of sentences) {
    const candidate = result ? `${result} ${sentence}` : sentence;

    if (candidate.length > maxLength) {
      break;
    }

    result = candidate;
  }

  return result || `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const extractHref = (attributes: string) => {
  const match = attributes.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

  return normalizeValue(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};

export const extractProductIdFromHref = (href: string) => {
  const normalized = normalizeValue(href);
  const match = normalized.match(/\/sklep\/produkt\/([^/"?#]+)/i);

  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

const toSafeRecipeHref = (href: string, productSlugById: Map<string, string>) => {
  const normalized = normalizeValue(href);

  if (!normalized) {
    return "";
  }

  const productId = extractProductIdFromHref(normalized);

  if (productId) {
    const productSlug = productSlugById.get(productId);

    return productSlug ? `/produkt/${productSlug}` : normalized;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const url = new URL(normalized, BROWIN_BASE_URL);

    if (url.hostname === "browin.pl") {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
};

export const sanitizeRecipeHtml = (
  value?: string | null,
  productSlugById = new Map<string, string>(),
) => {
  if (!value) {
    return "";
  }

  const withoutDangerousBlocks = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[\[yt:[^\]]+\]\]/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "");

  const sanitized = withoutDangerousBlocks.replace(
    /<\s*\/?\s*([a-z0-9-]+)([^>]*)>/gi,
    (match, tagName, attributes) => {
      const normalizedTag = String(tagName).toLowerCase();
      const isClosing = /^<\s*\//.test(match);

      if (!allowedRecipeTags.has(normalizedTag)) {
        return "";
      }

      if (normalizedTag === "br") {
        return "<br />";
      }

      if (isClosing) {
        return `</${normalizedTag}>`;
      }

      if (normalizedTag === "a") {
        const safeHref = toSafeRecipeHref(extractHref(String(attributes ?? "")), productSlugById);

        if (!safeHref) {
          return `<a class="${tagClasses.a}" href="#">`;
        }

        const isExternal = /^https?:\/\//i.test(safeHref);

        return `<a class="${tagClasses.a}" href="${escapeHtmlAttribute(safeHref)}"${isExternal ? ' rel="noopener" target="_blank"' : ""}>`;
      }

      return `<${normalizedTag} class="${tagClasses[normalizedTag]}">`;
    },
  );

  return sanitized
    .replace(/<\/a>/g, "</a>")
    .replace(/<\/span>/g, "</span>")
    .replace(/<p class="mb-4">\s*(<br \/>|\s)*<\/p>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const extractIngredientBlocks = (html?: string | null) => {
  const source = html ?? "";
  const blocks = [...source.matchAll(/<(li|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => match[0])
    .filter(Boolean);

  if (blocks.length > 0) {
    return blocks;
  }

  const fallbackText = stripHtml(source);

  return fallbackText ? fallbackText.split(/\s*[-•]\s+/).filter(Boolean) : [];
};

export const extractRecipeIngredients = (html?: string | null): RecipeIngredient[] => {
  const seen = new Set<string>();

  return extractIngredientBlocks(html)
    .map((block, index) => {
      const text = stripHtml(block).replace(/^[-•]\s*/, "");
      const productIdMatch = [...block.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)]
        .map((match) => extractProductIdFromHref(match[1] ?? match[2] ?? match[3] ?? ""))
        .find(Boolean);
      const key = `${text}::${productIdMatch ?? ""}`;

      if (!text || seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        id: `ingredient-${index}-${slugify(text).slice(0, 32) || "item"}`,
        text,
        ...(productIdMatch ? { productId: productIdMatch } : {}),
      };
    })
    .filter((ingredient): ingredient is RecipeIngredient => Boolean(ingredient));
};

const normalizeCategory = (
  category: BrowinJsonRecipe["kategoria"],
  fallbackName = "Przepisy",
): RecipeCategory => {
  const name = normalizeValue(category?.nazwa) || fallbackName;

  return {
    name,
    slug: slugify(category?.slug ?? name) || "przepisy",
  };
};

const normalizeTags = (value?: string | null) =>
  dedupeStrings(
    normalizeValue(value)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  );

const normalizeImages = (rawRecipe: BrowinJsonRecipe) =>
  dedupeStrings([
    rawRecipe.zdjecie,
    ...(Array.isArray(rawRecipe.innezdjecia) ? rawRecipe.innezdjecia : []),
  ]);

export const toRecipeSummary = (recipe: Recipe) => ({
  id: recipe.id,
  slug: recipe.slug,
  title: recipe.title,
  excerpt: recipe.excerpt,
  category: recipe.category,
  publishedAt: recipe.publishedAt,
  heroImage: recipe.heroImage,
  tags: recipe.tags,
  relatedProductIds: recipe.relatedProductIds,
});

export const transformBrowinRecipe = (
  rawRecipe: BrowinJsonRecipe,
  index: number,
  totalItems: number,
  productSlugById = new Map<string, string>(),
): Recipe | null => {
  const id = normalizeValue(rawRecipe.id);
  const title = normalizeRecipeWhitespace(rawRecipe.tytul ?? "");
  const slug = slugify(rawRecipe.slug ?? title);

  if (!id || !title || !slug) {
    return null;
  }

  const introText = stripHtml(rawRecipe.wstep ?? "");
  const contentText = stripHtml(rawRecipe.tresc ?? "");
  const ingredients = extractRecipeIngredients(rawRecipe.skladniki);
  const ingredientLines = ingredients.map((ingredient) => ingredient.text);
  const relatedProductIds = dedupeStrings(rawRecipe.asortymenty ?? []);
  const images = normalizeImages(rawRecipe);
  const metaDescription =
    normalizeRecipeWhitespace(rawRecipe.metadescription ?? "") ||
    takeFirstSentences(introText || contentText || title, 156);
  const excerpt = takeFirstSentences(introText || metaDescription || contentText || title, 220);

  return {
    id,
    slug,
    title,
    excerpt,
    metaDescription,
    author: normalizeValue(rawRecipe.autor) || "BROWIN",
    category: normalizeCategory(rawRecipe.kategoria),
    ...(rawRecipe.podkategoria ? { subcategory: normalizeCategory(rawRecipe.podkategoria) } : {}),
    publishedAt: normalizeValue(rawRecipe.datapublikacji) || "2024-01-01",
    ...(rawRecipe.datazakonczenia ? { endedAt: normalizeValue(rawRecipe.datazakonczenia) } : {}),
    heroImage: images[0] ?? DEFAULT_RECIPE_IMAGE,
    images: images.length > 0 ? images : [DEFAULT_RECIPE_IMAGE],
    introHtml: sanitizeRecipeHtml(rawRecipe.wstep, productSlugById),
    ingredientsHtml: sanitizeRecipeHtml(rawRecipe.skladniki, productSlugById),
    contentHtml: sanitizeRecipeHtml(rawRecipe.tresc, productSlugById),
    footer: normalizeRecipeWhitespace(rawRecipe.stopka ?? ""),
    tags: normalizeTags(rawRecipe.tagi),
    ingredients,
    ingredientLines,
    relatedProductIds,
    contentText,
    introText,
    newestOrder: totalItems - index,
  };
};

export const transformBrowinRecipes = (
  rawRecipes: BrowinJsonRecipe[],
  productSlugById = new Map<string, string>(),
) =>
  rawRecipes
    .map((recipe, index, source) =>
      transformBrowinRecipe(recipe, index, source.length, productSlugById),
    )
    .filter((recipe): recipe is Recipe => Boolean(recipe));
