import type { Product } from "@/data/products";
import {
  cheeseRecipes,
  curingMethodLabels,
  curingProductLabels,
  defaultCalculatorId,
  defaultInputs,
  furtherProcessingLabels,
  getCheeseMilkType,
  isCalculatorId,
  meatMethodLabels,
  meatProfiles,
  milkTypeLabels,
  rennetProductIds,
  rennetTypeLabels,
  tinctureFruitProfiles,
  wineFruitProfiles,
  wineKindLabels,
  wineResidualSugarGPerL,
  wineStrengthProfiles,
  wineYeastProducts,
  woodChipLabels,
} from "@/lib/calculators/data";
import type {
  CalculatorId,
  CalculatorInputMap,
  CalculatorIngredient,
  CalculatorProductRef,
  CalculatorResult,
  CalculatorSummaryItem,
  CheeseInput,
  MeatInput,
  ResolvedCalculatorProduct,
  TinctureInput,
  WineInput,
} from "@/lib/calculators/types";

export {
  calculatorDefinitions,
  defaultCalculatorId,
  defaultInputs,
  getCalculatorAliasTarget,
  getCalculatorDefinition,
  getDefaultInput,
  isCalculatorId,
} from "@/lib/calculators/data";

export type {
  CalculatorDefinition,
  CalculatorId,
  CalculatorIngredient,
  CalculatorInputMap,
  CalculatorProductRef,
  CalculatorResult,
  CheeseId,
  CheeseInput,
  MeatInput,
  ResolvedCalculatorProduct,
  TinctureInput,
  WineInput,
} from "@/lib/calculators/types";

type CartLineInput = {
  productId: string;
  variantId?: string;
  quantity?: number;
};

const numberFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);

const roundTo = (value: number, digits = 2) => {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
};

const formatNumber = (value: number, unit = "", digits = 2) => {
  const formatter = digits === 0 ? integerFormatter : numberFormatter;
  const formatted = formatter.format(roundTo(value, digits));

  return unit ? `${formatted} ${unit}` : formatted;
};

const formatIngredient = (
  label: string,
  value: string,
  detail?: string,
): CalculatorIngredient => ({
  label,
  value,
  detail,
});

const formatSummary = (label: string, value: string): CalculatorSummaryItem => ({
  label,
  value,
});

const productRef = ({
  legacyId,
  label,
  quantity = 1,
  fallbackQuery,
  optional,
}: CalculatorProductRef) => ({
  legacyId,
  label,
  quantity: Math.max(1, Math.ceil(quantity)),
  fallbackQuery,
  optional,
});

export const calculateWine = (rawInput: WineInput): CalculatorResult => {
  const input: WineInput = {
    ...rawInput,
    fruitKg: clamp(rawInput.fruitKg, 1, 150),
    targetLiters: clamp(rawInput.targetLiters, 4, 100),
  };
  const fruit = wineFruitProfiles[input.fruitId];
  const wineStrength = wineStrengthProfiles[input.strength];
  const yeast = resolveWineYeast(input);
  const targetLiters =
    input.mode === "target-volume"
      ? input.targetLiters
      : clamp(input.fruitKg / fruit.kgPerLiter, 4, 100);
  const fruitKg =
    input.mode === "fruit-weight"
      ? input.fruitKg
      : clamp(targetLiters * fruit.kgPerLiter, 1, 150);
  const juiceLiters = fruitKg * fruit.juiceYieldLPerKg;
  const waterLiters = Math.max(targetLiters - juiceLiters, targetLiters * 0.08);
  const residualSugarG = targetLiters * wineResidualSugarGPerL[input.wineKind];
  const fermentationSugarG = targetLiters * wineStrength.alc * 17;
  const fruitSugarG = fruitKg * fruit.sugarGPerKg * 0.62;
  const totalSugarKg = Math.max(
    0.15,
    (fermentationSugarG + residualSugarG - fruitSugarG) / 1000,
  );
  const sugarPortionKg = totalSugarKg / 3;
  const waterPortionLiters = waterLiters / 3;
  const yeastPacks = Math.max(1, Math.ceil(targetLiters / 25));
  const nutrientPacks = Math.max(1, Math.ceil(targetLiters / 20));
  const pectoenzymePacks = Math.max(1, Math.ceil(fruitKg / 25));
  const fermenterCount = Math.max(1, Math.ceil(targetLiters / 15));
  const acidityProduct =
    fruit.acidity === "low"
      ? productRef({
          legacyId: "401820",
          label: "Kwasomix - regulator kwasowości",
          quantity: 1,
          fallbackQuery: "kwasomix",
        })
      : fruit.acidity === "high"
        ? productRef({
            legacyId: "401830",
            label: "Redukwas - regulator kwasowości",
            quantity: 1,
            fallbackQuery: "redukwas",
          })
        : null;
  const warnings = [
    wineStrength.alc >= 16
      ? "Moc powyżej 15% wymaga zdrowych drożdży, dobrej pożywki i spokojnego prowadzenia fermentacji."
      : "",
    fruit.acidity === "high"
      ? "Wybrane owoce mają wysoką kwasowość, dlatego kalkulator proponuje korektę Redukwasem."
      : "",
    fruit.acidity === "low"
      ? "Wybrane owoce mają łagodną kwasowość, dlatego kalkulator proponuje korektę Kwasomixem."
      : "",
  ].filter(Boolean);

  return {
    calculatorId: "wine",
    title: `Nastaw ${wineKindLabels[input.wineKind]} z owoców: ${fruit.label}`,
    lead: `Proporcje dla około ${formatNumber(targetLiters, "l")} wina: ${wineStrength.label} (${wineStrength.additionalLabel}).`,
    summary: [
      formatSummary("Owoce", fruit.label),
      formatSummary("Typ wina", wineKindLabels[input.wineKind]),
      formatSummary("Moc", `${wineStrength.label} (${wineStrength.additionalLabel})`),
      formatSummary("Objętość nastawu", formatNumber(targetLiters, "l")),
    ],
    ingredients: [
      formatIngredient("Owoce", formatNumber(fruitKg, "kg")),
      formatIngredient("Woda", formatNumber(waterLiters, "l"), "podziel na trzy porcje"),
      formatIngredient(
        "Cukier",
        formatNumber(totalSugarKg, "kg"),
        `3 porcje po ${formatNumber(sugarPortionKg, "kg")}`,
      ),
      formatIngredient("Drożdże", yeast.label, `${yeastPacks} opak.`),
      formatIngredient("Pożywka", `${nutrientPacks} opak.`, "dodawaj zgodnie z etykietą"),
      ...(acidityProduct
        ? [formatIngredient("Korekta kwasowości", acidityProduct.label)]
        : []),
    ],
    steps: [
      "Umyj owoce, usuń części uszkodzone i rozdrobnij surowiec tak, aby łatwiej oddał sok.",
      `Do pojemnika dodaj owoce, pierwszą porcję cukru (${formatNumber(
        sugarPortionKg,
        "kg",
      )}) i pierwszą porcję wody (${formatNumber(waterPortionLiters, "l")}).`,
      "Dodaj drożdże, pożywkę i pektoenzym, a pojemnik zabezpiecz rurką fermentacyjną.",
      `Po 5 dniach dodaj drugą porcję syropu, a po kolejnych 5 dniach trzecią porcję.`,
      "Po burzliwej fermentacji odciśnij moszcz, przelej płyn znad osadu i prowadź cichą fermentację do wyklarowania.",
    ],
    warnings,
    productRefs: [
      productRef({
        legacyId: "340415",
        label: "Pojemnik fermentacyjny 15 L",
        quantity: fermenterCount,
        fallbackQuery: "pojemnik fermentacyjny",
      }),
      productRef({
        legacyId: yeast.legacyId,
        label: yeast.label,
        quantity: yeastPacks,
        fallbackQuery: "drożdże winiarskie",
      }),
      productRef({
        legacyId: "401030",
        label: "Pożywka do wina Kombi Vita",
        quantity: nutrientPacks,
        fallbackQuery: "pożywka do wina",
      }),
      productRef({
        legacyId: "401410",
        label: "Pektoenzym",
        quantity: pectoenzymePacks,
        fallbackQuery: "pektoenzym",
      }),
      productRef({
        legacyId: "405588",
        label: "Rurka fermentacyjna",
        quantity: fermenterCount,
        fallbackQuery: "rurka fermentacyjna",
      }),
      productRef({
        legacyId: "401810",
        label: "Pirosiarczyn potasu",
        quantity: 1,
        fallbackQuery: "pirosiarczyn",
        optional: true,
      }),
      ...(acidityProduct ? [acidityProduct] : []),
    ],
  };
};

const resolveWineYeast = (input: WineInput) => {
  const fruit = wineFruitProfiles[input.fruitId];
  const selectedForKind = fruit.yeasts[input.wineKind] ?? {};
  const yeastId =
    selectedForKind[input.strength] ??
    Object.values(selectedForKind).find(Boolean) ??
    Object.values(fruit.yeasts)
      .flatMap((entry) => Object.values(entry))
      .find(Boolean) ??
    "enovini";

  return wineYeastProducts[yeastId as keyof typeof wineYeastProducts];
};

export const calculateTincture = (rawInput: TinctureInput): CalculatorResult => {
  const input: TinctureInput = {
    ...rawInput,
    fruitKg: clamp(rawInput.fruitKg, 0.2, 50),
    targetStrength: clamp(rawInput.targetStrength, 10, 70),
    spiritStrength: clamp(
      rawInput.spiritStrength,
      rawInput.mode === "abv" ? 10 : 70,
      95,
    ),
    targetLiters: clamp(rawInput.targetLiters, 0.2, 50),
    alcoholLiters: clamp(rawInput.alcoholLiters, 0, 50),
    secondAlcoholStrength: clamp(rawInput.secondAlcoholStrength, 0, 70),
    secondAlcoholLiters: clamp(rawInput.secondAlcoholLiters, 0, 50),
    juiceLiters: clamp(rawInput.juiceLiters, 0, 50),
    waterLiters: clamp(rawInput.waterLiters, 0, 50),
    sugarG: clamp(rawInput.sugarG, 0, 20000),
  };
  const fruit = tinctureFruitProfiles[input.fruitId];
  const sugarVolumeLiters = input.sugarG / 1600;
  const contractionRatio = 0.965;
  const extractionAlcoholStrength = 70;
  const alcoholForFruitLiters = input.fruitKg * fruit.kgPerLiter;
  const waterForExtractionLiters = Math.max(
    0,
    (alcoholForFruitLiters * input.spiritStrength) / extractionAlcoholStrength -
      alcoholForFruitLiters,
  );
  const recipeFinalVolumeLiters =
    (alcoholForFruitLiters + waterForExtractionLiters + sugarVolumeLiters) *
      contractionRatio +
    input.fruitKg * fruit.juiceLPerKg;
  const recipeAlcoholPercent =
    (alcoholForFruitLiters * input.spiritStrength) / recipeFinalVolumeLiters;
  const abvPureAlcohol =
    input.alcoholLiters * (input.spiritStrength / 100) +
    input.secondAlcoholLiters * (input.secondAlcoholStrength / 100);
  const abvFinalVolume =
    (input.alcoholLiters +
      input.secondAlcoholLiters +
      input.waterLiters +
      input.juiceLiters +
      sugarVolumeLiters) *
    contractionRatio;
  const calculatedAbv = abvFinalVolume > 0 ? (abvPureAlcohol / abvFinalVolume) * 100 : 0;
  const dilutionSpiritLiters =
    (input.targetLiters * input.targetStrength) / input.spiritStrength;
  const dilutionWaterLiters = Math.max(
    0,
    input.targetLiters / contractionRatio - dilutionSpiritLiters,
  );
  const lowAcidityRef =
    fruit.acidity === "low"
      ? productRef({
          legacyId: "401820",
          label: "Kwasomix - regulator kwasowości",
          quantity: 1,
          fallbackQuery: "kwasomix",
          optional: true,
        })
      : null;
  const title =
    input.mode === "dilution"
      ? "Rozcieńczanie alkoholu"
      : input.mode === "abv"
        ? "Moc gotowej nalewki"
        : `Nalewka z owoców: ${fruit.label}`;
  const lead =
    input.mode === "dilution"
      ? `Proporcje dla ${formatNumber(input.targetLiters, "l")} alkoholu o mocy ${formatNumber(
          input.targetStrength,
          "%",
          1,
        )}.`
      : input.mode === "abv"
        ? `Szacowana moc nastawu to ${formatNumber(calculatedAbv, "%", 1)}.`
        : `Alkohol do zalania owoców jest przeliczony do około 70%, czyli stężenia dobrego do maceracji.`;

  return {
    calculatorId: "tincture",
    title,
    lead,
    summary:
      input.mode === "dilution"
        ? [
            formatSummary("Moc spirytusu", formatNumber(input.spiritStrength, "%", 1)),
            formatSummary("Moc docelowa", formatNumber(input.targetStrength, "%", 1)),
            formatSummary("Ilość docelowa", formatNumber(input.targetLiters, "l")),
          ]
        : [
            formatSummary("Owoce", fruit.label),
            formatSummary("Masa owoców", formatNumber(input.fruitKg, "kg")),
            formatSummary(
              input.mode === "abv" ? "Szacowana moc" : "Przewidywana moc",
              formatNumber(input.mode === "abv" ? calculatedAbv : recipeAlcoholPercent, "%", 1),
            ),
          ],
    ingredients:
      input.mode === "dilution"
        ? [
            formatIngredient("Spirytus", formatNumber(dilutionSpiritLiters, "l")),
            formatIngredient("Woda", formatNumber(dilutionWaterLiters, "l")),
          ]
        : input.mode === "abv"
          ? [
              formatIngredient("Alkohol główny", formatNumber(input.alcoholLiters, "l")),
              ...(input.secondAlcoholLiters > 0
                ? [
                    formatIngredient(
                      "Drugi alkohol",
                      formatNumber(input.secondAlcoholLiters, "l"),
                    ),
                  ]
                : []),
              formatIngredient("Sok z owoców", formatNumber(input.juiceLiters, "l")),
              formatIngredient("Cukier", formatNumber(input.sugarG, "g", 0)),
              formatIngredient("Woda", formatNumber(input.waterLiters, "l")),
            ]
          : [
              formatIngredient("Owoce", formatNumber(input.fruitKg, "kg"), fruit.note),
              formatIngredient(
                "Alkohol do maceracji",
                formatNumber(alcoholForFruitLiters, "l"),
                `${formatNumber(input.spiritStrength, "%", 1)}`,
              ),
              formatIngredient(
                "Woda do rozcieńczenia",
                formatNumber(waterForExtractionLiters, "l"),
                "dodaj, aby zejść w okolice 70%",
              ),
              formatIngredient("Cukier", formatNumber(input.sugarG, "g", 0)),
              ...(lowAcidityRef ? [formatIngredient("Korekta smaku", lowAcidityRef.label)] : []),
            ],
    steps:
      input.mode === "dilution"
        ? [
            "Odmierz alkohol i wodę w osobnych naczyniach.",
            "Wlewaj alkohol do wody powoli, mieszając i zostawiając miejsce na kontrakcję objętości.",
            "Po wymieszaniu odstaw roztwór, aby temperatura i objętość ustabilizowały się przed dalszą pracą.",
          ]
        : [
            "Przygotuj owoce: umyj je, usuń pestki lub szypułki, a w razie potrzeby przemroź.",
            "Zalej owoce alkoholem o dobranej mocy i prowadź macerację w ciemnym miejscu.",
            "Oddziel nalew od owoców, przefiltruj go i skoryguj smak cukrem, wodą albo dodatkami kwasowymi.",
            "Rozlej nalewkę do butelek i daj jej czas na ułożenie smaku.",
          ],
    warnings: [
      input.mode === "recipe" && recipeAlcoholPercent > 45
        ? "Gotowa nalewka może być mocna; po filtracji warto skorygować ją wodą lub syropem."
        : "",
      input.mode === "dilution" && dilutionSpiritLiters > input.targetLiters
        ? "Docelowa moc jest wyższa niż moc alkoholu bazowego, więc rozcieńczenie nie jest możliwe."
        : "",
    ].filter(Boolean),
    productRefs: [
      productRef({
        legacyId: "601650",
        label: "Słoik uniwersalny 5 L",
        quantity: Math.max(1, Math.ceil((input.mode === "recipe" ? input.fruitKg : 2) / 3)),
        fallbackQuery: "słoik 5 l",
      }),
      productRef({
        legacyId: "405552",
        label: "Alkoholomierz",
        quantity: 1,
        fallbackQuery: "alkoholomierz",
      }),
      productRef({
        legacyId: "810601",
        label: "Worek do filtracji nalewek",
        quantity: 1,
        fallbackQuery: "worek filtracji nalewek",
      }),
      ...(lowAcidityRef ? [lowAcidityRef] : []),
    ],
  };
};

export const calculateCheese = (rawInput: CheeseInput): CalculatorResult => {
  const input: CheeseInput = {
    ...rawInput,
    milkLiters: clamp(rawInput.milkLiters, 1, 1500),
  };
  const recipe = cheeseRecipes[input.cheeseId];
  const sourceType = getCheeseMilkType(input);
  const cheeseYieldKg = input.milkLiters * recipe.yieldKgPerLiter;
  const rennetMl = (input.milkLiters / 10) * recipe.rennetMlPer10L;
  const calciumChlorideMl =
    recipe.calciumChloride && input.milkType === "low-pasteurized"
      ? Math.max(1, input.milkLiters)
      : 0;
  const saltG = recipe.saltGPerLiter * input.milkLiters;
  const productIds = new Set(recipe.productLegacyIds);

  if (recipe.rennetMlPer10L > 0) {
    productIds.add(rennetProductIds[input.rennetType]);
  }

  if (recipe.calciumChloride) {
    productIds.add("411207");
  }

  return {
    calculatorId: "cheese",
    title: `${recipe.label}: proporcje serowarskie`,
    lead: `Przeliczenie dla ${formatNumber(input.milkLiters, "l")} surowca. Szacowany uzysk: ${formatNumber(
      cheeseYieldKg,
      "kg",
    )}.`,
    summary: [
      formatSummary("Rodzaj sera", recipe.label),
      formatSummary("Surowiec", milkTypeLabels[sourceType]),
      formatSummary("Temperatura pracy", recipe.targetTempC),
      formatSummary("Szacowany uzysk", formatNumber(cheeseYieldKg, "kg")),
    ],
    ingredients: [
      formatIngredient(recipe.sourceLabel, formatNumber(input.milkLiters, "l")),
      ...(recipe.cultureLabel
        ? [formatIngredient("Kultury", recipe.cultureLabel, "dawkowanie wg opakowania")]
        : []),
      ...(recipe.rennetMlPer10L > 0
        ? [
            formatIngredient(
              "Podpuszczka",
              formatNumber(rennetMl, "ml"),
              rennetTypeLabels[input.rennetType],
            ),
          ]
        : []),
      ...(calciumChlorideMl > 0
        ? [
            formatIngredient(
              "Chlorek wapnia",
              formatNumber(calciumChlorideMl, "ml"),
              "szczególnie przy mleku sklepowym",
            ),
          ]
        : []),
      ...(saltG > 0 ? [formatIngredient("Sól/solanka", formatNumber(saltG, "g", 0))] : []),
    ],
    steps: recipe.steps,
    warnings: [
      input.milkType === "low-pasteurized" && recipe.calciumChloride
        ? "Przy mleku niskopasteryzowanym warto użyć chlorku wapnia, aby skrzep był stabilniejszy."
        : "",
      input.cheeseId === "ricotta"
        ? "Ricotta wymaga dobrej serwatki; z serwatki po mleku sklepowym uzysk bywa niższy."
        : "",
    ].filter(Boolean),
    productRefs: Array.from(productIds).map((legacyId) =>
      productRef({
        legacyId,
        label: getCheeseProductLabel(legacyId),
        quantity:
          legacyId === "411312" || legacyId === "411313"
            ? Math.max(1, Math.ceil(cheeseYieldKg / 0.5))
            : 1,
        fallbackQuery: getCheeseProductLabel(legacyId),
      }),
    ),
  };
};

const getCheeseProductLabel = (legacyId: string) => {
  switch (legacyId) {
    case "102501":
      return "Termometr serowarski";
    case "411200":
      return "Podpuszczka do serów";
    case "411201":
      return "Podpuszczka mikrobiologiczna";
    case "411207":
      return "Podpuszczka naturalna";
    case "411209":
      return "Podpuszczka strong";
    case "411225":
      return "Wosk serowarski";
    case "411240":
      return "Kultury bakterii do jogurtu";
    case "411241":
      return "Kultury bakterii do sera greckiego";
    case "411242":
      return "Kultury bakterii do sera gouda";
    case "411243":
      return "Kultury bakterii do twarogu";
    case "411290":
    case "411305":
      return "Chusta serowarska";
    case "411312":
    case "411313":
    case "411310":
      return "Forma serowarska";
    case "411331":
      return "Podkład serowarski";
    case "801013":
      return "Sero-jogurtownica";
    case "139200":
      return "Lejek do słoików";
    default:
      return "Akcesorium serowarskie";
  }
};

export const calculateMeat = (rawInput: MeatInput): CalculatorResult => {
  const input: MeatInput = {
    ...rawInput,
    meatKg: clamp(rawInput.meatKg, 1, 50),
    pieceWeightG: clamp(rawInput.pieceWeightG, 100, 1500),
    meatThicknessCm: clamp(rawInput.meatThicknessCm, 1, 20),
    hamCookerSizeKg: clamp(rawInput.hamCookerSizeKg, 0.8, 3),
    extraBrineLiters: clamp(rawInput.extraBrineLiters, 0, 20),
  };
  const profile = meatProfiles[input.meatKind];
  const dryDaysByPiece = input.pieceWeightG < 500 ? 3 : input.pieceWeightG <= 1000 ? 4 : 5;
  const wetDaysByThickness = Math.max(4, Math.ceil(input.meatThicknessCm * 1.1));
  const curingDays =
    input.curingMethod === "dry"
      ? Math.max(profile.dryDays, dryDaysByPiece)
      : Math.max(profile.wetDays, wetDaysByThickness);
  const saltG = input.meatKg * profile.saltGPerKg;
  const saltpeterG =
    input.curingProduct === "salt-and-saltpeter" ? input.meatKg * 1.2 : 0;
  const brineLiters =
    input.curingMethod === "wet"
      ? input.meatKg * 0.42 + input.extraBrineLiters
      : 0;
  const brineSaltG = brineLiters * 80;
  const hamCookerCount =
    input.method === "ham-cooker"
      ? Math.max(1, Math.ceil(input.meatKg / input.hamCookerSizeKg))
      : 0;
  const productRefs: CalculatorProductRef[] = [
    productRef({
      legacyId: input.curingProduct === "curing-salt" ? "410019" : "410010",
      label:
        input.curingProduct === "curing-salt"
          ? "Peklosól Vit-C"
          : "Saletra potasowa do peklowania",
      quantity: Math.max(1, Math.ceil(input.meatKg / 2)),
      fallbackQuery: input.curingProduct === "curing-salt" ? "peklosól" : "saletra",
    }),
    productRef({
      legacyId: input.method === "ham-cooker" ? getHamCookerProductId(input.hamCookerSizeKg) : "100600",
      label:
        input.method === "ham-cooker" ? "Szynkowar dobrany do wsadu" : "Termometr do mięs",
      quantity: Math.max(1, hamCookerCount || 1),
      fallbackQuery: input.method === "ham-cooker" ? "szynkowar" : "termometr do mięsa",
    }),
  ];

  if (input.method === "ham-cooker") {
    productRefs.push(
      productRef({
        legacyId: input.hamCookerSizeKg >= 3 ? "313230" : "313215",
        label: "Woreczki do szynkowara",
        quantity: 1,
        fallbackQuery: "woreczki do szynkowara",
      }),
      productRef({
        legacyId: "100601",
        label: "Termometr do szynkowaru",
        quantity: 1,
        fallbackQuery: "termometr do szynkowaru",
      }),
    );
  }

  if (
    input.method === "smoker-roasting" ||
    input.furtherProcessing === "warm-smoking" ||
    input.furtherProcessing === "smoker-roasting"
  ) {
    productRefs.push(
      productRef({
        legacyId: "330006",
        label: "Wędzarnia",
        quantity: 1,
        fallbackQuery: "wędzarnia",
        optional: true,
      }),
      productRef({
        label: `Zrębki wędzarnicze: ${woodChipLabels[input.woodChip]}`,
        quantity: 1,
        fallbackQuery: `zrębki ${woodChipLabels[input.woodChip]}`,
      }),
    );
  }

  return {
    calculatorId: "meat",
    title: `${meatMethodLabels[input.method]}: ${curingMethodLabels[input.curingMethod]}`,
    lead: `Proporcje dla ${formatNumber(input.meatKg, "kg")} mięsa. Sugerowany czas peklowania: ${curingDays} dni.`,
    summary: [
      formatSummary("Metoda", meatMethodLabels[input.method]),
      formatSummary("Mięso", profile.label),
      formatSummary("Peklowanie", curingMethodLabels[input.curingMethod]),
      formatSummary("Dalsza obróbka", furtherProcessingLabels[input.furtherProcessing]),
    ],
    ingredients: [
      formatIngredient("Mięso", formatNumber(input.meatKg, "kg")),
      formatIngredient(
        curingProductLabels[input.curingProduct],
        input.curingMethod === "wet"
          ? formatNumber(brineSaltG, "g", 0)
          : formatNumber(saltG, "g", 0),
      ),
      ...(saltpeterG > 0
        ? [formatIngredient("Saletra potasowa", formatNumber(saltpeterG, "g", 1))]
        : []),
      ...(input.curingMethod === "wet"
        ? [formatIngredient("Zalewa", formatNumber(brineLiters, "l"))]
        : []),
    ],
    steps: [
      "Oczyść mięso, wyrównaj kawałki i zważ wsad przed przygotowaniem mieszanki.",
      input.curingMethod === "wet"
        ? "Przygotuj zalewę, zanurz mięso całkowicie i obciąż je tak, aby nie wypływało."
        : "Obsyp mięso mieszanką peklującą równomiernie ze wszystkich stron.",
      `Pekluj przez około ${curingDays} dni w chłodzie, obracając mięso co 1-2 dni.`,
      getFurtherProcessingStep(input),
      "Po obróbce pozwól wyrobowi odpocząć i schłodzić się przed krojeniem lub pakowaniem.",
    ],
    warnings: [
      input.curingProduct === "salt-and-saltpeter"
        ? "Saletrę odmierzaj precyzyjnie; przy domowej pracy bezpieczniejsza bywa gotowa peklosól."
        : "",
      input.method === "ham-cooker" && input.meatKg > input.hamCookerSizeKg
        ? "Wsad przekracza rozmiar jednego szynkowaru, dlatego kalkulator proponuje więcej niż jedno naczynie."
        : "",
    ].filter(Boolean),
    productRefs,
  };
};

const getHamCookerProductId = (sizeKg: number) => {
  if (sizeKg <= 0.8) {
    return "313008";
  }

  if (sizeKg >= 3) {
    return "313030";
  }

  return "313016";
};

const getFurtherProcessingStep = (input: MeatInput) => {
  switch (input.furtherProcessing) {
    case "warm-smoking":
      return "Osusz wyrób, następnie wędź na ciepło do uzyskania stabilnej barwy i właściwej temperatury wewnątrz.";
    case "smoker-roasting":
      return "Osusz wyrób, a następnie podpiekaj go w wędzarni do uzyskania właściwej barwy.";
    case "scalding":
    default:
      return "Parz wyrób do osiągnięcia temperatury bezpiecznej dla wybranego rodzaju mięsa.";
  }
};

export const calculateById = <T extends CalculatorId>(
  id: T,
  input: CalculatorInputMap[T],
): CalculatorResult => {
  switch (id) {
    case "wine":
      return calculateWine(input as WineInput);
    case "tincture":
      return calculateTincture(input as TinctureInput);
    case "cheese":
      return calculateCheese(input as CheeseInput);
    case "meat":
      return calculateMeat(input as MeatInput);
    default:
      return calculateWine(defaultInputs.wine);
  }
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const productHaystack = (product: Product) =>
  normalize(
    [
      product.id,
      product.baseProductId,
      product.slug,
      product.baseSlug,
      product.title,
      product.subtitle,
      product.description,
      product.line,
      ...product.tags,
      ...product.taxonomy.flatMap((entry) => [
        entry.lineName,
        entry.categoryName,
        entry.subcategoryName ?? "",
      ]),
    ].join(" "),
  );

const scoreProductForQuery = (product: Product, query: string) => {
  const normalizedQuery = normalize(query);
  const haystack = productHaystack(product);

  if (!normalizedQuery) {
    return 0;
  }

  if (haystack.includes(normalizedQuery)) {
    return 100 + normalizedQuery.length;
  }

  return normalizedQuery
    .split(" ")
    .filter((part) => part.length > 2)
    .reduce((score, part) => score + (haystack.includes(part) ? 8 : 0), 0);
};

export const resolveCalculatorProducts = (
  products: Product[],
  refs: CalculatorProductRef[],
): ResolvedCalculatorProduct[] => {
  const productByLegacyId = new Map<string, Product>();

  for (const product of products) {
    productByLegacyId.set(product.id, product);
    productByLegacyId.set(product.baseProductId, product);
  }

  const seen = new Set<string>();
  const resolved: ResolvedCalculatorProduct[] = [];

  for (const ref of refs) {
    const directProduct = ref.legacyId ? productByLegacyId.get(ref.legacyId) : undefined;
    const fallbackProduct =
      directProduct ??
      [...products]
        .map((product) => ({
          product,
          score: scoreProductForQuery(product, ref.fallbackQuery ?? ref.label),
        }))
        .filter((entry) => entry.score > 0)
        .sort(
          (left, right) =>
            right.score - left.score ||
            right.product.popularityScore - left.product.popularityScore,
        )[0]?.product;
    const product = directProduct ?? fallbackProduct;

    if (!product || seen.has(product.id)) {
      continue;
    }

    seen.add(product.id);
    resolved.push({
      ref,
      product,
      matchType: directProduct ? "legacy" : "fallback",
    });
  }

  return resolved;
};

export const toCalculatorCartLines = (
  products: ResolvedCalculatorProduct[],
  selectedProductIds?: Set<string>,
  quantityOverrides?: Record<string, number>,
): CartLineInput[] =>
  products
    .filter((entry) => !selectedProductIds || selectedProductIds.has(entry.product.id))
    .map((entry) => ({
      productId: entry.product.id,
      variantId: entry.product.variants[0]?.id,
      quantity: Math.max(
        1,
        Math.floor(quantityOverrides?.[entry.product.id] ?? entry.ref.quantity),
      ),
    }))
    .filter((entry) => Boolean(entry.variantId));

export const getCalculatorIdFromParam = (value: string | string[] | undefined) => {
  const candidate = Array.isArray(value) ? value[0] : value;

  return isCalculatorId(candidate) ? candidate : defaultCalculatorId;
};
