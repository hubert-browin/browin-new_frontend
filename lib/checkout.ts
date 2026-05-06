import { freeShippingThreshold } from "@/lib/catalog";

export type DeliveryMethodId =
  | "ORLENPACZKA"
  | "DPD-PA-PL-5"
  | "INPOST"
  | "FEDEX"
  | "INPOSTKURIER"
  | "DPDPRZEDP2"
  | "DPDPOBR"
  | "ODBIOROSOBISTY"
  | "FEDEX-POBR";

export type PaymentMethodId =
  | "TWISTO"
  | "IMOJE"
  | "IMOJE_APPLEPAY"
  | "IMOJE_GPAY"
  | "IMOJE_BLIK"
  | "PAYU"
  | "PRZELEW";

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
    id: "ORLENPACZKA",
    name: "ORLEN Paczka",
    price: 11,
    previousPrice: 10.99,
    eta: "1-2 dni robocze",
    hint: "Odbiór w punkcie lub automacie ORLEN Paczka.",
    logoAlt: "ORLEN Paczka",
    logoSrc: "/static/img/postage/orlenpaczka.png",
    pointLabel: "punkt ORLEN Paczka",
    requiresPoint: true,
  },
  {
    id: "DPD-PA-PL-5",
    name: "DPD automat lub punkt odbioru",
    price: 8.99,
    eta: "1-2 dni robocze",
    hint: "Odbiór w automacie lub punkcie DPD Pickup.",
    logoAlt: "DPD automat lub punkt odbioru",
    logoSrc: "/static/img/postage/dpd_pickup_logo_2.png",
    pointLabel: "automat lub punkt DPD",
    requiresPoint: true,
  },
  {
    id: "INPOST",
    name: "InPost Paczkomaty 24/7",
    price: 12.2,
    eta: "1-2 dni robocze",
    hint: "Odbiór w wybranym paczkomacie InPost.",
    logoAlt: "InPost Paczkomaty 24/7",
    logoSrc: "/static/img/postage/inpost-paczkomat-logo-kwadrat.png",
    pointLabel: "paczkomat InPost",
    requiresPoint: true,
  },
  {
    id: "FEDEX",
    name: "FedEx kurier",
    price: 15.99,
    eta: "1-2 dni robocze",
    hint: "Dostawa kurierska FedEx pod wskazany adres.",
    logoAlt: "FedEx kurier",
    logoSrc: "/static/img/postage/fedex.png",
  },
  {
    id: "INPOSTKURIER",
    name: "InPost Kurier",
    price: 13.51,
    eta: "1-2 dni robocze",
    hint: "Dostawa kurierem InPost pod wskazany adres.",
    logoAlt: "InPost Kurier",
    logoSrc: "/static/img/postage/rectangle.png",
  },
  {
    id: "DPDPRZEDP2",
    name: "DPD Kurier Przedpłata",
    price: 18.29,
    eta: "1-2 dni robocze",
    hint: "Dostawa kurierem DPD po płatności online lub przelewem.",
    logoAlt: "DPD Kurier Przedpłata",
    logoSrc: "/static/img/postage/dpd_logored2015-32.png",
  },
  {
    id: "DPDPOBR",
    name: "DPD Kurier Pobranie",
    price: 21,
    eta: "1-2 dni robocze",
    hint: "Dostawa DPD z płatnością przy odbiorze.",
    logoAlt: "DPD Kurier Pobranie",
    logoSrc: "/static/img/postage/dpd.png",
  },
  {
    id: "ODBIOROSOBISTY",
    name: "Odbiór osobisty Salon Firmowy",
    price: 0,
    eta: "po potwierdzeniu gotowości",
    hint: "Odbiór osobisty w salonie firmowym BROWIN.",
    logoAlt: "Odbiór osobisty Salon Firmowy",
    logoSrc: "/static/dist/img/d_browin.png",
  },
  {
    id: "FEDEX-POBR",
    name: "FedEx Pobranie",
    price: 19.5,
    eta: "1-2 dni robocze",
    hint: "Dostawa FedEx z płatnością przy odbiorze.",
    logoAlt: "FedEx Pobranie",
    logoSrc: "/static/img/postage/fedex-1.png",
  },
] as const satisfies ReadonlyArray<{
  eta: string;
  hint: string;
  id: DeliveryMethodId;
  logoAlt: string;
  logoSrc: string;
  name: string;
  pointLabel?: string;
  previousPrice?: number;
  price: number;
  requiresPoint?: boolean;
}>;

export const paymentMethods = [
  {
    id: "TWISTO",
    name: "Twisto - płatności odroczone",
    detail: "Kup teraz zapłać później",
    logoAlt: "Twisto - płatności odroczone",
    logoSrc: "/static/dist/img/checkout/twisto.svg",
    shortName: "Twisto",
  },
  {
    id: "IMOJE",
    name: "iMoje - płatności online",
    detail: "BLIK, szybkie przelewy, karty płatnicze",
    logoAlt: "iMoje - płatności online",
    logoSrc: "/static/dist/img/checkout/imoje.svg",
    shortName: "iMoje",
  },
  {
    id: "IMOJE_APPLEPAY",
    name: "Apple Pay",
    detail: "płatności Apple Pay",
    logoAlt: "Apple Pay",
    logoSrc: "/static/dist/img/checkout/ApplePay.svg",
    shortName: "Apple Pay",
  },
  {
    id: "IMOJE_GPAY",
    name: "GPay",
    detail: "płatności Google Pay",
    logoAlt: "GPay",
    logoSrc: "/static/dist/img/checkout/gpay.png",
    shortName: "GPay",
  },
  {
    id: "IMOJE_BLIK",
    name: "Blik",
    detail: "płatności Blik",
    logoAlt: "Blik",
    logoSrc: "/static/dist/img/checkout/blik.png",
    shortName: "Blik",
  },
  {
    id: "PAYU",
    name: "PayU - płatności online",
    detail: "BLIK, szybkie przelewy, karty płatnicze",
    logoAlt: "PayU - płatności online",
    logoSrc: "/static/dist/img/checkout/PayU_card.jpg",
    shortName: "PayU",
  },
  {
    id: "PRZELEW",
    name: "Przelew tradycyjny",
    detail: "Dane do przelewu w mailu potwierdzającym zamówienie.",
    logoAlt: "Przelew tradycyjny",
    logoSrc: "/static/dist/img/checkout/pbl_b.png",
    shortName: "Przelew",
  },
] as const satisfies ReadonlyArray<{
  detail: string;
  id: PaymentMethodId;
  logoAlt: string;
  logoSrc: string;
  name: string;
  shortName: string;
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

  if (method.id === "ODBIOROSOBISTY" || discountedSubtotal >= freeShippingThreshold) {
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
