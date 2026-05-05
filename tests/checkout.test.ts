import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDeliveryCost,
  formatPostalCodeInput,
  getDiscountForCode,
  isValidEmail,
  isValidPolishPhone,
  isValidPostalCode,
} from "../lib/checkout";

test("formatuje i waliduje polski kod pocztowy", () => {
  assert.equal(formatPostalCodeInput("90123"), "90-123");
  assert.equal(formatPostalCodeInput("90-123abc"), "90-123");
  assert.equal(isValidPostalCode("90-123"), true);
  assert.equal(isValidPostalCode("90123"), false);
});

test("waliduje email i telefon w checkoutcie", () => {
  assert.equal(isValidEmail("klient@example.pl"), true);
  assert.equal(isValidEmail("klient.example.pl"), false);
  assert.equal(isValidPolishPhone("+48 501 222 333"), true);
  assert.equal(isValidPolishPhone("12345"), false);
});

test("nalicza demo rabaty i darmowa dostawe", () => {
  assert.deepEqual(getDiscountForCode(" domowe10 ", 200), {
    amount: 20,
    code: "DOMOWE10",
    label: "10% rabatu na produkty BROWIN",
  });
  assert.equal(getDiscountForCode("START20", 100), null);
  assert.equal(
    calculateDeliveryCost({ deliveryMethodId: "inpost", discountedSubtotal: 149 }),
    0,
  );
  assert.equal(
    calculateDeliveryCost({ deliveryMethodId: "courier", discountedSubtotal: 120 }),
    16.9,
  );
});
