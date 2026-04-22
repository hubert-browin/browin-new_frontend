"use client";

import {
  ArrowRight,
  BookOpen,
  List,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/data/products";
import type { RecipeSummary } from "@/data/recipes";

type RecipeBridgeMode =
  | "spotlight"
  | "journey"
  | "rail"
  | "island"
  | "panel"
  | "popup";

type ProductRecipeBridgeProps = {
  placement?: "desktop" | "mobile";
  product: Product;
  recipes: RecipeSummary[];
};

type RecipeBridgeModeConfig = {
  key: RecipeBridgeMode;
  label: string;
  shortLabel: string;
  description: string;
};

const STORAGE_KEY = "browin.productRecipeBridgeMode";

const recipeBridgeModes: RecipeBridgeModeConfig[] = [
  {
    key: "spotlight",
    label: "Spotlight",
    shortLabel: "Focus",
    description: "Najmocniejszy przepis wpleciony bezpośrednio w buybox.",
  },
  {
    key: "journey",
    label: "Mapa",
    shortLabel: "Mapa",
    description: "Ścieżka produkt -> przepis -> koszyk.",
  },
  {
    key: "rail",
    label: "Pasek",
    shortLabel: "Pasek",
    description: "Poziomy pasek szybkich inspiracji pod zakupem.",
  },
  {
    key: "island",
    label: "Wyspa",
    shortLabel: "Wyspa",
    description: "Latająca wyspa z szybkim przejściem do przepisu.",
  },
  {
    key: "panel",
    label: "Panel",
    shortLabel: "Panel",
    description: "Stały boczny panel inspiracji dla desktopu.",
  },
  {
    key: "popup",
    label: "Popup",
    shortLabel: "Popup",
    description: "Modal z przepisami otwierany wtedy, gdy klient chce kontekstu.",
  },
];

const recipePluralRules = new Intl.PluralRules("pl-PL");

const isRecipeBridgeMode = (value: string | null): value is RecipeBridgeMode =>
  Boolean(value && recipeBridgeModes.some((mode) => mode.key === value));

const getRecipeCountLabel = (count: number) => {
  const suffixByPlural = {
    few: "przepisy",
    many: "przepisów",
    one: "przepis",
    other: "przepisów",
    two: "przepisy",
    zero: "przepisów",
  } satisfies Record<Intl.LDMLPluralRule, string>;

  return `${count} ${suffixByPlural[recipePluralRules.select(count)]}`;
};

const getProductSearchHref = (product: Product) =>
  `/szukaj?search=${encodeURIComponent(product.title)}`;

function RecipeBridgeModeSwitch({
  currentMode,
  onSelect,
  variant = "inline",
}: {
  currentMode: RecipeBridgeMode;
  onSelect: (mode: RecipeBridgeMode) => void;
  variant?: "floating" | "inline";
}) {
  const activeConfig = recipeBridgeModes.find((mode) => mode.key === currentMode);

  return (
    <div
      className={
        variant === "floating"
          ? "fixed bottom-20 right-4 z-[120] hidden w-[18rem] border border-browin-dark/10 bg-browin-white/92 p-2 shadow-2xl backdrop-blur-md md:block"
          : "border border-browin-dark/10 bg-browin-white p-2"
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-red">
            Produkt x przepisy
          </p>
          {variant === "floating" ? (
            <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-browin-dark/58">
              {activeConfig?.description}
            </p>
          ) : null}
        </div>
        <BookOpen className="shrink-0 text-browin-red" size={18} weight="fill" />
      </div>

      <div className="grid grid-cols-3 gap-1">
        {recipeBridgeModes.map((mode) => {
          const isActive = currentMode === mode.key;

          return (
            <button
              aria-pressed={isActive}
              className={`min-h-9 px-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${
                isActive
                  ? "bg-browin-red text-browin-white"
                  : "bg-browin-dark/5 text-browin-dark/68 hover:bg-browin-dark hover:text-browin-white"
              }`}
              key={mode.key}
              onClick={() => onSelect(mode.key)}
              type="button"
            >
              {variant === "floating" ? mode.shortLabel : mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecipeBridgeHeader({
  product,
  recipes,
}: {
  product: Product;
  recipes: RecipeSummary[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-browin-red">
          Co z tym zrobisz?
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-browin-dark">
          {getRecipeCountLabel(recipes.length)} z tym produktem
        </h2>
      </div>
      <Link
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-browin-red transition-colors hover:text-browin-dark"
        href={getProductSearchHref(product)}
      >
        Wszystkie inspiracje
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function MiniRecipeLink({
  recipe,
  variant = "row",
}: {
  recipe: RecipeSummary;
  variant?: "card" | "row";
}) {
  if (variant === "card") {
    return (
      <Link
        className="group block min-w-[13.5rem] border border-browin-dark/10 bg-browin-white transition-colors hover:border-browin-red"
        href={`/przepisnik/przepis/${recipe.slug}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-browin-dark">
          <Image
            alt={recipe.title}
            className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
            fill
            sizes="220px"
            src={recipe.heroImage}
          />
          <span className="absolute left-0 top-0 bg-browin-red px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-browin-white">
            {recipe.category.name}
          </span>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-bold leading-snug text-browin-dark transition-colors group-hover:text-browin-red">
            {recipe.title}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className="group grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-3 border border-browin-dark/10 bg-browin-white p-2 transition-colors hover:border-browin-red"
      href={`/przepisnik/przepis/${recipe.slug}`}
    >
      <div className="relative aspect-square overflow-hidden bg-browin-dark">
        <Image
          alt={recipe.title}
          className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.05]"
          fill
          sizes="72px"
          src={recipe.heroImage}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-browin-red">
          {recipe.category.name}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-browin-dark transition-colors group-hover:text-browin-red">
          {recipe.title}
        </p>
      </div>
      <ArrowRight
        className="shrink-0 text-browin-dark/35 transition-colors group-hover:text-browin-red"
        size={16}
      />
    </Link>
  );
}

function RecipeSpotlight({
  leadRecipe,
  product,
  recipes,
}: {
  leadRecipe: RecipeSummary;
  product: Product;
  recipes: RecipeSummary[];
}) {
  return (
    <section className="overflow-hidden border border-browin-dark/10 bg-browin-dark text-browin-white">
      <div className="grid md:grid-cols-[9rem_minmax(0,1fr)]">
        <Link
          className="relative block min-h-[9rem] overflow-hidden bg-browin-dark"
          href={`/przepisnik/przepis/${leadRecipe.slug}`}
        >
          <Image
            alt={leadRecipe.title}
            className="object-cover opacity-90 transition-transform duration-500 hover:scale-[1.04]"
            fill
            sizes="(max-width: 767px) 100vw, 160px"
            src={leadRecipe.heroImage}
          />
        </Link>
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-browin-white/58">
            Najszybsze przejście do inspiracji
          </p>
          <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-browin-white">
            {leadRecipe.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-browin-white/68">
            {leadRecipe.excerpt}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-white hover:text-browin-dark"
              href={`/przepisnik/przepis/${leadRecipe.slug}`}
            >
              Zobacz przepis
              <ArrowRight size={14} />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-browin-white/20 px-4 text-xs font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:border-browin-white hover:bg-browin-white hover:text-browin-dark"
              href={getProductSearchHref(product)}
            >
              {getRecipeCountLabel(recipes.length)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecipeJourney({
  leadRecipe,
  product,
  productImage,
}: {
  leadRecipe: RecipeSummary;
  product: Product;
  productImage: string;
}) {
  return (
    <section className="border border-browin-dark/10 bg-browin-white p-4">
      <div className="grid gap-2 md:grid-cols-3">
        <div className="border border-browin-dark/10 bg-browin-gray p-3">
          <div className="relative mb-3 aspect-[4/3] overflow-hidden bg-browin-white">
            <Image
              alt={product.title}
              className="object-contain p-3"
              fill
              sizes="180px"
              src={productImage}
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            01 Produkt
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-browin-dark">
            {product.title}
          </p>
        </div>
        <Link
          className="group border border-browin-red bg-browin-red p-3 text-browin-white transition-colors hover:bg-browin-dark"
          href={`/przepisnik/przepis/${leadRecipe.slug}`}
        >
          <div className="relative mb-3 aspect-[4/3] overflow-hidden bg-browin-dark">
            <Image
              alt={leadRecipe.title}
              className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.04]"
              fill
              sizes="180px"
              src={leadRecipe.heroImage}
            />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-white/72">
            02 Przepis
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-browin-white">
            {leadRecipe.title}
          </p>
        </Link>
        <div className="border border-browin-dark/10 bg-browin-gray p-3">
          <div className="mb-3 flex aspect-[4/3] items-center justify-center bg-browin-white text-browin-red">
            <BookOpen size={40} weight="fill" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            03 Koszyk
          </p>
          <p className="mt-1 text-sm font-bold text-browin-dark">
            Przejdź do składników i dodaj brakujące produkty jednym kliknięciem.
          </p>
        </div>
      </div>
    </section>
  );
}

function RecipeRail({
  product,
  recipes,
}: {
  product: Product;
  recipes: RecipeSummary[];
}) {
  return (
    <section className="border border-browin-dark/10 bg-browin-gray/70 p-4">
      <RecipeBridgeHeader product={product} recipes={recipes} />
      <div className="no-scrollbar -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1">
        {recipes.map((recipe) => (
          <MiniRecipeLink key={recipe.id} recipe={recipe} variant="card" />
        ))}
      </div>
    </section>
  );
}

function RecipeIsland({
  leadRecipe,
  recipes,
}: {
  leadRecipe: RecipeSummary;
  recipes: RecipeSummary[];
}) {
  const extraRecipes = recipes.slice(1, 4);

  return (
    <>
      <section className="border border-browin-dark/10 bg-browin-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-browin-red/10 text-browin-red">
            <BookOpen size={22} weight="fill" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
              Wyspa inspiracji aktywna
            </p>
            <h3 className="mt-1 text-base font-bold leading-snug text-browin-dark">
              Na desktopie przepis płynie razem z kartą produktu.
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
              W tym widoku klient ma stały skrót do najlepszego przepisu bez
              opuszczania kontekstu zakupowego.
            </p>
          </div>
        </div>
      </section>

      <div className="group/recipe-island fixed bottom-24 left-1/2 z-[115] hidden -translate-x-1/2 lg:block">
        {extraRecipes.length > 0 ? (
          <div className="pointer-events-none absolute bottom-16 left-1/2 w-[28rem] -translate-x-1/2 translate-y-3 border border-browin-dark/10 bg-browin-white/94 p-3 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover/recipe-island:pointer-events-auto group-hover/recipe-island:translate-y-0 group-hover/recipe-island:opacity-100">
            <div className="grid gap-2">
              {extraRecipes.map((recipe) => (
                <MiniRecipeLink key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        ) : null}

        <Link
          className="relative z-10 grid min-w-[23rem] grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 border border-browin-dark/10 bg-browin-dark/92 p-2 text-browin-white shadow-2xl backdrop-blur-md transition-colors hover:bg-browin-red"
          href={`/przepisnik/przepis/${leadRecipe.slug}`}
        >
          <div className="relative aspect-square overflow-hidden bg-browin-dark">
            <Image
              alt={leadRecipe.title}
              className="object-cover"
              fill
              sizes="80px"
              src={leadRecipe.heroImage}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-white/58">
              Latający przepis
            </p>
            <p className="mt-1 line-clamp-1 text-sm font-bold text-browin-white">
              {leadRecipe.title}
            </p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}

function RecipeSidePanel({
  product,
  recipes,
}: {
  product: Product;
  recipes: RecipeSummary[];
}) {
  return (
    <>
      <section className="border border-browin-dark/10 bg-browin-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-browin-red/10 text-browin-red">
            <List size={22} weight="bold" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
              Panel inspiracji
            </p>
            <h3 className="mt-1 text-base font-bold leading-snug text-browin-dark">
              Przepisy są przypięte do prawej strony ekranu.
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
              Na mniejszych ekranach zostaje ta kompaktowa wersja, żeby nie
              przykrywać karty produktu.
            </p>
          </div>
        </div>
      </section>

      <aside className="fixed bottom-8 right-5 top-28 z-[90] hidden w-[22rem] flex-col overflow-hidden border border-browin-dark/10 bg-browin-white shadow-2xl xl:flex">
        <div className="border-b border-browin-dark/10 bg-browin-dark px-4 py-4 text-browin-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-white/58">
            Przepisy do produktu
          </p>
          <h3 className="mt-1 text-lg font-bold leading-tight">{product.title}</h3>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid gap-2">
            {recipes.map((recipe) => (
              <MiniRecipeLink key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
        <Link
          className="flex min-h-12 items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-dark"
          href={getProductSearchHref(product)}
        >
          Zobacz więcej
          <ArrowRight size={14} />
        </Link>
      </aside>
    </>
  );
}

function RecipePopupLauncher({
  onOpen,
  recipes,
}: {
  onOpen: () => void;
  recipes: RecipeSummary[];
}) {
  return (
    <section className="border border-browin-dark/10 bg-browin-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
            Popup inspiracji
          </p>
          <h3 className="mt-1 text-base font-bold leading-snug text-browin-dark">
            {getRecipeCountLabel(recipes.length)} dostępne w jednym oknie.
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-browin-dark/62">
            Dobre, gdy chcemy utrzymać kartę produktu czystą i otwierać przepisy
            dopiero po intencji klienta.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-browin-red px-4 text-xs font-bold uppercase tracking-[0.12em] text-browin-white transition-colors hover:bg-browin-dark"
          onClick={onOpen}
          type="button"
        >
          Otwórz przepisy
          <SquaresFour size={16} weight="fill" />
        </button>
      </div>
    </section>
  );
}

function RecipePopup({
  onClose,
  product,
  recipes,
}: {
  onClose: () => void;
  product: Product;
  recipes: RecipeSummary[];
}) {
  return (
    <div className="fixed inset-0 z-[160] bg-browin-dark/62 px-4 py-6 backdrop-blur-sm md:py-10">
      <div className="mx-auto flex max-h-full w-full max-w-5xl flex-col overflow-hidden border border-browin-dark/10 bg-browin-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-browin-dark/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-browin-red">
              Co z tym zrobisz?
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-browin-dark">
              Przepisy z produktem: {product.title}
            </h2>
          </div>
          <button
            aria-label="Zamknij popup przepisów"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-browin-dark/10 text-browin-dark transition-colors hover:border-browin-red hover:text-browin-red"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <MiniRecipeLink key={recipe.id} recipe={recipe} variant="card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductRecipeBridge({
  placement = "desktop",
  product,
  recipes,
}: ProductRecipeBridgeProps) {
  const [mode, setMode] = useState<RecipeBridgeMode>("spotlight");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const leadRecipe = recipes[0];
  const productImage = product.images[0];

  useEffect(() => {
    let frame = 0;

    try {
      const storedMode = window.localStorage.getItem(STORAGE_KEY);

      if (isRecipeBridgeMode(storedMode)) {
        frame = window.requestAnimationFrame(() => setMode(storedMode));
      }
    } catch {
      // Local storage is an enhancement only.
    }

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPopupOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopupOpen]);

  const modeLabel = useMemo(
    () => recipeBridgeModes.find((entry) => entry.key === mode)?.description ?? "",
    [mode],
  );

  if (!leadRecipe || !productImage) {
    return null;
  }

  const handleModeSelect = (nextMode: RecipeBridgeMode) => {
    setMode(nextMode);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Local storage is an enhancement only.
    }

    if (nextMode === "popup") {
      setIsPopupOpen(true);
    }
  };

  return (
    <div className={placement === "desktop" ? "mt-4" : ""}>
      {placement === "desktop" ? (
        <RecipeBridgeModeSwitch
          currentMode={mode}
          onSelect={handleModeSelect}
          variant="floating"
        />
      ) : null}

      <div className="grid gap-3">
        <div className={placement === "desktop" ? "hidden" : ""}>
          <RecipeBridgeModeSwitch currentMode={mode} onSelect={handleModeSelect} />
        </div>

        <div className="border border-browin-dark/10 bg-browin-white px-3 py-2 text-[11px] font-semibold leading-relaxed text-browin-dark/58">
          {modeLabel}
        </div>

        {mode === "spotlight" ? (
          <RecipeSpotlight
            leadRecipe={leadRecipe}
            product={product}
            recipes={recipes}
          />
        ) : null}

        {mode === "journey" ? (
          <RecipeJourney
            leadRecipe={leadRecipe}
            product={product}
            productImage={productImage}
          />
        ) : null}

        {mode === "rail" ? <RecipeRail product={product} recipes={recipes} /> : null}

        {mode === "island" ? (
          <RecipeIsland leadRecipe={leadRecipe} recipes={recipes} />
        ) : null}

        {mode === "panel" ? (
          <RecipeSidePanel product={product} recipes={recipes} />
        ) : null}

        {mode === "popup" ? (
          <RecipePopupLauncher
            onOpen={() => setIsPopupOpen(true)}
            recipes={recipes}
          />
        ) : null}
      </div>

      {isPopupOpen ? (
        <RecipePopup
          onClose={() => setIsPopupOpen(false)}
          product={product}
          recipes={recipes}
        />
      ) : null}
    </div>
  );
}
