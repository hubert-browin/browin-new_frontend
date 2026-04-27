import type {
  BrowinJsonRecipe,
  Recipe,
  RecipeCategory,
  RecipeIngredient,
} from "@/data/recipes";

const BROWIN_BASE_URL = "https://browin.pl";
const DEFAULT_RECIPE_IMAGE = "/assets/baner-27.02-wielkanoc5.webp";
const recipeImageUrlSource =
  String.raw`https?:\/\/[^\s<>"']+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^\s<>"']*)?`;
const recipeImageUrlGlobalPattern = new RegExp(recipeImageUrlSource, "gi");
const recipeTextImageUrlPattern = new RegExp(
  String.raw`(?<!src=")(?<!href=")${recipeImageUrlSource}`,
  "gi",
);
const recipeImageExtensionPattern = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const recipeInlineWhitespaceSource = String.raw`(?:\s|&nbsp;|&#160;|\u00a0|\uFEFF)*`;
const recipeLinkedImageOnlyBlockPattern = new RegExp(
  String.raw`<\s*(p|div)\b[^>]*>${recipeInlineWhitespaceSource}(?:<br\s*\/?>${recipeInlineWhitespaceSource})*<a\b([^>]*)>${recipeInlineWhitespaceSource}(${recipeImageUrlSource})${recipeInlineWhitespaceSource}<\/a>(?:${recipeInlineWhitespaceSource}<br\s*\/?>)*${recipeInlineWhitespaceSource}<\/\s*\1\s*>`,
  "gi",
);
const recipeImageOnlyBlockPattern = new RegExp(
  String.raw`<\s*(p|div)\b[^>]*>${recipeInlineWhitespaceSource}(?:<br\s*\/?>${recipeInlineWhitespaceSource})*(${recipeImageUrlSource})(?:${recipeInlineWhitespaceSource}<br\s*\/?>)*${recipeInlineWhitespaceSource}<\/\s*\1\s*>`,
  "gi",
);
const recipeImageOnlyAnchorPattern = new RegExp(
  String.raw`<a\b([^>]*)>${recipeInlineWhitespaceSource}(${recipeImageUrlSource})${recipeInlineWhitespaceSource}<\/a>`,
  "gi",
);
const recipeImageOnlyInlineElementPattern = new RegExp(
  String.raw`<\s*(b|em|font|i|span|strong|u)\b[^>]*>${recipeInlineWhitespaceSource}(?:<br\s*\/?>${recipeInlineWhitespaceSource})*(${recipeImageUrlSource})(?:${recipeInlineWhitespaceSource}<br\s*\/?>)*${recipeInlineWhitespaceSource}<\/\s*\1\s*>`,
  "gi",
);

const allowedRecipeTags = new Set([
  "a",
  "br",
  "div",
  "em",
  "figcaption",
  "figure",
  "h2",
  "h3",
  "h4",
  "img",
  "li",
  "ol",
  "p",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const tagClasses: Record<string, string> = {
  a: "font-semibold text-browin-red underline decoration-browin-red/25 underline-offset-4 transition-colors hover:text-browin-dark",
  div: "mb-4",
  em: "italic",
  figcaption: "mt-2 text-sm leading-relaxed text-browin-dark/58",
  figure: "my-7",
  h2: "mb-4 mt-8 text-2xl font-bold tracking-tight text-browin-dark",
  h3: "mb-3 mt-6 text-xl font-bold tracking-tight text-browin-dark",
  h4: "mb-3 mt-5 text-base font-bold uppercase tracking-[0.12em] text-browin-dark/72",
  img: "h-auto w-full max-w-3xl bg-browin-gray object-cover",
  li: "leading-relaxed",
  ol: "mb-5 list-decimal space-y-2 pl-5",
  p: "mb-4",
  strong: "font-bold text-browin-dark",
  sub: "align-sub text-[0.7em]",
  sup: "align-super text-[0.7em]",
  table: "my-6 w-full border-collapse text-sm",
  tbody: "",
  td: "border border-browin-dark/10 px-3 py-2 align-top",
  th: "border border-browin-dark/10 bg-browin-gray px-3 py-2 text-left font-bold text-browin-dark",
  thead: "",
  tr: "",
  u: "underline decoration-browin-red/30 underline-offset-2",
  ul: "mb-5 list-disc space-y-2 pl-5",
};

const recipeImageLinkClass =
  "block max-w-3xl transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-browin-red";

const normalizedRecipeTagNames: Record<string, string> = {
  b: "strong",
  h1: "h2",
  h5: "h4",
  h6: "h4",
  i: "em",
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
      .replace(recipeImageUrlGlobalPattern, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|figcaption|figure|h1|h2|h3|h4|h5|h6|li|p|tr)>/gi, "\n")
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

const normalizeComparableRecipeText = (value: string) =>
  normalizeRecipeWhitespace(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

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

const extractAttribute = (attributes: string, name: string) => {
  const attributePattern = new RegExp(
    String.raw`\s${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`,
    "i",
  );
  const match = attributes.match(attributePattern);

  return normalizeValue(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
};

const extractHref = (attributes: string) => extractAttribute(attributes, "href");

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

const toSafeRecipeImageSrc = (src: string) => {
  const normalized = normalizeValue(src);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized, BROWIN_BASE_URL);

    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      !recipeImageExtensionPattern.test(url.pathname)
    ) {
      return "";
    }

    if (normalized.startsWith("/") && !normalized.startsWith("//")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    return "";
  }
};

const buildRecipeImageTag = (src: string, alt = "Zdjęcie z przepisu") => {
  const safeSrc = toSafeRecipeImageSrc(src);

  if (!safeSrc) {
    return "";
  }

  return `<img alt="${escapeHtmlAttribute(alt)}" src="${escapeHtmlAttribute(safeSrc)}" />`;
};

const buildSanitizedRecipeImageTag = (src: string, alt = "Zdjęcie z przepisu") => {
  const safeSrc = toSafeRecipeImageSrc(src);

  if (!safeSrc) {
    return "";
  }

  return `<img alt="${escapeHtmlAttribute(alt)}" class="${tagClasses.img}" decoding="async" loading="lazy" src="${escapeHtmlAttribute(safeSrc)}" />`;
};

const buildRecipeImageLink = (
  src: string,
  href: string,
  productSlugById: Map<string, string>,
) => {
  const imageTag = buildRecipeImageTag(src);
  const safeHref = toSafeRecipeHref(href, productSlugById);

  if (!imageTag || !safeHref) {
    return imageTag;
  }

  return `<a data-recipe-image-link="true" href="${escapeHtmlAttribute(safeHref)}">${imageTag}</a>`;
};

const buildRecipeImageFigure = (
  src: string,
  href = "",
  productSlugById = new Map<string, string>(),
) => {
  const content = href
    ? buildRecipeImageLink(src, href, productSlugById)
    : buildRecipeImageTag(src);

  return content ? `<figure>${content}</figure>` : "";
};

const normalizeLegacyRecipeMarkup = (
  value: string,
  productSlugById: Map<string, string>,
) =>
  value
    .replace(recipeLinkedImageOnlyBlockPattern, (_match, _tagName, attributes, imageUrl) =>
      buildRecipeImageFigure(imageUrl, extractHref(String(attributes ?? "")), productSlugById),
    )
    .replace(recipeImageOnlyBlockPattern, (_match, _tagName, imageUrl) =>
      buildRecipeImageFigure(imageUrl),
    )
    .replace(recipeImageOnlyAnchorPattern, (_match, attributes, imageUrl) =>
      buildRecipeImageLink(imageUrl, extractHref(String(attributes ?? "")), productSlugById),
    )
    .replace(recipeImageOnlyInlineElementPattern, (_match, _tagName, imageUrl) =>
      buildRecipeImageTag(imageUrl),
    );

export const sanitizeRecipeHtml = (
  value?: string | null,
  productSlugById = new Map<string, string>(),
) => {
  if (!value) {
    return "";
  }

  const withoutDangerousBlocks = normalizeLegacyRecipeMarkup(
    value
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\[\[yt:[^\]]+\]\]/gi, "")
      .replace(/<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, ""),
    productSlugById,
  );

  const sanitized = withoutDangerousBlocks.replace(
    /<\s*\/?\s*([a-z0-9-]+)([^>]*)>/gi,
    (match, tagName, attributes) => {
      const sourceTag = String(tagName).toLowerCase();
      const normalizedTag = normalizedRecipeTagNames[sourceTag] ?? sourceTag;
      const isClosing = /^<\s*\//.test(match);

      if (!allowedRecipeTags.has(normalizedTag)) {
        return "";
      }

      if (normalizedTag === "br") {
        return "<br />";
      }

      if (normalizedTag === "img") {
        if (isClosing) {
          return "";
        }

        const safeSrc = toSafeRecipeImageSrc(
          extractAttribute(String(attributes ?? ""), "src"),
        );

        if (!safeSrc) {
          return "";
        }

        const alt =
          normalizeValue(extractAttribute(String(attributes ?? ""), "alt")) ||
          "Zdjęcie z przepisu";

        return buildSanitizedRecipeImageTag(safeSrc, alt);
      }

      if (isClosing) {
        return `</${normalizedTag}>`;
      }

      if (normalizedTag === "a") {
        const isRecipeImageLink = /\sdata-recipe-image-link\b/i.test(
          String(attributes ?? ""),
        );
        const safeHref = toSafeRecipeHref(extractHref(String(attributes ?? "")), productSlugById);

        if (!safeHref) {
          return `<a class="${isRecipeImageLink ? recipeImageLinkClass : tagClasses.a}" href="#">`;
        }

        const isExternal = /^https?:\/\//i.test(safeHref);
        const className = isRecipeImageLink ? recipeImageLinkClass : tagClasses.a;

        return `<a class="${className}" href="${escapeHtmlAttribute(safeHref)}"${isExternal ? ' rel="noopener" target="_blank"' : ""}>`;
      }

      const className = tagClasses[normalizedTag];

      return `<${normalizedTag}${className ? ` class="${className}"` : ""}>`;
    },
  );

  return sanitized
    .replace(recipeTextImageUrlPattern, (imageUrl) =>
      buildSanitizedRecipeImageTag(imageUrl),
    )
    .replace(/<\/a>/g, "</a>")
    .replace(/<\/(font|span)>/g, "")
    .replace(/<(div|p) class="mb-4">\s*(<br \/>|\s)*<\/\1>/g, "")
    .replace(/<figure class="my-7">\s*<\/figure>/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

type IngredientBlock = {
  html: string;
  tagName: "li" | "p";
};

type IngredientFragment = {
  html: string;
  sourceTagName: "li" | "p";
};

const ingredientSectionLabelPattern =
  /^(zalewa|zalewa peklujaca|solanka|marynata|skladniki(?: na [^:]+)?|do smaku|do dekoracji|uwaga!?)(?:\b|:)/i;
const ingredientPortionHeadingPattern =
  /^(na|do|dla)\b.*(?:\d|litr|litr[ay]?\b|ml\b|kg\b|g\b|dag\b|sloik|sloicz|porcj|nastaw|nalewk|trunk|chleb|ciast|farsz|kruszonk|sos|zup|barszcz|hummus|pasztet|krem|dzem|majonez|musztard|golonk|salank|zalew|ser|drink)/i;

const extractIngredientBlocks = (html?: string | null): IngredientBlock[] => {
  const source = html ?? "";
  const blocks = [...source.matchAll(/<(li|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => ({
      html: match[0],
      tagName: String(match[1]).toLowerCase() as "li" | "p",
    }))
    .filter(Boolean);

  if (blocks.length > 0) {
    return blocks;
  }

  const fallbackText = stripHtml(source);

  return fallbackText
    ? fallbackText
        .split(/\s*[-•]\s+/)
        .filter(Boolean)
        .map((text) => ({ html: text, tagName: "p" }))
    : [];
};

const splitIngredientBlock = ({ html, tagName }: IngredientBlock): IngredientFragment[] => {
  if (tagName !== "p") {
    return [{ html, sourceTagName: tagName }];
  }

  const innerMatch = html.match(/^<p\b[^>]*>([\s\S]*?)<\/p>$/i);
  const innerHtml = innerMatch?.[1] ?? html;
  const fragments = innerHtml
    .split(/(?:<br\s*\/?>\s*){1,}/i)
    .map((fragment) => fragment.trim())
    .filter((fragment) => stripHtml(fragment));

  if (fragments.length <= 1) {
    return [{ html, sourceTagName: tagName }];
  }

  return fragments.map((fragment) => ({
    html: fragment,
    sourceTagName: tagName,
  }));
};

const isIngredientSeparator = (text: string, sourceTagName: "li" | "p") => {
  if (sourceTagName !== "p") {
    return false;
  }

  const normalized = normalizeComparableRecipeText(text);

  if (!normalized) {
    return false;
  }

  if (/^[*•]/.test(text.trim())) {
    return true;
  }

  if (/:$/.test(normalized)) {
    return true;
  }

  if (ingredientSectionLabelPattern.test(normalized)) {
    return true;
  }

  return normalized.length <= 96 && ingredientPortionHeadingPattern.test(normalized);
};

export const extractRecipeIngredients = (html?: string | null): RecipeIngredient[] => {
  const seen = new Set<string>();

  return extractIngredientBlocks(html)
    .flatMap(splitIngredientBlock)
    .map((fragment, index) => {
      const text = stripHtml(fragment.html).replace(/^[-•]\s*/, "");
      const productIdMatch = [...fragment.html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)]
        .map((match) => extractProductIdFromHref(match[1] ?? match[2] ?? match[3] ?? ""))
        .find(Boolean);
      const kind = isIngredientSeparator(text, fragment.sourceTagName) ? "separator" : "item";
      const key = `${kind}::${text}::${productIdMatch ?? ""}`;

      if (!text || seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        id: `ingredient-${index}-${slugify(text).slice(0, 32) || "item"}`,
        text,
        ...(kind === "separator" ? { kind } : {}),
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
  const ingredientLines = ingredients
    .filter((ingredient) => ingredient.kind !== "separator")
    .map((ingredient) => ingredient.text);
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
