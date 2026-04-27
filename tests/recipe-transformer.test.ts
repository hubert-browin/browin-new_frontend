import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "../data/products";
import { mockBrowinRecipes } from "../data/mock-recipes";
import {
  buildRecipeCountsByProductId,
  findRecipesByProductId,
  hydrateRecipeProducts,
} from "../lib/recipe-commerce";
import { enrichRecipeIngredientMatches } from "../lib/recipe-ingredient-matcher";
import { transformBrowinRecipes } from "../lib/recipe-transformer";

const makeProduct = ({
  id,
  price,
  title,
  categoryId = "wedliniarstwo",
  features = [],
  line = "Linia testowa",
  subtitle = "BROWIN",
  tags = [],
}: {
  categoryId?: Product["categoryId"];
  features?: string[];
  id: string;
  line?: string;
  price: number;
  subtitle?: string;
  tags?: string[];
  title: string;
}): Product => ({
  id,
  baseProductId: id,
  baseSlug: title.toLowerCase().replace(/\s+/g, "-"),
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  symbol: id,
  ean: id,
  title,
  subtitle,
  line,
  categoryId,
  shortDescription: title,
  description: title,
  longDescription: title,
  images: ["/assets/produkt1.webp"],
  status: "standard",
  tags,
  rating: 4.8,
  reviews: 12,
  soldLast30Days: 3,
  viewingNow: 1,
  popularityScore: 10,
  newestOrder: 1,
  benefits: [],
  features,
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
      label: "",
      sku: id,
      price,
      stock: 8,
      leadTime: "24",
      availabilityLabel: "Dostępny",
    },
  ],
});

const makeRecipe = ({
  contentHtml = "",
  ingredients,
  relatedProductIds,
  slug,
}: {
  contentHtml?: string;
  ingredients: Array<{ id: string; text: string; productId?: string }>;
  relatedProductIds: string[];
  slug: string;
}) => ({
  id: slug,
  slug,
  title: slug,
  excerpt: slug,
  metaDescription: slug,
  author: "BROWIN",
  category: {
    name: "Test",
    slug: "test",
  },
  publishedAt: "2026-04-27",
  heroImage: "/assets/produkt1.webp",
  images: ["/assets/produkt1.webp"],
  introHtml: "",
  ingredientsHtml: "",
  contentHtml,
  footer: "",
  tags: [],
  ingredients,
  ingredientLines: ingredients.map((ingredient) => ingredient.text),
  relatedProductIds,
  contentText: "",
  introText: "",
  newestOrder: 1,
});

test("transformuje przepisy, SEO pola, składniki i bezpieczny HTML", () => {
  const recipes = transformBrowinRecipes(
    mockBrowinRecipes,
    new Map([["310002", "receptura-babci-leokadii-do-peklowania-35-g"]]),
  );
  const recipe = recipes.find(
    (entry) => entry.slug === "udziec-z-indyka-z-pistacjami-szynkowar",
  );

  assert.ok(recipe);
  assert.equal(recipe.title, "Udziec z indyka z pistacjami - szynkowar");
  assert.equal(recipe.category.slug, "mieso-i-wedliny");
  assert.deepEqual(recipe.relatedProductIds, ["313016", "313015", "312024", "310002"]);
  assert.ok(recipe.metaDescription.includes("udziec"));
  assert.ok(recipe.ingredients.some((ingredient) => ingredient.productId === "310002"));
  assert.ok(
    recipe.ingredientsHtml.includes(
      '/produkt/receptura-babci-leokadii-do-peklowania-35-g',
    ),
  );
  assert.ok(!recipe.ingredientsHtml.includes("style="));
  assert.ok(recipe.contentHtml.includes('class="mb-4 mt-8'));
});

test("renderuje obrazki i starszy HTML z feedu przepisów", () => {
  const [recipe] = transformBrowinRecipes([
    {
      id: "legacy-recipe-html",
      datapublikacji: "2026-04-24",
      kategoria: {
        slug: "test",
        nazwa: "Test",
      },
      skladniki:
        '<ul><li><span style="color: red;">1 kg jabłek</span></li></ul>',
      slug: "legacy-recipe-html",
      tresc:
        '<h1 style="text-align: center;">Tytuł z CMS</h1><div style="text-align: justify;">Akapit w div z <b>pogrubieniem</b> i <i>kursywą</i>.</div><p style="text-align: center;">https://browin.pl/static/images/600/domowy-ocet-jablkowy-1-10.webp</p><p><a href="https://browin.pl/kalkulator-nalewkowy">https://browin.pl/static/images/600/kokosanka-likier-kokosowy-nalewkarski-2.webp</a></p><p>Tekst przed<br>https://browin.pl/static/images/600/domowa-watrobianka.webp<br>podpis</p><p>﻿https://browin.pl/static/images/600/makaron-z-krewetkami.webp</p><table><tr><th>Etap</th><td>Opis</td></tr></table>',
      tytul: "Legacy recipe HTML",
      wstep:
        '<div style="text-align: justify;"><font color="red">Wstęp</font> z <u>podkreśleniem</u>.</div>',
      zdjecie: "https://browin.pl/static/images/900/domowy-ocet-jablkowy.webp",
    },
  ]);

  assert.ok(recipe);
  assert.ok(recipe.introHtml.includes('<div class="mb-4">Wstęp z <u'));
  assert.ok(recipe.contentHtml.includes('<h2 class="mb-4 mt-8'));
  assert.ok(recipe.contentHtml.includes('<strong class="font-bold text-browin-dark">'));
  assert.ok(recipe.contentHtml.includes('<em class="italic">'));
  assert.ok(recipe.contentHtml.includes('<figure class="my-7">'));
  assert.ok(recipe.contentHtml.includes('alt="Zdjęcie z przepisu"'));
  assert.ok(recipe.contentHtml.includes('loading="lazy"'));
  assert.ok(recipe.contentHtml.includes('src="https://browin.pl/static/images/600/domowy-ocet-jablkowy-1-10.webp"'));
  assert.ok(recipe.contentHtml.includes('src="https://browin.pl/static/images/600/kokosanka-likier-kokosowy-nalewkarski-2.webp"'));
  assert.ok(recipe.contentHtml.includes('href="/kalkulator-nalewkowy"><img'));
  assert.ok(recipe.contentHtml.includes('src="https://browin.pl/static/images/600/domowa-watrobianka.webp"'));
  assert.ok(recipe.contentHtml.includes('src="https://browin.pl/static/images/600/makaron-z-krewetkami.webp"'));
  assert.ok(recipe.contentHtml.includes('<table class="my-6 w-full border-collapse text-sm">'));
  assert.ok(!recipe.contentHtml.includes("style="));
  assert.ok(!recipe.contentHtml.includes(">https://browin.pl/static/images"));
  assert.ok(!recipe.contentText.includes("static/images"));
});

test("oznacza przerywniki sekcji jako separatory zamiast skladnikow", () => {
  const [recipe] = transformBrowinRecipes([
    {
      id: "recipe-separators",
      datapublikacji: "2026-04-27",
      kategoria: {
        slug: "test",
        nazwa: "Test",
      },
      skladniki:
        "<p><span>Na 1 L zalewy:</span></p><p>500 g ciecierzycy</p><p>Zalewa:</p><ul><li>250 ml octu</li></ul>",
      slug: "recipe-separators",
      tresc: "<p>Test</p>",
      tytul: "Recipe separators",
      zdjecie: "https://browin.pl/static/images/900/domowy-ocet-jablkowy.webp",
    },
  ]);

  assert.ok(recipe);
  assert.deepEqual(
    recipe.ingredients.map((ingredient) => ({
      kind: ingredient.kind,
      text: ingredient.text,
    })),
    [
      { kind: "separator", text: "Na 1 L zalewy:" },
      { kind: undefined, text: "500 g ciecierzycy" },
      { kind: "separator", text: "Zalewa:" },
      { kind: undefined, text: "250 ml octu" },
    ],
  );
  assert.deepEqual(recipe.ingredientLines, ["500 g ciecierzycy", "250 ml octu"]);
});

test("dzieli paragraf z wieloma skladnikami na osobne pozycje", () => {
  const [recipe] = transformBrowinRecipes([
    {
      id: "recipe-br-lines",
      datapublikacji: "2026-04-27",
      kategoria: {
        slug: "test",
        nazwa: "Test",
      },
      skladniki: "<p>1 kg szynki<br>3 g saletry<br>80 g soli<br>1 L zimnej wody</p>",
      slug: "recipe-br-lines",
      tresc: "<p>Test</p>",
      tytul: "Recipe br lines",
      zdjecie: "https://browin.pl/static/images/900/domowy-ocet-jablkowy.webp",
    },
  ]);

  assert.ok(recipe);
  assert.deepEqual(recipe.ingredientLines, [
    "1 kg szynki",
    "3 g saletry",
    "80 g soli",
    "1 L zimnej wody",
  ]);
});

test("buduje odwrotny indeks przepisów po ID produktu", () => {
  const recipes = transformBrowinRecipes(mockBrowinRecipes);
  const counts = buildRecipeCountsByProductId(recipes);
  const szynkowarRecipes = findRecipesByProductId(recipes, "313016");

  assert.equal(counts["313016"], 1);
  assert.equal(counts["411240"], 1);
  assert.equal(szynkowarRecipes[0]?.slug, "udziec-z-indyka-z-pistacjami-szynkowar");
});

test("klasyfikuje produkty przepisu na sprzęt i zapasy", () => {
  const [recipe] = transformBrowinRecipes(mockBrowinRecipes);

  assert.ok(recipe);

  const hydrated = hydrateRecipeProducts(recipe, [
    makeProduct({ id: "313016", title: "Szynkowar ze stali nierdzewnej", price: 119.99 }),
    makeProduct({ id: "310002", title: "Receptura Babci Leokadii do peklowania", price: 7.99 }),
  ]);

  assert.equal(
    hydrated.productGroups.find((group) => group.role === "equipment")?.products[0]?.product.id,
    "313016",
  );
  assert.equal(
    hydrated.productGroups.find((group) => group.role === "consumable")?.products[0]?.product.id,
    "310002",
  );
});

test("zachowuje jawny link produktowy w skladniku", () => {
  const [recipe] = enrichRecipeIngredientMatches(
    [
      makeRecipe({
        slug: "jawny-link",
        ingredients: [
          {
            id: "ingredient-1",
            text: "Mieszanka peklujaca",
            productId: "310002",
          },
        ],
        relatedProductIds: ["310002", "404922"],
      }),
    ],
    [
      makeProduct({
        id: "310002",
        price: 7.99,
        title: "Receptura Babci Leokadii do peklowania, 35 g",
      }),
      makeProduct({
        id: "404922",
        price: 19.99,
        title: "Mieszanka peklujaca premium, 40 g",
      }),
    ],
  );

  assert.equal(recipe.ingredients[0]?.productId, "310002");
});

test("automatycznie podpina skladnik VLEYTO do powiazanego produktu", () => {
  const ingredientText = "pół nakrętki esencji VLEYTO Pigwa & Miód";
  const [recipe] = enrichRecipeIngredientMatches(
    [
      makeRecipe({
        slug: "sparkling-pigwa-orzezwiajacy-bezalkoholowy-drink-z-nuta-miodu-i-pigwy",
        ingredients: [{ id: "ingredient-1", text: ingredientText }],
        relatedProductIds: ["312022", "602555", "602503", "404922"],
      }),
    ],
    [
      makeProduct({
        id: "312022",
        price: 249.99,
        title: "Saturator Soda Joy do wody gazowanej",
        categoryId: "gorzelnictwo",
      }),
      makeProduct({
        id: "602555",
        price: 14.99,
        title: "Miarka barmańska 20/40 ml",
      }),
      makeProduct({
        id: "602503",
        price: 11.99,
        title: "Syrop do drinków miodowy, 250 ml",
      }),
      makeProduct({
        id: "404922",
        price: 17.99,
        title: "VLEYTO Pigwa & Miód - esencja smakowa z naturalnymi aromatami, 250 ml",
        tags: ["name_keyword:vleyto pigwa miod", "esencja smakowa"],
      }),
    ],
  );

  assert.equal(recipe.ingredients[0]?.productId, "404922");

  const hydrated = hydrateRecipeProducts(recipe, [
    makeProduct({
      id: "312022",
      price: 249.99,
      title: "Saturator Soda Joy do wody gazowanej",
      categoryId: "gorzelnictwo",
    }),
    makeProduct({
      id: "404922",
      price: 17.99,
      title: "VLEYTO Pigwa & Miód - esencja smakowa z naturalnymi aromatami, 250 ml",
      tags: ["name_keyword:vleyto pigwa miod", "esencja smakowa"],
    }),
  ]);

  assert.equal(
    hydrated.availableProducts.find((entry) => entry.product.id === "404922")?.ingredientText,
    ingredientText,
  );
});

test("preferuje produkt o zgodnej pojemnosci", () => {
  const [recipe] = enrichRecipeIngredientMatches(
    [
      makeRecipe({
        slug: "sloiki",
        ingredients: [{ id: "ingredient-1", text: "1 słoik 900 ml" }],
        relatedProductIds: ["500001", "900001"],
      }),
    ],
    [
      makeProduct({
        id: "500001",
        price: 3.49,
        title: "Słoik TO fi 82, 500 ml",
        categoryId: "domiogrod",
      }),
      makeProduct({
        id: "900001",
        price: 4.19,
        title: "Słoik TO fi 82, 900 ml",
        categoryId: "domiogrod",
      }),
    ],
  );

  assert.equal(recipe.ingredients[0]?.productId, "900001");
});

test("nie matchuje skladu przy zbyt slabym sygnale", () => {
  const [recipe] = enrichRecipeIngredientMatches(
    [
      makeRecipe({
        slug: "slaby-sygnal",
        ingredients: [
          { id: "ingredient-1", text: "74 C" },
          { id: "ingredient-2", text: "wino" },
        ],
        relatedProductIds: ["thermo", "yeast"],
      }),
    ],
    [
      makeProduct({
        id: "thermo",
        price: 22.99,
        title: "Termometr do wina 0-100 C",
        categoryId: "termometry",
      }),
      makeProduct({
        id: "yeast",
        price: 5.99,
        title: "Drożdże winiarskie do czerwonych win",
      }),
    ],
  );

  assert.equal(recipe.ingredients[0]?.productId, undefined);
  assert.equal(recipe.ingredients[1]?.productId, undefined);
});

test("wybiera najlepiej punktowany produkt sposrod kwalifikowanych kandydatow", () => {
  const [recipe] = enrichRecipeIngredientMatches(
    [
      makeRecipe({
        slug: "najlepszy-kandydat",
        ingredients: [{ id: "ingredient-1", text: "1 butelka esencji VLEYTO Pigwa & Miód" }],
        relatedProductIds: ["404922", "404923"],
      }),
    ],
    [
      makeProduct({
        id: "404922",
        price: 17.99,
        title: "VLEYTO Pigwa & Miód - esencja smakowa, 250 ml",
      }),
      makeProduct({
        id: "404923",
        price: 17.99,
        title: "VLEYTO Cytryna - esencja smakowa, 250 ml",
      }),
    ],
  );

  assert.equal(recipe.ingredients[0]?.productId, "404922");
});
