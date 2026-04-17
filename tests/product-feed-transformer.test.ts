import assert from "node:assert/strict";
import test from "node:test";

import { getStoreCategories } from "../data/store";
import { transformBrowinProducts } from "../lib/product-feed-transformer";
import { browinProductsFixture } from "./fixtures/browin-products.fixture";

test("transformuje bundle, relacje i bezpieczny HTML opisu", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const product = products.find((entry) => entry.id === "344001");

  assert.ok(product);
  assert.equal(product.categoryId, "gorzelnictwo");
  assert.equal(product.status, "nowosc");
  assert.equal(product.badge, "Nowość");
  assert.equal(product.bundleItems.length, 2);
  assert.deepEqual(product.relatedProductIds, ["220305", "405662"]);
  assert.deepEqual(product.complementaryProductIds, ["405073", "640219"]);
  assert.ok(product.descriptionHtml?.includes('<h2 class="'));
  assert.ok(product.descriptionHtml?.includes("list-disc"));
});

test("nie duplikuje zdjęć z różnych rozmiarów tego samego kadru", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const product = products.find((entry) => entry.id === "344001");

  assert.ok(product);
  assert.equal(product.images.length, 1);
  assert.equal(
    product.images[0],
    "https://browin.pl/static/images/1600/destylator-hawkstill-aabratek-60l-60-3-mm-2-1-smart-344001.webp",
  );
});

test("mapuje pliki dokumentów do właściwych katalogów", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const docsProduct = products.find((entry) => entry.id === "403250");
  const termometerProduct = products.find((entry) => entry.id === "270109");

  assert.ok(docsProduct);
  assert.ok(termometerProduct);
  assert.equal(docsProduct.files[0]?.href, "https://browin.pl/static/docs/karty/angel-leaven-statement.pdf");
  assert.equal(docsProduct.files[0]?.label, "Skład");
  assert.equal(termometerProduct.files[0]?.type, "deklaracja");
  assert.equal(termometerProduct.files[1]?.type, "karta-produktu");
});

test("podstawia lokalny placeholder, gdy produkt nie ma zdjęć", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const product = products.find((entry) => entry.id === "353030_MAT");

  assert.ok(product);
  assert.deepEqual(product.images, ["/assets/produkt1.webp"]);
  assert.equal(product.variants[0]?.compareAtPrice, 8.99);
});

test("mapuje linie Stacje pogody i Wyrób jogurtu do istniejących kategorii sklepu", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const weatherProduct = products.find((entry) => entry.id === "270109");
  const yogurtProduct = products.find((entry) => entry.id === "411240");

  assert.ok(weatherProduct);
  assert.ok(yogurtProduct);
  assert.equal(weatherProduct.categoryId, "termometry");
  assert.equal(yogurtProduct.categoryId, "serowarstwo");
});

test("generuje dynamiczne sekcje menu na podstawie taksonomii produktów", () => {
  const products = transformBrowinProducts(browinProductsFixture);
  const storeCategories = getStoreCategories(products);
  const termometryCategory = storeCategories.find((entry) => entry.id === "termometry");
  const serowarstwoCategory = storeCategories.find((entry) => entry.id === "serowarstwo");

  assert.ok(termometryCategory);
  assert.ok(serowarstwoCategory);
  assert.ok(termometryCategory.menuSections.some((section) => section.topics.some((topic) => topic.label === "Elektroniczne")));
  assert.ok(serowarstwoCategory.menuSections.some((section) => section.topics.some((topic) => topic.label === "Kultury bakterii")));
});
