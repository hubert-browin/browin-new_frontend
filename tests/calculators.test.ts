import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "../data/products";
import {
  calculateCheese,
  calculateMeat,
  calculateTincture,
  calculateWine,
  resolveCalculatorProducts,
  toCalculatorCartLines,
} from "../lib/calculators";

const makeProduct = (id: string, title: string, overrides: Partial<Product> = {}): Product => ({
  id,
  baseProductId: id,
  baseSlug: title.toLowerCase().replace(/\s+/g, "-"),
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  symbol: id,
  ean: id.padStart(13, "0").slice(0, 13),
  title,
  subtitle: "",
  line: "Test",
  categoryId: "winiarstwo",
  shortDescription: title,
  description: title,
  longDescription: title,
  images: ["/assets/produkt1.webp"],
  status: "standard",
  tags: [],
  rating: 0,
  reviews: 0,
  soldLast30Days: 0,
  viewingNow: 0,
  popularityScore: 0,
  newestOrder: 0,
  benefits: [],
  features: [],
  specs: [],
  faq: [],
  files: [],
  bundleItems: [],
  relatedProductIds: [],
  complementaryProductIds: [],
  taxonomy: [],
  variants: [
    {
      id: `${id}-default`,
      label: "Standard",
      sku: id,
      price: 10,
      stock: 10,
      leadTime: "24h",
    },
  ],
  ...overrides,
});

test("kalkulator winiarski liczy nastaw i porcje cukru", () => {
  const result = calculateWine({
    mode: "target-volume",
    fruitId: "dark-grape",
    targetLiters: 10,
    fruitKg: 12,
    wineKind: "semi-sweet",
    strength: "medium",
  });

  assert.equal(result.calculatorId, "wine");
  assert.equal(result.summary.find((item) => item.label === "Objętość nastawu")?.value, "10 l");
  assert.ok(result.ingredients.some((ingredient) => ingredient.label === "Cukier"));
  assert.ok(result.steps.some((step) => step.includes("drugą porcję syropu")));
  assert.ok(result.productRefs.some((ref) => ref.legacyId === "400350"));
});

test("kalkulator nalewek obsługuje rozcieńczanie spirytusu", () => {
  const result = calculateTincture({
    mode: "dilution",
    fruitId: "chokeberry",
    fruitKg: 2,
    targetStrength: 40,
    spiritStrength: 95,
    targetLiters: 2,
    alcoholLiters: 1,
    secondAlcoholStrength: 40,
    secondAlcoholLiters: 0,
    juiceLiters: 0,
    waterLiters: 0,
    sugarG: 0,
  });

  assert.equal(result.calculatorId, "tincture");
  assert.equal(result.title, "Rozcieńczanie alkoholu");
  assert.ok(result.ingredients.some((ingredient) => ingredient.label === "Spirytus"));
  assert.ok(result.ingredients.some((ingredient) => ingredient.label === "Woda"));
});

test("kalkulator serowarski dobiera składniki dla goudy", () => {
  const result = calculateCheese({
    cheeseId: "gouda",
    milkLiters: 20,
    milkType: "low-pasteurized",
    rennetType: "microbial",
  });

  assert.equal(result.calculatorId, "cheese");
  assert.equal(result.summary.find((item) => item.label === "Rodzaj sera")?.value, "Gouda");
  assert.ok(result.ingredients.some((ingredient) => ingredient.label === "Chlorek wapnia"));
  assert.ok(result.productRefs.some((ref) => ref.legacyId === "411242"));
  assert.ok(result.productRefs.some((ref) => ref.legacyId === "411201"));
});

test("kalkulator wędliniarski liczy peklowanie i wyposażenie szynkowaru", () => {
  const result = calculateMeat({
    method: "ham-cooker",
    curingMethod: "wet",
    meatKind: "pork",
    meatKg: 3,
    pieceWeightG: 900,
    meatThicknessCm: 8,
    curingProduct: "curing-salt",
    hamCookerSizeKg: 1.5,
    furtherProcessing: "scalding",
    extraBrineLiters: 0.5,
    woodChip: "alder",
  });

  assert.equal(result.calculatorId, "meat");
  assert.ok(result.lead.includes("Sugerowany czas peklowania"));
  assert.ok(result.ingredients.some((ingredient) => ingredient.label === "Zalewa"));
  assert.ok(result.productRefs.some((ref) => ref.legacyId === "313016" && ref.quantity === 2));
});

test("mapuje produkty po legacy ID i fallbacku oraz buduje linie koszyka", () => {
  const products = [
    makeProduct("401030", "Pożywka do wina Kombi Vita"),
    makeProduct("fallback-1", "Rurka fermentacyjna do pojemnika"),
    makeProduct("unrelated", "Produkt poboczny"),
  ];
  const resolved = resolveCalculatorProducts(products, [
    { legacyId: "401030", label: "Pożywka", quantity: 2 },
    { legacyId: "missing", label: "Rurka fermentacyjna", quantity: 1, fallbackQuery: "rurka fermentacyjna" },
    { legacyId: "also-missing", label: "Nieistniejący produkt", quantity: 1, fallbackQuery: "brak sygnału" },
  ]);

  assert.equal(resolved.length, 2);
  assert.equal(resolved[0]?.matchType, "legacy");
  assert.equal(resolved[1]?.matchType, "fallback");

  const lines = toCalculatorCartLines(resolved, new Set(["401030"]), { "401030": 3 });

  assert.deepEqual(lines, [
    { productId: "401030", variantId: "401030-default", quantity: 3 },
  ]);
});
