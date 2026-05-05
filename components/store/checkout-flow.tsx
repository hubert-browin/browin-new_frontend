"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bank,
  Check,
  CheckCircle,
  CreditCard,
  DeviceMobile,
  HandCoins,
  HouseLine,
  IdentificationCard,
  LockKey,
  MapPin,
  Minus,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  SpinnerGap,
  Storefront,
  Ticket,
  Trash,
  Truck,
  UserPlus,
  WarningCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { FormEvent, InputHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  isValidPostalCode,
  normalizeDiscountCode,
  paymentMethods,
  type DeliveryMethodId,
  type DiscountResult,
  type PaymentMethodId,
} from "@/lib/checkout";

type CheckoutStep = "cart" | "delivery" | "payment" | "success";
type CartItem = ReturnType<typeof useCart>["items"][number];
type CheckoutField = keyof CheckoutForm | "blikCode" | "discount";

type CheckoutForm = {
  billingCity: string;
  billingHouseNumber: string;
  billingPostalCode: string;
  billingStreet: string;
  city: string;
  companyName: string;
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

const STORAGE_KEY = "browin-checkout-demo";
const defaultForm: CheckoutForm = {
  billingCity: "",
  billingHouseNumber: "",
  billingPostalCode: "",
  billingStreet: "",
  city: "",
  companyName: "",
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

const checkoutSteps = [
  { id: "cart", label: "Koszyk" },
  { id: "delivery", label: "Dostawa" },
  { id: "payment", label: "Płatność" },
] as const satisfies ReadonlyArray<{
  id: Exclude<CheckoutStep, "success">;
  label: string;
}>;

const checkoutStepIds = [
  "cart",
  "delivery",
  "payment",
  "success",
] as const satisfies ReadonlyArray<CheckoutStep>;

const mobileStepCopy: Record<(typeof checkoutSteps)[number]["id"], { label: string; title: string }> = {
  cart: { label: "Koszyk", title: "Koszyk" },
  delivery: { label: "Dostawa", title: "Dane dostawy" },
  payment: { label: "Płatność", title: "Płatność" },
};

const stepIndex = (step: CheckoutStep) =>
  checkoutSteps.findIndex((candidate) => candidate.id === step);

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const isDeliveryMethodId = (value: unknown): value is DeliveryMethodId =>
  deliveryMethods.some((method) => method.id === value);

const isPaymentMethodId = (value: unknown): value is PaymentMethodId =>
  paymentMethods.some((method) => method.id === value);

const isCheckoutStep = (value: unknown): value is CheckoutStep =>
  checkoutStepIds.includes(value as CheckoutStep);

const getPaymentIcon = (id: PaymentMethodId) => {
  if (id === "blik") return DeviceMobile;
  if (id === "card") return CreditCard;
  if (id === "p24") return Bank;
  if (id === "paypo") return HandCoins;
  return Receipt;
};

const getDeliveryIcon = (id: DeliveryMethodId) => {
  if (id === "inpost") return Package;
  if (id === "courier") return Truck;
  return Storefront;
};

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

const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

function FormField({
  className = "",
  error,
  hint,
  id,
  label,
  wrapperClassName = "",
  ...props
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={wrapperClassName}>
      <label className="block text-[12px] font-bold text-browin-dark" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={classNames(
          "mt-2 min-h-12 w-full border bg-browin-white px-3.5 py-3 text-sm font-semibold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/42 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12",
          error ? "border-browin-red bg-browin-red/5" : "border-browin-dark/12",
          className,
        )}
        id={id}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-browin-red" id={`${id}-error`}>
          <WarningCircle className="mt-0.5 shrink-0" size={14} weight="fill" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-browin-dark/55" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function CompactField({
  className = "",
  error,
  hint,
  id,
  label,
  wrapperClassName = "",
  ...props
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={wrapperClassName}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/58" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={classNames(
          "mt-1 min-h-10 w-full border bg-browin-white px-2.5 py-2 text-[13px] font-bold text-browin-dark outline-none transition-colors placeholder:text-browin-dark/38 focus:border-browin-red focus:ring-2 focus:ring-browin-red/12",
          error ? "border-browin-red bg-browin-red/5" : "border-browin-dark/12",
          className,
        )}
        id={id}
        {...props}
      />
      {error ? (
        <p className="mt-1 flex items-start gap-1 text-[10px] font-bold leading-snug text-browin-red" id={`${id}-error`}>
          <WarningCircle className="mt-0.5 shrink-0" size={12} weight="fill" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[10px] leading-snug text-browin-dark/52" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function CheckboxField({
  checked,
  children,
  error,
  id,
  onChange,
}: {
  checked: boolean;
  children: React.ReactNode;
  error?: string;
  id: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div>
      <label
        className={classNames(
          "flex cursor-pointer items-start gap-3 border bg-browin-white p-4 text-sm leading-relaxed transition-colors hover:border-browin-red/45",
          checked ? "border-browin-red/45 bg-browin-red/5" : "border-browin-dark/10",
          error && "border-browin-red bg-browin-red/5",
        )}
        htmlFor={id}
      >
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          checked={checked}
          className="peer sr-only"
          id={id}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-browin-dark/28 bg-browin-white text-browin-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-browin-red peer-checked:border-browin-red peer-checked:bg-browin-red"
        >
          {checked ? <Check size={14} weight="bold" /> : null}
        </span>
        <span className="text-browin-dark/75">{children}</span>
      </label>
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-browin-red" id={`${id}-error`}>
          <WarningCircle className="mt-0.5 shrink-0" size={14} weight="fill" />
          {error}
        </p>
      ) : null}
    </div>
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
  deliveryMethodId: DeliveryMethodId;
  discount: DiscountResult | null;
  discountedSubtotal: number;
  items: CartItem[];
  subtotal: number;
  total: number;
}) {
  const selectedDelivery = deliveryMethods.find((method) => method.id === deliveryMethodId);

  return (
    <div>
      <div className="space-y-3">
        {items.length ? (
          items.map(({ product, quantity, variant }) => (
            <div className="grid grid-cols-[3.75rem_minmax(0,1fr)_auto] gap-3 border border-browin-dark/10 bg-browin-gray p-3" key={`${product.id}-${variant.id}`}>
              <div className="relative h-14 p-1">
                <Image
                  alt={product.title}
                  className="object-contain"
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
        <div className="flex items-center justify-between gap-4 text-browin-dark/68">
          <span>{selectedDelivery?.name ?? "Dostawa"}</span>
          <span>{deliveryCost === 0 ? "0,00 zł" : formatCurrency(deliveryCost)}</span>
        </div>
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
    clearCart,
    count,
    items,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [deliveryMethodId, setDeliveryMethodId] =
    useState<DeliveryMethodId>("inpost");
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>("blik");
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
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const discount = useMemo(
    () => (discountCode ? getDiscountForCode(discountCode, subtotal) : null),
    [discountCode, subtotal],
  );
  const discountedSubtotal = Math.max(subtotal - (discount?.amount ?? 0), 0);
  const deliveryCost = items.length
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
  const mobileErrorMessage = Object.values(errors)[0] ?? null;

  const mobileErrorTitle =
    currentStep === "delivery"
      ? "Dokończ dane dostawy"
      : currentStep === "payment"
        ? "Sprawdź płatność"
        : "Sprawdź koszyk";
  const selectedDelivery = deliveryMethods.find((method) => method.id === deliveryMethodId);
  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethodId);

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
      deliveryMethodId,
      discountCode,
      form,
      paymentMethodId,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [currentStep, deliveryMethodId, discountCode, form, hasHydrated, paymentMethodId]);

  useEffect(() => {
    if (currentStep !== "success" && hasHydrated && items.length === 0) {
      setCurrentStep("cart");
    }
  }, [currentStep, hasHydrated, items.length]);

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

  const validateDelivery = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "Podaj imię.";
    if (!form.lastName.trim()) nextErrors.lastName = "Podaj nazwisko.";
    if (!isValidEmail(form.email)) nextErrors.email = "Podaj poprawny adres e-mail.";
    if (!isValidPolishPhone(form.phone)) {
      nextErrors.phone = "Podaj 9-cyfrowy numer telefonu, np. 501 222 333.";
    }
    if (!form.street.trim()) nextErrors.street = "Podaj ulicę.";
    if (!form.houseNumber.trim()) nextErrors.houseNumber = "Podaj numer domu lub lokalu.";
    if (!isValidPostalCode(form.postalCode)) {
      nextErrors.postalCode = "Podaj kod w formacie 00-000.";
    }
    if (!form.city.trim()) nextErrors.city = "Podaj miasto.";
    if (!form.country.trim()) nextErrors.country = "Podaj kraj dostawy.";

    if (deliveryMethodId === "inpost" && !form.inpostPoint.trim()) {
      nextErrors.inpostPoint = "Wybierz paczkomat lub punkt odbioru.";
    }

    if (form.wantsInvoice) {
      if (!form.companyName.trim()) nextErrors.companyName = "Podaj nazwę firmy.";
      if (form.taxId.replace(/\D/g, "").length !== 10) {
        nextErrors.taxId = "Podaj 10-cyfrowy NIP.";
      }
    }

    if (form.differentBillingAddress) {
      if (!form.billingStreet.trim()) nextErrors.billingStreet = "Podaj ulicę.";
      if (!form.billingHouseNumber.trim()) {
        nextErrors.billingHouseNumber = "Podaj numer domu lub lokalu.";
      }
      if (!isValidPostalCode(form.billingPostalCode)) {
        nextErrors.billingPostalCode = "Podaj kod w formacie 00-000.";
      }
      if (!form.billingCity.trim()) nextErrors.billingCity = "Podaj miasto.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePayment = () => {
    const nextErrors: Partial<Record<CheckoutField, string>> = {};

    if (paymentMethodId === "blik" && !/^\d{6}$/.test(blikCode)) {
      nextErrors.blikCode = "Podaj 6-cyfrowy kod BLIK.";
    }

    if (!form.termsAccepted) {
      nextErrors.termsAccepted = "Akceptacja regulaminu i polityki prywatności jest wymagana.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToDelivery = () => {
    if (!items.length) {
      return;
    }

    setCurrentStep("delivery");
  };

  const handleDeliverySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateDelivery()) {
      return;
    }

    setCurrentStep("payment");
  };

  const submitPayment = async () => {
    if (!validatePayment() || !items.length || isSubmitting) {
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
  };

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPayment();
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
    const activeIndex = stepIndex(currentStep);

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
      <nav aria-label="Etapy checkoutu" className="mb-6 border border-browin-dark/10 bg-browin-white p-3 shadow-sm">
        <ol className="grid grid-cols-3 gap-2">
          {checkoutSteps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = index < activeIndex;
            const canNavigate = index < activeIndex;

            return (
              <li key={step.id}>
                <button
                  aria-current={isActive ? "step" : undefined}
                  className={classNames(
                    "flex min-h-14 w-full flex-col items-start justify-center border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red md:px-4",
                    isActive
                      ? "border-browin-red bg-browin-red text-browin-white"
                      : isComplete
                        ? "border-browin-red/35 bg-browin-red/5 text-browin-dark"
                        : "border-browin-dark/10 bg-browin-gray text-browin-dark/48",
                    canNavigate && "hover:border-browin-red hover:text-browin-red",
                  )}
                  disabled={!canNavigate}
                  onClick={() => setCurrentStep(step.id)}
                  type="button"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-[11px] font-bold md:text-sm">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  const renderDiscountBox = () => {
    const discountDescriptionId = discount
      ? "discount-code-hint"
      : discountError
        ? "discount-code-error"
        : undefined;

    return (
      <div
        className={classNames(
          "border bg-browin-white p-4 transition-colors",
          discount ? "border-browin-red/35" : "border-browin-dark/10",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-browin-red text-browin-white">
              <Ticket size={21} weight="fill" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                Kupon
              </p>
              <label className="mt-1 block text-lg font-bold leading-tight text-browin-dark" htmlFor="discount-code">
                Kod rabatowy
              </label>
            </div>
          </div>

          {discount ? (
            <div className="flex min-h-10 shrink-0 items-center gap-2 border border-browin-red bg-browin-red/5 px-3 text-sm font-bold text-browin-red">
              <Check size={16} weight="bold" />
              -{formatCurrency(discount.amount)}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <div
            className={classNames(
              "flex min-h-12 overflow-hidden border bg-browin-gray transition-colors focus-within:border-browin-red focus-within:bg-browin-white focus-within:ring-2 focus-within:ring-browin-red/12",
              discountError ? "border-browin-red" : "border-browin-dark/12",
            )}
          >
            <input
              autoCapitalize="characters"
              autoComplete="off"
              aria-describedby={discountDescriptionId}
              aria-invalid={Boolean(discountError)}
              className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-browin-dark outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-browin-dark/40"
              enterKeyHint="done"
              id="discount-code"
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
              placeholder="Wpisz kod"
              spellCheck={false}
              value={discountDraft}
            />
            {discount ? (
              <button
                className="min-h-12 border-l border-browin-dark/12 bg-browin-white px-4 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red"
                onClick={removeDiscount}
                type="button"
              >
                Usuń
              </button>
            ) : (
              <button
                className="checkout-cta inline-flex min-h-12 items-center justify-center gap-2 bg-browin-dark px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red"
                onClick={applyDiscount}
                type="button"
              >
                Zastosuj
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {discount ? (
            <p className="flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-browin-red" id="discount-code-hint">
              <Check className="mt-0.5 shrink-0" size={14} weight="bold" />
              {discount.label}
            </p>
          ) : discountError ? (
            <p className="flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-browin-red" id="discount-code-error">
              <WarningCircle className="mt-0.5 shrink-0" size={14} weight="fill" />
              {discountError}
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderCartStep = () => (
    <div className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8">
      {renderStepHeader(
        "Koszyk",
        "Sprawdź produkty",
        "Możesz zmienić ilości, dodać kod rabatowy i od razu zobaczyć finalne koszty bez ukrytych dopłat.",
      )}

      {items.length ? (
        <>
          <div className="mt-6 space-y-4">
            {items.map(({ product, quantity, variant }) => (
              <article
                className="border border-browin-dark/10 bg-browin-white p-4 transition-colors hover:border-browin-red/35"
                key={`${product.id}-${variant.id}`}
              >
                <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)]">
                  <Link
                    className="relative block h-36 overflow-hidden p-2 md:h-28"
                    href={`/produkt/${product.slug}`}
                  >
                    <Image
                      alt={product.title}
                      className="object-contain"
                      fill
                      sizes="112px"
                      src={product.images[0]}
                    />
                  </Link>

                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Link
                          className="block text-lg font-bold leading-tight text-browin-dark transition-colors hover:text-browin-red"
                          href={`/produkt/${product.slug}`}
                        >
                          {product.title}
                        </Link>
                        <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                          {product.subtitle}
                        </p>
                        {variant.label.trim() ? (
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-browin-red">
                            {variant.label}
                          </p>
                        ) : null}
                      </div>
                      <button
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-browin-dark/45 transition-colors hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                        onClick={() => removeItem(product.id, variant.id)}
                        type="button"
                      >
                        <Trash size={16} />
                        Usuń
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark/48">
                          Ilość
                        </p>
                        <QuantityControl
                          label={product.title}
                          onDecrease={() => updateQuantity(product.id, variant.id, quantity - 1)}
                          onIncrease={() => updateQuantity(product.id, variant.id, quantity + 1)}
                          quantity={quantity}
                        />
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-semibold text-browin-dark/48">
                          {formatCurrency(variant.price)} / szt.
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-browin-dark">
                          {formatCurrency(variant.price * quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6">{renderDiscountBox()}</div>

          <div className="mt-6 flex flex-col gap-3 border-t border-browin-dark/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-browin-dark/68 transition-colors hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
              href="/produkty"
            >
              <ArrowLeft size={16} />
              Wróć do zakupów
            </Link>
            <button
              className="checkout-cta inline-flex min-h-14 items-center justify-center gap-2 bg-browin-red px-6 text-sm font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
              onClick={goToDelivery}
              type="button"
            >
              Dalej do dostawy
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="mt-6 border border-dashed border-browin-dark/15 bg-browin-gray p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-browin-white text-browin-red">
            <ShoppingCart size={26} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-browin-dark">Koszyk jest pusty</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-browin-dark/65">
            Checkout zachowa dane po przejściu między etapami, ale najpierw dodaj produkty
            do koszyka.
          </p>
          <Link
            className="checkout-cta mt-5 inline-flex min-h-12 items-center justify-center gap-2 bg-browin-red px-5 text-sm font-bold uppercase tracking-[0.16em] text-browin-white transition-colors hover:bg-browin-dark"
            href="/produkty"
          >
            Otwórz katalog
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );

  const renderDeliveryStep = () => (
    <form
      autoComplete="on"
      className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8"
      noValidate
      onSubmit={handleDeliverySubmit}
    >
      {renderStepHeader(
        "Dostawa",
        "Dane i metoda dostawy",
        "Konto nie jest wymagane. Podaj tylko dane potrzebne do dostarczenia zamówienia i powiadomień o statusie.",
      )}

      <div className="mt-6 grid gap-8">
        <section aria-labelledby="contact-data-title">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-red text-browin-white">
              <HouseLine size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-browin-dark" id="contact-data-title">
                Dane odbiorcy
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                Pola są przygotowane pod autofill przeglądarki.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField
              autoComplete="shipping given-name"
              enterKeyHint="next"
              error={errors.firstName}
              id="first-name"
              label="Imię"
              name="given-name"
              onChange={(event) => updateFormField("firstName", event.target.value)}
              value={form.firstName}
            />
            <FormField
              autoComplete="shipping family-name"
              enterKeyHint="next"
              error={errors.lastName}
              id="last-name"
              label="Nazwisko"
              name="family-name"
              onChange={(event) => updateFormField("lastName", event.target.value)}
              value={form.lastName}
            />
            <FormField
              autoComplete="email"
              autoCapitalize="none"
              enterKeyHint="next"
              error={errors.email}
              id="email"
              inputMode="email"
              label="E-mail"
              name="email"
              onChange={(event) => updateFormField("email", event.target.value)}
              placeholder="adres@email.pl"
              spellCheck={false}
              type="email"
              value={form.email}
            />
            <FormField
              autoComplete="tel"
              enterKeyHint="next"
              error={errors.phone}
              id="phone"
              inputMode="tel"
              label="Telefon"
              name="tel"
              onChange={(event) => updateFormField("phone", event.target.value)}
              placeholder="501 222 333"
              type="tel"
              value={form.phone}
            />
            <FormField
              autoComplete="shipping address-line1"
              enterKeyHint="next"
              error={errors.street}
              id="street"
              label="Ulica"
              name="address-line1"
              onChange={(event) => updateFormField("street", event.target.value)}
              value={form.street}
            />
            <FormField
              autoComplete="shipping address-line2"
              enterKeyHint="next"
              error={errors.houseNumber}
              id="house-number"
              label="Numer domu / lokalu"
              name="address-line2"
              onChange={(event) => updateFormField("houseNumber", event.target.value)}
              value={form.houseNumber}
            />
            <FormField
              autoComplete="shipping postal-code"
              enterKeyHint="next"
              error={errors.postalCode}
              id="postal-code"
              inputMode="numeric"
              label="Kod pocztowy"
              maxLength={6}
              name="postal-code"
              onChange={(event) =>
                updateFormField("postalCode", formatPostalCodeInput(event.target.value))
              }
              pattern="[0-9]{2}-?[0-9]{3}"
              placeholder="00-000"
              value={form.postalCode}
            />
            <FormField
              autoComplete="shipping address-level2"
              enterKeyHint="next"
              error={errors.city}
              id="city"
              label="Miasto"
              name="address-level2"
              onChange={(event) => updateFormField("city", event.target.value)}
              value={form.city}
            />
            <FormField
              autoComplete="shipping country-name"
              enterKeyHint="done"
              error={errors.country}
              id="country"
              label="Kraj"
              name="country-name"
              onChange={(event) => updateFormField("country", event.target.value)}
              value={form.country}
              wrapperClassName="md:col-span-2"
            />
          </div>
        </section>

        <fieldset className="border border-browin-dark/10 bg-browin-gray p-4 md:p-5">
          <legend className="px-1 text-xl font-bold tracking-tight text-browin-dark">
            Metoda dostawy
          </legend>
          <div className="mt-4 grid gap-3">
            {deliveryMethods.map((method) => {
              const DeliveryIcon = getDeliveryIcon(method.id);
              const checked = deliveryMethodId === method.id;
              const methodCost = calculateDeliveryCost({
                deliveryMethodId: method.id,
                discountedSubtotal,
              });

              return (
                <label
                  className={classNames(
                    "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border bg-browin-white p-4 transition-colors hover:border-browin-red/45",
                    checked ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10",
                  )}
                  htmlFor={`delivery-${method.id}`}
                  key={method.id}
                >
                  <input
                    checked={checked}
                    className="mt-1 h-4 w-4 accent-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                    id={`delivery-${method.id}`}
                    name="delivery-method"
                    onChange={() => setDeliveryMethodId(method.id)}
                    type="radio"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-base font-bold text-browin-dark">
                      <DeliveryIcon className="text-browin-red" size={19} />
                      {method.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-browin-dark/62">
                      {method.hint}
                    </span>
                    <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-browin-dark/45">
                      {method.eta}
                    </span>
                  </span>
                  <span className="text-right text-sm font-bold text-browin-dark">
                    {methodCost === 0 ? "0,00 zł" : formatCurrency(methodCost)}
                  </span>
                </label>
              );
            })}
          </div>

          {deliveryMethodId === "inpost" ? (
            <div
              className={classNames(
                "mt-4 border p-4 transition-colors",
                errors.inpostPoint ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10 bg-browin-white",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-gray text-browin-red">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-browin-dark">
                      {form.inpostPoint || "Wybierz Paczkomat"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                      Placeholder integracyjny pod mapę i API InPost. W demo możesz wybrać
                      przykładowy punkt.
                    </p>
                  </div>
                </div>
                <button
                  className="min-h-11 border border-browin-red bg-browin-white px-4 text-sm font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:bg-browin-red hover:text-browin-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                  onClick={() => updateFormField("inpostPoint", "LOD01A • ul. Piotrkowska 120")}
                  type="button"
                >
                  Wybierz punkt
                </button>
              </div>
              {errors.inpostPoint ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-relaxed text-browin-red" id="inpost-point-error">
                  <WarningCircle className="mt-0.5 shrink-0" size={14} weight="fill" />
                  {errors.inpostPoint}
                </p>
              ) : null}
            </div>
          ) : null}
        </fieldset>

        <section className="grid gap-4" aria-label="Dane dodatkowe">
          <CheckboxField
            checked={form.wantsInvoice}
            id="wants-invoice"
            onChange={(checked) => updateFormField("wantsInvoice", checked)}
          >
            <span className="font-bold text-browin-dark">Chcę fakturę</span>
            <span className="block text-browin-dark/62">
              Pola firmowe rozwiną się tylko wtedy, gdy są potrzebne.
            </span>
          </CheckboxField>

          {form.wantsInvoice ? (
            <div className="grid gap-4 border border-browin-dark/10 bg-browin-gray p-4 md:grid-cols-2">
              <FormField
                autoComplete="organization"
                enterKeyHint="next"
                error={errors.companyName}
                id="company-name"
                label="Nazwa firmy"
                name="organization"
                onChange={(event) => updateFormField("companyName", event.target.value)}
                value={form.companyName}
              />
              <FormField
                autoComplete="off"
                enterKeyHint="done"
                error={errors.taxId}
                id="tax-id"
                inputMode="numeric"
                label="NIP"
                maxLength={13}
                name="tax-id"
                onChange={(event) => updateFormField("taxId", event.target.value)}
                value={form.taxId}
              />
            </div>
          ) : null}

          <CheckboxField
            checked={form.differentBillingAddress}
            id="different-billing"
            onChange={(checked) => updateFormField("differentBillingAddress", checked)}
          >
            <span className="font-bold text-browin-dark">Inny adres rozliczeniowy</span>
            <span className="block text-browin-dark/62">
              Domyślnie użyjemy adresu dostawy.
            </span>
          </CheckboxField>

          {form.differentBillingAddress ? (
            <div className="grid gap-4 border border-browin-dark/10 bg-browin-gray p-4 md:grid-cols-2">
              <FormField
                autoComplete="billing address-line1"
                enterKeyHint="next"
                error={errors.billingStreet}
                id="billing-street"
                label="Ulica"
                name="billing-address-line1"
                onChange={(event) => updateFormField("billingStreet", event.target.value)}
                value={form.billingStreet}
              />
              <FormField
                autoComplete="billing address-line2"
                enterKeyHint="next"
                error={errors.billingHouseNumber}
                id="billing-house-number"
                label="Numer domu / lokalu"
                name="billing-address-line2"
                onChange={(event) => updateFormField("billingHouseNumber", event.target.value)}
                value={form.billingHouseNumber}
              />
              <FormField
                autoComplete="billing postal-code"
                enterKeyHint="next"
                error={errors.billingPostalCode}
                id="billing-postal-code"
                inputMode="numeric"
                label="Kod pocztowy"
                maxLength={6}
                name="billing-postal-code"
                onChange={(event) =>
                  updateFormField("billingPostalCode", formatPostalCodeInput(event.target.value))
                }
                pattern="[0-9]{2}-?[0-9]{3}"
                placeholder="00-000"
                value={form.billingPostalCode}
              />
              <FormField
                autoComplete="billing address-level2"
                enterKeyHint="done"
                error={errors.billingCity}
                id="billing-city"
                label="Miasto"
                name="billing-address-level2"
                onChange={(event) => updateFormField("billingCity", event.target.value)}
                value={form.billingCity}
              />
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-browin-dark/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-browin-dark/12 bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
          onClick={() => setCurrentStep("cart")}
          type="button"
        >
          <ArrowLeft size={16} />
          Wróć do koszyka
        </button>
        <button
          className="checkout-cta inline-flex min-h-14 items-center justify-center gap-2 bg-browin-red px-6 text-sm font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
          type="submit"
        >
          Dalej do płatności
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form
      autoComplete="on"
      className="border border-browin-dark/10 bg-browin-white p-5 shadow-sm md:p-8"
      noValidate
      onSubmit={handlePaymentSubmit}
    >
      {renderStepHeader(
        "Płatność",
        "Potwierdź zamówienie",
        "To tryb demonstracyjny. Płatność jest pokazana jako bezpieczny punkt integracyjny pod operatora i tokenizację.",
      )}

      <div className="mt-6 grid gap-8">
        <fieldset className="border border-browin-dark/10 bg-browin-gray p-4 md:p-5">
          <legend className="px-1 text-xl font-bold tracking-tight text-browin-dark">
            Metoda płatności
          </legend>
          <div className="mt-4 grid gap-3">
            {paymentMethods.map((method) => {
              const PaymentIcon = getPaymentIcon(method.id);
              const checked = paymentMethodId === method.id;

              return (
                <label
                  className={classNames(
                    "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 border bg-browin-white p-4 transition-colors hover:border-browin-red/45",
                    checked ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10",
                  )}
                  htmlFor={`payment-${method.id}`}
                  key={method.id}
                >
                  <input
                    checked={checked}
                    className="mt-1 h-4 w-4 accent-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                    id={`payment-${method.id}`}
                    name="payment-method"
                    onChange={() => {
                      setPaymentMethodId(method.id);
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.blikCode;
                        return next;
                      });
                    }}
                    type="radio"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-base font-bold text-browin-dark">
                      <PaymentIcon className="text-browin-red" size={19} />
                      {method.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-browin-dark/62">
                      {method.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {paymentMethodId === "blik" ? (
            <div className="mt-4 border border-browin-dark/10 bg-browin-white p-4">
              <FormField
                autoComplete="one-time-code"
                enterKeyHint="done"
                error={errors.blikCode}
                id="blik-code"
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
              <p className="mt-2 text-xs leading-relaxed text-browin-dark/55">
                Kod BLIK jest używany wyłącznie w stanie komponentu podczas demonstracji i
                czyszczony po złożeniu zamówienia.
              </p>
            </div>
          ) : null}

          {paymentMethodId === "card" ? (
            <div className="mt-4 border border-browin-dark/10 bg-browin-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-browin-gray text-browin-red">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-bold text-browin-dark">Tokenizowany formularz karty</p>
                  <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                    Docelowo operator płatności osadza tutaj własny, certyfikowany iframe.
                    Frontend sklepu nie zapisuje pełnych danych karty.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </fieldset>

        <section className="grid gap-4 border border-browin-dark/10 bg-browin-white p-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-browin-red" size={22} weight="fill" />
            <div>
              <h2 className="font-bold text-browin-dark">Bezpieczne połączenie</h2>
              <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                SSL i tokenizacja po stronie operatora płatności.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LockKey className="mt-0.5 shrink-0 text-browin-red" size={22} />
            <div>
              <h2 className="font-bold text-browin-dark">Bez ukrytych kosztów</h2>
              <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                Dostawa, rabat i suma brutto są widoczne przed kliknięciem CTA.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Receipt className="mt-0.5 shrink-0 text-browin-red" size={22} />
            <div>
              <h2 className="font-bold text-browin-dark">Zwroty i reklamacje</h2>
              <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                Obsługa zgodnie z regulaminem sklepu BROWIN.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-browin-dark/10 bg-browin-gray p-4">
          <div className="flex items-start gap-3">
            <IdentificationCard className="mt-0.5 shrink-0 text-browin-red" size={22} />
            <div>
              <h2 className="font-bold text-browin-dark">Finalne potwierdzenie</h2>
              <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
                Dostawa: {selectedDelivery?.name} • {selectedDelivery?.eta}. Płatność:{" "}
                {selectedPayment?.name}.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 text-browin-dark/68">
              <span>Produkty po rabacie</span>
              <span>{formatCurrency(discountedSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-browin-dark/68">
              <span>Dostawa</span>
              <span>{deliveryCost === 0 ? "0,00 zł" : formatCurrency(deliveryCost)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-browin-dark/10 pt-3 text-lg font-bold text-browin-dark">
              <span>Do zapłaty</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <CheckboxField
            checked={form.termsAccepted}
            error={errors.termsAccepted}
            id="terms-accepted"
            onChange={(checked) => updateFormField("termsAccepted", checked)}
          >
            Akceptuję{" "}
            <Link className="font-bold text-browin-red underline underline-offset-2" href="/regulamin">
              regulamin
            </Link>{" "}
            oraz{" "}
            <Link className="font-bold text-browin-red underline underline-offset-2" href="/polityka-prywatnosci">
              politykę prywatności
            </Link>
            .
          </CheckboxField>
          <CheckboxField
            checked={form.marketingAccepted}
            id="marketing-accepted"
            onChange={(checked) => updateFormField("marketingAccepted", checked)}
          >
            Chcę otrzymywać inspiracje, przepisy i informacje o promocjach BROWIN. Zgoda
            jest dobrowolna i nie jest domyślnie zaznaczona.
          </CheckboxField>
        </section>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-browin-dark/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-browin-dark/12 bg-browin-white px-5 text-sm font-bold uppercase tracking-[0.12em] text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
          disabled={isSubmitting}
          onClick={() => setCurrentStep("delivery")}
          type="button"
        >
          <ArrowLeft size={16} />
          Wróć do dostawy
        </button>
        <button
          className="checkout-cta inline-flex min-h-14 items-center justify-center gap-2 bg-browin-red px-6 text-sm font-bold uppercase tracking-[0.16em] text-browin-white shadow-sharp transition-colors hover:bg-browin-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red disabled:cursor-not-allowed disabled:bg-browin-dark/35"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <SpinnerGap className="animate-spin" size={18} />
              Finalizuję...
            </>
          ) : (
            <>
              Zamawiam i płacę
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );

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
                    {placedOrder.paymentMethodId === "bank-transfer"
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

  const getMobilePrimaryLabel = () => {
    if (currentStep === "cart") return "Dostawa";
    if (currentStep === "delivery") return "Płatność";
    if (isSubmitting) return "Finalizuję...";
    return "Zamawiam";
  };

  const handleMobilePrimaryAction = () => {
    if (currentStep === "cart") {
      goToDelivery();
      return;
    }

    if (currentStep === "delivery") {
      if (validateDelivery()) {
        setCurrentStep("payment");
      }
      return;
    }

    if (currentStep === "payment") {
      void submitPayment();
    }
  };

  const handleMobileBackAction = () => {
    if (currentStep === "payment") {
      setCurrentStep("delivery");
      return;
    }

    if (currentStep === "delivery") {
      setCurrentStep("cart");
    }
  };

  const renderMobileProgress = () => {
    const activeIndex = stepIndex(currentStep);
    const progressWidth = `${((Math.max(activeIndex, 0) + 1) / checkoutSteps.length) * 100}%`;

    if (currentStep === "success") {
      return (
        <div className="sticky top-[3.625rem] z-40 border-b border-browin-red/20 bg-browin-white px-3 py-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-browin-red text-browin-white">
              <CheckCircle size={20} weight="fill" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
                Dziękujemy
              </span>
              <span className="block truncate text-[12px] font-bold leading-snug text-browin-dark">
                Zamówienie przyjęte. Szczegóły są poniżej.
              </span>
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="sticky top-[3.625rem] z-40 border-b border-browin-dark/10 bg-browin-white px-3 py-2">
        <div className="mb-2 h-1 overflow-hidden bg-browin-dark/10" aria-hidden="true">
          <div
            className="h-full bg-browin-red transition-[width] duration-300"
            style={{ width: progressWidth }}
          />
        </div>
        <ol className="grid grid-cols-3 gap-1.5" aria-label="Etapy checkoutu">
          {checkoutSteps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = index < activeIndex;
            const canNavigate = index < activeIndex;

            return (
              <li key={step.id} className="min-w-0">
                <button
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Etap ${index + 1}: ${mobileStepCopy[step.id].title}`}
                  className={classNames(
                    "flex min-h-9 w-full min-w-0 items-center justify-center rounded-[2px] px-1 text-[10px] font-bold leading-none transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red",
                    isActive
                      ? "bg-browin-red text-browin-white"
                      : isComplete
                        ? "text-browin-red"
                        : "text-browin-dark/46",
                    canNavigate && "hover:bg-browin-red/5 hover:text-browin-red",
                  )}
                  disabled={!canNavigate}
                  onClick={() => setCurrentStep(step.id)}
                  type="button"
                >
                  <span className="whitespace-nowrap">{mobileStepCopy[step.id].label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const renderMobileCart = () => (
    <div className="grid gap-3">
      <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
        Koszyk
      </h1>
      {items.length ? (
        <>
          <div className="grid gap-2">
            {items.map(({ product, quantity, variant }) => (
              <article
                className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-2 border border-browin-dark/10 bg-browin-white p-3"
                key={`${product.id}-${variant.id}`}
              >
                <div className="relative -my-1 h-24 overflow-hidden">
                  <Image
                    alt={product.title}
                    className="object-contain drop-shadow-sm"
                    fill
                    sizes="92px"
                    src={product.images[0]}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-[13px] font-bold leading-tight text-browin-dark">
                      {product.title}
                    </p>
                    <p className="shrink-0 text-right text-sm font-bold text-browin-dark">
                      {formatCurrency(variant.price * quantity)}
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-browin-dark/42">
                    {variant.label.trim() || "Wariant domyślny"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <QuantityControl
                      label={product.title}
                      onDecrease={() => updateQuantity(product.id, variant.id, quantity - 1)}
                      onIncrease={() => updateQuantity(product.id, variant.id, quantity + 1)}
                      quantity={quantity}
                    />
                    <button
                      aria-label={`Usuń ${product.title}`}
                      className="flex h-9 w-9 items-center justify-center border border-browin-dark/10 text-browin-dark/45"
                      onClick={() => removeItem(product.id, variant.id)}
                      type="button"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div
            className={classNames(
              "border bg-browin-white p-3 transition-colors",
              discount ? "border-browin-red/35" : "border-browin-dark/10",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-browin-red text-browin-white">
                  <Ticket size={17} weight="fill" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
                    Kupon
                  </span>
                  <span className="block truncate text-[12px] font-bold text-browin-dark">
                    {discount ? discount.code : "Kod rabatowy"}
                  </span>
                </span>
              </div>
              {discount ? (
                <span className="shrink-0 text-[12px] font-bold text-browin-red">
                  -{formatCurrency(discount.amount)}
                </span>
              ) : null}
            </div>

            <div
              className={classNames(
                "mt-2 flex min-h-11 overflow-hidden border bg-browin-gray transition-colors focus-within:border-browin-red focus-within:bg-browin-white",
                discountError ? "border-browin-red" : "border-browin-dark/12",
              )}
            >
              <input
                autoCapitalize="characters"
                autoComplete="off"
                aria-describedby={
                  discount ? "mobile-discount-hint" : discountError ? "mobile-discount-error" : undefined
                }
                aria-invalid={Boolean(discountError)}
                className="min-w-0 flex-1 bg-transparent px-3 text-[12px] font-bold uppercase tracking-[0.08em] text-browin-dark outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-browin-dark/42"
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
                  "min-h-11 shrink-0 px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-browin-red",
                  discount
                    ? "border-l border-browin-dark/12 bg-browin-white text-browin-dark hover:text-browin-red"
                    : "bg-browin-dark text-browin-white hover:bg-browin-red",
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

          <FreeShippingMeter discountedSubtotal={discountedSubtotal} compact />
        </>
      ) : (
        <div className="border border-dashed border-browin-dark/15 bg-browin-white p-6 text-center">
          <ShoppingCart className="mx-auto text-browin-red" size={28} />
          <h1
            className="mt-3 text-xl font-bold text-browin-dark outline-none"
            ref={headingRef}
            tabIndex={-1}
          >
            Koszyk jest pusty
          </h1>
          <Link
            className="checkout-cta mt-4 inline-flex min-h-11 items-center justify-center bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.14em] text-browin-white"
            href="/produkty"
          >
            Otwórz katalog
          </Link>
        </div>
      )}
    </div>
  );

  const renderMobileDeliveryMethods = () => (
    <fieldset className="border border-browin-dark/10 bg-browin-white p-3">
      <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
        Dostawa
      </legend>
      <div className="grid gap-2">
        {deliveryMethods.map((method) => {
          const DeliveryIcon = getDeliveryIcon(method.id);
          const checked = deliveryMethodId === method.id;
          const methodCost = calculateDeliveryCost({
            deliveryMethodId: method.id,
            discountedSubtotal,
          });

          return (
            <label
              className={classNames(
                "grid min-h-14 cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border px-3 py-2 text-left transition-colors",
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
                onChange={() => setDeliveryMethodId(method.id)}
                type="radio"
              />
              <DeliveryIcon className="mx-auto" size={19} weight={checked ? "fill" : "regular"} />
              <span className="min-w-0 text-[12px] font-bold leading-tight">
                {method.id === "inpost"
                  ? "Paczkomat InPost"
                  : method.id === "courier"
                    ? "Kurier"
                    : "Odbiór osobisty"}
              </span>
              <span className="text-[11px] font-bold">
                {methodCost === 0 ? "0 zł" : formatCurrency(methodCost)}
              </span>
            </label>
          );
        })}
      </div>
      {deliveryMethodId === "inpost" ? (
        <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2 border border-browin-dark/10 bg-browin-gray p-2">
          <p className="min-w-0 truncate text-[12px] font-bold text-browin-dark">
            {form.inpostPoint || "Paczkomat: wybierz punkt"}
          </p>
          <button
            className="min-h-9 bg-browin-dark px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-browin-white"
            onClick={() => updateFormField("inpostPoint", "LOD01A • ul. Piotrkowska 120")}
            type="button"
          >
            Wybierz
          </button>
          {errors.inpostPoint ? (
            <p className="col-span-2 text-[10px] font-bold text-browin-red">
              {errors.inpostPoint}
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );

  const renderMobileDelivery = () => (
    <form
      autoComplete="on"
      className="grid gap-3"
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
        Dane dostawy
      </h1>

      {renderMobileDeliveryMethods()}

      <div className="grid gap-2 border border-browin-dark/10 bg-browin-white p-3">
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
        <CompactField
          autoComplete="email"
          autoCapitalize="none"
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

      <div className="grid gap-2 border border-browin-dark/10 bg-browin-white p-3">
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
          enterKeyHint="next"
          error={errors.postalCode}
          id="mobile-postal"
          inputMode="numeric"
          label="Kod"
          maxLength={6}
          name="postal-code"
          onChange={(event) =>
            updateFormField("postalCode", formatPostalCodeInput(event.target.value))
          }
          pattern="[0-9]{2}-?[0-9]{3}"
          placeholder="00-000"
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
        <CompactField
          autoComplete="shipping country-name"
          enterKeyHint="done"
          error={errors.country}
          id="mobile-country"
          label="Kraj"
          name="country-name"
          onChange={(event) => updateFormField("country", event.target.value)}
          value={form.country}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          aria-pressed={form.wantsInvoice}
          className={classNames(
            "min-h-11 border px-2 text-[11px] font-bold uppercase tracking-[0.1em]",
            form.wantsInvoice ? "border-browin-red bg-browin-red/5 text-browin-red" : "border-browin-dark/10 bg-browin-white text-browin-dark/62",
          )}
          onClick={() => updateFormField("wantsInvoice", !form.wantsInvoice)}
          type="button"
        >
          Faktura
        </button>
        <button
          aria-pressed={form.differentBillingAddress}
          className={classNames(
            "min-h-11 border px-2 text-[11px] font-bold uppercase tracking-[0.1em]",
            form.differentBillingAddress ? "border-browin-red bg-browin-red/5 text-browin-red" : "border-browin-dark/10 bg-browin-white text-browin-dark/62",
          )}
          onClick={() =>
            updateFormField("differentBillingAddress", !form.differentBillingAddress)
          }
          type="button"
        >
          Inny adres
        </button>
      </div>

      {form.wantsInvoice ? (
        <div className="grid gap-2 border border-browin-dark/10 bg-browin-white p-3">
          <CompactField
            autoComplete="organization"
            enterKeyHint="next"
            error={errors.companyName}
            id="mobile-company"
            label="Firma"
            name="organization"
            onChange={(event) => updateFormField("companyName", event.target.value)}
            value={form.companyName}
          />
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
        </div>
      ) : null}

      {form.differentBillingAddress ? (
        <div className="grid gap-2 border border-browin-dark/10 bg-browin-white p-3">
          <CompactField
            autoComplete="billing address-line1"
            enterKeyHint="next"
            error={errors.billingStreet}
            id="mobile-billing-street"
            label="Ulica rozl."
            name="billing-address-line1"
            onChange={(event) => updateFormField("billingStreet", event.target.value)}
            value={form.billingStreet}
          />
          <CompactField
            autoComplete="billing address-line2"
            enterKeyHint="next"
            error={errors.billingHouseNumber}
            id="mobile-billing-house"
            label="Nr"
            name="billing-address-line2"
            onChange={(event) => updateFormField("billingHouseNumber", event.target.value)}
            value={form.billingHouseNumber}
          />
          <CompactField
            autoComplete="billing postal-code"
            enterKeyHint="next"
            error={errors.billingPostalCode}
            id="mobile-billing-postal"
            inputMode="numeric"
            label="Kod"
            maxLength={6}
            name="billing-postal-code"
            onChange={(event) =>
              updateFormField("billingPostalCode", formatPostalCodeInput(event.target.value))
            }
            pattern="[0-9]{2}-?[0-9]{3}"
            placeholder="00-000"
            value={form.billingPostalCode}
          />
          <CompactField
            autoComplete="billing address-level2"
            enterKeyHint="done"
            error={errors.billingCity}
            id="mobile-billing-city"
            label="Miasto"
            name="billing-address-level2"
            onChange={(event) => updateFormField("billingCity", event.target.value)}
            value={form.billingCity}
          />
        </div>
      ) : null}
    </form>
  );

  const renderMobilePayment = () => (
    <div className="grid gap-3">
      <h1 className="sr-only" ref={headingRef} tabIndex={-1}>
        Płatność
      </h1>

      <fieldset className="border border-browin-dark/10 bg-browin-white p-3">
        <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
          Płatność
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const PaymentIcon = getPaymentIcon(method.id);
            const checked = paymentMethodId === method.id;
            const mobileName =
              method.id === "bank-transfer"
                ? "Przelew bankowy"
                : method.id === "p24"
                  ? "Przelew online"
                  : method.name;

            return (
              <label
                className={classNames(
                  "grid min-h-14 cursor-pointer grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 border px-3 py-2 text-left transition-colors",
                  checked ? "border-browin-red bg-browin-red/5 text-browin-red" : "border-browin-dark/10 bg-browin-gray text-browin-dark",
                )}
                htmlFor={`mobile-payment-${method.id}`}
                key={method.id}
              >
                <input
                  checked={checked}
                  className="sr-only"
                  id={`mobile-payment-${method.id}`}
                  name="mobile-payment-method"
                  onChange={() => {
                    setPaymentMethodId(method.id);
                    setErrors((current) => {
                      const next = { ...current };
                      delete next.blikCode;
                      return next;
                    });
                  }}
                  type="radio"
                />
                <PaymentIcon size={19} weight={checked ? "fill" : "regular"} />
                <span className="min-w-0 text-[11px] font-bold leading-tight">{mobileName}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {paymentMethodId === "blik" ? (
        <div className="border border-browin-dark/10 bg-browin-white p-3">
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
        </div>
      ) : paymentMethodId === "card" ? (
        <div className="border border-browin-dark/10 bg-browin-white p-3">
          <p className="text-[12px] font-bold text-browin-dark">
            Karta przez iframe operatora
          </p>
          <p className="mt-1 text-[11px] leading-snug text-browin-dark/58">
            Integracja tokenizacji. Pełne dane karty nie trafiają do aplikacji.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 border border-browin-dark/10 bg-browin-white p-3 text-center">
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

      <div className="grid gap-2">
        <label
          className={classNames(
            "grid min-h-12 cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border bg-browin-white p-3 text-[12px] font-semibold leading-snug",
            errors.termsAccepted ? "border-browin-red bg-browin-red/5" : "border-browin-dark/10",
          )}
          htmlFor="mobile-terms"
        >
          <input
            aria-describedby={errors.termsAccepted ? "mobile-error-toast-message" : undefined}
            aria-invalid={Boolean(errors.termsAccepted)}
            checked={form.termsAccepted}
            className="peer sr-only"
            id="mobile-terms"
            onChange={(event) => updateFormField("termsAccepted", event.target.checked)}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-5 w-5 items-center justify-center border border-browin-dark/28 bg-browin-white text-browin-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-browin-red peer-checked:border-browin-red peer-checked:bg-browin-red"
          >
            {form.termsAccepted ? <Check size={14} weight="bold" /> : null}
          </span>
          <span>Akceptuję regulamin i politykę prywatności.</span>
        </label>
        <label className="grid min-h-12 cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border border-browin-dark/10 bg-browin-white p-3 text-[12px] font-semibold leading-snug" htmlFor="mobile-marketing">
          <input
            checked={form.marketingAccepted}
            className="peer sr-only"
            id="mobile-marketing"
            onChange={(event) => updateFormField("marketingAccepted", event.target.checked)}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-5 w-5 items-center justify-center border border-browin-dark/28 bg-browin-white text-browin-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-browin-red peer-checked:border-browin-red peer-checked:bg-browin-red"
          >
            {form.marketingAccepted ? <Check size={14} weight="bold" /> : null}
          </span>
          <span>Inspiracje i promocje BROWIN po zakupie. Opcjonalnie.</span>
        </label>
      </div>
    </div>
  );

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

  const renderMobileErrorToast = () => {
    if (!mobileErrorMessage || currentStep === "success") {
      return null;
    }

    return (
      <div
        aria-live="assertive"
        className="fixed inset-x-3 bottom-[5.25rem] z-[60] border border-browin-red bg-browin-white p-3 text-browin-dark"
        role="alert"
      >
        <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-browin-red text-browin-white">
            <WarningCircle size={17} weight="fill" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-browin-red">
              {mobileErrorTitle}
            </span>
            <span
              className="mt-0.5 block text-[12px] font-bold leading-snug text-browin-dark"
              id="mobile-error-toast-message"
            >
              {mobileErrorMessage}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const renderMobileCheckout = () => (
    <section className="min-h-[calc(100dvh-3.625rem)] bg-browin-gray pb-24">
      {renderMobileProgress()}
      <div className="px-3 py-3">
        {currentStep === "cart" ? renderMobileCart() : null}
        {currentStep === "delivery" ? renderMobileDelivery() : null}
        {currentStep === "payment" ? renderMobilePayment() : null}
      </div>

      {currentStep === "success" ? renderMobileSuccess() : null}
      {renderMobileErrorToast()}

      {currentStep !== "success" && items.length ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-browin-dark/10 bg-browin-white p-3">
          <div
            className={classNames(
              "grid items-center gap-3",
              currentStep === "cart" ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr_auto_auto]",
            )}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-dark/48">
                Do zapłaty
              </p>
              <p className="text-xl font-bold tracking-tight text-browin-dark">
                {formatCurrency(total)}
              </p>
            </div>
            {currentStep !== "cart" ? (
              <button
                aria-label="Wróć do poprzedniego etapu"
                className="flex h-12 w-12 items-center justify-center border border-browin-dark/12 bg-browin-white text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-browin-red"
                disabled={isSubmitting}
                onClick={handleMobileBackAction}
                type="button"
              >
                <ArrowLeft size={20} weight="bold" />
              </button>
            ) : null}
            <button
              className="checkout-cta inline-flex min-h-12 min-w-[9.5rem] items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.13em] text-browin-white shadow-sharp transition-colors disabled:cursor-not-allowed disabled:bg-browin-dark/35"
              disabled={isSubmitting}
              onClick={handleMobilePrimaryAction}
              type="button"
            >
              {isSubmitting ? <SpinnerGap className="animate-spin" size={16} /> : null}
              {getMobilePrimaryLabel()}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );

  return (
    <>
    <div className="md:hidden">{renderMobileCheckout()}</div>
    <section className="hidden bg-browin-gray py-10 md:block md:py-14">
      <div className="container mx-auto px-4">
        {renderProgress()}

        <div className="checkout-grid grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          <div className="min-w-0">
            {currentStep === "cart" ? renderCartStep() : null}
            {currentStep === "delivery" ? renderDeliveryStep() : null}
            {currentStep === "payment" ? renderPaymentStep() : null}
            {currentStep === "success" ? renderSuccessStep() : null}
          </div>

          <aside className="checkout-sidebar hidden h-max border border-browin-dark/10 bg-browin-white p-5 shadow-sm lg:sticky lg:top-28 lg:block">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-browin-red">
                Zamówienie
              </p>
              <h2 className="mt-2 text-2xl font-bold uppercase tracking-tight text-browin-dark">
                Podsumowanie
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-browin-dark/62">
                {count > 0 || order
                  ? "Cena produktów, rabat, dostawa i suma brutto są liczone na bieżąco."
                  : "Dodaj produkty, aby uruchomić pełny checkout."}
              </p>
            </div>

            <OrderSummary
              deliveryCost={summaryDeliveryCost}
              deliveryMethodId={summaryDeliveryMethodId}
              discount={summaryDiscount}
              discountedSubtotal={summaryDiscountedSubtotal}
              items={summaryItems}
              subtotal={summarySubtotal}
              total={summaryTotal}
            />

            <div className="mt-6 grid gap-3 border-t border-browin-dark/10 pt-5">
              <div className="flex items-start gap-3 text-sm leading-relaxed text-browin-dark/68">
                <LockKey className="mt-0.5 shrink-0 text-browin-red" size={18} />
                <span>Zamówienie demo nie wysyła danych płatniczych poza frontend.</span>
              </div>
              <div className="flex items-start gap-3 text-sm leading-relaxed text-browin-dark/68">
                <CheckCircle className="mt-0.5 shrink-0 text-browin-red" size={18} weight="fill" />
                <span>Zakupy bez konta. Konto możesz założyć dopiero po zakupie.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  );
}
