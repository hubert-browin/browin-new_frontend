import { freeShippingThreshold } from "@/lib/catalog";

export type DeliveryMethodId = "inpost" | "courier" | "pickup";

export type PaymentMethodId =
  | "blik"
  | "card"
  | "p24"
  | "paypo"
  | "bank-transfer";

export type DiscountResult = {
  amount: number;
  code: string;
  label: string;
};

type DiscountDefinition = {
  code: string;
  label: string;
  maxDiscount?: number;
  minSubtotal: number;
  type: "fixed" | "percent";
  value: number;
};

export const deliveryMethods = [
  {
    id: "inpost",
    name: "Paczkomat InPost",
    price: 14.9,
    eta: "1-2 dni robocze",
    hint: "Najczęściej wybierana opcja w zamówieniach BROWIN.",
  },
  {
    id: "courier",
    name: "Kurier",
    price: 16.9,
    eta: "1-2 dni robocze",
    hint: "Wygodna dostawa pod drzwi dla większych zestawów.",
  },
  {
    id: "pickup",
    name: "Odbiór osobisty",
    price: 0,
    eta: "po potwierdzeniu gotowości",
    hint: "Bez kosztu dostawy, płatność online lub przy odbiorze w kolejnym etapie integracji.",
  },
] as const satisfies ReadonlyArray<{
  eta: string;
  hint: string;
  id: DeliveryMethodId;
  name: string;
  price: number;
}>;

export const paymentMethods = [
  {
    id: "blik",
    name: "BLIK",
    detail: "Szybkie potwierdzenie w aplikacji bankowej.",
  },
  {
    id: "card",
    name: "Karta",
    detail: "Docelowo tokenizowany formularz operatora płatności.",
  },
  {
    id: "p24",
    name: "Szybki przelew",
    detail: "Przelewy24 lub inny operator po stronie integracji.",
  },
  {
    id: "paypo",
    name: "PayPo",
    detail: "Płatność odroczona, gdy operator potwierdzi dostępność.",
  },
  {
    id: "bank-transfer",
    name: "Przelew tradycyjny",
    detail: "Dane do przelewu w mailu potwierdzającym zamówienie.",
  },
] as const satisfies ReadonlyArray<{
  detail: string;
  id: PaymentMethodId;
  name: string;
}>;

export const demoDiscountCodes = [
  {
    code: "DOMOWE10",
    label: "10% rabatu na produkty BROWIN",
    maxDiscount: 80,
    minSubtotal: 80,
    type: "percent",
    value: 10,
  },
  {
    code: "START20",
    label: "20 zł rabatu od 120 zł",
    minSubtotal: 120,
    type: "fixed",
    value: 20,
  },
] as const satisfies ReadonlyArray<DiscountDefinition>;

export const normalizeDiscountCode = (value: string) =>
  value.trim().toUpperCase().replace(/\s+/g, "");

export const getDiscountForCode = (
  code: string,
  subtotal: number,
): DiscountResult | null => {
  const normalizedCode = normalizeDiscountCode(code);
  const discount = demoDiscountCodes.find((item) => item.code === normalizedCode);

  if (!discount || subtotal < discount.minSubtotal) {
    return null;
  }

  const rawAmount =
    discount.type === "percent" ? subtotal * (discount.value / 100) : discount.value;
  const maxDiscount = "maxDiscount" in discount ? discount.maxDiscount : undefined;
  const cappedAmount = maxDiscount ? Math.min(rawAmount, maxDiscount) : rawAmount;

  return {
    amount: Number(Math.min(subtotal, cappedAmount).toFixed(2)),
    code: discount.code,
    label: discount.label,
  };
};

export const calculateDeliveryCost = ({
  deliveryMethodId,
  discountedSubtotal,
}: {
  deliveryMethodId: DeliveryMethodId;
  discountedSubtotal: number;
}) => {
  const method = deliveryMethods.find((item) => item.id === deliveryMethodId);

  if (!method) {
    return 0;
  }

  if (method.id === "pickup" || discountedSubtotal >= freeShippingThreshold) {
    return 0;
  }

  return method.price;
};

export const getShippingProgress = (discountedSubtotal: number) =>
  Math.min((discountedSubtotal / freeShippingThreshold) * 100, 100);

export const getShippingRemaining = (discountedSubtotal: number) =>
  Math.max(freeShippingThreshold - discountedSubtotal, 0);

export const formatPostalCodeInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 5);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

export const isValidPostalCode = (value: string) => /^\d{2}-\d{3}$/.test(value);

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const normalizePhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("48") && digits.length === 11) {
    return digits.slice(2);
  }

  return digits;
};

export const isValidPolishPhone = (value: string) =>
  normalizePhoneDigits(value).length === 9;
