import type { Product } from "@/data/products";
import type { Recipe, RecipeIngredient, RecipeProductRole } from "@/data/recipes";
import { classifyRecipeProduct } from "@/lib/recipe-commerce";

const titleLinkPattern = /href="\/produkt\/([^"?#/]+)(?:[?#][^"]*)?"/gi;
const camelCaseBoundaryPattern = /([a-ząćęłńóśźż])([A-ZĄĆĘŁŃÓŚŹŻ])/g;
const sizeSignalPattern =
  /\bfi\s*\d{2,3}\b|\b\d{1,3}\/\d{1,3}\s?(?:mm|cm)?\b|\b\d{1,4}(?:[.,]\d+)?\s?(?:ml|l|kg|g|dag|cm|mm|m|szt)\b/gi;
const tokenPattern = /[a-z0-9/]+/g;

const stemSuffixes = [
  "owego",
  "owej",
  "owym",
  "owych",
  "owie",
  "acja",
  "acje",
  "acji",
  "eniu",
  "enie",
  "enia",
  "aniu",
  "anie",
  "ania",
  "kach",
  "kami",
  "owie",
  "owie",
  "nego",
  "nymi",
  "nych",
  "owej",
  "owym",
  "owego",
  "owej",
  "owym",
  "skiego",
  "skiej",
  "skim",
  "skie",
  "skich",
  "stwo",
  "stwa",
  "stwie",
  "sci",
  "cja",
  "cje",
  "cji",
  "cia",
  "cie",
  "ami",
  "ach",
  "ego",
  "emu",
  "owi",
  "owa",
  "owe",
  "owy",
  "kich",
  "kami",
  "kach",
  "kami",
  "kach",
  "kami",
  "kiem",
  "kiem",
  "kach",
  "kami",
  "czka",
  "czki",
  "czek",
  "kami",
  "kach",
  "ania",
  "enie",
  "eniu",
  "nego",
  "nym",
  "nej",
  "nych",
  "owa",
  "owe",
  "owy",
  "ami",
  "ach",
  "era",
  "ery",
  "orem",
  "orze",
  "kach",
  "kami",
  "ki",
  "ka",
  "ku",
  "ek",
  "em",
  "ie",
  "om",
  "ow",
  "owi",
  "owa",
  "owe",
  "ego",
  "nej",
  "nym",
  "nych",
  "iej",
  "iey",
  "ami",
  "ach",
  "cja",
  "cji",
  "cje",
  "a",
  "e",
  "i",
  "o",
  "u",
  "y",
];

const toStemSet = (tokens: string[]) =>
  new Set(
    tokens.map((token) =>
      stemToken(
        token
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, ""),
      ),
    ),
  );

const stopwordStems = toStemSet(
  [
    "a",
    "albo",
    "ani",
    "bez",
    "by",
    "co",
    "czy",
    "dla",
    "do",
    "i",
    "ich",
    "jako",
    "jakos",
    "jest",
    "lub",
    "na",
    "nad",
    "nie",
    "od",
    "oko",
    "okolo",
    "oraz",
    "po",
    "pod",
    "przez",
    "przy",
    "s",
    "sie",
    "u",
    "w",
    "we",
    "z",
    "za",
    "ze",
    "ml",
    "l",
    "g",
    "kg",
    "dag",
    "cm",
    "mm",
    "m",
    "szt",
    "fi",
    "nr",
    "x",
    "plus",
    "max",
    "min",
    "pol",
    "cwierc",
    "kilka",
    "kilkanascie",
    "lyzka",
    "lyzeczka",
    "nakretka",
    "opakowanie",
    "opak",
  ],
);

const weakSignalStems = toStemSet(
  [
    "aromat",
    "balon",
    "beczka",
    "butelka",
    "drozdze",
    "esencja",
    "fermentor",
    "jelita",
    "korek",
    "mieszanka",
    "nakretka",
    "oslona",
    "oslonka",
    "peklosol",
    "pojemnik",
    "pozywka",
    "przyprawa",
    "rurka",
    "saturator",
    "siatka",
    "sloik",
    "sloj",
    "sol",
    "szynkowar",
    "termometr",
    "wino",
    "winiarskie",
    "worek",
    "zestaw",
    "zrebk",
    "zrebki",
    "zrebkow",
  ],
);

const equipmentHintStems = toStemSet(
  [
    "balon",
    "beczka",
    "butelka",
    "fermentor",
    "garnek",
    "gasior",
    "generator",
    "jogurtownica",
    "kociol",
    "korkownica",
    "pojemnik",
    "prasa",
    "rurka",
    "sloik",
    "sloj",
    "saturator",
    "szynkowar",
    "termometr",
    "wedzarnia",
  ],
);

const consumableHintStems = toStemSet(
  [
    "aromat",
    "drozdze",
    "esencja",
    "jelita",
    "kultury",
    "kwasomix",
    "mieszanka",
    "oslonka",
    "peklosol",
    "podpuszcz",
    "pozywka",
    "przyprawa",
    "sol",
    "slod",
    "vleyto",
    "zrebk",
    "zrebki",
  ],
);

type TokenProfile = {
  normalized: string;
  comparable: string;
  orderedStems: string[];
  strongStems: Set<string>;
  weakStems: Set<string>;
  sizeSignals: Set<string>;
  roleHints: Set<RecipeProductRole>;
  phrases: string[];
};

type ProductCandidate = {
  product: Product;
  role: RecipeProductRole;
  titleProfile: TokenProfile;
  metadataStrongStems: Set<string>;
  metadataWeakStems: Set<string>;
  sizeSignals: Set<string>;
  linkedInRecipeBody: boolean;
};

type MatchCandidate = {
  productId: string;
  score: number;
  qualifies: boolean;
  strongTitleMatches: string[];
  strongMetadataMatches: string[];
  weakTitleMatches: string[];
  weakMetadataMatches: string[];
  sizeMatches: string[];
  matchedPhraseTokenCount: number;
  linkedInRecipeBody: boolean;
  roleAligned: boolean;
};

export type RecipeIngredientMatchDecision = {
  ingredientId: string;
  ingredientText: string;
  existingProductId?: string;
  matchedProductId?: string;
  candidates: MatchCandidate[];
};

const normalizeText = (value: string) =>
  value
    .replace(camelCaseBoundaryPattern, "$1 $2")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " i ")
    .replace(/[%+]/g, " ")
    .replace(/[–—-]+/g, " ")
    .replace(/[^a-z0-9/.,\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function stemToken(token: string) {
  if (token.length <= 3 || /\d/.test(token)) {
    return token;
  }

  for (const suffix of stemSuffixes) {
    if (token.length - suffix.length >= 4 && token.endsWith(suffix)) {
      return token.slice(0, -suffix.length);
    }
  }

  return token;
}

const isNumericToken = (token: string) => /^\d+(?:[./]\d+)?$/.test(token);

const extractSizeSignals = (value: string) =>
  Array.from(
    new Set(
      Array.from(value.matchAll(sizeSignalPattern), (match) =>
        match[0].replace(/\s+/g, "").replace(",", "."),
      ),
    ),
  );

const buildPhrases = (orderedStems: string[]) => {
  const phrases = new Set<string>();

  for (let start = 0; start < orderedStems.length; start += 1) {
    for (let length = 4; length >= 2; length -= 1) {
      const slice = orderedStems.slice(start, start + length);

      if (slice.length < 2) {
        continue;
      }

      const phrase = slice.join(" ");

      if (phrase.length >= 8) {
        phrases.add(phrase);
      }
    }
  }

  return [...phrases].sort((left, right) => right.length - left.length);
};

const buildTokenProfile = (value: string): TokenProfile => {
  const normalized = normalizeText(value);
  const rawTokens = normalized.match(tokenPattern) ?? [];
  const orderedStems: string[] = [];
  const strongStems = new Set<string>();
  const weakStems = new Set<string>();
  const roleHints = new Set<RecipeProductRole>();

  for (const rawToken of rawTokens) {
    const stem = stemToken(rawToken);

    if (
      !stem ||
      stem.length < 4 ||
      stopwordStems.has(stem) ||
      isNumericToken(stem) ||
      extractSizeSignals(stem).length > 0
    ) {
      continue;
    }

    orderedStems.push(stem);

    if (weakSignalStems.has(stem)) {
      weakStems.add(stem);
    } else {
      strongStems.add(stem);
    }

    if (equipmentHintStems.has(stem)) {
      roleHints.add("equipment");
    }

    if (consumableHintStems.has(stem)) {
      roleHints.add("consumable");
    }
  }

  return {
    normalized,
    comparable: orderedStems.join(" "),
    orderedStems,
    strongStems,
    weakStems,
    sizeSignals: new Set(extractSizeSignals(normalized)),
    roleHints,
    phrases: buildPhrases(orderedStems),
  };
};

const buildMetadataText = (product: Product) =>
  [
    product.subtitle,
    product.line,
    ...product.tags,
    ...product.features,
    ...product.taxonomy.flatMap((entry) => [
      entry.lineName,
      entry.categoryName,
      entry.subcategoryName ?? "",
    ]),
  ]
    .filter(Boolean)
    .join(" ");

const collectLinkedProductIds = (recipe: Recipe, productIdBySlug: Map<string, string>) => {
  const linkedProductIds = new Set<string>();
  const bodyHtml = `${recipe.introHtml} ${recipe.contentHtml}`;

  for (const match of bodyHtml.matchAll(titleLinkPattern)) {
    const productSlug = match[1];

    if (!productSlug) {
      continue;
    }

    const productId = productIdBySlug.get(productSlug);

    if (productId) {
      linkedProductIds.add(productId);
    }
  }

  return linkedProductIds;
};

const collectMatches = (left: Set<string>, right: Set<string>) =>
  [...left].filter((token) => right.has(token)).sort();

const getMatchedPhraseTokenCount = (ingredientComparable: string, phrases: string[]) => {
  for (const phrase of phrases) {
    if (ingredientComparable.includes(phrase)) {
      return phrase.split(" ").length;
    }
  }

  return 0;
};

const getComparablePhraseMatch = (ingredient: TokenProfile, candidate: ProductCandidate) => {
  const comparable = ingredient.comparable;
  const candidateComparable = candidate.titleProfile.comparable;

  if (!comparable || !candidateComparable) {
    return false;
  }

  if (comparable.length >= 12 && candidateComparable.includes(comparable)) {
    return true;
  }

  if (candidateComparable.length >= 12 && comparable.includes(candidateComparable)) {
    return true;
  }

  return false;
};

const qualifiesCandidate = ({
  comparablePhraseMatch,
  genericMatchCount,
  ingredientHasRoleHints,
  matchedPhraseTokenCount,
  roleAligned,
  sizeMatchCount,
  strongMatchCount,
}: {
  comparablePhraseMatch: boolean;
  genericMatchCount: number;
  ingredientHasRoleHints: boolean;
  matchedPhraseTokenCount: number;
  roleAligned: boolean;
  sizeMatchCount: number;
  strongMatchCount: number;
}) => {
  if (comparablePhraseMatch || matchedPhraseTokenCount >= 3 || strongMatchCount >= 2) {
    return true;
  }

  if (strongMatchCount >= 1 && (sizeMatchCount >= 1 || matchedPhraseTokenCount >= 2)) {
    return true;
  }

  // Generic nouns like "sloik" or "balon" can qualify only when the line also
  // carries a specific technical signal, so unit-only or category-only matches stay quiet.
  if (sizeMatchCount >= 1 && roleAligned && (genericMatchCount >= 1 || ingredientHasRoleHints)) {
    return true;
  }

  return false;
};

const scoreCandidate = (
  ingredientProfile: TokenProfile,
  candidate: ProductCandidate,
): MatchCandidate => {
  const strongTitleMatches = collectMatches(
    ingredientProfile.strongStems,
    candidate.titleProfile.strongStems,
  );
  const strongMetadataMatches = collectMatches(
    ingredientProfile.strongStems,
    candidate.metadataStrongStems,
  ).filter((token) => !candidate.titleProfile.strongStems.has(token));
  const weakTitleMatches = collectMatches(
    ingredientProfile.weakStems,
    candidate.titleProfile.weakStems,
  );
  const weakMetadataMatches = collectMatches(
    ingredientProfile.weakStems,
    candidate.metadataWeakStems,
  ).filter((token) => !candidate.titleProfile.weakStems.has(token));
  const sizeMatches = collectMatches(ingredientProfile.sizeSignals, candidate.sizeSignals);
  const matchedPhraseTokenCount = getMatchedPhraseTokenCount(
    ingredientProfile.comparable,
    candidate.titleProfile.phrases,
  );
  const comparablePhraseMatch = getComparablePhraseMatch(ingredientProfile, candidate);
  const roleAligned =
    ingredientProfile.roleHints.size === 0 || ingredientProfile.roleHints.has(candidate.role);
  const strongMatchCount = strongTitleMatches.length + strongMetadataMatches.length;
  const genericMatchCount = weakTitleMatches.length + weakMetadataMatches.length;
  const qualifies = qualifiesCandidate({
    comparablePhraseMatch,
    genericMatchCount,
    ingredientHasRoleHints: ingredientProfile.roleHints.size > 0,
    matchedPhraseTokenCount,
    roleAligned,
    sizeMatchCount: sizeMatches.length,
    strongMatchCount,
  });

  let score = 0;

  if (comparablePhraseMatch) {
    score += 48;
  }

  score += strongTitleMatches.length * 18;
  score += strongMetadataMatches.length * 10;
  score += Math.min(weakTitleMatches.length, 2) * 6;
  score += Math.min(weakMetadataMatches.length, 1) * 3;
  score += Math.min(sizeMatches.length, 2) * 20;
  score += matchedPhraseTokenCount >= 2 ? matchedPhraseTokenCount * 8 : 0;

  if (candidate.linkedInRecipeBody) {
    score += 5;
  }

  if (roleAligned) {
    score += 4;
  }

  return {
    productId: candidate.product.id,
    score,
    qualifies,
    strongTitleMatches,
    strongMetadataMatches,
    weakTitleMatches,
    weakMetadataMatches,
    sizeMatches,
    matchedPhraseTokenCount,
    linkedInRecipeBody: candidate.linkedInRecipeBody,
    roleAligned,
  };
};

const buildProductCandidates = (
  recipe: Recipe,
  products: Product[],
  productIdBySlug: Map<string, string>,
) => {
  const productIndex = new Map(products.map((product) => [product.id, product]));
  const linkedProductIds = collectLinkedProductIds(recipe, productIdBySlug);

  return recipe.relatedProductIds
    .map((productId) => productIndex.get(productId))
    .filter((product): product is Product => Boolean(product))
    .map((product) => {
      const titleProfile = buildTokenProfile(product.title);
      const metadataProfile = buildTokenProfile(buildMetadataText(product));

      return {
        product,
        role: classifyRecipeProduct(recipe, product),
        titleProfile,
        metadataStrongStems: metadataProfile.strongStems,
        metadataWeakStems: metadataProfile.weakStems,
        sizeSignals: new Set([
          ...titleProfile.sizeSignals,
          ...metadataProfile.sizeSignals,
          ...extractSizeSignals(normalizeText(product.title)),
        ]),
        linkedInRecipeBody: linkedProductIds.has(product.id),
      } satisfies ProductCandidate;
    });
};

export const evaluateRecipeIngredientProductMatches = (
  recipe: Recipe,
  products: Product[],
): RecipeIngredientMatchDecision[] => {
  const productIdBySlug = new Map(products.map((product) => [product.slug, product.id]));
  const candidates = buildProductCandidates(recipe, products, productIdBySlug);

  if (candidates.length === 0) {
    return recipe.ingredients.map((ingredient) => ({
      ingredientId: ingredient.id,
      ingredientText: ingredient.text,
      ...(ingredient.productId ? { existingProductId: ingredient.productId } : {}),
      candidates: [],
    }));
  }

  return recipe.ingredients.map((ingredient) => {
    if (ingredient.kind === "separator") {
      return {
        ingredientId: ingredient.id,
        ingredientText: ingredient.text,
        candidates: [],
      };
    }

    if (ingredient.productId) {
      return {
        ingredientId: ingredient.id,
        ingredientText: ingredient.text,
        existingProductId: ingredient.productId,
        matchedProductId: ingredient.productId,
        candidates: [],
      };
    }

    const ingredientProfile = buildTokenProfile(ingredient.text);
    const scoredCandidates = candidates
      .map((candidate) => scoreCandidate(ingredientProfile, candidate))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => {
        return (
          right.score - left.score ||
          right.strongTitleMatches.length - left.strongTitleMatches.length ||
          right.sizeMatches.length - left.sizeMatches.length ||
          right.matchedPhraseTokenCount - left.matchedPhraseTokenCount
        );
      });
    const bestCandidate = scoredCandidates.find((candidate) => candidate.qualifies);

    return {
      ingredientId: ingredient.id,
      ingredientText: ingredient.text,
      ...(bestCandidate ? { matchedProductId: bestCandidate.productId } : {}),
      candidates: scoredCandidates.slice(0, 5),
    };
  });
};

const applyIngredientMatches = (
  ingredients: RecipeIngredient[],
  decisions: RecipeIngredientMatchDecision[],
) => {
  const matchedProductIdByIngredientId = new Map(
    decisions
      .filter((decision) => decision.matchedProductId)
      .map((decision) => [decision.ingredientId, decision.matchedProductId!]),
  );

  let changed = false;

  const nextIngredients = ingredients.map((ingredient) => {
    if (ingredient.kind === "separator" || ingredient.productId) {
      return ingredient;
    }

    const matchedProductId = matchedProductIdByIngredientId.get(ingredient.id);

    if (!matchedProductId) {
      return ingredient;
    }

    changed = true;

    return {
      ...ingredient,
      productId: matchedProductId,
    };
  });

  return changed ? nextIngredients : ingredients;
};

export const enrichRecipeIngredientMatches = (recipes: Recipe[], products: Product[]) =>
  recipes.map((recipe) => {
    if (
      recipe.relatedProductIds.length === 0 ||
      recipe.ingredients.every((ingredient) => ingredient.kind === "separator")
    ) {
      return recipe;
    }

    const decisions = evaluateRecipeIngredientProductMatches(recipe, products);
    const nextIngredients = applyIngredientMatches(recipe.ingredients, decisions);

    if (nextIngredients === recipe.ingredients) {
      return recipe;
    }

    return {
      ...recipe,
      ingredients: nextIngredients,
    };
  });
