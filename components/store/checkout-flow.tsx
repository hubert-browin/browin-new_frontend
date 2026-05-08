"use client";

import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Check,
  CheckCircle,
  LockKey,
  Minus,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBagOpen,
  ShoppingCart,
  SpinnerGap,
  Ticket,
  Trash,
  Truck,
  UserPlus,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { FormEvent, InputHTMLAttributes } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import { formatCurrency, freeShippingThreshold } from "@/lib/catalog";
import {
  calculateDeliveryCost,
  deliveryMethods,
  formatPostalCodeInput,
  getDiscountForCode,
  getShippingProgress,
  getShippingRemaining,
  isValidEmail,
  isValidPolishPhone,
  normalizeDiscountCode,
  paymentMethods,
  type DeliveryMethodId,
  type DiscountResult,
  type PaymentMethodId,
} from "@/lib/checkout";

type CheckoutStep =
  | "cart"
  | "contact"
  | "delivery"
  | "data"
  | "payment"
  | "success";
type CartItem = ReturnType<typeof useCart>["items"][number];
type RemovedCheckoutLine = Pick<CartItem, "product" | "quantity" | "variant"> & {
  expiresAt: number;
  listPosition?: number;
  source?: "desktop" | "mobile-cart-products";
  undoId: string;
};
type CheckoutField =
  | keyof CheckoutForm
  | "blikCode"
  | "deliveryMethod"
  | "discount";
type DeliveryMethod = {
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
};

type CheckoutForm = {
  billingCity: string;
  billingHouseNumber: string;
  billingPostalCode: string;
  billingStreet: string;
  city: string;
  country: string;
  differentBillingAddress: boolean;
  email: string;
  firstName: string;
  houseNumber: string;
  inpostPoint: string;
  lastName: string;
  marketingAccepted: boolean;
  phone: string;
  postalCode: string;
  street: string;
  taxId: string;
  termsAccepted: boolean;
  wantsInvoice: boolean;
};

type CheckoutOrder = {
  createdAt: string;
  deliveryCost: number;
  deliveryMethodId: DeliveryMethodId;
  discount: DiscountResult | null;
  discountedSubtotal: number;
  email: string;
  estimatedDelivery: string;
  inpostPoint: string;
  items: CartItem[];
  orderNumber: string;
  paymentMethodId: PaymentMethodId;
  subtotal: number;
  total: number;
};

type PersistedCheckout = {
  currentStep?: CheckoutStep;
  deliveryMethodId?: DeliveryMethodId;
  discountCode?: string;
  form?: Partial<CheckoutForm>;
  paymentMethodId?: PaymentMethodId;
};

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  error?: string;
  hint?: string;
  id: string;
  label: string;
  wrapperClassName?: string;
};

type CheckoutAnalyticsPayload = Record<
  string,
  boolean | null | number | string | undefined
>;

const STORAGE_KEY = "browin-checkout-demo";
const REMOVED_LINE_UNDO_DURATION_MS = 5000;
const defaultForm: CheckoutForm = {
  billingCity: "",
  billingHouseNumber: "",
  billingPostalCode: "",
  billingStreet: "",
  city: "",
  country: "Polska",
  differentBillingAddress: false,
  email: "",
  firstName: "",
  houseNumber: "",
  inpostPoint: "",
  lastName: "",
  marketingAccepted: false,
  phone: "",
  postalCode: "",
  street: "",
  taxId: "",
  termsAccepted: false,
  wantsInvoice: false,
};

const deliveryCountries = [
  "Austria",
  "Belgia",
  "Bułgaria",
  "Czechy",
  "Niemcy",
  "Dania",
  "Estonia",
  "Hiszpania",
  "Finlandia",
  "Francja",
  "Wielka Brytania",
  "Grecja",
  "Chorwacja",
  "Węgry",
  "Irlandia",
  "Włochy",
  "Litwa",
  "Luksemburg",
  "Łotwa",
  "Holandia",
  "Polska",
  "Portugalia",
  "Rumunia",
  "Szwecja",
  "Słowenia",
  "Słowacja",
] as const;

type DeliveryCountry = (typeof deliveryCountries)[number];

const deliveryCountryCodes: Record<DeliveryCountry, string> = {
  Austria: "at",
  Belgia: "be",
  Bułgaria: "bg",
  Czechy: "cz",
  Niemcy: "de",
  Dania: "dk",
  Estonia: "ee",
  Hiszpania: "es",
  Finlandia: "fi",
  Francja: "fr",
  "Wielka Brytania": "gb",
  Grecja: "gr",
  Chorwacja: "hr",
  Węgry: "hu",
  Irlandia: "ie",
  Włochy: "it",
  Litwa: "lt",
  Luksemburg: "lu",
  Łotwa: "lv",
  Holandia: "nl",
  Polska: "pl",
  Portugalia: "pt",
  Rumunia: "ro",
  Szwecja: "se",
  Słowenia: "si",
  Słowacja: "sk",
};

const checkoutSteps = [
  { id: "contact", label: "Kontakt" },
  { id: "delivery", label: "Dostawa" },
  { id: "data", label: "Dane" },
  { id: "payment", label: "Płatność" },
] as const satisfies ReadonlyArray<{
  id: Exclude<CheckoutStep, "cart" | "success">;
  label: string;
}>;

const mobileCheckoutStages = [
  { id: "cart", label: "Zamówienie" },
  { id: "contact", label: "Kontakt" },
  { id: "delivery", label: "Dostawa" },
  { id: "data", label: "Dane" },
  { id: "payment", label: "Płatność" },
] as const satisfies ReadonlyArray<{
  id: Exclude<CheckoutStep, "success">;
  label: string;
}>;

const checkoutStepIds = [
  "cart",
  "contact",
  "delivery",
  "data",
  "payment",
  "success",
] as const satisfies ReadonlyArray<CheckoutStep>;

type DesktopCheckoutStep = (typeof checkoutSteps)[number]["id"];

const stepIndex = (step: DesktopCheckoutStep) =>
  checkoutSteps.findIndex((candidate) => candidate.id === step);

const getDesktopCheckoutStep = (step: CheckoutStep): DesktopCheckoutStep => {
  if (step === "cart" || step === "contact") {
    return "contact";
  }

  if (step === "success") {
    return "payment";
  }

  return step;
};

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const formatPolishPlural = (
  value: number,
  singular: string,
  few: string,
  many: string,
) => {
  const lastDigit = value % 10;
  const lastTwoDigits = value % 100;

  if (value === 1) return singular;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return few;
  }

  return many;
};

const isDeliveryMethodId = (value: unknown): value is DeliveryMethodId =>
  deliveryMethods.some((method) => method.id === value);

const isPaymentMethodId = (value: unknown): value is PaymentMethodId =>
  paymentMethods.some((method) => method.id === value);

const isCheckoutStep = (value: unknown): value is CheckoutStep =>
  checkoutStepIds.includes(value as CheckoutStep);

const isDeliveryCountry = (value: string): value is DeliveryCountry =>
  deliveryCountries.includes(value as DeliveryCountry);

const normalizeCountrySearch = (value: string) =>
  value
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l");

const postalCodeRules: Record<
  DeliveryCountry,
  { example: string; pattern: RegExp }
> = {
  Austria: { example: "1010", pattern: /^\d{4}$/ },
  Belgia: { example: "1000", pattern: /^\d{4}$/ },
  Bułgaria: { example: "1000", pattern: /^\d{4}$/ },
  Czechy: { example: "110 00", pattern: /^\d{3}\s?\d{2}$/ },
  Niemcy: { example: "10115", pattern: /^\d{5}$/ },
  Dania: { example: "1050", pattern: /^\d{4}$/ },
  Estonia: { example: "10111", pattern: /^\d{5}$/ },
  Hiszpania: { example: "28001", pattern: /^\d{5}$/ },
  Finlandia: { example: "00100", pattern: /^\d{5}$/ },
  Francja: { example: "75001", pattern: /^\d{5}$/ },
  "Wielka Brytania": {
    example: "SW1A 1AA",
    pattern: /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|GIR\s?0AA)$/i,
  },
  Grecja: { example: "105 58", pattern: /^\d{3}\s?\d{2}$/ },
  Chorwacja: { example: "10000", pattern: /^\d{5}$/ },
  Węgry: { example: "1051", pattern: /^\d{4}$/ },
  Irlandia: { example: "D02 X285", pattern: /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i },
  Włochy: { example: "00118", pattern: /^\d{5}$/ },
  Litwa: { example: "LT-01100", pattern: /^(LT-?)?\d{5}$/i },
  Luksemburg: { example: "1234", pattern: /^\d{4}$/ },
  Łotwa: { example: "LV-1050", pattern: /^(LV-?)?\d{4}$/i },
  Holandia: { example: "1011 AB", pattern: /^\d{4}\s?[A-Z]{2}$/i },
  Polska: { example: "00-000", pattern: /^\d{2}-?\d{3}$/ },
  Portugalia: { example: "1000-001", pattern: /^\d{4}-?\d{3}$/ },
  Rumunia: { example: "010011", pattern: /^\d{6}$/ },
  Szwecja: { example: "111 20", pattern: /^\d{3}\s?\d{2}$/ },
  Słowenia: { example: "1000", pattern: /^\d{4}$/ },
  Słowacja: { example: "811 01", pattern: /^\d{3}\s?\d{2}$/ },
};

const normalizePostalCode = (value: string) =>
  value.trim().toLocaleUpperCase("pl-PL").replace(/\s+/g, " ");

const formatGroupedDigitsPostalCode = (
  value: string,
  firstGroupLength: number,
  secondGroupLength: number,
  separator: "-" | " ",
) => {
  const digits = value.replace(/\D/g, "").slice(0, firstGroupLength + secondGroupLength);

  if (digits.length <= firstGroupLength) {
    return digits;
  }

  return `${digits.slice(0, firstGroupLength)}${separator}${digits.slice(firstGroupLength)}`;
};

const formatPrefixedDigitsPostalCode = (
  value: string,
  prefix: "LT" | "LV",
  digitCount: number,
) => {
  const withoutPrefix = value
    .toLocaleUpperCase("pl-PL")
    .replace(new RegExp(`^${prefix}-?`), "");
  const digits = withoutPrefix.replace(/\D/g, "").slice(0, digitCount);

  return digits ? `${prefix}-${digits}` : "";
};

type PostalCodeCharacterType = "alnum" | "digit" | "letter";

const postalCodeCharacterMatches = (
  character: string,
  type: PostalCodeCharacterType,
) => {
  if (type === "digit") {
    return /\d/.test(character);
  }

  if (type === "letter") {
    return /[A-Z]/.test(character);
  }

  return /[A-Z0-9]/.test(character);
};

const postalCodePatternAcceptsPrefix = (
  candidate: string,
  pattern: PostalCodeCharacterType[],
) =>
  candidate.length <= pattern.length &&
  Array.from(candidate).every((character, index) =>
    postalCodeCharacterMatches(character, pattern[index]),
  );

const formatPatternedPostalCode = (
  value: string,
  patterns: PostalCodeCharacterType[][],
  splitAt?: number,
) => {
  const characters = value.toLocaleUpperCase("pl-PL").replace(/[^A-Z0-9]/g, "");
  let formatted = "";

  for (const character of characters) {
    const candidate = `${formatted}${character}`;

    if (patterns.some((pattern) => postalCodePatternAcceptsPrefix(candidate, pattern))) {
      formatted = candidate;
    }
  }

  if (splitAt && formatted.length > splitAt) {
    return `${formatted.slice(0, splitAt)} ${formatted.slice(splitAt)}`;
  }

  return formatted;
};

const formatUkPostalCode = (value: string) => {
  const regularUkPatterns: PostalCodeCharacterType[][] = [
    ["letter", "digit", "digit", "letter", "letter"],
    ["letter", "digit", "digit", "digit", "letter", "letter"],
    ["letter", "digit", "letter", "digit", "letter", "letter"],
    ["letter", "letter", "digit", "digit", "letter", "letter"],
    ["letter", "letter", "digit", "digit", "digit", "letter", "letter"],
    ["letter", "letter", "digit", "letter", "digit", "letter", "letter"],
  ];
  const characters = value.toLocaleUpperCase("pl-PL").replace(/[^A-Z0-9]/g, "");
  let formatted = "";

  for (const character of characters) {
    const candidate = `${formatted}${character}`;
    const isRegularPrefix = regularUkPatterns.some((pattern) =>
      postalCodePatternAcceptsPrefix(candidate, pattern),
    );
    const isGiroPrefix = "GIR0AA".startsWith(candidate);

    if (isRegularPrefix || isGiroPrefix) {
      formatted = candidate;
    }
  }

  if (formatted.length > 3) {
    return `${formatted.slice(0, -3)} ${formatted.slice(-3)}`;
  }

  return formatted;
};

const formatPostalCodeForCountry = (value: string, country: DeliveryCountry) => {
  const digitsOnly = (limit: number) => value.replace(/\D/g, "").slice(0, limit);
  const fourDigitCountries: DeliveryCountry[] = [
    "Austria",
    "Belgia",
    "Bułgaria",
    "Dania",
    "Węgry",
    "Luksemburg",
    "Słowenia",
  ];
  const fiveDigitCountries: DeliveryCountry[] = [
    "Niemcy",
    "Estonia",
    "Hiszpania",
    "Finlandia",
    "Francja",
    "Chorwacja",
    "Włochy",
  ];
  const threeTwoDigitCountries: DeliveryCountry[] = [
    "Czechy",
    "Grecja",
    "Szwecja",
    "Słowacja",
  ];

  if (country === "Polska") {
    return formatPostalCodeInput(value);
  }

  if (fourDigitCountries.includes(country)) {
    return digitsOnly(4);
  }

  if (fiveDigitCountries.includes(country)) {
    return digitsOnly(5);
  }

  if (threeTwoDigitCountries.includes(country)) {
    return formatGroupedDigitsPostalCode(value, 3, 2, " ");
  }

  if (country === "Portugalia") {
    return formatGroupedDigitsPostalCode(value, 4, 3, "-");
  }

  if (country === "Rumunia") {
    return digitsOnly(6);
  }

  if (country === "Holandia") {
    return formatPatternedPostalCode(
      value,
      [["digit", "digit", "digit", "digit", "letter", "letter"]],
      4,
    );
  }

  if (country === "Wielka Brytania") {
    return formatUkPostalCode(value);
  }

  if (country === "Irlandia") {
    return formatPatternedPostalCode(
      value,
      [
        ["letter", "digit", "digit", "alnum", "alnum", "alnum", "alnum"],
      ],
      3,
    );
  }

  if (country === "Litwa") {
    return formatPrefixedDigitsPostalCode(value, "LT", 5);
  }

  if (country === "Łotwa") {
    return formatPrefixedDigitsPostalCode(value, "LV", 4);
  }

  return value.toLocaleUpperCase("pl-PL").replace(/[^A-Z0-9 -]/g, "").slice(0, 12);
};

const getPostalCodeInputMode = (
  country: DeliveryCountry,
): InputHTMLAttributes<HTMLInputElement>["inputMode"] => {
  if (country === "Holandia" || country === "Wielka Brytania" || country === "Irlandia") {
    return "text";
  }

  return "numeric";
};

const isPostalCodeValidForCountry = (value: string, country: string) =>
  isDeliveryCountry(country)
    ? postalCodeRules[country].pattern.test(normalizePostalCode(value))
    : false;

const getPostalCodeError = (country: DeliveryCountry) =>
  `Podaj kod pocztowy w formacie ${postalCodeRules[country].example}.`;

const getDeliveryMethodsForCountry = (country: string) => {
  const normalizedCountry = country.trim().toLowerCase();

  if (!normalizedCountry) {
    return deliveryMethods;
  }

  return deliveryMethods;
};

const getPaymentMethodsForCountry = (country: string) => {
  const normalizedCountry = country.trim().toLowerCase();

  if (!normalizedCountry) {
    return paymentMethods;
  }

  return paymentMethods;
};

function MethodLogo({
  alt,
  className = "",
  sizes = "80px",
  src,
}: {
  alt: string;
  className?: string;
  sizes?: string;
  src: string;
}) {
  return (
    <span
      className={classNames(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-browin-white",
        className,
      )}
    >
      <Image
        alt={alt}
        className="object-contain object-center"
        fill
        sizes={sizes}
        src={src}
        unoptimized={src.endsWith(".svg")}
      />
    </span>
  );
}

function DeliveryPrice({
  align = "left",
  compact = false,
  cost,
  method,
}: {
  align?: "left" | "right";
  compact?: boolean;
  cost: number;
  method: DeliveryMethod;
}) {
  if (cost === 0) {
    return (
      <span
        className={classNames(
          "block font-bold text-browin-red",
          compact ? "text-[11px]" : "text-[12px]",
          align === "right" && "text-right",
        )}
      >
        {method.price === 0 ? formatCurrency(0) : "Gratis"}
      </span>
    );
  }

  return (
    <span
      className={classNames(
        "block font-bold leading-tight text-browin-red",
        compact ? "text-[11px]" : "text-[12px]",
        align === "right" && "text-right",
      )}
    >
      {method.previousPrice && cost === method.price ? (
        <span className="mb-0.5 block text-[10px] font-bold text-browin-dark/45 line-through">
          {formatCurrency(method.previousPrice)}
        </span>
      ) : null}
      {formatCurrency(cost)}
    </span>
  );
}

const generateOrderNumber = () => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const datePart = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");

  return `BRW-${datePart}-${randomPart}`;
};

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const trackCheckoutEvent = (
  event: string,
  payload: CheckoutAnalyticsPayload = {},
) => {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };
  const eventPayload = { event, ...payload };

  analyticsWindow.dataLayer?.push(eventPayload);
  window.dispatchEvent(new CustomEvent("browin:checkout", { detail: eventPayload }));
};

const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const mobileErrorFieldIds: Partial<Record<CheckoutField, string>> = {
  billingCity: "mobile-billing-city",
  billingHouseNumber: "mobile-billing-house",
  billingPostalCode: "mobile-billing-postal",
  billingStreet: "mobile-billing-street",
  blikCode: "mobile-blik",
  city: "mobile-city",
  country: "mobile-country",
  deliveryMethod: "mobile-delivery",
  email: "mobile-email",
  firstName: "mobile-first-name",
  houseNumber: "mobile-house",
  inpostPoint: "mobile-inpost-point-button",
  lastName: "mobile-last-name",
  phone: "mobile-phone",
  postalCode: "mobile-postal",
  street: "mobile-street",
  taxId: "mobile-nip",
  termsAccepted: "mobile-terms",
};

function CompactField({
  className = "",
  error,
  hint,
  id,
  label,
  wrapperClassName = "",
  ...props
}: FormFieldProps) {
  const descriptionId = hint ? `${id}-hint` : undefined;

  return (
    <div className={wrapperClassName}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/58" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={classNames(
          "mt-1 min-h-10 w-full border bg-browin-white px-2.5 py-2 text-[13px] font-bold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/38 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12 disabled:cursor-not-allowed disabled:bg-browin-gray disabled:text-browin-dark/58",
          error ? "border-browin-red bg-browin-red/5" : "border-browin-dark/12",
          className,
        )}
        id={id}
        {...props}
      />
      {hint ? (
        <p className="mt-1 text-[10px] leading-snug text-browin-dark/52" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function CountryFlag({
  className,
  country,
}: {
  className?: string;
  country: DeliveryCountry;
}) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "block h-4 w-6 overflow-hidden bg-contain bg-center bg-no-repeat",
        className,
      )}
      style={{
        backgroundImage: `url(https://flagcdn.com/${deliveryCountryCodes[country]}.svg)`,
      }}
    />
  );
}

function CountrySelect({
  error,
  id,
  label,
  name,
  onChange,
  mode = "dropdown",
  value,
}: {
  error?: string;
  id: string;
  label: string;
  mode?: "dropdown" | "sheet";
  name: string;
  onChange: (value: DeliveryCountry) => void;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sheetMetrics, setSheetMetrics] = useState({
    keyboardInset: 0,
    listBottomPadding: 8,
    maxHeight: 640,
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const isSheetMode = mode === "sheet";
  const listboxId = `${id}-listbox`;
  const sheetTitleId = `${id}-sheet-title`;
  const selectedCountry = value.trim();
  const selectedValue: DeliveryCountry | "" = isDeliveryCountry(selectedCountry)
    ? selectedCountry
    : "";
  const normalizedQuery = normalizeCountrySearch(query.trim());
  const filteredCountries = normalizedQuery
    ? deliveryCountries.filter((country) =>
        normalizeCountrySearch(country).includes(normalizedQuery),
      )
    : deliveryCountries;

  useEffect(() => {
    if (open && !isSheetMode) {
      const focusTimeout = window.setTimeout(() => searchRef.current?.focus(), 40);

      return () => window.clearTimeout(focusTimeout);
    }
  }, [isSheetMode, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!open || !isSheetMode) {
      return;
    }

    const updateSheetMetrics = () => {
      const viewport = window.visualViewport;
      const viewportHeight = Math.floor(viewport?.height ?? window.innerHeight);
      const rawBottomInset = viewport
        ? Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      const bottomInset = rawBottomInset > 24 ? rawBottomInset : 0;
      const listBottomPadding = bottomInset ? 64 : 8;
      const maxHeight = Math.max(
        260,
        Math.min(
          640,
          Math.floor(viewportHeight - 12),
          Math.floor(viewportHeight * 0.92),
        ),
      );

      setSheetMetrics({ keyboardInset: bottomInset, listBottomPadding, maxHeight });
    };

    const initialFrame = window.requestAnimationFrame(updateSheetMetrics);
    window.addEventListener("resize", updateSheetMetrics);
    window.addEventListener("orientationchange", updateSheetMetrics);
    window.visualViewport?.addEventListener("resize", updateSheetMetrics);
    window.visualViewport?.addEventListener("scroll", updateSheetMetrics);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.removeEventListener("resize", updateSheetMetrics);
      window.removeEventListener("orientationchange", updateSheetMetrics);
      window.visualViewport?.removeEventListener("resize", updateSheetMetrics);
      window.visualViewport?.removeEventListener("scroll", updateSheetMetrics);
    };
  }, [isSheetMode, open]);

  const closeDropdown = () => {
    setOpen(false);
    setQuery("");
    setSheetMetrics({ keyboardInset: 0, listBottomPadding: 8, maxHeight: 640 });
  };

  const selectCountry = (country: DeliveryCountry) => {
    onChange(country);
    closeDropdown();
  };

  const renderCountryOption = (
    country: DeliveryCountry,
    optionMode: "dropdown" | "sheet",
  ) => {
    const selected = country === selectedValue;

    return (
      <button
        aria-selected={selected}
        className={classNames(
          optionMode === "sheet"
            ? "grid min-h-12 w-full grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center gap-2 border px-3 text-left text-[14px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-browin-red/20"
            : "grid min-h-10 w-full grid-cols-[1.75rem_minmax(0,1fr)_1.25rem] items-center gap-2 px-3 text-left text-[13px] font-bold transition-colors hover:bg-browin-red/5 hover:text-browin-red focus-visible:bg-browin-red/5 focus-visible:text-browin-red focus-visible:outline-none",
          selected
            ? "border-browin-red bg-browin-red/5 text-browin-red"
            : optionMode === "sheet"
              ? "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red/35 hover:bg-browin-red/5"
              : "text-browin-dark",
        )}
        key={country}
        onClick={() => selectCountry(country)}
        role="option"
        type="button"
      >
        <CountryFlag
          className={optionMode === "sheet" ? "h-5 w-7" : undefined}
          country={country}
        />
        <span className="truncate">{country}</span>
        {selected ? <Check size={optionMode === "sheet" ? 17 : 15} weight="bold" /> : null}
      </button>
    );
  };

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (isSheetMode) {
          return;
        }

        const nextFocus =
          event.relatedTarget instanceof Node ? event.relatedTarget : null;

        if (!event.currentTarget.contains(nextFocus)) {
          closeDropdown();
        }
      }}
    >
      <label
        className="block text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/58"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative mt-1">
        <input name={name} type="hidden" value={selectedValue} />
        <button
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={classNames(
            "grid min-h-10 w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-2 border bg-browin-white px-2.5 py-2 text-left text-[13px] font-bold text-browin-dark outline-none transition-colors focus:border-browin-red focus:ring-2 focus:ring-browin-red/12",
            error ? "border-browin-red bg-browin-red/5" : "border-browin-dark/12",
          )}
          id={id}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          type="button"
        >
          {selectedValue ? (
            <CountryFlag country={selectedValue} />
          ) : (
            <span aria-hidden="true" className="block h-5 w-7 opacity-0" />
          )}
          <span className={classNames("truncate", !selectedValue && "text-browin-dark/42")}>
            {selectedValue || "Wybierz kraj dostawy"}
          </span>
          {isSheetMode ? (
            <ArrowRight
              aria-hidden="true"
              className="text-browin-dark/48"
              size={16}
              weight="bold"
            />
          ) : (
            <CaretDown
              aria-hidden="true"
              className={classNames(
                "text-browin-dark/48 transition-transform",
                open && "rotate-180",
              )}
              size={16}
              weight="bold"
            />
          )}
        </button>
        {open && !isSheetMode ? (
          <div className="absolute left-0 right-0 z-40 mt-1 border border-browin-dark/12 bg-browin-white shadow-sharp">
            <div className="border-b border-browin-dark/10 p-2">
              <input
                aria-label="Szukaj kraju dostawy"
                className="min-h-10 w-full border border-browin-dark/12 bg-browin-gray px-2.5 py-2 text-[13px] font-bold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/38 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj kraju"
                ref={searchRef}
                value={query}
              />
            </div>
            <div
              className="checkout-scrollbar max-h-60 overflow-y-auto py-1"
              id={listboxId}
              role="listbox"
            >
              {filteredCountries.length ? (
                filteredCountries.map((country) => renderCountryOption(country, "dropdown"))
              ) : (
                <p className="px-3 py-3 text-[12px] font-bold text-browin-dark/52">
                  Brak kraju na liście dostaw.
                </p>
              )}
            </div>
          </div>
        ) : null}
        {open && isSheetMode ? (
          <div
            aria-labelledby={sheetTitleId}
            aria-modal="true"
            className="fixed inset-0 z-[80] md:hidden"
            role="dialog"
          >
            <button
              aria-label="Zamknij wybór kraju dostawy"
              className="absolute inset-0 bg-browin-dark/42"
              onClick={closeDropdown}
              type="button"
            />
            {sheetMetrics.keyboardInset ? (
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 bg-browin-white"
                style={{ height: sheetMetrics.keyboardInset }}
              />
            ) : null}
            <div
              className="absolute inset-x-0 flex flex-col border-t border-browin-dark/10 bg-browin-white shadow-panel"
              style={{
                bottom: sheetMetrics.keyboardInset,
                maxHeight: sheetMetrics.maxHeight,
                paddingBottom: sheetMetrics.keyboardInset
                  ? 0
                  : "env(safe-area-inset-bottom)",
              }}
            >
              <div className="border-b border-browin-dark/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
                      Dostawa
                    </p>
                    <h3
                      className="mt-0.5 text-lg font-bold leading-tight text-browin-dark"
                      id={sheetTitleId}
                    >
                      Wybierz kraj
                    </h3>
                  </div>
                  <button
                    aria-label="Zamknij"
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-browin-dark/10 bg-browin-gray text-browin-dark transition-colors hover:border-browin-red/35 hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                    onClick={closeDropdown}
                    type="button"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>
                <input
                  aria-label="Szukaj kraju dostawy"
                  className="mt-3 min-h-11 w-full border border-browin-dark/12 bg-browin-gray px-3 py-2 text-[15px] font-bold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/38 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Szukaj kraju"
                  ref={searchRef}
                  value={query}
                />
              </div>
              <div
                className="checkout-scrollbar grid min-h-[6.5rem] flex-1 content-start gap-1 overflow-y-auto p-2"
                id={listboxId}
                role="listbox"
                style={{ paddingBottom: sheetMetrics.listBottomPadding }}
              >
                {filteredCountries.length ? (
                  filteredCountries.map((country) => renderCountryOption(country, "sheet"))
                ) : (
                  <p className="px-3 py-4 text-[13px] font-bold text-browin-dark/52">
                    Brak kraju na liście dostaw.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InvoiceSwitch({
  checked,
  id,
  onChange,
}: {
  checked: boolean;
  id: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={checked ? "Wyłącz fakturę VAT" : "Włącz fakturę VAT"}
      className={classNames(
        "flex min-h-12 w-full items-center justify-between gap-3 border bg-browin-white px-3.5 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red",
        "border-browin-dark/10 hover:border-browin-dark/20",
      )}
      id={id}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span className="min-w-0">
        <span
          className="block text-[13px] font-extrabold uppercase tracking-[0.1em] text-browin-dark sm:text-sm"
        >
          Faktura VAT
        </span>
      </span>
      <span
        aria-hidden="true"
        className={classNames(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-browin-red bg-browin-red"
            : "border-browin-dark/18 bg-browin-dark/10",
        )}
      >
        <span
          className={classNames(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-browin-white shadow-sm transition-transform",
            checked ? "translate-x-[1.35rem]" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

function QuantityControl({
  label,
  onDecrease,
  onIncrease,
  quantity,
}: {
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  quantity: number;
}) {
  return (
    <div className="flex items-center border border-browin-dark/10 bg-browin-gray">
      <button
        aria-label={`Zmniejsz ilość: ${label}`}
        className="flex h-9 w-9 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white focus-visible:bg-browin-dark focus-visible:text-browin-white focus-visible:outline-none"
        onClick={onDecrease}
        type="button"
      >
        <Minus size={15} />
      </button>
      <span className="w-10 text-center text-sm font-bold text-browin-dark" aria-live="polite">
        {quantity}
      </span>
      <button
        aria-label={`Zwiększ ilość: ${label}`}
        className="flex h-9 w-9 items-center justify-center text-browin-dark transition-colors hover:bg-browin-dark hover:text-browin-white focus-visible:bg-browin-dark focus-visible:text-browin-white focus-visible:outline-none"
        onClick={onIncrease}
        type="button"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function FreeShippingMeter({
  compact = false,
  discountedSubtotal,
}: {
  compact?: boolean;
  discountedSubtotal: number;
}) {
  const shippingRemaining = getShippingRemaining(discountedSubtotal);
  const shippingProgress = getShippingProgress(discountedSubtotal);
  const isUnlocked = shippingRemaining <= 0;

  return (
    <div
      className={classNames(
        "border bg-browin-white transition-colors",
        compact ? "p-3" : "p-4",
        isUnlocked ? "border-browin-red/35" : "border-browin-dark/10",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={classNames(
              "flex shrink-0 items-center justify-center",
              compact ? "h-8 w-8" : "h-10 w-10",
              isUnlocked ? "bg-browin-red text-browin-white" : "bg-browin-gray text-browin-red",
            )}
            aria-hidden="true"
          >
            <Truck size={compact ? 17 : 20} weight={isUnlocked ? "fill" : "regular"} />
          </span>
          <span className="min-w-0">
            <span
              className={classNames(
                "block font-bold leading-tight",
                compact ? "text-[12px]" : "text-sm",
                isUnlocked ? "text-browin-red" : "text-browin-dark",
              )}
            >
              {isUnlocked
                ? "Darmowa dostawa aktywna"
                : `Do darmowej dostawy ${formatCurrency(shippingRemaining)}`}
            </span>
            {!compact ? (
              <span className="mt-1 block text-xs font-semibold text-browin-dark/52">
                Próg zamówienia: {formatCurrency(freeShippingThreshold)}
              </span>
            ) : null}
          </span>
        </div>
        <span className="shrink-0 text-xs font-bold tabular-nums text-browin-red">
          {Math.round(shippingProgress)}%
        </span>
      </div>
      <div
        className={classNames("mt-3 overflow-hidden bg-browin-dark/10", compact ? "h-1.5" : "h-2")}
        aria-hidden="true"
      >
        <div
          className="h-full bg-browin-red transition-[width] duration-300"
          style={{ width: `${shippingProgress}%` }}
        />
      </div>
      {!compact ? (
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-browin-dark/38">
          <span>Koszyk</span>
          <span>{formatCurrency(freeShippingThreshold)}</span>
        </div>
      ) : null}
    </div>
  );
}

function OrderSummary({
  deliveryCost,
  deliveryMethodId,
  discount,
  discountedSubtotal,
  items,
  subtotal,
  total,
}: {
  deliveryCost: number;
  deliveryMethodId: DeliveryMethodId | null;
  discount: DiscountResult | null;
  discountedSubtotal: number;
  items: CartItem[];
  subtotal: number;
  total: number;
}) {
  const selectedDelivery: DeliveryMethod | undefined = deliveryMethods.find(
    (method) => method.id === deliveryMethodId,
  );

  return (
    <div>
      <div className="space-y-3">
        {items.length ? (
          items.map(({ product, quantity, variant }) => (
            <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_auto] gap-3 border border-browin-dark/10 bg-browin-gray p-3" key={`${product.id}-${variant.id}`}>
              <div className="relative h-14 self-center overflow-hidden bg-browin-white">
                <Image
                  alt={product.title}
                  className="object-contain object-center"
                  fill
                  sizes="56px"
                  src={product.images[0]}
                />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] font-bold leading-tight text-browin-dark">
                  {product.title}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-browin-dark/45">
                  {variant.label.trim() ? `${variant.label} • ` : ""}
                  {quantity} szt.
                </p>
              </div>
              <p className="text-right text-sm font-bold text-browin-dark">
                {formatCurrency(variant.price * quantity)}
              </p>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-browin-dark/15 bg-browin-gray p-4 text-sm leading-relaxed text-browin-dark/62">
            Koszyk jest pusty. Dodaj produkty, aby zobaczyć podsumowanie zamówienia.
          </div>
        )}
      </div>

      <div className="mt-5">
        <FreeShippingMeter discountedSubtotal={discountedSubtotal} />
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 text-browin-dark/68">
          <span>Produkty</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount ? (
          <div className="flex items-center justify-between gap-4 text-browin-red">
            <span>Rabat {discount.code}</span>
            <span>-{formatCurrency(discount.amount)}</span>
          </div>
        ) : null}
        {selectedDelivery ? (
          <div className="flex items-center justify-between gap-4 text-browin-dark/68">
            <span>{selectedDelivery.name}</span>
            <span>{deliveryCost === 0 ? "0,00 zł" : formatCurrency(deliveryCost)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-browin-dark/10 pt-4 text-xl font-bold tracking-tight text-browin-dark">
          <span>Razem brutto</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

export function CheckoutFlow() {
  const {
    addItem,
    clearCart,
    count,
    items,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [deliveryMethodId, setDeliveryMethodId] =
    useState<DeliveryMethodId | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>("TWISTO");
  const [form, setForm] = useState<CheckoutForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [discountDraft, setDiscountDraft] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [blikCode, setBlikCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [accountIntent, setAccountIntent] = useState(false);
  const [removedLines, setRemovedLines] = useState<RemovedCheckoutLine[]>([]);
  const [undoNow, setUndoNow] = useState(0);
  const [desktopDiscountOpen, setDesktopDiscountOpen] = useState(false);
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
  const [mobileCartProductsOpen, setMobileCartProductsOpen] = useState(false);
  const [mobileDiscountOpen, setMobileDiscountOpen] = useState(false);
  const [mobileStickyBarHeight, setMobileStickyBarHeight] = useState(0);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const mobileCheckoutRef = useRef<HTMLElement | null>(null);
  const mobileOrderRef = useRef<HTMLDivElement | null>(null);
  const mobileStickyBarRef = useRef<HTMLDivElement | null>(null);

  const discount = useMemo(
    () => (discountCode ? getDiscountForCode(discountCode, subtotal) : null),
    [discountCode, subtotal],
  );
  const discountedSubtotal = Math.max(subtotal - (discount?.amount ?? 0), 0);
  const deliveryCost = items.length && deliveryMethodId
    ? calculateDeliveryCost({
        deliveryMethodId,
        discountedSubtotal,
      })
    : 0;
  const total = discountedSubtotal + deliveryCost;
  const summaryItems = order?.items ?? items;
  const summarySubtotal = order?.subtotal ?? subtotal;
  const summaryDiscount = order?.discount ?? discount;
  const summaryDiscountedSubtotal = order?.discountedSubtotal ?? discountedSubtotal;
  const summaryDeliveryCost = order?.deliveryCost ?? deliveryCost;
  const summaryDeliveryMethodId = order?.deliveryMethodId ?? deliveryMethodId;
  const summaryTotal = order?.total ?? total;
  const checkoutErrorMessages = Array.from(
    new Set(Object.values(errors).filter((message): message is string => Boolean(message))),
  );
  const bottomPanelErrorMessages =
    checkoutErrorMessages.length > 2
      ? ["Uzupełnij wymagane pola, aby przejść dalej."]
      : checkoutErrorMessages;
  const bottomPanelErrorText = bottomPanelErrorMessages.join(" ");
  const lastRemovedLine = removedLines.at(-1) ?? null;
  const selectedCountry = form.country.trim();
  const countryForMethods: DeliveryCountry = isDeliveryCountry(selectedCountry)
    ? selectedCountry
    : "Polska";
  const requiresContactPostalCode = countryForMethods !== "Polska";
  const postalCodeLockedInDataStep =
    requiresContactPostalCode && Boolean(form.postalCode.trim());
  const availableDeliveryMethods = getDeliveryMethodsForCountry(countryForMethods);
  const availablePaymentMethods = getPaymentMethodsForCountry(countryForMethods);

  const selectedDelivery: DeliveryMethod | undefined = availableDeliveryMethods.find(
    (method) => method.id === deliveryMethodId,
  );
  const selectedPayment = availablePaymentMethods.find(
    (method) => method.id === paymentMethodId,
  );
  const selectedDeliveryRequiresPoint = Boolean(selectedDelivery?.requiresPoint);

  useEffect(() => {
    trackCheckoutEvent("checkout_view", {
      item_count: count,
      step: currentStep,
      total,
    });
  }, [count, currentStep, total]);

  useEffect(() => {
    if (!removedLines.length) {
      return;
    }

    const nextExpiry = Math.min(...removedLines.map((line) => line.expiresAt));
    const undoTimeout = window.setTimeout(() => {
      const now = Date.now();
      setRemovedLines((current) =>
        current.filter((line) => line.expiresAt > now),
      );
    }, Math.max(nextExpiry - Date.now(), 0));

    return () => window.clearTimeout(undoTimeout);
  }, [removedLines]);

  useEffect(() => {
    if (!removedLines.length) {
      return;
    }

    setUndoNow(Date.now());
    const progressInterval = window.setInterval(() => {
      setUndoNow(Date.now());
    }, 100);

    return () => window.clearInterval(progressInterval);
  }, [removedLines.length]);

  useEffect(() => {
    scrollPageToTop();

    const topFrame = window.requestAnimationFrame(scrollPageToTop);
    const topTimeout = window.setTimeout(scrollPageToTop, 120);

    return () => {
      window.cancelAnimationFrame(topFrame);
      window.clearTimeout(topTimeout);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as PersistedCheckout;

        if (parsed.form && typeof parsed.form === "object") {
          setForm({ ...defaultForm, ...parsed.form });
        }

        if (isDeliveryMethodId(parsed.deliveryMethodId)) {
          setDeliveryMethodId(parsed.deliveryMethodId);
        }

        if (isPaymentMethodId(parsed.paymentMethodId)) {
          setPaymentMethodId(parsed.paymentMethodId);
        }

        if (typeof parsed.discountCode === "string") {
          const normalized = normalizeDiscountCode(parsed.discountCode);
          setDiscountCode(normalized);
          setDiscountDraft(normalized);
        }

        if (
          isCheckoutStep(parsed.currentStep) &&
          parsed.currentStep !== "success"
        ) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || currentStep === "success") {
      return;
    }

    const payload: PersistedCheckout = {
      currentStep,
      discountCode,
      form,
      paymentMethodId,
    };

    if (deliveryMethodId) {
      payload.deliveryMethodId = deliveryMethodId;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [currentStep, deliveryMethodId, discountCode, form, hasHydrated, paymentMethodId]);

  useEffect(() => {
    if (currentStep !== "success" && hasHydrated && items.length === 0) {
      setCurrentStep("cart");
    }
  }, [currentStep, hasHydrated, items.length]);

  useEffect(() => {
    if (items.length <= 1) {
      setMobileCartProductsOpen(false);
    }
  }, [items.length]);

  useEffect(() => {
    if (discountCode && !discount) {
      setDiscountError("Ten kod nie spełnia już warunków dla aktualnej wartości koszyka.");
      return;
    }

    if (discountCode) {
      setDiscountError(null);
    }
  }, [discount, discountCode]);

  useEffect(() => {
    scrollPageToTop();

    const focusFrame = window.requestAnimationFrame(() => {
      scrollPageToTop();
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [currentStep]);

  useEffect(() => {
    const stickyBar = mobileStickyBarRef.current;

    if (!stickyBar || currentStep === "success" || !items.length) {
      setMobileStickyBarHeight(0);
      return;
    }

    const updateStickyBarHeight = () => {
      setMobileStickyBarHeight(Math.ceil(stickyBar.getBoundingClientRect().height));
    };

    updateStickyBarHeight();
    window.addEventListener("resize", updateStickyBarHeight);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.removeEventListener("resize", updateStickyBarHeight);
      };
    }

    const observer = new ResizeObserver(updateStickyBarHeight);
    observer.observe(stickyBar);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateStickyBarHeight);
    };
  }, [bottomPanelErrorText, currentStep, items.length, mobileOrderOpen]);

  useEffect(() => {
    const checkout = mobileCheckoutRef.current;
    const isMobileCheckout =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;

    if (!checkout || !isMobileCheckout || currentStep === "success") {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousHtmlOverscroll = html.style.overscrollBehaviorY;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyHeight = body.style.height;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyOverscroll = body.style.overscrollBehaviorY;
    let isScrollLocked = false;
    let lockedScrollY = 0;

    const restoreScrollStyles = () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
      html.style.overscrollBehaviorY = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.overscrollBehaviorY = previousBodyOverscroll;
    };

    const unlockScroll = () => {
      if (!isScrollLocked) {
        return;
      }

      restoreScrollStyles();
      window.scrollTo({ top: lockedScrollY, left: 0, behavior: "auto" });
      isScrollLocked = false;
    };

    const updateScrollLock = () => {
      const viewportHeight =
        Math.floor(window.visualViewport?.height ?? window.innerHeight);
      const checkoutHeight = Math.ceil(checkout.getBoundingClientRect().height);
      const shouldLockScroll =
        checkoutHeight <= viewportHeight + 1 &&
        !document.activeElement?.matches("input, textarea, select");

      if (!shouldLockScroll) {
        unlockScroll();
        return;
      }

      if (isScrollLocked) {
        html.style.height = `${viewportHeight}px`;
        body.style.height = `${viewportHeight}px`;
        return;
      }

      lockedScrollY = window.scrollY;
      isScrollLocked = true;
      html.style.overflow = "hidden";
      html.style.height = `${viewportHeight}px`;
      html.style.overscrollBehaviorY = "none";
      body.style.overflow = "hidden";
      body.style.height = `${viewportHeight}px`;
      body.style.position = "fixed";
      body.style.top = `-${lockedScrollY}px`;
      body.style.width = "100%";
      body.style.overscrollBehaviorY = "none";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const scheduleScrollLockUpdate = () => {
      window.requestAnimationFrame(updateScrollLock);
    };

    updateScrollLock();
    window.addEventListener("resize", scheduleScrollLockUpdate);
    window.addEventListener("orientationchange", scheduleScrollLockUpdate);
    window.addEventListener("focusin", scheduleScrollLockUpdate);
    window.addEventListener("focusout", scheduleScrollLockUpdate);
    window.visualViewport?.addEventListener("resize", scheduleScrollLockUpdate);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleScrollLockUpdate);
      observer.observe(checkout);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", scheduleScrollLockUpdate);
      window.removeEventListener("orientationchange", scheduleScrollLockUpdate);
      window.removeEventListener("focusin", scheduleScrollLockUpdate);
      window.removeEventListener("focusout", scheduleScrollLockUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleScrollLockUpdate);
      restoreScrollStyles();
    };
  }, [
    currentStep,
    discount,
    errors,
    form.country,
    form.differentBillingAddress,
    form.wantsInvoice,
    form.postalCode,
    items.length,
    mobileDiscountOpen,
    mobileOrderOpen,
    mobileStickyBarHeight,
    paymentMethodId,
  ]);

  const updateFormField = <Field extends keyof CheckoutForm>(
    field: Field,
    value: CheckoutForm[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const selectDeliveryCountry = (country: DeliveryCountry) => {
    setForm((current) => {
      if (current.country === country) {
        return current;
      }

      return {
        ...current,
        country,
        postalCode: "",
      };
    });
    setErrors((current) => {
      if (!current.country && !current.postalCode) {
        return current;
      }

      const next = { ...current };
      delete next.country;
      delete next.postalCode;
      return next;
    });
  };

  const removeCartLine = (
    line: CartItem,
    options: Pick<RemovedCheckoutLine, "listPosition" | "source"> = {},
  ) => {
    const removedAt = Date.now();

    setUndoNow(removedAt);
    setRemovedLines((current) => [
      ...current,
      {
        ...options,
        expiresAt: removedAt + REMOVED_LINE_UNDO_DURATION_MS,
        product: line.product,
        quantity: line.quantity,
        undoId: `${line.product.id}-${line.variant.id}-${removedAt}-${Math.random()
          .toString(36)
          .slice(2)}`,
        variant: line.variant,
      },
    ]);
    removeItem(line.product.id, line.variant.id);
  };

  const restoreRemovedLine = (undoId: string) => {
    const removedLine = removedLines.find((line) => line.undoId === undoId);

    if (!removedLine) {
      return;
    }

    addItem(
      removedLine.product.id,
      removedLine.variant.id,
      removedLine.quantity,
      { openCart: false },
    );
    setRemovedLines((current) => current.filter((line) => line.undoId !== undoId));
  };

  const renderUndoCountdownBar = (line: RemovedCheckoutLine) => {
    const progress = Math.max(
      0,
      Math.min(
        1,
        (line.expiresAt - undoNow) / REMOVED_LINE_UNDO_DURATION_MS,
      ),
    );

    return (
      <span
        aria-hidden="true"
        className="checkout-undo-progress pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-browin-red"
        style={{ transform: `scaleX(${progress})` }}
      />
    );
  };

  const renderUndoRemove = (variant: "desktop" | "mobile" = "desktop") => {
    if (!removedLines.length) {
      return null;
    }

    return (
      <div className="grid gap-2" aria-live="polite">
        {removedLines.map((line) => (
          <div
            className={classNames(
              "relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden text-browin-dark",
              variant === "mobile"
                ? "border border-browin-dark/10 bg-browin-white p-2 text-[11px]"
                : "border border-browin-red/15 bg-browin-red/5 p-3 text-sm",
            )}
            key={line.undoId}
          >
            <p className="min-w-0 truncate font-semibold">
              Usunięto: {line.product.title}
            </p>
            <button
              className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-red underline underline-offset-2 transition-colors hover:text-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
              onClick={() => restoreRemovedLine(line.undoId)}
              type="button"
            >
              Cofnij
            </button>
            {renderUndoCountdownBar(line)}
          </div>
        ))}
      </div>
    );
  };

  const focusFirstMobileError = (
    nextErrors: Partial<Record<CheckoutField, string>>,
  ) => {
    const firstErrorField = Object.keys(nextErrors)[0] as CheckoutField | undefined;

    if (!firstErrorField) {
      return;
    }

    trackCheckoutEvent("checkout_field_error", {
      field: firstErrorField,
      message: nextErrors[firstErrorField],
    });

    window.setTimeout(() => {
      const targetId =
        currentStep === "contact" && firstErrorField === "postalCode"
          ? "mobile-contact-postal"
          : mobileErrorFieldIds[firstErrorField];
      const target = targetId ? document.getElementById(targetId) : null;

      target?.scrollIntoView({ behavior: "smooth", block: "center" });

      if (
        target instanceof HTMLButtonElement ||
        target instanceof HTMLInputElement
      ) {
        target.focus({ preventScroll: true });
      }
    }, 40);
  };

  const selectDeliveryMethod = (methodId: DeliveryMethodId) => {
    setDeliveryMethodId(methodId);
    setForm((current) => {
      if (!current.inpostPoint) return current;
      return { ...current, inpostPoint: "" };
    });
    setErrors((current) => {
      if (!current.inpostPoint && !current.deliveryMethod) return current;
      const next = { ...current };
      delete next.inpostPoint;
      delete next.deliveryMethod;
      return next;
    });
    trackCheckoutEvent("checkout_method_change", {
      method: methodId,
      type: "delivery",
    });
  };

  const selectPaymentMethod = (methodId: PaymentMethodId) => {
    setPaymentMethodId(methodId);
    setErrors((current) => {
      const next = { ...current };
      delete next.blikCode;
      return next;
    });
    trackCheckoutEvent("checkout_method_change", {
      method: methodId,
      type: "payment",
    });
  };

  const applyDiscountCode = (code: string) => {
    const normalized = normalizeDiscountCode(code);

    if (!normalized) {
      setDiscountError("Wpisz kod rabatowy.");
      return;
    }

    const result = getDiscountForCode(normalized, subtotal);

    if (!result) {
      setDiscountCode("");
      setDiscountError("Kod jest nieprawidłowy albo wymaga wyższej wartości koszyka.");
      return;
    }

    setDiscountCode(result.code);
    setDiscountDraft(result.code);
    setDiscountError(null);
  };

  const applyDiscount = () => applyDiscountCode(discountDraft);

  const removeDiscount = () => {
    setDiscountCode("");
    setDiscountDraft("");
    setDiscountError(null);
  };

  const getContactErrors = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};

    if (!isValidEmail(form.email)) {
      nextErrors.email = "Podaj poprawny adres e-mail.";
    }

    const country = form.country.trim();

    if (!country) {
      nextErrors.country = "Wybierz kraj dostawy.";
    } else if (!isDeliveryCountry(country)) {
      nextErrors.country = "Wybierz kraj z listy obsługiwanych dostaw.";
    } else if (country !== "Polska" && !isPostalCodeValidForCountry(form.postalCode, country)) {
      nextErrors.postalCode = getPostalCodeError(country);
    }

    if (!form.termsAccepted) {
      nextErrors.termsAccepted = "Akceptacja regulaminu i polityki prywatności jest wymagana.";
    }

    return nextErrors;
  };

  const getDeliveryMethodErrors = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};
    const delivery: DeliveryMethod | undefined = availableDeliveryMethods.find(
      (method) => method.id === deliveryMethodId,
    );

    if (!deliveryMethodId || !delivery) {
      nextErrors.deliveryMethod = "Wybierz metodę dostawy.";
      return nextErrors;
    }

    if (delivery?.requiresPoint && !form.inpostPoint.trim()) {
      nextErrors.inpostPoint = `Wybierz ${delivery.pointLabel ?? "punkt odbioru"}.`;
    }

    return nextErrors;
  };

  const getDeliveryDataErrors = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};

    if (!isValidPolishPhone(form.phone)) {
      nextErrors.phone = "Podaj 9-cyfrowy numer telefonu, np. 501 222 333.";
    }
    if (!form.firstName.trim()) nextErrors.firstName = "Podaj imię.";
    if (!form.lastName.trim()) nextErrors.lastName = "Podaj nazwisko.";
    if (!form.street.trim()) nextErrors.street = "Podaj ulicę.";
    if (!form.houseNumber.trim()) nextErrors.houseNumber = "Podaj numer domu lub lokalu.";
    if (!isPostalCodeValidForCountry(form.postalCode, countryForMethods)) {
      nextErrors.postalCode = getPostalCodeError(countryForMethods);
    }
    if (!form.city.trim()) nextErrors.city = "Podaj miasto.";

    if (form.wantsInvoice) {
      if (form.taxId.replace(/\D/g, "").length !== 10) {
        nextErrors.taxId = "Podaj 10-cyfrowy NIP.";
      }
    }

    return nextErrors;
  };

  const validateErrors = (
    nextErrors: Partial<Record<CheckoutField, string>>,
    { focusMobile = false } = {},
  ) => {
    setErrors(nextErrors);
    if (focusMobile) {
      focusFirstMobileError(nextErrors);
    }
    return Object.keys(nextErrors).length === 0;
  };

  const validateContact = ({ focusMobile = false } = {}) =>
    validateErrors(getContactErrors(), { focusMobile });

  const validateDeliveryMethod = ({ focusMobile = false } = {}) =>
    validateErrors(getDeliveryMethodErrors(), { focusMobile });

  const validateDeliveryData = ({ focusMobile = false } = {}) =>
    validateErrors(getDeliveryDataErrors(), { focusMobile });

  const getPaymentErrors = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};

    if (paymentMethodId === "IMOJE_BLIK" && !/^\d{6}$/.test(blikCode)) {
      nextErrors.blikCode = "Podaj 6-cyfrowy kod BLIK.";
    }

    return nextErrors;
  };

  const validatePayment = ({ focusMobile = false } = {}) =>
    validateErrors(getPaymentErrors(), { focusMobile });

  const submitPayment = async ({
    focusMobile = false,
    source = "checkout",
  }: {
    focusMobile?: boolean;
    source?: string;
  } = {}) => {
    if (!deliveryMethodId || !selectedDelivery) {
      setErrors({ deliveryMethod: "Wybierz metodę dostawy." });
      setCurrentStep("delivery");
      if (focusMobile) {
        window.setTimeout(
          () => focusFirstMobileError({ deliveryMethod: "Wybierz metodę dostawy." }),
          40,
        );
      }
      return;
    }

    if (!validatePayment({ focusMobile }) || !items.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await wait(950);

    const orderSnapshot: CheckoutOrder = {
      createdAt: new Date().toISOString(),
      deliveryCost,
      deliveryMethodId,
      discount,
      discountedSubtotal,
      email: form.email,
      estimatedDelivery: selectedDelivery?.eta ?? "1-2 dni robocze",
      inpostPoint: form.inpostPoint,
      items,
      orderNumber: generateOrderNumber(),
      paymentMethodId,
      subtotal,
      total,
    };

    setOrder(orderSnapshot);
    setBlikCode("");
    setIsSubmitting(false);
    setCurrentStep("success");
    clearCart();
    window.localStorage.removeItem(STORAGE_KEY);
    trackCheckoutEvent("checkout_success", {
      delivery_method: deliveryMethodId,
      item_count: count,
      order_number: orderSnapshot.orderNumber,
      payment_method: paymentMethodId,
      source,
      total,
    });
  };

  const handleDesktopWizardSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length || isSubmitting) {
      return;
    }

    const desktopStep = getDesktopCheckoutStep(currentStep);

    if (desktopStep === "contact") {
      if (validateContact()) {
        setCurrentStep("delivery");
      }
      return;
    }

    if (desktopStep === "delivery") {
      if (validateDeliveryMethod()) {
        setCurrentStep("data");
      }
      return;
    }

    if (desktopStep === "data") {
      if (validateDeliveryData()) {
        setCurrentStep("payment");
      }
      return;
    }

    const contactErrors = getContactErrors();
    if (!validateErrors(contactErrors)) {
      setCurrentStep("contact");
      return;
    }

    const deliveryMethodErrors = getDeliveryMethodErrors();
    if (!validateErrors(deliveryMethodErrors)) {
      setCurrentStep("delivery");
      return;
    }

    const deliveryDataErrors = getDeliveryDataErrors();
    if (!validateErrors(deliveryDataErrors)) {
      setCurrentStep("data");
      return;
    }

    void submitPayment({ source: "desktop_express" });
  };

  const renderStepHeader = (
    eyebrow: string,
    title: string,
    description: string,
  ) => (
    <div className="border-b border-browin-dark/10 pb-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
        {eyebrow}
      </p>
      <h1
        className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark outline-none md:text-3xl"
        ref={headingRef}
        tabIndex={-1}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-browin-dark/66 md:text-base">
        {description}
      </p>
    </div>
  );

  const renderProgress = () => {
    const desktopCurrentStep = getDesktopCheckoutStep(currentStep);
    const activeIndex =
      currentStep === "success" ? checkoutSteps.length : stepIndex(desktopCurrentStep);
    const clampedActiveIndex = Math.max(
      0,
      Math.min(activeIndex, checkoutSteps.length - 1),
    );
    const desktopProgressWidth = `${
      ((clampedActiveIndex + 1) / checkoutSteps.length) * 100
    }%`;

    if (currentStep === "success") {
      return (
        <div
          aria-live="polite"
          className="mb-6 flex items-center justify-between gap-4 border border-browin-red/25 bg-browin-white p-4 shadow-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-browin-red text-browin-white">
              <CheckCircle size={24} weight="fill" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                Dziękujemy za zakup
              </span>
              <span className="mt-1 block text-sm font-bold leading-snug text-browin-dark md:text-base">
                Zamówienie przyjęte. Szczegóły i kolejne kroki znajdziesz poniżej.
              </span>
            </span>
          </div>
          {order ? (
            <span className="hidden shrink-0 border border-browin-dark/10 bg-browin-gray px-3 py-2 text-sm font-bold text-browin-dark md:block">
              {order.orderNumber}
            </span>
          ) : null}
        </div>
      );
    }

    return (
      <nav
        aria-label="Etapy checkoutu"
        className="mb-3 border border-browin-dark/10 bg-browin-white px-4 py-3 shadow-sm"
      >
        <div className="grid items-center gap-4 lg:grid-cols-[10rem_minmax(0,1fr)]">
          <Link
            aria-label="BROWIN - strona główna"
            className="inline-flex w-max shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
            href="/"
          >
            <Image
              alt="BROWIN"
              className="block object-contain"
              height={20}
              priority
              src="/assets/logo_BROWIN.svg"
              style={{ height: "auto", width: "9.25rem" }}
              width={148}
            />
          </Link>

          <ol className="grid min-w-0 grid-cols-4 gap-1.5">
            {checkoutSteps.map((step, index) => {
              const isActive = step.id === desktopCurrentStep;
              const isComplete = index < activeIndex;
              const canNavigate = index < activeIndex;

              return (
                <li key={step.id}>
                  <button
                    aria-current={isActive ? "step" : undefined}
                    className={classNames(
                      "grid w-full grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 px-1 py-1 text-left transition-colors disabled:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red",
                      isActive
                        ? "text-browin-red"
                        : isComplete
                          ? "text-browin-dark"
                          : "text-browin-dark/42",
                      canNavigate && "hover:text-browin-red",
                    )}
                    disabled={!canNavigate && !isActive}
                    onClick={() => setCurrentStep(step.id)}
                    type="button"
                  >
                    <span
                      className={classNames(
                        "flex h-7 w-7 items-center justify-center text-[11px] font-bold",
                        isActive
                          ? "bg-browin-red text-browin-white"
                          : isComplete
                            ? "bg-browin-red/10 text-browin-red"
                            : "bg-browin-gray text-browin-dark/42",
                      )}
                    >
                      {isComplete ? <Check size={14} weight="bold" /> : index + 1}
                    </span>
                    <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.08em] md:text-xs">
                      {step.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-3 h-1 bg-browin-dark/10" aria-hidden="true">
          <span
            className="block h-full bg-browin-red transition-[width]"
            style={{ width: desktopProgressWidth }}
          />
        </div>
      </nav>
    );
  };

  const renderSuccessStep = () => {
    const placedOrder = order;

    return (
      <div className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8">
        {renderStepHeader(
          "Potwierdzenie",
          "Dziękujemy za zamówienie",
          "Zamówienie zostało przyjęte w trybie demo. Poniżej pokazujemy komunikację, którą można podpiąć pod backend sklepu.",
        )}

        {placedOrder ? (
          <div className="mt-6 grid gap-6">
            <div className="border border-browin-red/25 bg-browin-red/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-browin-red text-browin-white">
                  <CheckCircle size={26} weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-browin-red">
                    Numer zamówienia
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-browin-dark">
                    {placedOrder.orderNumber}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-browin-dark/68">
                    Potwierdzenie trafi na adres {placedOrder.email}. Status płatności:{" "}
                    {placedOrder.paymentMethodId === "PRZELEW"
                      ? "oczekujemy na przelew tradycyjny"
                      : "płatność demonstracyjnie zaakceptowana"}
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-browin-dark/10 bg-browin-gray p-4">
                <Truck className="text-browin-red" size={24} />
                <h3 className="mt-3 font-bold text-browin-dark">Przewidywana dostawa</h3>
                <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                  {placedOrder.estimatedDelivery}
                </p>
              </div>
              <div className="border border-browin-dark/10 bg-browin-gray p-4">
                <Package className="text-browin-red" size={24} />
                <h3 className="mt-3 font-bold text-browin-dark">Co dalej</h3>
                <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                  Przygotujemy paczkę i wyślemy link do śledzenia przesyłki.
                </p>
              </div>
              <div className="border border-browin-dark/10 bg-browin-gray p-4">
                <ShieldCheck className="text-browin-red" size={24} weight="fill" />
                <h3 className="mt-3 font-bold text-browin-dark">Wsparcie BROWIN</h3>
                <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                  W razie pytań obsługa zamówienia działa zgodnie z regulaminem.
                </p>
              </div>
            </div>

            <div className="border border-browin-dark/10 bg-browin-gray p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-browin-dark">
                    Konto po zakupie
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                    Konto można założyć dopiero teraz, korzystając z danych zamówienia. Bez
                    przerywania checkoutu.
                  </p>
                  {accountIntent ? (
                    <p className="mt-2 text-sm font-bold text-browin-red">
                      Link aktywacyjny demo został przygotowany dla {placedOrder.email}.
                    </p>
                  ) : null}
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-browin-red bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                  onClick={() => setAccountIntent(true)}
                  type="button"
                >
                  <UserPlus size={18} />
                  Załóż konto
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="checkout-cta inline-flex min-h-12 items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.14em] text-browin-white transition-colors hover:bg-browin-dark"
                href="/"
              >
                Wróć do sklepu
                <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-browin-dark/12 bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
                href="/produkty?sort=popular"
              >
                Produkty uzupełniające
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-browin-dark/10 bg-browin-gray p-6 text-sm leading-relaxed text-browin-dark/65">
            Brakuje danych zamówienia. Wróć do sklepu i złóż zamówienie ponownie.
          </div>
        )}
      </div>
    );
  };

  const renderDesktopSection = ({
    action,
    children,
    className,
    eyebrow,
    title,
  }: {
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    eyebrow: React.ReactNode;
    title?: string;
  }) => (
    <section
      className={classNames(
        "min-w-0 border border-browin-dark/10 bg-browin-white p-3",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            {eyebrow}
          </p>
          {title ? (
            <h2 className="mt-0.5 text-base font-bold leading-tight text-browin-dark">
              {title}
            </h2>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );

  const renderDesktopInlineUndo = (line: RemovedCheckoutLine) => (
    <div
      aria-live="polite"
      className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden border border-browin-dark/10 bg-browin-white px-2.5 py-2 text-[11px] text-browin-dark"
    >
      <p className="min-w-0 truncate font-semibold text-browin-dark/58">
        <span className="font-bold text-browin-dark">Usunięto</span>{" "}
        {line.product.title}
      </p>
      <button
        className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red underline underline-offset-2 transition-colors hover:text-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
        onClick={() => restoreRemovedLine(line.undoId)}
        type="button"
      >
        Cofnij
      </button>
      {renderUndoCountdownBar(line)}
    </div>
  );

  const renderDesktopOrderPanel = () => {
    const inlineUndoLines = removedLines
      .filter((line) => line.source === "desktop")
      .map((line) => ({
        ...line,
        listPosition: Math.min(
          Math.max(line.listPosition ?? items.length, 0),
          items.length,
        ),
      }));
    const renderInlineUndoAtPosition = (position: number) =>
      inlineUndoLines
        .filter((line) => line.listPosition === position)
        .map((line) => (
          <Fragment key={line.undoId}>{renderDesktopInlineUndo(line)}</Fragment>
        ));

    return renderDesktopSection({
      className: "xl:flex xl:h-full xl:max-h-full xl:min-h-0 xl:flex-col xl:overflow-hidden",
      eyebrow: "Zamówienie",
      title: `${count} ${formatPolishPlural(count, "produkt", "produkty", "produktów")}`,
      children: (
        <div className="grid gap-3 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden">
          {items.length || inlineUndoLines.length ? (
            <div className="checkout-scrollbar grid max-h-[12.75rem] gap-2 overflow-auto pr-1 xl:min-h-0 xl:flex-1 xl:auto-rows-max xl:max-h-none">
              {items.map(({ product, quantity, variant }, index) => (
                <Fragment key={`${product.id}-${variant.id}`}>
                  {renderInlineUndoAtPosition(index)}
                  <article
                    className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 border border-browin-dark/10 bg-browin-white p-2"
                  >
                    <Link
                      className="relative h-16 self-center overflow-hidden bg-browin-white"
                      href={`/produkt/${product.slug}`}
                    >
                      <Image
                        alt={product.title}
                        className="object-contain object-center"
                        fill
                        sizes="60px"
                        src={product.images[0]}
                      />
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          className="line-clamp-2 text-[12px] font-bold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                          href={`/produkt/${product.slug}`}
                        >
                          {product.title}
                        </Link>
                        <button
                          aria-label={`Usuń ${product.title}`}
                          className="flex h-7 w-7 shrink-0 items-center justify-center text-browin-dark/42 transition-colors hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                          onClick={() =>
                            removeCartLine(
                              { product, quantity, variant },
                              {
                                listPosition: index,
                                source: "desktop",
                              },
                            )
                          }
                          type="button"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                      {variant.label.trim() ? (
                        <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-browin-dark/42">
                          {variant.label.trim()}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <QuantityControl
                          label={product.title}
                          onDecrease={() =>
                            updateQuantity(product.id, variant.id, quantity - 1)
                          }
                          onIncrease={() =>
                            updateQuantity(product.id, variant.id, quantity + 1)
                          }
                          quantity={quantity}
                        />
                        <span className="shrink-0 text-[12px] font-bold text-browin-dark">
                          {formatCurrency(variant.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Fragment>
              ))}
              {renderInlineUndoAtPosition(items.length)}
            </div>
          ) : (
            <div className="border border-dashed border-browin-dark/15 bg-browin-gray p-5 text-center">
              <ShoppingCart className="mx-auto text-browin-red" size={26} />
              <p className="mt-2 text-sm font-bold text-browin-dark">Koszyk jest pusty</p>
              <Link
                className="mt-3 inline-flex min-h-10 items-center justify-center bg-browin-red px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-white"
                href="/produkty"
              >
                Otwórz katalog
              </Link>
            </div>
          )}

          <div className="overflow-hidden border border-browin-dark/10 bg-browin-white">
            {desktopDiscountOpen || discount || discountError ? (
              <div className="p-2">
                <div
                  className={classNames(
                    "flex min-h-10 overflow-hidden border bg-browin-white",
                    discountError ? "border-browin-red" : "border-browin-dark/12",
                  )}
                >
                  <input
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-invalid={Boolean(discountError)}
                    className="min-w-0 flex-1 bg-transparent px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-browin-dark outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-browin-dark/42"
                    enterKeyHint="done"
                    id="desktop-discount"
                    name="desktop-discount-code"
                    onChange={(event) => {
                      setDiscountDraft(event.target.value);
                      setDiscountError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyDiscount();
                      }
                    }}
                    placeholder="Kod rabatowy"
                    spellCheck={false}
                    value={discountDraft}
                  />
                  <button
                    className={classNames(
                      "min-h-10 shrink-0 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red",
                      discount
                        ? "bg-browin-white text-browin-red hover:bg-browin-red/5"
                        : "bg-browin-red text-browin-white hover:bg-browin-red/90",
                    )}
                    onClick={discount ? removeDiscount : applyDiscount}
                    type="button"
                  >
                    {discount ? "Usuń" : "Dodaj"}
                  </button>
                </div>
                {discount ? (
                  <p className="mt-1.5 text-[10px] font-bold leading-snug text-browin-red">
                    {discount.label}
                  </p>
                ) : discountError ? (
                  <p className="mt-1.5 text-[10px] font-bold leading-snug text-browin-red">
                    {discountError}
                  </p>
                ) : null}
              </div>
            ) : null}
            <button
              aria-expanded={desktopDiscountOpen || Boolean(discount) || Boolean(discountError)}
              className="flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left transition-colors hover:text-browin-red"
              onClick={() => setDesktopDiscountOpen((open) => !open)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Ticket className="shrink-0 text-browin-red" size={16} weight="fill" />
                <span className="truncate text-[12px] font-bold text-browin-dark">
                  {discount ? `Kod ${discount.code}` : "Mam kod rabatowy"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-[12px] font-bold text-browin-red">
                {discount ? `-${formatCurrency(discount.amount)}` : null}
                <CaretDown
                  className={classNames(
                    "transition-transform",
                    !(desktopDiscountOpen || discount || discountError) && "rotate-180",
                  )}
                  size={14}
                  weight="bold"
                />
              </span>
            </button>
          </div>

          <div className="xl:mt-auto">
            <FreeShippingMeter compact discountedSubtotal={discountedSubtotal} />
          </div>

          <div className="grid gap-1 border-t border-browin-dark/10 pt-2 text-[12px]">
            <div className="flex items-center justify-between gap-3 text-browin-dark/62">
              <span>Produkty</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount ? (
              <div className="flex items-center justify-between gap-3 text-browin-red">
                <span>Rabat</span>
                <span>-{formatCurrency(discount.amount)}</span>
              </div>
            ) : null}
            {selectedDelivery ? (
              <div className="flex items-center justify-between gap-3 text-browin-dark/62">
                <span>Dostawa</span>
                <span>{deliveryCost === 0 ? "Gratis" : formatCurrency(deliveryCost)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-browin-dark/10 pt-1.5 text-lg font-bold text-browin-dark">
              <span>Razem</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      ),
    });
  };

  const renderDesktopContactPanel = () =>
    renderDesktopSection({
      eyebrow: "Kontakt",
      title: "Kontakt i kraj dostawy",
      children: (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <CompactField
              autoComplete="email"
              autoCapitalize="none"
              className={!form.email ? "checkout-email-attention" : ""}
              enterKeyHint="next"
              error={errors.email}
              id="desktop-email"
              inputMode="email"
              label="E-mail"
              name="desktop-email"
              onChange={(event) => updateFormField("email", event.target.value)}
              placeholder="adres@email.pl"
              spellCheck={false}
              type="email"
              value={form.email}
            />
            <CountrySelect
              error={errors.country}
              id="desktop-country"
              label="Kraj dostawy"
              name="desktop-country-name"
              onChange={selectDeliveryCountry}
              value={form.country}
            />
            {requiresContactPostalCode ? (
              <CompactField
                autoComplete="shipping postal-code"
                enterKeyHint="next"
                error={errors.postalCode}
                id="desktop-contact-postal"
                inputMode={getPostalCodeInputMode(countryForMethods)}
                label="Kod pocztowy"
                maxLength={postalCodeRules[countryForMethods].example.length}
                name="desktop-contact-postal-code"
                onChange={(event) =>
                  updateFormField(
                    "postalCode",
                    formatPostalCodeForCountry(event.target.value, countryForMethods),
                  )
                }
                placeholder={`np. ${postalCodeRules[countryForMethods].example}`}
                value={form.postalCode}
                wrapperClassName="sm:col-span-2"
              />
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <label
              className={classNames(
                "grid cursor-pointer grid-cols-[1.35rem_minmax(0,1fr)] items-start gap-2 border bg-browin-white p-3 text-[12px] font-semibold leading-snug transition-colors hover:border-browin-red/35",
                errors.termsAccepted
                  ? "border-browin-red bg-browin-red/5"
                  : "border-browin-dark/10",
              )}
              htmlFor="desktop-contact-terms"
            >
              <input
                aria-describedby={
                  errors.termsAccepted ? "desktop-checkout-error-summary" : undefined
                }
                aria-invalid={Boolean(errors.termsAccepted)}
                checked={form.termsAccepted}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-browin-red"
                id="desktop-contact-terms"
                onChange={(event) =>
                  updateFormField("termsAccepted", event.target.checked)
                }
                type="checkbox"
              />
              <span>Akceptuję regulamin oraz politykę prywatności sklepu.</span>
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] font-bold">
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/regulamin"
              >
                Zobacz regulamin
              </Link>
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/polityka-prywatnosci"
              >
                Zobacz politykę prywatności
              </Link>
            </div>
          </div>
        </div>
      ),
    });

  const renderDesktopDeliveryPanel = () =>
    renderDesktopSection({
      eyebrow: "Dostawa",
      title: "Metoda dostawy",
      action: selectedDelivery ? (
        <span className="shrink-0 text-[12px] font-bold text-browin-red">
          {deliveryCost === 0 ? "Gratis" : formatCurrency(deliveryCost)}
        </span>
      ) : null,
      children: (
        <div className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {availableDeliveryMethods.map((method) => {
              const checked = deliveryMethodId === method.id;
              const methodCost = calculateDeliveryCost({
                deliveryMethodId: method.id,
                discountedSubtotal,
              });

              return (
                <label
                  className={classNames(
                    "grid min-h-[6.35rem] cursor-pointer content-between gap-2 border bg-browin-white p-2.5 transition-colors hover:border-browin-red/45 hover:bg-browin-red/5",
                    checked ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10",
                  )}
                  htmlFor={`desktop-delivery-${method.id}`}
                  key={method.id}
                  title={method.hint}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    id={`desktop-delivery-${method.id}`}
                    name="desktop-delivery-method"
                    onChange={() => selectDeliveryMethod(method.id)}
                    type="radio"
                  />
                  <span className="flex items-start justify-between gap-2">
                    <MethodLogo
                      alt={method.logoAlt}
                      className="h-8 w-16 p-1"
                      sizes="64px"
                      src={method.logoSrc}
                    />
                    {checked ? (
                      <span
                        aria-hidden="true"
                        className="flex h-5 w-5 shrink-0 items-center justify-center bg-browin-red text-browin-white"
                      >
                        <Check size={12} weight="bold" />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 min-w-0 text-[11px] font-bold leading-tight text-browin-dark">
                      {method.name}
                    </span>
                    <DeliveryPrice compact cost={methodCost} method={method} />
                  </span>
                </label>
              );
            })}
          </div>

          {selectedDeliveryRequiresPoint && selectedDelivery ? (
            <div
              className={classNames(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border p-2.5",
                errors.inpostPoint
                  ? "border-browin-red bg-browin-red/5"
                  : "border-browin-dark/10 bg-browin-white",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-browin-dark">
                  {form.inpostPoint ||
                    `Wybierz ${selectedDelivery.pointLabel ?? "punkt odbioru"}`}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-browin-dark/52">
                  {selectedDelivery.name}: wskaż punkt odbioru dla tej metody dostawy.
                </p>
              </div>
              <button
                className="min-h-9 border border-browin-red bg-browin-white px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white"
                id="desktop-inpost-point-button"
                onClick={() =>
                  updateFormField(
                    "inpostPoint",
                    `${selectedDelivery.name} • LOD01A • ul. Piotrkowska 120`,
                  )
                }
                type="button"
              >
                Wybierz
              </button>
            </div>
          ) : null}
        </div>
      ),
    });

  const renderDesktopDataPanel = () =>
    renderDesktopSection({
      eyebrow: "Dane",
      title: "Dane dostawy",
      children: (
        <div className="grid gap-3">
          <div className="grid gap-2">
            <div className="grid gap-2 lg:grid-cols-3">
              <CompactField
                autoComplete="shipping given-name"
                enterKeyHint="next"
                error={errors.firstName}
                id="desktop-first-name"
                label="Imię"
                name="desktop-given-name"
                onChange={(event) => updateFormField("firstName", event.target.value)}
                value={form.firstName}
              />
              <CompactField
                autoComplete="shipping family-name"
                enterKeyHint="next"
                error={errors.lastName}
                id="desktop-last-name"
                label="Nazwisko"
                name="desktop-family-name"
                onChange={(event) => updateFormField("lastName", event.target.value)}
                value={form.lastName}
              />
              <CompactField
                autoComplete="tel"
                enterKeyHint="next"
                error={errors.phone}
                id="desktop-phone"
                inputMode="tel"
                label="Telefon"
                name="desktop-tel"
                onChange={(event) => updateFormField("phone", event.target.value)}
                placeholder="501 222 333"
                type="tel"
                value={form.phone}
              />
            </div>

            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_9rem]">
              <CompactField
                autoComplete="shipping address-line1"
                enterKeyHint="next"
                error={errors.street}
                id="desktop-street"
                label="Ulica"
                name="desktop-address-line1"
                onChange={(event) => updateFormField("street", event.target.value)}
                value={form.street}
              />
              <CompactField
                autoComplete="shipping address-line2"
                enterKeyHint="next"
                error={errors.houseNumber}
                id="desktop-house"
                label="Nr domu / lokalu"
                name="desktop-address-line2"
                onChange={(event) => updateFormField("houseNumber", event.target.value)}
                value={form.houseNumber}
              />
            </div>

            <div className="grid gap-2 lg:grid-cols-[10rem_minmax(0,1fr)]">
              <CompactField
                autoComplete="shipping postal-code"
                disabled={postalCodeLockedInDataStep}
                enterKeyHint="next"
                error={errors.postalCode}
                id="desktop-postal"
                inputMode={getPostalCodeInputMode(countryForMethods)}
                label="Kod pocztowy"
                maxLength={postalCodeRules[countryForMethods].example.length}
                name="desktop-postal-code"
                onChange={(event) =>
                  updateFormField(
                    "postalCode",
                    formatPostalCodeForCountry(event.target.value, countryForMethods),
                  )
                }
                pattern={
                  countryForMethods === "Polska" ? "[0-9]{2}-?[0-9]{3}" : undefined
                }
                placeholder={`np. ${postalCodeRules[countryForMethods].example}`}
                value={form.postalCode}
              />
              <CompactField
                autoComplete="shipping address-level2"
                enterKeyHint="done"
                error={errors.city}
                id="desktop-city"
                label="Miasto"
                name="desktop-address-level2"
                onChange={(event) => updateFormField("city", event.target.value)}
                value={form.city}
              />
            </div>
          </div>

          <InvoiceSwitch
            checked={form.wantsInvoice}
            id="desktop-wants-invoice"
            onChange={(checked) => updateFormField("wantsInvoice", checked)}
          />

          {form.wantsInvoice ? (
            <CompactField
              autoComplete="off"
              error={errors.taxId}
              id="desktop-tax"
              inputMode="numeric"
              label="NIP"
              maxLength={13}
              name="desktop-tax-id"
              onChange={(event) => updateFormField("taxId", event.target.value)}
              value={form.taxId}
            />
          ) : null}
        </div>
      ),
    });

  const renderDesktopPaymentPanel = () =>
    renderDesktopSection({
      className: "xl:flex xl:h-full xl:max-h-full xl:min-h-0 xl:flex-col xl:overflow-hidden",
      eyebrow: "Płatność",
      title: "Finalizacja",
      children: (
        <div className="checkout-scrollbar grid gap-3 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-y-auto xl:pr-1">
          <div className="grid grid-cols-3 gap-2">
            {availablePaymentMethods.map((method) => {
              const checked = paymentMethodId === method.id;

              return (
                <label
                  className={classNames(
                    "grid min-h-[4.75rem] cursor-pointer content-start gap-1.5 border bg-browin-white px-2.5 pb-1.5 pt-2.5 transition-colors hover:border-browin-red/45 hover:bg-browin-red/5",
                    checked ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10",
                  )}
                  htmlFor={`desktop-payment-${method.id}`}
                  key={method.id}
                  title={method.detail}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    id={`desktop-payment-${method.id}`}
                    name="desktop-payment-method"
                    onChange={() => selectPaymentMethod(method.id)}
                    type="radio"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <MethodLogo
                      alt={method.logoAlt}
                      className="h-7 w-16 p-1"
                      sizes="64px"
                      src={method.logoSrc}
                    />
                    {checked ? (
                      <Check
                        className="text-browin-red"
                        size={14}
                        weight="bold"
                      />
                    ) : null}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-bold leading-tight text-browin-dark">
                    {method.shortName}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedPayment ? (
            <div className="border border-browin-dark/10 bg-browin-gray p-2.5">
              <p className="text-[11px] font-bold leading-tight text-browin-dark">
                {selectedPayment.name}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-browin-dark/58">
                {selectedPayment.detail}
              </p>
            </div>
          ) : null}

          {paymentMethodId === "IMOJE_BLIK" ? (
            <CompactField
              autoComplete="one-time-code"
              enterKeyHint="done"
              error={errors.blikCode}
              id="desktop-blik"
              inputMode="numeric"
              label="Kod BLIK"
              maxLength={6}
              name="desktop-one-time-code"
              onChange={(event) => {
                setBlikCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setErrors((current) => {
                  if (!current.blikCode) return current;
                  const next = { ...current };
                  delete next.blikCode;
                  return next;
                });
              }}
              pattern="[0-9]{6}"
              placeholder="000000"
              value={blikCode}
            />
          ) : null}

          <div className="grid gap-1 border-t border-browin-dark/10 pt-2 text-[12px] xl:mt-auto">
            <div className="flex items-center justify-between gap-3 text-browin-dark/62">
              <span>Produkty</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount ? (
              <div className="flex items-center justify-between gap-3 text-browin-red">
                <span>Rabat</span>
                <span>-{formatCurrency(discount.amount)}</span>
              </div>
            ) : null}
            {selectedDelivery ? (
              <div className="flex items-center justify-between gap-3 text-browin-dark/62">
                <span>Dostawa</span>
                <span>{deliveryCost === 0 ? "Gratis" : formatCurrency(deliveryCost)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-browin-dark/10 pt-1.5 text-lg font-bold text-browin-dark">
              <span>Razem</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

        </div>
      ),
    });

  const getDesktopCtaLabel = () => {
    if (isSubmitting) return "Finalizuję...";

    const desktopStep = getDesktopCheckoutStep(currentStep);

    if (desktopStep === "contact") return "Wybierz metodę dostawy";
    if (desktopStep === "delivery") return "Uzupełnij dane kontaktowe";
    if (desktopStep === "data") return "Wybierz metodę płatności";
    return "Zamawiam i płacę";
  };

  const handleDesktopBack = () => {
    const desktopStep = getDesktopCheckoutStep(currentStep);

    setErrors({});

    if (desktopStep === "payment") {
      setCurrentStep("data");
      return;
    }

    if (desktopStep === "data") {
      setCurrentStep("delivery");
      return;
    }

    if (desktopStep === "delivery") {
      setCurrentStep("contact");
    }
  };

  const renderCheckoutErrorSummary = (id: string) => {
    if (!bottomPanelErrorMessages.length) {
      return null;
    }

    return (
      <div
        aria-live="assertive"
        className="border border-browin-red/25 bg-browin-red/5 px-3 py-2 text-[11px] font-bold leading-snug text-browin-red"
        id={id}
        role="alert"
      >
        <div className="flex items-start gap-1.5">
          <WarningCircle className="mt-0.5 shrink-0" size={13} weight="fill" />
          <div className="grid gap-0.5">
            {bottomPanelErrorMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopWizardControls = () => {
    const desktopStep = getDesktopCheckoutStep(currentStep);
    const canGoBack = desktopStep !== "contact";

    return (
      <div
        className="grid gap-2 md:sticky md:bottom-3 md:z-20 xl:static"
      >
        {renderCheckoutErrorSummary("desktop-checkout-error-summary")}
        <div
          className={classNames(
            "grid gap-3",
            canGoBack ? "sm:grid-cols-[11rem_minmax(0,1fr)]" : "sm:grid-cols-1",
          )}
        >
          {canGoBack ? (
            <button
              className="inline-flex min-h-14 items-center justify-center gap-2 border border-browin-dark/14 bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
              disabled={isSubmitting}
              onClick={handleDesktopBack}
              type="button"
            >
              <ArrowLeft size={22} weight="bold" />
              Wstecz
            </button>
          ) : null}
          <button
            className="checkout-cta inline-flex min-h-14 w-full items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-white shadow-sharp transition-colors disabled:cursor-not-allowed disabled:bg-browin-dark/35"
            disabled={isSubmitting || !items.length}
            type="submit"
          >
            {isSubmitting ? (
              <SpinnerGap className="animate-spin" size={16} />
            ) : desktopStep === "payment" ? (
              <ShoppingBagOpen size={16} weight="fill" />
            ) : (
              <ArrowRight size={16} weight="bold" />
            )}
            {getDesktopCtaLabel()}
          </button>
        </div>
      </div>
    );
  };

  const renderDesktopActivePanel = () => {
    const desktopStep = getDesktopCheckoutStep(currentStep);

    return (
      <div className="grid min-w-0 gap-3 xl:h-full xl:max-h-full xl:min-h-0 xl:self-stretch xl:grid-rows-[minmax(0,1fr)_auto]">
        <div className="checkout-scrollbar grid min-w-0 content-start gap-3 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
          {desktopStep === "contact" ? renderDesktopContactPanel() : null}
          {desktopStep === "delivery" ? renderDesktopDeliveryPanel() : null}
          {desktopStep === "data" ? renderDesktopDataPanel() : null}
          {desktopStep === "payment" ? renderDesktopPaymentPanel() : null}
        </div>
        {renderDesktopWizardControls()}
      </div>
    );
  };

  const renderDesktopExpressCheckout = () => {
    if (currentStep === "success") {
      return (
        <section className="hidden bg-browin-gray py-6 md:block">
          <div className="container mx-auto px-4">
            {renderProgress()}
            <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              {renderSuccessStep()}
              <aside className="h-max border border-browin-dark/10 bg-browin-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
                  Zamówienie
                </p>
                <h2 className="mt-1 text-lg font-bold text-browin-dark">Podsumowanie</h2>
                <div className="mt-4">
                  <OrderSummary
                    deliveryCost={summaryDeliveryCost}
                    deliveryMethodId={summaryDeliveryMethodId}
                    discount={summaryDiscount}
                    discountedSubtotal={summaryDiscountedSubtotal}
                    items={summaryItems}
                    subtotal={summarySubtotal}
                    total={summaryTotal}
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="hidden bg-browin-gray py-3 md:block xl:h-full xl:min-h-0 xl:overflow-hidden">
        <div className="container mx-auto flex h-full flex-col px-4">
          {renderProgress()}
          <form
            autoComplete="on"
            className="grid gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(17rem,0.85fr)_minmax(30rem,1.65fr)] xl:grid-rows-[minmax(0,1fr)] xl:items-start"
            noValidate
            onSubmit={handleDesktopWizardSubmit}
          >
            <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
              Ekspresowe zamówienie BROWIN
            </h1>

            <aside className="min-w-0 xl:sticky xl:top-0 xl:h-full xl:max-h-full xl:min-h-0 xl:overflow-hidden xl:self-start">
              {renderDesktopOrderPanel()}
            </aside>

            {renderDesktopActivePanel()}
          </form>
        </div>
      </section>
    );
  };

  const mobileDeliveryCostLabel = (cost: number) =>
    cost === 0 ? "Gratis" : formatCurrency(cost);

  const isMobileSuccessStep = currentStep === "success";
  const mobileStageIndex = Math.max(
    mobileCheckoutStages.findIndex((stage) => stage.id === currentStep),
    0,
  );
  const mobileStageLabel = isMobileSuccessStep
    ? "Potwierdzenie"
    : mobileCheckoutStages[mobileStageIndex].label;
  const mobileStageNumber = isMobileSuccessStep
    ? mobileCheckoutStages.length
    : mobileStageIndex + 1;
  const mobileProgressWidth = isMobileSuccessStep
    ? "100%"
    : `${(mobileStageNumber / mobileCheckoutStages.length) * 100}%`;
  const isMobileOrderExpanded = currentStep === "cart" || mobileOrderOpen;
  const shouldCollapseMobileCartProducts = currentStep === "cart" && items.length > 1;
  const hasInlineMobileUndo =
    currentStep === "cart" &&
    items.length > 0 &&
    removedLines.some((line) => line.source === "mobile-cart-products");
  const mobileStickyBarFallbackHeight = currentStep === "cart" ? 73 : 128;
  const mobileCheckoutBottomPadding =
    currentStep === "success" || !items.length
      ? 0
      : Math.max(
          (mobileStickyBarHeight || mobileStickyBarFallbackHeight) - 8,
          0,
        );

  const handleMobileOrderDetails = () => {
    setMobileOrderOpen((open) => !open);
    trackCheckoutEvent("checkout_cta_click", {
      action: mobileOrderOpen ? "hide_order_details" : "show_order_details",
      source: "mobile_sticky_bar",
      total,
    });
  };

  const handleMobileSubmit = () => {
    trackCheckoutEvent("checkout_cta_click", {
      action: currentStep === "payment" ? "submit" : "next_step",
      item_count: count,
      step: currentStep,
      source: "mobile_express",
      total,
    });

    if (!items.length || isSubmitting) {
      return;
    }

    if (currentStep === "cart") {
      setErrors({});
      setMobileOrderOpen(false);
      setCurrentStep("contact");
      return;
    }

    if (currentStep === "contact") {
      if (validateContact({ focusMobile: true })) {
        setMobileOrderOpen(false);
        setCurrentStep("delivery");
      }
      return;
    }

    if (currentStep === "delivery") {
      if (validateDeliveryMethod({ focusMobile: true })) {
        setMobileOrderOpen(false);
        setCurrentStep("data");
      }
      return;
    }

    if (currentStep === "data") {
      if (validateDeliveryData({ focusMobile: true })) {
        setMobileOrderOpen(false);
        setCurrentStep("payment");
      }
      return;
    }

    if (!validateContact()) {
      setCurrentStep("contact");
      window.setTimeout(() => validateContact({ focusMobile: true }), 80);
      return;
    }

    if (!validateDeliveryMethod()) {
      setCurrentStep("delivery");
      window.setTimeout(() => validateDeliveryMethod({ focusMobile: true }), 80);
      return;
    }

    if (!validateDeliveryData()) {
      setCurrentStep("data");
      window.setTimeout(() => validateDeliveryData({ focusMobile: true }), 80);
      return;
    }

    void submitPayment({
      focusMobile: true,
      source: "mobile_express",
    });
  };

  const handleMobileBack = () => {
    setErrors({});
    setMobileOrderOpen(false);

    if (currentStep === "payment") {
      setCurrentStep("data");
      return;
    }

    if (currentStep === "data") {
      setCurrentStep("delivery");
      return;
    }

    if (currentStep === "delivery") {
      setCurrentStep("contact");
      return;
    }

    if (currentStep === "contact") {
      setCurrentStep("cart");
    }
  };

  const getMobileCtaLabel = () => {
    if (isSubmitting) return "Finalizuję...";
    if (currentStep === "cart") return "Do kontaktu";
    if (currentStep === "contact") return "Wybierz dostawę";
    if (currentStep === "delivery") return "Uzupełnij dane";
    if (currentStep === "data") return "Wybierz płatność";
    return "Zamawiam i płacę";
  };

  const renderMobileSection = ({
    children,
    complete = false,
    eyebrow,
    id,
    title,
  }: {
    children: React.ReactNode;
    complete?: boolean;
    eyebrow: string;
    id: string;
    title: string;
  }) => (
    <section
      aria-labelledby={`${id}-title`}
      className="min-w-0 overflow-hidden border border-browin-dark/10 bg-browin-white p-3"
      id={id}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            {eyebrow}
          </p>
          <h2
            className="mt-0.5 text-base font-bold leading-tight text-browin-dark"
            id={`${id}-title`}
          >
            {title}
          </h2>
        </div>
        {complete ? (
          <span className="inline-flex min-h-7 shrink-0 items-center gap-1 border border-browin-red/25 bg-browin-red/5 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-browin-red">
            <Check size={12} weight="bold" />
            Gotowe
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );

  const renderMobileInlineUndo = (
    line: RemovedCheckoutLine,
    { connected = false } = {},
  ) => (
    <div
      aria-live="polite"
      className={classNames(
        "relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden bg-browin-white px-2.5 py-2 text-[11px] text-browin-dark",
        connected ? "border-b border-browin-dark/10" : "border border-browin-dark/10",
      )}
    >
      <p className="min-w-0 truncate font-semibold text-browin-dark/58">
        <span className="font-bold text-browin-dark">Usunięto</span>{" "}
        {line.product.title}
      </p>
      <button
        className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-red underline underline-offset-2 transition-colors hover:text-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
        onClick={() => restoreRemovedLine(line.undoId)}
        type="button"
      >
        Cofnij
      </button>
      {renderUndoCountdownBar(line)}
    </div>
  );

  const renderMobileCartProductCards = ({ connected = false } = {}) => {
    const inlineUndoLines = removedLines
      .filter((line) => line.source === "mobile-cart-products")
      .map((line) => ({
        ...line,
        listPosition: Math.min(
          Math.max(line.listPosition ?? items.length, 0),
          items.length,
        ),
      }));
    const renderInlineUndoAtPosition = (position: number) =>
      inlineUndoLines
        .filter((line) => line.listPosition === position)
        .map((line) => (
          <Fragment key={line.undoId}>
            {renderMobileInlineUndo(line, { connected })}
          </Fragment>
        ));

    return (
      <div
        className={classNames(
          "grid",
          connected ? "gap-0 bg-browin-white" : "gap-2",
        )}
      >
        {items.map(({ product, quantity, variant }, index) => (
          <Fragment key={`${product.id}-${variant.id}`}>
            {renderInlineUndoAtPosition(index)}
            <article
              className={classNames(
                "grid grid-cols-[4rem_minmax(0,1fr)] gap-3 bg-browin-white p-2.5",
                connected
                  ? "border-b border-browin-dark/10 last:border-b-0"
                  : "border border-browin-dark/10",
              )}
            >
              <div className="relative h-16 self-center overflow-hidden bg-browin-white">
                <Image
                  alt={product.title}
                  className="object-contain object-center"
                  fill
                  sizes="64px"
                  src={product.images[0]}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-[12px] font-bold leading-tight text-browin-dark">
                    {product.title}
                  </p>
                  <p className="shrink-0 text-right text-[12px] font-bold text-browin-dark">
                    {formatCurrency(variant.price * quantity)}
                  </p>
                </div>
                {variant.label.trim() ? (
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-browin-dark/42">
                    {variant.label.trim()}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-2">
                  <QuantityControl
                    label={product.title}
                    onDecrease={() =>
                      updateQuantity(product.id, variant.id, quantity - 1)
                    }
                    onIncrease={() =>
                      updateQuantity(product.id, variant.id, quantity + 1)
                    }
                    quantity={quantity}
                  />
                  <button
                    aria-label={`Usuń ${product.title}`}
                    className="flex h-9 w-9 items-center justify-center border border-browin-dark/10 text-browin-dark/45"
                    onClick={() =>
                      removeCartLine(
                        { product, quantity, variant },
                        {
                          listPosition: index,
                          source: "mobile-cart-products",
                        },
                      )
                    }
                    type="button"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            </article>
          </Fragment>
        ))}
        {renderInlineUndoAtPosition(items.length)}
      </div>
    );
  };

  const renderMobileOrderPanel = () => (
    <div className="min-w-0" ref={mobileOrderRef}>
      {renderMobileSection({
        eyebrow: "Zamówienie",
        id: "mobile-order",
        title: "Twoje zamówienie",
        children: items.length ? (
          <div>
            {currentStep !== "cart" ? (
              <button
                aria-expanded={isMobileOrderExpanded}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border border-browin-dark/10 bg-browin-gray p-3 text-left"
                onClick={() => setMobileOrderOpen((open) => !open)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block text-[12px] font-bold text-browin-dark">
                    {count} {count === 1 ? "produkt" : "produkty"} w koszyku
                  </span>
                  <span className="mt-1 flex min-w-0 items-center gap-1.5">
                    {items.slice(0, 3).map(({ product, variant }) => (
                      <span
                        className="relative h-8 w-8 shrink-0 border border-browin-dark/10 bg-browin-white"
                        key={`mobile-thumb-${product.id}-${variant.id}`}
                      >
                        <Image
                          alt=""
                          className="object-contain object-center"
                          fill
                          sizes="32px"
                          src={product.images[0]}
                        />
                      </span>
                    ))}
                    <span className="truncate text-[11px] font-semibold text-browin-dark/55">
                      {selectedDelivery
                        ? `${selectedDelivery.name} · ${mobileDeliveryCostLabel(deliveryCost)}`
                        : "Dostawa do wyboru"}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2 text-right">
                  <span className="text-sm font-bold text-browin-dark">
                    {formatCurrency(total)}
                  </span>
                  <CaretDown
                    className={classNames(
                      "text-browin-red transition-transform",
                      isMobileOrderExpanded && "rotate-180",
                    )}
                    size={16}
                    weight="bold"
                  />
                </span>
              </button>
            ) : null}

            {isMobileOrderExpanded ? (
              <div className={classNames("grid gap-3", currentStep !== "cart" && "mt-3")}>
                {shouldCollapseMobileCartProducts ? (
                  <div className="overflow-hidden border border-browin-dark/10 bg-browin-white transition-colors hover:border-browin-red/35">
                    <button
                      aria-expanded={mobileCartProductsOpen}
                      className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red"
                      onClick={() => setMobileCartProductsOpen((open) => !open)}
                      type="button"
                    >
                      <span className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 p-2.5">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden border border-browin-dark/10 bg-browin-white">
                          <Image
                            alt={items[0]!.product.title}
                            className="object-contain object-center"
                            fill
                            sizes="56px"
                            src={items[0]!.product.images[0]}
                          />
                          <span className="absolute bottom-0 right-0 flex min-w-6 items-center justify-center bg-browin-red px-1.5 py-0.5 text-[10px] font-bold leading-none text-browin-white">
                            +{items.length - 1}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
                            Produkty
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] font-bold text-browin-dark">
                            {count}{" "}
                            {formatPolishPlural(count, "produkt", "produkty", "produktów")} w
                            zamówieniu
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] font-semibold text-browin-dark/52">
                            {items[0]?.product.title}
                            {items.length > 1
                              ? ` + ${items.length - 1} ${formatPolishPlural(
                                  items.length - 1,
                                  "kolejny",
                                  "kolejne",
                                  "kolejnych",
                                )}`
                              : ""}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-right text-[12px] font-bold text-browin-dark">
                          <span className="whitespace-nowrap">{formatCurrency(subtotal)}</span>
                          <CaretDown
                            className={classNames(
                              "text-browin-red transition-transform",
                              mobileCartProductsOpen && "rotate-180",
                            )}
                            size={14}
                            weight="bold"
                          />
                        </span>
                      </span>
                      <span className="flex min-h-9 items-center justify-between gap-3 border-t border-browin-dark/10 bg-browin-gray px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-dark/45">
                        <span>
                          {mobileCartProductsOpen ? "Zwiń listę" : "Rozwiń listę produktów"}
                        </span>
                        <span>
                          {items.length}{" "}
                          {formatPolishPlural(items.length, "pozycja", "pozycje", "pozycji")}
                        </span>
                      </span>
                    </button>

                    {mobileCartProductsOpen ? (
                      <div className="border-t border-browin-dark/10">
                        {renderMobileCartProductCards({ connected: true })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {!shouldCollapseMobileCartProducts ? renderMobileCartProductCards() : null}
                {lastRemovedLine && !hasInlineMobileUndo
                  ? renderUndoRemove("mobile")
                  : null}

                <FreeShippingMeter compact discountedSubtotal={discountedSubtotal} />

                <div
                  className={classNames(
                      "w-full min-w-0 overflow-hidden border bg-browin-white transition-colors",
                    discountError ? "border-browin-red" : "border-browin-dark/10",
                  )}
                >
                  <button
                    aria-expanded={mobileDiscountOpen}
                    className="flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left transition-colors hover:text-browin-red"
                    onClick={() => setMobileDiscountOpen((open) => !open)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Ticket className="shrink-0 text-browin-red" size={17} weight="fill" />
                      <span className="truncate text-[12px] font-bold text-browin-dark">
                        {discount ? `Kod ${discount.code}` : "Mam kod rabatowy"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] font-bold text-browin-red">
                      {discount ? `-${formatCurrency(discount.amount)}` : null}
                      <CaretDown
                        className={classNames(
                          "transition-transform",
                          mobileDiscountOpen && "rotate-180",
                        )}
                        size={14}
                        weight="bold"
                      />
                    </span>
                  </button>

                  {mobileDiscountOpen ? (
                    <div className="min-w-0 p-2">
                      <div
                        className={classNames(
                          "flex min-h-10 w-full min-w-0 overflow-hidden border bg-browin-white transition-colors",
                          discountError ? "border-browin-red" : "border-browin-dark/12",
                        )}
                      >
                        <input
                          autoCapitalize="characters"
                          autoComplete="off"
                          aria-describedby={
                            discount
                              ? "mobile-discount-hint"
                              : discountError
                                ? "mobile-discount-error"
                                : undefined
                          }
                          aria-invalid={Boolean(discountError)}
                          className="min-w-0 flex-1 bg-transparent px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-browin-dark outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-browin-dark/42"
                          enterKeyHint="done"
                          id="mobile-discount"
                          name="discount-code"
                          onChange={(event) => {
                            setDiscountDraft(event.target.value);
                            setDiscountError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              applyDiscount();
                            }
                          }}
                          placeholder="Kod rabatowy"
                          spellCheck={false}
                          value={discountDraft}
                        />
                        <button
                          className={classNames(
                            "min-h-10 shrink-0 px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red",
                            discount
                              ? "bg-browin-white text-browin-red hover:bg-browin-red/5"
                              : "bg-browin-red text-browin-white hover:bg-browin-red/90",
                          )}
                          onClick={discount ? removeDiscount : applyDiscount}
                          type="button"
                        >
                          {discount ? "Usuń" : "Dodaj"}
                        </button>
                      </div>
                    {discount ? (
                      <p
                        className="mt-2 flex items-start gap-1 text-[10px] font-bold leading-snug text-browin-red"
                        id="mobile-discount-hint"
                      >
                        <Check className="mt-0.5 shrink-0" size={12} weight="bold" />
                        <span>{discount.label}</span>
                      </p>
                    ) : discountError ? (
                      <p
                        className="mt-2 flex items-start gap-1 text-[10px] font-bold leading-snug text-browin-red"
                        id="mobile-discount-error"
                      >
                        <WarningCircle className="mt-0.5 shrink-0" size={12} weight="fill" />
                        <span>{discountError}</span>
                      </p>
                    ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2 border-t border-browin-dark/10 pt-3 text-[12px]">
                  <div className="flex items-center justify-between gap-3 text-browin-dark/62">
                    <span>Produkty</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount ? (
                    <div className="flex items-center justify-between gap-3 text-browin-red">
                      <span>Rabat</span>
                      <span>-{formatCurrency(discount.amount)}</span>
                    </div>
                  ) : null}
                  {selectedDelivery ? (
                    <div className="flex items-center justify-between gap-3 text-browin-dark/62">
                      <span>Dostawa</span>
                      <span>{mobileDeliveryCostLabel(deliveryCost)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 border-t border-browin-dark/10 pt-2 text-base font-bold text-browin-dark">
                    <span>Razem</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border border-dashed border-browin-dark/15 bg-browin-gray p-6 text-center">
            <ShoppingCart className="mx-auto text-browin-red" size={28} />
            <h1
              className="mt-3 text-xl font-bold text-browin-dark outline-none"
              ref={headingRef}
              tabIndex={-1}
            >
              Koszyk jest pusty
            </h1>
	            <p className="mt-2 text-sm leading-relaxed text-browin-dark/58">
	              Dodaj produkty, a checkout od razu pokaże finalną kwotę.
	            </p>
	            {lastRemovedLine ? (
	              <div className="mt-4">{renderUndoRemove("mobile")}</div>
	            ) : null}
	            <Link
	              className="checkout-cta mt-4 inline-flex min-h-11 items-center justify-center bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.14em] text-browin-white"
              href="/produkty"
            >
              Otwórz katalog
            </Link>
          </div>
        ),
      })}
    </div>
  );

  const renderMobileOrderTray = () => {
    if (currentStep === "cart" || !items.length || !mobileOrderOpen) {
      return null;
    }

    return (
      <div className="mb-2 border border-browin-red/20 bg-browin-white p-2.5">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
              Podsumowanie
            </p>
            <p className="truncate text-[12px] font-bold text-browin-dark">
              {count} {count === 1 ? "produkt" : "produkty"}
              {selectedDelivery ? ` · ${selectedDelivery.name}` : ""}
            </p>
          </div>
          <button
            aria-label="Zwiń podsumowanie zamówienia"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-browin-red transition-colors hover:bg-browin-red/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
            onClick={() => setMobileOrderOpen(false)}
            type="button"
          >
            <CaretDown size={14} weight="bold" />
          </button>
        </div>

        <div className="grid gap-1">
          {items.slice(0, 2).map(({ product, quantity, variant }) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
              key={`mobile-tray-${product.id}-${variant.id}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-semibold text-browin-dark">
                  {quantity} x {product.title}
                </span>
              </span>
              <span className="text-[11px] font-bold text-browin-dark">
                {formatCurrency(variant.price * quantity)}
              </span>
            </div>
          ))}
          {items.length > 2 ? (
            <p className="text-[10px] font-bold text-browin-dark/50">
              + {items.length - 2} więcej w zamówieniu
            </p>
          ) : null}
        </div>

        <div className="mt-2 grid gap-1 border-t border-browin-dark/10 pt-2 text-[11px]">
          <div className="flex items-center justify-between gap-3 text-browin-dark/60">
            <span>Produkty</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount ? (
            <div className="flex items-center justify-between gap-3 text-browin-red">
              <span>Rabat</span>
              <span>-{formatCurrency(discount.amount)}</span>
            </div>
          ) : null}
          {selectedDelivery ? (
            <div className="flex items-center justify-between gap-3 text-browin-dark/60">
              <span>Dostawa</span>
              <span>{mobileDeliveryCostLabel(deliveryCost)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-browin-dark">
            <span>Razem</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileContact = () =>
    renderMobileSection({
      complete:
        isValidEmail(form.email) &&
        isDeliveryCountry(form.country.trim()) &&
        (!requiresContactPostalCode ||
          isPostalCodeValidForCountry(form.postalCode, countryForMethods)) &&
        form.termsAccepted,
      eyebrow: "Kontakt",
      id: "mobile-contact",
      title: "Kontakt i zgody",
      children: (
        <form
          autoComplete="on"
          className="grid gap-3"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
            Kontakt do zamówienia
          </h1>
          <div className="grid gap-2">
            <CompactField
              autoComplete="email"
              autoCapitalize="none"
              className={!form.email ? "checkout-email-attention" : ""}
              enterKeyHint="next"
              error={errors.email}
              id="mobile-email"
              inputMode="email"
              label="E-mail"
              name="email"
              onChange={(event) => updateFormField("email", event.target.value)}
              placeholder="adres@email.pl"
              spellCheck={false}
              type="email"
              value={form.email}
            />
            <CountrySelect
              error={errors.country}
              id="mobile-country"
              label="Kraj dostawy"
              mode="sheet"
              name="country-name"
              onChange={selectDeliveryCountry}
              value={form.country}
            />
            {requiresContactPostalCode ? (
              <CompactField
                autoComplete="shipping postal-code"
                enterKeyHint="next"
                error={errors.postalCode}
                id="mobile-contact-postal"
                inputMode={getPostalCodeInputMode(countryForMethods)}
                label="Kod pocztowy"
                maxLength={postalCodeRules[countryForMethods].example.length}
                name="contact-postal-code"
                onChange={(event) =>
                  updateFormField(
                    "postalCode",
                    formatPostalCodeForCountry(event.target.value, countryForMethods),
                  )
                }
                placeholder={`np. ${postalCodeRules[countryForMethods].example}`}
                value={form.postalCode}
              />
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <label
              className={classNames(
                "grid min-h-12 cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border bg-browin-white p-3 text-[12px] font-semibold leading-snug transition-colors hover:border-browin-red/35",
                errors.termsAccepted
                  ? "border-browin-red bg-browin-red/5"
                  : "border-browin-dark/10",
              )}
              htmlFor="mobile-terms"
            >
              <input
                aria-describedby={
                  errors.termsAccepted ? "mobile-inline-error-message" : undefined
                }
                aria-invalid={Boolean(errors.termsAccepted)}
                checked={form.termsAccepted}
                className="peer sr-only"
                id="mobile-terms"
                onChange={(event) =>
                  updateFormField("termsAccepted", event.target.checked)
                }
                type="checkbox"
              />
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 cursor-pointer items-center justify-center border border-browin-dark/28 bg-browin-white text-browin-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-browin-red peer-checked:border-browin-red peer-checked:bg-browin-red"
              >
                {form.termsAccepted ? <Check size={14} weight="bold" /> : null}
              </span>
              <span>Akceptuję regulamin oraz politykę prywatności sklepu.</span>
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] font-bold">
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/regulamin"
              >
                Zobacz regulamin
              </Link>
              <Link
                className="text-browin-red underline underline-offset-2 transition-colors hover:text-browin-red/80"
                href="/polityka-prywatnosci"
              >
                Zobacz politykę prywatności
              </Link>
            </div>
          </div>
        </form>
      ),
    });

  const renderMobileDeliveryMethods = () =>
    renderMobileSection({
      complete:
        Boolean(selectedDelivery) &&
        (!selectedDeliveryRequiresPoint || Boolean(form.inpostPoint.trim())),
      eyebrow: "Dostawa",
      id: "mobile-delivery",
      title: "Jak dostarczyć paczkę?",
      children: (
        <fieldset>
          <legend className="sr-only">Metoda dostawy</legend>
          <div className="grid gap-2">
            {availableDeliveryMethods.map((method) => {
              const checked = deliveryMethodId === method.id;
              const methodCost = calculateDeliveryCost({
                deliveryMethodId: method.id,
                discountedSubtotal,
              });

              return (
                <label
                  className={classNames(
                    "grid min-h-[4.65rem] cursor-pointer grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-3 border px-3 py-2.5 text-left transition-colors hover:border-browin-red/45 hover:bg-browin-red/5",
                    checked
                      ? "border-browin-red bg-browin-red/5 text-browin-red"
                      : "border-browin-dark/10 bg-browin-gray text-browin-dark",
                  )}
                  htmlFor={`mobile-delivery-${method.id}`}
                  key={method.id}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    id={`mobile-delivery-${method.id}`}
                    name="mobile-delivery-method"
                    onChange={() => selectDeliveryMethod(method.id)}
                    type="radio"
                  />
                  <MethodLogo
                    alt={method.logoAlt}
                    className="h-9 w-[3.75rem] p-1"
                    sizes="60px"
                    src={method.logoSrc}
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold leading-tight">
                      {method.name}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/45">
                      {method.eta}
                    </span>
                  </span>
                  <DeliveryPrice align="right" compact cost={methodCost} method={method} />
                </label>
              );
            })}
          </div>

          {selectedDeliveryRequiresPoint && selectedDelivery ? (
            <div
              className={classNames(
                "mt-2 grid grid-cols-[1fr_auto] items-center gap-2 border p-2",
                errors.inpostPoint
                  ? "border-browin-red bg-browin-red/5"
                  : "border-browin-dark/10 bg-browin-white",
              )}
            >
              <p className="min-w-0 truncate text-[12px] font-bold text-browin-dark">
                {form.inpostPoint ||
                  `Wybierz ${selectedDelivery.pointLabel ?? "punkt odbioru"}`}
              </p>
              <button
                className="min-h-9 bg-browin-dark px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-white"
                id="mobile-inpost-point-button"
                onClick={() =>
                  updateFormField(
                    "inpostPoint",
                    `${selectedDelivery.name} • LOD01A • ul. Piotrkowska 120`,
                  )
                }
                type="button"
              >
                Wybierz
              </button>
            </div>
          ) : null}
        </fieldset>
      ),
    });

  const renderMobileData = () =>
    renderMobileSection({
      complete:
        isValidPolishPhone(form.phone) &&
        Boolean(form.firstName.trim()) &&
        Boolean(form.lastName.trim()) &&
        Boolean(form.street.trim()) &&
        Boolean(form.houseNumber.trim()) &&
        isPostalCodeValidForCountry(form.postalCode, countryForMethods) &&
        Boolean(form.city.trim()),
      eyebrow: "Dane",
      id: "mobile-data",
      title: "Telefon i adres",
      children: (
        <form
          autoComplete="on"
          className="grid gap-3"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
            Ekspresowy checkout
          </h1>
          <div className="grid gap-2">
            <CompactField
              autoComplete="tel"
              enterKeyHint="next"
              error={errors.phone}
              id="mobile-phone"
              inputMode="tel"
              label="Telefon"
              name="tel"
              onChange={(event) => updateFormField("phone", event.target.value)}
              placeholder="501 222 333"
              type="tel"
              value={form.phone}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CompactField
              autoComplete="shipping given-name"
              enterKeyHint="next"
              error={errors.firstName}
              id="mobile-first-name"
              label="Imię"
              name="given-name"
              onChange={(event) => updateFormField("firstName", event.target.value)}
              value={form.firstName}
            />
            <CompactField
              autoComplete="shipping family-name"
              enterKeyHint="next"
              error={errors.lastName}
              id="mobile-last-name"
              label="Nazwisko"
              name="family-name"
              onChange={(event) => updateFormField("lastName", event.target.value)}
              value={form.lastName}
            />
          </div>

          <div className="grid gap-2">
            <CompactField
              autoComplete="shipping address-line1"
              enterKeyHint="next"
              error={errors.street}
              id="mobile-street"
              label="Ulica"
              name="address-line1"
              onChange={(event) => updateFormField("street", event.target.value)}
              value={form.street}
            />
            <div className="grid grid-cols-[0.8fr_0.85fr_minmax(0,1fr)] gap-2">
              <CompactField
                autoComplete="shipping address-line2"
                enterKeyHint="next"
                error={errors.houseNumber}
                id="mobile-house"
                label="Nr"
                name="address-line2"
                onChange={(event) => updateFormField("houseNumber", event.target.value)}
                value={form.houseNumber}
              />
              <CompactField
                autoComplete="shipping postal-code"
                disabled={postalCodeLockedInDataStep}
                enterKeyHint="next"
                error={errors.postalCode}
                id="mobile-postal"
                inputMode={getPostalCodeInputMode(countryForMethods)}
                label="Kod pocztowy"
                maxLength={postalCodeRules[countryForMethods].example.length}
                name="postal-code"
                onChange={(event) =>
                  updateFormField(
                    "postalCode",
                    formatPostalCodeForCountry(event.target.value, countryForMethods),
                  )
                }
                pattern={
                  countryForMethods === "Polska" ? "[0-9]{2}-?[0-9]{3}" : undefined
                }
                placeholder={`np. ${postalCodeRules[countryForMethods].example}`}
                value={form.postalCode}
              />
              <CompactField
                autoComplete="shipping address-level2"
                enterKeyHint="next"
                error={errors.city}
                id="mobile-city"
                label="Miasto"
                name="address-level2"
                onChange={(event) => updateFormField("city", event.target.value)}
                value={form.city}
              />
            </div>
          </div>

          <InvoiceSwitch
            checked={form.wantsInvoice}
            id="mobile-wants-invoice"
            onChange={(checked) => updateFormField("wantsInvoice", checked)}
          />

          {form.wantsInvoice ? (
            <CompactField
              autoComplete="off"
              enterKeyHint="done"
              error={errors.taxId}
              id="mobile-nip"
              inputMode="numeric"
              label="NIP"
              maxLength={13}
              name="tax-id"
              onChange={(event) => updateFormField("taxId", event.target.value)}
              value={form.taxId}
            />
          ) : null}

        </form>
      ),
    });

  const renderMobilePayment = () =>
    renderMobileSection({
      complete: paymentMethodId !== "IMOJE_BLIK" || /^\d{6}$/.test(blikCode),
      eyebrow: "Płatność",
      id: "mobile-payment",
      title: "Wybierz płatność",
      children: (
        <div className="grid gap-3">
          <fieldset>
            <legend className="sr-only">Metoda płatności</legend>
            <div className="grid grid-cols-3 gap-2">
              {availablePaymentMethods.map((method) => {
                const checked = paymentMethodId === method.id;

                return (
                  <label
                    className={classNames(
                      "grid min-h-[4.75rem] cursor-pointer content-start gap-1.5 border px-2 pb-1.5 pt-2.5 text-left transition-colors hover:border-browin-red/45 hover:bg-browin-red/5",
                      checked
                        ? "border-browin-red bg-browin-red/5 text-browin-red"
                        : "border-browin-dark/10 bg-browin-gray text-browin-dark",
                    )}
                    htmlFor={`mobile-payment-${method.id}`}
                    key={method.id}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      id={`mobile-payment-${method.id}`}
                      name="mobile-payment-method"
                      onChange={() => selectPaymentMethod(method.id)}
                      type="radio"
                    />
                    <span className="flex items-center justify-between gap-2">
                      <MethodLogo
                        alt={method.logoAlt}
                        className="h-8 w-14 p-1"
                        sizes="56px"
                        src={method.logoSrc}
                      />
                      {checked ? <Check size={14} weight="bold" /> : null}
                    </span>
                    <span className="line-clamp-2 min-w-0 text-[11px] font-bold leading-tight">
                      {method.shortName}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {selectedPayment ? (
            <div className="border border-browin-dark/10 bg-browin-gray p-3">
              <p className="text-[12px] font-bold text-browin-dark">
                {selectedPayment.name}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-browin-dark/58">
                {selectedPayment.detail}
              </p>
            </div>
          ) : null}

          {paymentMethodId === "IMOJE_BLIK" ? (
            <CompactField
              autoComplete="one-time-code"
              enterKeyHint="done"
              error={errors.blikCode}
              id="mobile-blik"
              inputMode="numeric"
              label="Kod BLIK"
              maxLength={6}
              name="one-time-code"
              onChange={(event) => {
                setBlikCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setErrors((current) => {
                  if (!current.blikCode) return current;
                  const next = { ...current };
                  delete next.blikCode;
                  return next;
                });
              }}
              pattern="[0-9]{6}"
              placeholder="000000"
              value={blikCode}
            />
          ) : null}

          <div className="grid grid-cols-3 gap-2 border border-browin-dark/10 bg-browin-gray p-3 text-center">
            <div>
              <ShieldCheck className="mx-auto text-browin-red" size={19} weight="fill" />
              <p className="mt-1 text-[10px] font-bold text-browin-dark">SSL</p>
            </div>
            <div>
              <LockKey className="mx-auto text-browin-red" size={19} />
              <p className="mt-1 text-[10px] font-bold text-browin-dark">Tokenizacja</p>
            </div>
            <div>
              <Receipt className="mx-auto text-browin-red" size={19} />
              <p className="mt-1 text-[10px] font-bold text-browin-dark">Zwroty</p>
            </div>
          </div>

        </div>
      ),
    });

  const renderMobileSuccess = () => {
    const placedOrder = order;

    return (
      <div className="grid gap-3 px-3 py-3">
        <div className="border border-browin-red/25 bg-browin-white p-4 text-center">
          <CheckCircle className="mx-auto text-browin-red" size={34} weight="fill" />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            Zamówienie przyjęte
          </p>
          <h1
            className="mt-1 text-2xl font-bold tracking-tight text-browin-dark outline-none"
            ref={headingRef}
            tabIndex={-1}
          >
            {placedOrder?.orderNumber ?? "BRW-DEMO"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-browin-dark/62">
            Potwierdzenie wysłaliśmy na {placedOrder?.email ?? "adres z zamówienia"}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-browin-dark/10 bg-browin-white p-3">
            <Truck className="text-browin-red" size={22} />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-browin-dark/50">
              Dostawa
            </p>
            <p className="mt-1 text-sm font-bold text-browin-dark">
              {placedOrder?.estimatedDelivery ?? "1-2 dni"}
            </p>
          </div>
          <div className="border border-browin-dark/10 bg-browin-white p-3">
            <Receipt className="text-browin-red" size={22} />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-browin-dark/50">
              Razem
            </p>
            <p className="mt-1 text-sm font-bold text-browin-dark">
              {formatCurrency(placedOrder?.total ?? summaryTotal)}
            </p>
          </div>
        </div>
        <button
          className="min-h-11 border border-browin-red bg-browin-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-browin-red"
          onClick={() => setAccountIntent(true)}
          type="button"
        >
          {accountIntent ? "Link konta gotowy" : "Załóż konto po zakupie"}
        </button>
        <Link
          className="checkout-cta inline-flex min-h-12 items-center justify-center bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.14em] text-browin-white"
          href="/"
        >
          Wróć do sklepu
        </Link>
      </div>
    );
  };

  const renderMobileCheckout = () => (
    <section
      className="bg-browin-gray"
      ref={mobileCheckoutRef}
      style={{
        paddingBottom: mobileCheckoutBottomPadding
          ? `${mobileCheckoutBottomPadding}px`
          : undefined,
      }}
    >
      <div className="sticky top-0 z-40 border-b border-browin-dark/10 bg-browin-white px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <Link className="min-w-0 flex-shrink" href="/">
            <Image
              alt="BROWIN"
              className="object-contain"
              height={35}
              priority
              src="/assets/logo_BROWIN.svg"
              style={{ height: "1.35rem", maxWidth: "7.5rem", width: "auto" }}
              width={162}
            />
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 text-right">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
                Bezpieczny checkout
              </span>
              <span className="block truncate text-[12px] font-bold text-browin-dark">
                Etap {mobileStageNumber}/{mobileCheckoutStages.length} · {mobileStageLabel}
              </span>
            </span>
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden bg-browin-dark/10" aria-hidden="true">
          <div
            className="h-full bg-browin-red transition-[width] duration-300"
            style={{ width: mobileProgressWidth }}
          />
        </div>
      </div>

      {currentStep === "success" ? (
        renderMobileSuccess()
      ) : (
        <>
          <div className="grid gap-3 px-3 py-3">
            {currentStep === "cart" ? renderMobileOrderPanel() : null}
            {items.length && currentStep === "contact" ? renderMobileContact() : null}
            {items.length && currentStep === "delivery" ? renderMobileDeliveryMethods() : null}
            {items.length && currentStep === "data" ? renderMobileData() : null}
            {items.length && currentStep === "payment" ? renderMobilePayment() : null}
          </div>

          {items.length ? (
            <div
              className="fixed inset-x-0 bottom-0 z-50 border-t border-browin-dark/10 bg-browin-white px-3 pt-3"
              ref={mobileStickyBarRef}
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              {renderMobileOrderTray()}
              {bottomPanelErrorMessages.length ? (
                <div className="mb-2">
                  {renderCheckoutErrorSummary("mobile-inline-error-message")}
                </div>
              ) : null}
              {currentStep === "cart" ? (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/48">
                      Razem
                    </p>
                    <p className="text-xl font-bold tracking-tight text-browin-dark">
                      {formatCurrency(total)}
                    </p>
                  </div>
                  <button
                    className="checkout-cta inline-flex min-h-12 min-w-[9.75rem] items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.1em] text-browin-white shadow-sharp transition-colors disabled:cursor-not-allowed disabled:bg-browin-dark/35"
                    disabled={isSubmitting}
                    onClick={handleMobileSubmit}
                    type="button"
                  >
                    <ArrowRight size={16} weight="bold" />
                    {getMobileCtaLabel()}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/48">
                        Razem
                      </p>
                      <p className="text-xl font-bold tracking-tight text-browin-dark">
                        {formatCurrency(total)}
                      </p>
                    </div>
                    <button
                      aria-expanded={mobileOrderOpen}
                      aria-label={
                        mobileOrderOpen
                          ? "Zwiń podsumowanie zamówienia"
                          : "Pokaż podsumowanie zamówienia"
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-white text-browin-red transition-colors hover:bg-browin-red/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                      onClick={handleMobileOrderDetails}
                      type="button"
                    >
                      <CaretDown
                        className={classNames(
                          "transition-transform",
                          mobileOrderOpen ? "" : "rotate-180",
                        )}
                        size={16}
                        weight="bold"
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-[minmax(3rem,10%)_minmax(0,1fr)] gap-2">
                    <button
                      aria-label="Wróć do poprzedniego etapu"
                      className="flex min-h-12 w-full items-center justify-center border border-browin-dark/12 bg-browin-white text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                      disabled={isSubmitting}
                      onClick={handleMobileBack}
                      type="button"
                    >
                      <ArrowLeft size={19} weight="bold" />
                    </button>
                    <button
                      className="checkout-cta inline-flex min-h-12 w-full items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.1em] text-browin-white shadow-sharp transition-colors disabled:cursor-not-allowed disabled:bg-browin-dark/35"
                      disabled={isSubmitting}
                      onClick={handleMobileSubmit}
                      type="button"
                    >
                      {isSubmitting ? (
                        <SpinnerGap className="animate-spin" size={16} />
                      ) : currentStep === "payment" ? (
                        <ShoppingBagOpen size={16} weight="fill" />
                      ) : (
                        <ArrowRight size={16} weight="bold" />
                      )}
                      {getMobileCtaLabel()}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );

  return (
    <>
      <div className="md:hidden">{renderMobileCheckout()}</div>
      {renderDesktopExpressCheckout()}
    </>
  );
}
