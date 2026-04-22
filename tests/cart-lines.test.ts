import assert from "node:assert/strict";
import test from "node:test";

import { mergeCartLines } from "../lib/cart-lines";

test("scala masowo dodawane linie koszyka z istniejącymi ilościami", () => {
  const merged = mergeCartLines(
    [
      { productId: "313016", variantId: "313016-default", quantity: 1 },
      { productId: "310002", variantId: "310002-default", quantity: 2 },
    ],
    [
      { productId: "313016", variantId: "313016-default", quantity: 1 },
      { productId: "411240", variantId: "411240-default", quantity: 3 },
      { productId: "999999", variantId: "999999-default", quantity: 0 },
    ],
  );

  assert.deepEqual(merged, [
    { productId: "313016", variantId: "313016-default", quantity: 2 },
    { productId: "310002", variantId: "310002-default", quantity: 2 },
    { productId: "411240", variantId: "411240-default", quantity: 3 },
  ]);
});
