"use client";

import {
  Cheese,
  Fire,
  Flask,
  Printer,
  ShoppingCart,
  WarningCircle,
  Wine,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import type { Product } from "@/data/products";
import {
  calculateCheese,
  calculateMeat,
  calculateTincture,
  calculateWine,
  calculatorDefinitions,
  resolveCalculatorProducts,
  toCalculatorCartLines,
  type CalculatorId,
  type CheeseInput,
  type MeatInput,
  type ResolvedCalculatorProduct,
  type TinctureInput,
  type WineInput,
} from "@/lib/calculators";
import {
  cheeseRecipes,
  curingMethodLabels,
  curingProductLabels,
  defaultInputs,
  furtherProcessingLabels,
  meatMethodLabels,
  meatProfiles,
  milkTypeLabels,
  rennetTypeLabels,
  tinctureFruitProfiles,
  wineFruitProfiles,
  wineKindLabels,
  wineStrengthProfiles,
  woodChipLabels,
} from "@/lib/calculators/data";
import { formatCurrency, getPrimaryVariant } from "@/lib/catalog";

type CalculatorHubProps = {
  initialCalculatorId: CalculatorId;
  products: Product[];
};

const calculatorIconMap = {
  wine: Wine,
  tincture: Flask,
  cheese: Cheese,
  meat: Fire,
} satisfies Record<CalculatorId, typeof Wine>;

const fruitOptions = Object.values(wineFruitProfiles);
const tinctureFruitOptions = Object.values(tinctureFruitProfiles);
const cheeseOptions = Object.values(cheeseRecipes);
const meatOptions = Object.values(meatProfiles);

const numberInputClass =
  "h-11 w-full border border-browin-dark/12 bg-browin-white px-3 text-sm font-semibold text-browin-dark outline-none transition-colors focus:border-browin-red";

const toNumericValue = (value: string, fallback: number) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const hamCookerSizeOptions = [0.8, 1.5, 3];

const getAvailableWineKinds = (fruitId: WineInput["fruitId"]) =>
  Object.entries(wineKindLabels)
    .filter(([wineKind]) =>
      Object.values(
        wineFruitProfiles[fruitId].yeasts[wineKind as WineInput["wineKind"]] ?? {},
      ).some(Boolean),
    )
    .map(([wineKind]) => wineKind as WineInput["wineKind"]);

const getAvailableWineStrengths = (
  fruitId: WineInput["fruitId"],
  wineKind: WineInput["wineKind"],
) =>
  Object.keys(wineFruitProfiles[fruitId].yeasts[wineKind] ?? {}) as WineInput["strength"][];

const normalizeWineSelection = (
  fruitId: WineInput["fruitId"],
  wineKind: WineInput["wineKind"],
  strength: WineInput["strength"],
) => {
  const availableKinds = getAvailableWineKinds(fruitId);
  const nextWineKind = availableKinds.includes(wineKind)
    ? wineKind
    : (availableKinds[0] ?? "semi-sweet");
  const availableStrengths = getAvailableWineStrengths(fruitId, nextWineKind);
  const nextStrength = availableStrengths.includes(strength)
    ? strength
    : (availableStrengths[0] ?? "medium");

  return {
    strength: nextStrength,
    wineKind: nextWineKind,
  };
};

export function CalculatorHub({ initialCalculatorId, products }: CalculatorHubProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addItems } = useCart();
  const [activeCalculatorId, setActiveCalculatorId] =
    useState<CalculatorId>(initialCalculatorId);
  const [inputs, setInputs] = useState(defaultInputs);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});

  const result = useMemo(() => {
    switch (activeCalculatorId) {
      case "tincture":
        return calculateTincture(inputs.tincture);
      case "cheese":
        return calculateCheese(inputs.cheese);
      case "meat":
        return calculateMeat(inputs.meat);
      case "wine":
      default:
        return calculateWine(inputs.wine);
    }
  }, [activeCalculatorId, inputs]);

  const resolvedProducts = useMemo(
    () => resolveCalculatorProducts(products, result.productRefs),
    [products, result.productRefs],
  );
  const selectedProductIds = useMemo(
    () =>
      new Set(
        resolvedProducts
          .filter((entry) => selectedProducts[entry.product.id] ?? !entry.ref.optional)
          .map((entry) => entry.product.id),
      ),
    [resolvedProducts, selectedProducts],
  );
  const cartLines = useMemo(
    () => toCalculatorCartLines(resolvedProducts, selectedProductIds, productQuantities),
    [productQuantities, resolvedProducts, selectedProductIds],
  );
  const selectedProductCount = cartLines.reduce(
    (sum, line) => sum + Math.max(1, line.quantity ?? 1),
    0,
  );

  const updateCalculator = (id: CalculatorId) => {
    setActiveCalculatorId(id);

    const params = new URLSearchParams(window.location.search);
    params.set("calculator", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const addSelectedProducts = () => {
    addItems(cartLines);
  };

  return (
    <main className="calculator-print-area bg-browin-gray pb-[calc(var(--mobile-bottom-nav-height)+2rem)] md:pb-16">
      <section className="border-b border-browin-dark/8 bg-browin-white">
        <div className="container mx-auto px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {calculatorDefinitions.map((definition) => {
              const Icon = calculatorIconMap[definition.id];
              const isActive = activeCalculatorId === definition.id;

              return (
                <button
                  aria-pressed={isActive}
                  className={`group flex min-h-[5.25rem] items-center gap-3 border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-browin-red bg-browin-red text-browin-white"
                      : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red"
                  }`}
                  key={definition.id}
                  onClick={() => updateCalculator(definition.id)}
                  type="button"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center border ${
                      isActive
                        ? "border-browin-white/35 bg-browin-white/12"
                        : "border-browin-red/18 bg-browin-red/5 text-browin-red"
                    }`}
                  >
                    <Icon size={22} weight={isActive ? "fill" : "regular"} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                        isActive ? "text-browin-white/72" : "text-browin-red"
                      }`}
                    >
                      {definition.eyebrow}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-tight md:text-base">
                      {definition.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.94fr)_minmax(24rem,0.56fr)] lg:items-start">
          <section className="border border-browin-dark/10 bg-browin-white">
            <div className="border-b border-browin-dark/8 p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-browin-red">
                Parametry
              </p>
            </div>

            <div className="p-4 md:p-5">
              {activeCalculatorId === "wine" ? (
                <WineForm
                  input={inputs.wine}
                  onChange={(patch) =>
                    setInputs((current) => ({
                      ...current,
                      wine: { ...current.wine, ...patch },
                    }))
                  }
                />
              ) : null}

              {activeCalculatorId === "tincture" ? (
                <TinctureForm
                  input={inputs.tincture}
                  onChange={(patch) =>
                    setInputs((current) => ({
                      ...current,
                      tincture: { ...current.tincture, ...patch },
                    }))
                  }
                />
              ) : null}

              {activeCalculatorId === "cheese" ? (
                <CheeseForm
                  input={inputs.cheese}
                  onChange={(patch) =>
                    setInputs((current) => ({
                      ...current,
                      cheese: { ...current.cheese, ...patch },
                    }))
                  }
                />
              ) : null}

              {activeCalculatorId === "meat" ? (
                <MeatForm
                  input={inputs.meat}
                  onChange={(patch) =>
                    setInputs((current) => ({
                      ...current,
                      meat: { ...current.meat, ...patch },
                    }))
                  }
                />
              ) : null}
            </div>
          </section>

          <aside className="calculator-result-panel border border-browin-dark/10 bg-browin-white">
            <div className="border-b border-browin-dark/8 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-browin-red">
                    Wynik
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-browin-dark">
                    Receptura
                  </h2>
                </div>
                <button
                  className="calculator-no-print inline-flex h-10 w-10 items-center justify-center text-browin-dark/55 transition-colors hover:text-browin-red"
                  onClick={() => window.print()}
                  title="Drukuj recepturę"
                  type="button"
                >
                  <Printer size={20} />
                </button>
              </div>
            </div>

            <div>
              <ResultBlock title={result.title}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.summary.map((item) => (
                    <div className="border border-browin-dark/8 p-3" key={item.label}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-browin-dark/42">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-browin-dark">{item.value}</p>
                    </div>
                  ))}
                </div>
              </ResultBlock>

              <ResultBlock title="Wyliczone składniki">
                <div className="space-y-2">
                  {result.ingredients.map((ingredient) => (
                    <div
                      className="flex items-start justify-between gap-3 border-b border-browin-dark/8 pb-2 last:border-0 last:pb-0"
                      key={`${ingredient.label}-${ingredient.value}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-browin-dark">
                          {ingredient.label}
                        </p>
                        {ingredient.detail ? (
                          <p className="mt-0.5 text-xs leading-relaxed text-browin-dark/55">
                            {ingredient.detail}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-bold text-browin-red">
                        {ingredient.value}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultBlock>

              <ResultBlock title="Receptura krok po kroku">
                <ol className="space-y-3">
                  {result.steps.map((step, index) => (
                    <li className="flex gap-3" key={step}>
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-browin-red text-[11px] font-bold text-browin-white">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-browin-dark/72">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </ResultBlock>

              {result.warnings.length > 0 ? (
                <ResultBlock title="Uwagi">
                  <div className="space-y-2">
                    {result.warnings.map((warning) => (
                      <div
                        className="flex gap-2 border border-browin-red/20 bg-browin-red/5 p-3 text-sm leading-relaxed text-browin-dark/72"
                        key={warning}
                      >
                        <WarningCircle className="mt-0.5 shrink-0 text-browin-red" size={18} />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </ResultBlock>
              ) : null}

            </div>
          </aside>
        </div>

        <CalculatorProducts
          cartLinesLength={cartLines.length}
          onAddSelectedProducts={addSelectedProducts}
          onQuantityChange={(productId, quantity) =>
            setProductQuantities((current) => ({
              ...current,
              [productId]: quantity,
            }))
          }
          onSelectionChange={(productId, selected) =>
            setSelectedProducts((current) => ({
              ...current,
              [productId]: selected,
            }))
          }
          productQuantities={productQuantities}
          resolvedProducts={resolvedProducts}
          selectedProductCount={selectedProductCount}
          selectedProducts={selectedProducts}
        />
      </section>
    </main>
  );
}

function ResultBlock({
  action,
  children,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border-b border-browin-dark/8 p-4 last:border-0 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.13em] text-browin-dark">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function CalculatorProducts({
  cartLinesLength,
  onAddSelectedProducts,
  onQuantityChange,
  onSelectionChange,
  productQuantities,
  resolvedProducts,
  selectedProductCount,
  selectedProducts,
}: {
  cartLinesLength: number;
  onAddSelectedProducts: () => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onSelectionChange: (productId: string, selected: boolean) => void;
  productQuantities: Record<string, number>;
  resolvedProducts: ResolvedCalculatorProduct[];
  selectedProductCount: number;
  selectedProducts: Record<string, boolean>;
}) {
  return (
    <section className="calculator-no-print mt-5 border border-browin-dark/10 bg-browin-white">
      <div className="flex flex-col gap-3 border-b border-browin-dark/8 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-browin-red">
            Produkty do przepisu
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-browin-dark">
            Potrzebne akcesoria i dodatki
          </h2>
        </div>
        {cartLinesLength > 0 ? (
          <button
            className="inline-flex items-center justify-center gap-2 bg-browin-red px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-dark"
            onClick={onAddSelectedProducts}
            type="button"
          >
            <ShoppingCart size={16} />
            Dodaj zaznaczone ({selectedProductCount})
          </button>
        ) : null}
      </div>

      {resolvedProducts.length > 0 ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:p-5">
          {resolvedProducts.map((entry) => {
            const primaryVariant = getPrimaryVariant(entry.product);
            const isSelected = selectedProducts[entry.product.id] ?? !entry.ref.optional;

            return (
              <div
                className={`grid min-h-[9rem] grid-cols-[4.75rem_minmax(0,1fr)] gap-3 border p-3 transition-colors ${
                  isSelected
                    ? "border-browin-red/45 bg-browin-red/5"
                    : "border-browin-dark/8 bg-browin-white"
                }`}
                key={entry.product.id}
              >
                <Link
                  className="relative h-[4.75rem] w-[4.75rem] overflow-hidden bg-browin-gray"
                  href={`/produkt/${entry.product.slug}`}
                >
                  <Image
                    alt={entry.product.title}
                    className="object-contain p-1.5"
                    fill
                    sizes="76px"
                    src={entry.product.images[0]}
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    className="line-clamp-2 text-sm font-bold leading-snug text-browin-dark transition-colors hover:text-browin-red"
                    href={`/produkt/${entry.product.slug}`}
                  >
                    {entry.product.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-browin-dark/45">
                    <span>{formatCurrency(primaryVariant.price)}</span>
                    <span>{entry.matchType === "legacy" ? "dopasowany" : "zamiennik"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-browin-dark/60">
                      <input
                        checked={isSelected}
                        className="h-4 w-4 accent-browin-red"
                        onChange={(event) =>
                          onSelectionChange(entry.product.id, event.target.checked)
                        }
                        type="checkbox"
                      />
                      wybierz
                    </label>
                    <input
                      className="h-8 w-16 border border-browin-dark/12 bg-browin-white px-2 text-sm font-bold text-browin-dark outline-none focus:border-browin-red"
                      min={1}
                      onChange={(event) =>
                        onQuantityChange(
                          entry.product.id,
                          Math.max(
                            1,
                            Math.floor(
                              toNumericValue(
                                event.target.value,
                                productQuantities[entry.product.id] ?? entry.ref.quantity,
                              ),
                            ),
                          ),
                        )
                      }
                      type="number"
                      value={productQuantities[entry.product.id] ?? entry.ref.quantity}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="p-4 text-sm leading-relaxed text-browin-dark/62 md:p-5">
          Dla tej konfiguracji nie znaleziono produktów w aktualnym feedzie.
        </p>
      )}
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-browin-dark/52">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-11 flex-1 border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-browin-red bg-browin-red text-browin-white"
          : "border-browin-dark/10 bg-browin-white text-browin-dark/68 hover:border-browin-red hover:text-browin-red"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ChoiceGrid<T extends string | number>({
  columns = "sm:grid-cols-2",
  onChange,
  options,
  value,
}: {
  columns?: string;
  onChange: (value: T) => void;
  options: Array<{
    disabled?: boolean;
    helper?: string;
    label: string;
    value: T;
  }>;
  value: T;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={`min-h-11 border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              isActive
                ? "border-browin-red bg-browin-red text-browin-white"
                : "border-browin-dark/10 bg-browin-white text-browin-dark hover:border-browin-red hover:text-browin-red"
            }`}
            disabled={option.disabled}
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <span className="block text-sm font-bold leading-tight">{option.label}</span>
            {option.helper ? (
              <span
                className={`mt-1 block text-xs leading-snug ${
                  isActive ? "text-browin-white/72" : "text-browin-dark/50"
                }`}
              >
                {option.helper}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  max,
  min,
  onChange,
  step = 0.1,
  value,
}: {
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  const normalizeValue = (nextValue: number) => {
    const minValue = min ?? Number.NEGATIVE_INFINITY;
    const maxValue = max ?? Number.POSITIVE_INFINITY;

    return Math.min(Math.max(nextValue, minValue), maxValue);
  };

  return (
    <input
      className={numberInputClass}
      max={max}
      min={min}
      onChange={(event) =>
        onChange(normalizeValue(toNumericValue(event.target.value, value)))
      }
      step={step}
      type="number"
      value={value}
    />
  );
}

function WineForm({
  input,
  onChange,
}: {
  input: WineInput;
  onChange: (patch: Partial<WineInput>) => void;
}) {
  const availableWineKinds = getAvailableWineKinds(input.fruitId);
  const availableWineStrengths = getAvailableWineStrengths(input.fruitId, input.wineKind);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <SegmentButton
          active={input.mode === "target-volume"}
          onClick={() => onChange({ mode: "target-volume" })}
        >
          Mam cel w litrach
        </SegmentButton>
        <SegmentButton
          active={input.mode === "fruit-weight"}
          onClick={() => onChange({ mode: "fruit-weight" })}
        >
          Mam owoce
        </SegmentButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Owoce">
          <ChoiceGrid
            columns="sm:grid-cols-2"
            onChange={(fruitId) =>
              onChange({
                fruitId,
                ...normalizeWineSelection(fruitId, input.wineKind, input.strength),
              })
            }
            options={fruitOptions.map((fruit) => ({
              label: fruit.label,
              value: fruit.id,
            }))}
            value={input.fruitId}
          />
        </Field>
        <Field label={input.mode === "target-volume" ? "Ile wina chcesz uzyskać" : "Ile masz owoców"}>
          <NumberInput
            max={input.mode === "target-volume" ? 100 : 150}
            min={input.mode === "target-volume" ? 4 : 1}
            onChange={(value) =>
              onChange(
                input.mode === "target-volume"
                  ? { targetLiters: value }
                  : { fruitKg: value },
              )
            }
            value={input.mode === "target-volume" ? input.targetLiters : input.fruitKg}
          />
        </Field>
        <Field label="Rodzaj wina">
          <ChoiceGrid
            columns="grid-cols-2 sm:grid-cols-4"
            onChange={(wineKind) =>
              onChange({
                ...normalizeWineSelection(input.fruitId, wineKind, input.strength),
              })
            }
            options={availableWineKinds.map((wineKind) => ({
              label: wineKindLabels[wineKind],
              value: wineKind,
            }))}
            value={input.wineKind}
          />
        </Field>
        <Field label="Moc wina">
          <ChoiceGrid
            columns="sm:grid-cols-3"
            onChange={(strength) => onChange({ strength })}
            options={availableWineStrengths.map((strength) => ({
              helper: wineStrengthProfiles[strength].additionalLabel,
              label: wineStrengthProfiles[strength].label,
              value: strength,
            }))}
            value={input.strength}
          />
        </Field>
      </div>
    </div>
  );
}

function TinctureForm({
  input,
  onChange,
}: {
  input: TinctureInput;
  onChange: (patch: Partial<TinctureInput>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-2 md:grid-cols-3">
        <SegmentButton active={input.mode === "recipe"} onClick={() => onChange({ mode: "recipe" })}>
          Przepis
        </SegmentButton>
        <SegmentButton active={input.mode === "abv"} onClick={() => onChange({ mode: "abv" })}>
          Moc nalewki
        </SegmentButton>
        <SegmentButton
          active={input.mode === "dilution"}
          onClick={() => onChange({ mode: "dilution" })}
        >
          Rozcieńczanie
        </SegmentButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {input.mode !== "dilution" ? (
          <Field label="Owoce">
            <ChoiceGrid
              columns="sm:grid-cols-2"
              onChange={(fruitId) => onChange({ fruitId })}
              options={tinctureFruitOptions.map((fruit) => ({
                helper: fruit.note,
                label: fruit.label,
                value: fruit.id,
              }))}
              value={input.fruitId}
            />
          </Field>
        ) : null}

        {input.mode === "recipe" ? (
          <>
            <Field label="Waga owoców">
              <NumberInput
                max={50}
                min={0.2}
                onChange={(value) => onChange({ fruitKg: value })}
                value={input.fruitKg}
              />
            </Field>
            <Field label="Moc alkoholu do zalania">
              <NumberInput
                max={95}
                min={70}
                onChange={(value) => onChange({ spiritStrength: value })}
                step={0.1}
                value={input.spiritStrength}
              />
            </Field>
            <Field label="Cukier">
              <NumberInput
                max={20000}
                min={0}
                onChange={(value) => onChange({ sugarG: value })}
                step={10}
                value={input.sugarG}
              />
            </Field>
          </>
        ) : null}

        {input.mode === "abv" ? (
          <>
            <Field label="Ilość alkoholu">
              <NumberInput
                max={50}
                min={0}
                onChange={(value) => onChange({ alcoholLiters: value })}
                value={input.alcoholLiters}
              />
            </Field>
            <Field label="Moc alkoholu">
              <NumberInput
                max={95}
                min={10}
                onChange={(value) => onChange({ spiritStrength: value })}
                step={0.1}
                value={input.spiritStrength}
              />
            </Field>
            <Field label="Drugi alkohol">
              <NumberInput
                max={50}
                min={0}
                onChange={(value) => onChange({ secondAlcoholLiters: value })}
                value={input.secondAlcoholLiters}
              />
            </Field>
            <Field label="Moc drugiego alkoholu">
              <NumberInput
                max={70}
                min={0}
                onChange={(value) => onChange({ secondAlcoholStrength: value })}
                step={0.1}
                value={input.secondAlcoholStrength}
              />
            </Field>
            <Field label="Sok z owoców">
              <NumberInput
                max={50}
                min={0}
                onChange={(value) => onChange({ juiceLiters: value })}
                value={input.juiceLiters}
              />
            </Field>
            <Field label="Woda">
              <NumberInput
                max={50}
                min={0}
                onChange={(value) => onChange({ waterLiters: value })}
                value={input.waterLiters}
              />
            </Field>
            <Field label="Cukier">
              <NumberInput
                max={20000}
                min={0}
                onChange={(value) => onChange({ sugarG: value })}
                step={10}
                value={input.sugarG}
              />
            </Field>
          </>
        ) : null}

        {input.mode === "dilution" ? (
          <>
            <Field label="Ilość docelowa">
              <NumberInput
                max={50}
                min={0.2}
                onChange={(value) => onChange({ targetLiters: value })}
                value={input.targetLiters}
              />
            </Field>
            <Field label="Moc docelowa">
              <NumberInput
                max={70}
                min={10}
                onChange={(value) => onChange({ targetStrength: value })}
                step={0.1}
                value={input.targetStrength}
              />
            </Field>
            <Field label="Moc spirytusu">
              <NumberInput
                max={95}
                min={70}
                onChange={(value) => onChange({ spiritStrength: value })}
                step={0.1}
                value={input.spiritStrength}
              />
            </Field>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CheeseForm({
  input,
  onChange,
}: {
  input: CheeseInput;
  onChange: (patch: Partial<CheeseInput>) => void;
}) {
  const recipe = cheeseRecipes[input.cheeseId];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Rodzaj sera">
        <ChoiceGrid
          columns="sm:grid-cols-2"
          onChange={(cheeseId) => onChange({ cheeseId })}
          options={cheeseOptions.map((recipe) => ({
            helper: recipe.sourceLabel,
            label: recipe.label,
            value: recipe.id,
          }))}
          value={input.cheeseId}
        />
      </Field>
      <Field label={recipe.sourceLabel === "serwatka" ? "Ilość serwatki" : "Ilość mleka"}>
        <NumberInput
          max={1500}
          min={1}
          onChange={(value) => onChange({ milkLiters: value })}
          value={input.milkLiters}
        />
      </Field>
      <Field label="Rodzaj mleka">
        <ChoiceGrid
          columns="sm:grid-cols-2"
          onChange={(milkType) => onChange({ milkType })}
          options={Object.entries(milkTypeLabels).map(([value, label]) => ({
            disabled:
              recipe.sourceLabel === "serwatka" ? value !== "whey" : value === "whey",
            label,
            value: value as CheeseInput["milkType"],
          }))}
          value={recipe.sourceLabel === "serwatka" ? "whey" : input.milkType}
        />
      </Field>
      {recipe.rennetMlPer10L > 0 ? (
        <Field label="Rodzaj podpuszczki">
          <ChoiceGrid
            columns="sm:grid-cols-2"
            onChange={(rennetType) => onChange({ rennetType })}
            options={Object.entries(rennetTypeLabels).map(([value, label]) => ({
              label,
              value: value as CheeseInput["rennetType"],
            }))}
            value={input.rennetType}
          />
        </Field>
      ) : null}
    </div>
  );
}

function MeatForm({
  input,
  onChange,
}: {
  input: MeatInput;
  onChange: (patch: Partial<MeatInput>) => void;
}) {
  const isSmoking =
    input.furtherProcessing === "warm-smoking" ||
    input.furtherProcessing === "smoker-roasting" ||
    input.method === "smoker-roasting";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Metoda obróbki">
        <ChoiceGrid
          columns="sm:grid-cols-3"
          onChange={(method) => onChange({ method })}
          options={Object.entries(meatMethodLabels).map(([value, label]) => ({
            label,
            value: value as MeatInput["method"],
          }))}
          value={input.method}
        />
      </Field>
      <Field label="Metoda peklowania">
        <ChoiceGrid
          columns="sm:grid-cols-2"
          onChange={(curingMethod) => onChange({ curingMethod })}
          options={Object.entries(curingMethodLabels).map(([value, label]) => ({
            label,
            value: value as MeatInput["curingMethod"],
          }))}
          value={input.curingMethod}
        />
      </Field>
      <Field label="Rodzaj mięsa">
        <ChoiceGrid
          columns="sm:grid-cols-2"
          onChange={(meatKind) => onChange({ meatKind })}
          options={meatOptions.map((profile) => ({
            label: profile.label,
            value: profile.id,
          }))}
          value={input.meatKind}
        />
      </Field>
      <Field label="Masa mięsa">
        <NumberInput
          max={50}
          min={1}
          onChange={(value) => onChange({ meatKg: value })}
          value={input.meatKg}
        />
      </Field>
      <Field label="Masa pojedynczych kawałków">
        <NumberInput
          max={1500}
          min={100}
          onChange={(value) => onChange({ pieceWeightG: value })}
          step={50}
          value={input.pieceWeightG}
        />
      </Field>
      <Field label="Grubość mięsa">
        <NumberInput
          max={20}
          min={1}
          onChange={(value) => onChange({ meatThicknessCm: value })}
          value={input.meatThicknessCm}
        />
      </Field>
      <Field label="Czym peklujesz">
        <ChoiceGrid
          columns="sm:grid-cols-2"
          onChange={(curingProduct) => onChange({ curingProduct })}
          options={Object.entries(curingProductLabels).map(([value, label]) => ({
            label,
            value: value as MeatInput["curingProduct"],
          }))}
          value={input.curingProduct}
        />
      </Field>
      {input.method === "ham-cooker" ? (
        <Field label="Rozmiar szynkowaru">
          <ChoiceGrid
            columns="grid-cols-3"
            onChange={(hamCookerSizeKg) => onChange({ hamCookerSizeKg })}
            options={hamCookerSizeOptions.map((size) => ({
              label: `${size} kg`,
              value: size,
            }))}
            value={input.hamCookerSizeKg}
          />
        </Field>
      ) : null}
      <Field label="Dalsza obróbka">
        <ChoiceGrid
          columns="sm:grid-cols-3"
          onChange={(furtherProcessing) => onChange({ furtherProcessing })}
          options={Object.entries(furtherProcessingLabels).map(([value, label]) => ({
            label,
            value: value as MeatInput["furtherProcessing"],
          }))}
          value={input.furtherProcessing}
        />
      </Field>
      {input.curingMethod === "wet" ? (
        <Field label="Dodatkowa zalewa">
          <NumberInput
            max={20}
            min={0}
            onChange={(value) => onChange({ extraBrineLiters: value })}
            value={input.extraBrineLiters}
          />
        </Field>
      ) : null}
      {isSmoking ? (
        <Field label="Rodzaj zrębków">
          <ChoiceGrid
            columns="grid-cols-4"
            onChange={(woodChip) => onChange({ woodChip })}
            options={Object.entries(woodChipLabels).map(([value, label]) => ({
              label,
              value: value as MeatInput["woodChip"],
            }))}
            value={input.woodChip}
          />
        </Field>
      ) : null}
    </div>
  );
}
