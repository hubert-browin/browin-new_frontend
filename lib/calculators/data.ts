import type {
  CalculatorDefinition,
  CalculatorId,
  CalculatorInputMap,
  CheeseId,
  CheeseInput,
  CuringProduct,
  FurtherProcessing,
  MeatInput,
  MeatKind,
  MilkType,
  RennetType,
  TinctureFruitId,
  WineFruitId,
  WineKind,
  WineStrength,
  WoodChip,
} from "@/lib/calculators/types";

type WineFruitProfile = {
  id: WineFruitId;
  label: string;
  kgPerLiter: number;
  juiceYieldLPerKg: number;
  sugarGPerKg: number;
  acidity: "low" | "balanced" | "high";
  yeasts: Record<WineKind, Partial<Record<WineStrength, WineYeastId>>>;
};

type WineYeastId =
  | "enovini_truskawka"
  | "enovini_porzeczka"
  | "enovini"
  | "enovini_baya"
  | "enovini_ws"
  | "fermivin_7013"
  | "fermivin_ls2"
  | "fermivin_pdm"
  | "fermivin_vr5";

type TinctureFruitProfile = {
  id: TinctureFruitId;
  label: string;
  kgPerLiter: number;
  sugarGPerKg: number;
  juiceLPerKg: number;
  acidity: "low" | "balanced" | "high";
  note: string;
};

type CheeseRecipe = {
  id: CheeseId;
  label: string;
  sourceLabel: string;
  yieldKgPerLiter: number;
  targetTempC: string;
  cultureLegacyId?: string;
  cultureLabel?: string;
  rennetMlPer10L: number;
  saltGPerLiter: number;
  calciumChloride: boolean;
  productLegacyIds: string[];
  steps: string[];
};

type MeatProfile = {
  id: MeatKind;
  label: string;
  dryDays: number;
  wetDays: number;
  saltGPerKg: number;
};

export const calculatorDefinitions: CalculatorDefinition[] = [
  {
    id: "wine",
    title: "Kalkulator winiarski",
    shortTitle: "Wino",
    eyebrow: "Winiarstwo",
    description:
      "Dobiera owoce, wodę, cukier, drożdże i kolejne porcje syropu dla domowego nastawu.",
    legacyHref: "/kalkulator-winiarski",
    accentLabel: "Fermentacja krok po kroku",
  },
  {
    id: "tincture",
    title: "Kalkulator nalewek",
    shortTitle: "Nalewki",
    eyebrow: "Nalewki",
    description:
      "Pomaga ułożyć nastaw, policzyć moc gotowej nalewki albo rozcieńczyć spirytus.",
    legacyHref: "/kalkulator-nalewkowy",
    accentLabel: "Moc i proporcje",
  },
  {
    id: "cheese",
    title: "Kalkulator serowarski",
    shortTitle: "Sery",
    eyebrow: "Serowarstwo",
    description:
      "Przelicza mleko, podpuszczkę, kultury i akcesoria dla najpopularniejszych serów.",
    legacyHref: "/kalkulator-serowarski",
    accentLabel: "Domowa serowarnia",
  },
  {
    id: "meat",
    title: "Kalkulator wędliniarski",
    shortTitle: "Wędliny",
    eyebrow: "Wędliniarstwo",
    description:
      "Liczy peklowanie, zalewę, dodatki i dalszą obróbkę dla szynkowaru, parzenia i podpiekania.",
    legacyHref: "/kalkulator-wedliniarski",
    accentLabel: "Peklowanie bez zgadywania",
  },
];

export const calculatorIds = calculatorDefinitions.map((entry) => entry.id);

export const defaultCalculatorId: CalculatorId = "wine";

export const wineFruitProfiles: Record<WineFruitId, WineFruitProfile> = {
  gooseberry: {
    id: "gooseberry",
    label: "Agrest",
    kgPerLiter: 0.58,
    juiceYieldLPerKg: 0.4,
    sugarGPerKg: 70,
    acidity: "balanced",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { medium: "fermivin_ls2", strong: "enovini" },
      sweet: { medium: "fermivin_ls2", strong: "enovini" },
    },
  },
  chokeberry: {
    id: "chokeberry",
    label: "Aronia",
    kgPerLiter: 0.49,
    juiceYieldLPerKg: 0.35,
    sugarGPerKg: 70,
    acidity: "low",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { light: "fermivin_7013", medium: "fermivin_vr5", strong: "enovini" },
      sweet: { medium: "fermivin_vr5", strong: "enovini" },
    },
  },
  "sweet-cherry": {
    id: "sweet-cherry",
    label: "Czereśnie",
    kgPerLiter: 0.92,
    juiceYieldLPerKg: 0.6,
    sugarGPerKg: 90,
    acidity: "low",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { medium: "fermivin_7013", strong: "fermivin_ls2" },
      sweet: { medium: "fermivin_pdm", strong: "enovini_baya" },
    },
  },
  pear: {
    id: "pear",
    label: "Gruszki",
    kgPerLiter: 0.9,
    juiceYieldLPerKg: 0.6,
    sugarGPerKg: 100,
    acidity: "low",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { medium: "fermivin_pdm", strong: "enovini_baya" },
      sweet: { medium: "fermivin_pdm", strong: "enovini_baya" },
    },
  },
  apple: {
    id: "apple",
    label: "Jabłka",
    kgPerLiter: 1.08,
    juiceYieldLPerKg: 0.65,
    sugarGPerKg: 100,
    acidity: "low",
    yeasts: {
      dry: {},
      "semi-dry": { light: "enovini_ws", medium: "fermivin_7013" },
      "semi-sweet": { light: "fermivin_7013", medium: "fermivin_ls2", strong: "fermivin_pdm" },
      sweet: { medium: "enovini", strong: "enovini_baya" },
    },
  },
  blackberry: {
    id: "blackberry",
    label: "Jeżyny",
    kgPerLiter: 0.85,
    juiceYieldLPerKg: 0.6,
    sugarGPerKg: 60,
    acidity: "balanced",
    yeasts: {
      dry: {},
      "semi-dry": { light: "enovini_ws", medium: "fermivin_7013" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_vr5", strong: "enovini" },
      sweet: { medium: "fermivin_vr5", strong: "enovini" },
    },
  },
  raspberry: {
    id: "raspberry",
    label: "Maliny",
    kgPerLiter: 0.73,
    juiceYieldLPerKg: 0.55,
    sugarGPerKg: 55,
    acidity: "high",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_7013" },
      sweet: { medium: "fermivin_vr5", strong: "enovini" },
    },
  },
  blackcurrant: {
    id: "blackcurrant",
    label: "Czarne porzeczki",
    kgPerLiter: 0.5,
    juiceYieldLPerKg: 0.3,
    sugarGPerKg: 85,
    acidity: "high",
    yeasts: {
      dry: { light: "enovini_ws", medium: "fermivin_7013" },
      "semi-dry": { light: "enovini_ws", medium: "fermivin_7013", strong: "fermivin_ls2" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_7013", strong: "enovini_porzeczka" },
      sweet: { medium: "fermivin_vr5", strong: "enovini_porzeczka" },
    },
  },
  redcurrant: {
    id: "redcurrant",
    label: "Czerwone porzeczki",
    kgPerLiter: 0.5,
    juiceYieldLPerKg: 0.35,
    sugarGPerKg: 70,
    acidity: "balanced",
    yeasts: {
      dry: {},
      "semi-dry": { light: "enovini_ws", medium: "fermivin_7013", strong: "fermivin_vr5" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_7013", strong: "enovini_porzeczka" },
      sweet: { medium: "fermivin_vr5", strong: "enovini_porzeczka" },
    },
  },
  plum: {
    id: "plum",
    label: "Śliwki węgierki",
    kgPerLiter: 0.9,
    juiceYieldLPerKg: 0.55,
    sugarGPerKg: 100,
    acidity: "balanced",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_7013", strong: "fermivin_ls2" },
      sweet: { medium: "fermivin_ls2", strong: "enovini_baya" },
    },
  },
  strawberry: {
    id: "strawberry",
    label: "Truskawki",
    kgPerLiter: 1.08,
    juiceYieldLPerKg: 0.7,
    sugarGPerKg: 45,
    acidity: "balanced",
    yeasts: {
      dry: {},
      "semi-dry": {},
      "semi-sweet": { medium: "enovini_truskawka", strong: "enovini" },
      sweet: { medium: "enovini_truskawka", strong: "enovini" },
    },
  },
  "white-grape": {
    id: "white-grape",
    label: "Jasne winogrona",
    kgPerLiter: 0.9,
    juiceYieldLPerKg: 0.63,
    sugarGPerKg: 155,
    acidity: "balanced",
    yeasts: {
      dry: { light: "enovini_ws", medium: "fermivin_ls2" },
      "semi-dry": { light: "enovini_ws", medium: "fermivin_ls2", strong: "fermivin_pdm" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_ls2", strong: "enovini" },
      sweet: { medium: "fermivin_pdm", strong: "enovini_baya" },
    },
  },
  "dark-grape": {
    id: "dark-grape",
    label: "Ciemne winogrona",
    kgPerLiter: 0.9,
    juiceYieldLPerKg: 0.63,
    sugarGPerKg: 155,
    acidity: "balanced",
    yeasts: {
      dry: { light: "enovini_ws", medium: "fermivin_vr5" },
      "semi-dry": { light: "enovini_ws", medium: "fermivin_vr5" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_vr5" },
      sweet: { medium: "fermivin_vr5", strong: "enovini" },
    },
  },
  "sour-cherry": {
    id: "sour-cherry",
    label: "Wiśnie",
    kgPerLiter: 1,
    juiceYieldLPerKg: 0.55,
    sugarGPerKg: 100,
    acidity: "balanced",
    yeasts: {
      dry: { light: "enovini_ws", medium: "fermivin_ls2" },
      "semi-dry": { light: "enovini_ws", medium: "fermivin_ls2" },
      "semi-sweet": { light: "enovini_ws", medium: "fermivin_vr5", strong: "enovini" },
      sweet: { medium: "fermivin_vr5", strong: "enovini" },
    },
  },
};

export const wineKindLabels: Record<WineKind, string> = {
  dry: "wytrawne",
  "semi-dry": "półwytrawne",
  "semi-sweet": "półsłodkie",
  sweet: "słodkie",
};

export const wineResidualSugarGPerL: Record<WineKind, number> = {
  dry: 4,
  "semi-dry": 12,
  "semi-sweet": 28,
  sweet: 58,
};

export const wineStrengthProfiles: Record<
  WineStrength,
  { additionalLabel: string; alc: number; label: string }
> = {
  light: {
    label: "lekkie",
    additionalLabel: "13-14%",
    alc: 13.5,
  },
  medium: {
    label: "średniej mocy",
    additionalLabel: "14-16%",
    alc: 15,
  },
  strong: {
    label: "mocne",
    additionalLabel: "16-18%",
    alc: 17,
  },
};

export const wineYeastProducts: Record<
  WineYeastId,
  { legacyId: string; label: string }
> = {
  enovini_truskawka: { legacyId: "400302", label: "Enovini Truskawka" },
  enovini_porzeczka: { legacyId: "400301", label: "Enovini Porzeczka" },
  enovini: { legacyId: "400300", label: "Enovini" },
  enovini_baya: { legacyId: "400360", label: "Enovini Baya" },
  enovini_ws: { legacyId: "400310", label: "Enovini WS" },
  fermivin_7013: { legacyId: "400340", label: "Fermivin 7013" },
  fermivin_ls2: { legacyId: "400320", label: "Fermivin LS2" },
  fermivin_pdm: { legacyId: "400330", label: "Fermivin PDM" },
  fermivin_vr5: { legacyId: "400350", label: "Fermivin VR5" },
};

export const tinctureFruitProfiles: Record<TinctureFruitId, TinctureFruitProfile> = {
  chokeberry: {
    id: "chokeberry",
    label: "Aronia",
    kgPerLiter: 0.7,
    sugarGPerKg: 300,
    juiceLPerKg: 0.22,
    acidity: "low",
    note: "owoce warto przemrozić, żeby złagodzić cierpkość",
  },
  rosehip: {
    id: "rosehip",
    label: "Dzika róża",
    kgPerLiter: 0.5,
    sugarGPerKg: 200,
    juiceLPerKg: 0.12,
    acidity: "low",
    note: "warto ją dobrze rozdrobnić i prowadzić macerację cierpliwie",
  },
  "common-quince": {
    id: "common-quince",
    label: "Pigwa",
    kgPerLiter: 0.5,
    sugarGPerKg: 350,
    juiceLPerKg: 0.18,
    acidity: "low",
    note: "owoce pokrój drobno, żeby dobrze oddały aromat",
  },
  quince: {
    id: "quince",
    label: "Pigwowiec",
    kgPerLiter: 0.5,
    sugarGPerKg: 400,
    juiceLPerKg: 0.18,
    acidity: "balanced",
    note: "mocny aromat lubi odrobinę wyższą słodycz",
  },
  "paradise-apple": {
    id: "paradise-apple",
    label: "Rajskie jabłuszka",
    kgPerLiter: 0.7,
    sugarGPerKg: 300,
    juiceLPerKg: 0.2,
    acidity: "balanced",
    note: "owoce umyj i pozbądź się czarnej końcówki",
  },
  plum: {
    id: "plum",
    label: "Śliwki węgierki",
    kgPerLiter: 0.6,
    sugarGPerKg: 250,
    juiceLPerKg: 0.3,
    acidity: "balanced",
    note: "dojrzałe owoce dobrze znoszą dłuższą macerację",
  },
  "sour-cherry": {
    id: "sour-cherry",
    label: "Wiśnie",
    kgPerLiter: 0.7,
    sugarGPerKg: 400,
    juiceLPerKg: 0.28,
    acidity: "balanced",
    note: "usuń pestki, jeśli zależy Ci na łagodniejszym profilu nalewki",
  },
};

export const cheeseRecipes: Record<CheeseId, CheeseRecipe> = {
  twarog: {
    id: "twarog",
    label: "Twaróg",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.17,
    targetTempC: "38-45°C",
    cultureLegacyId: "411243",
    cultureLabel: "kultury bakterii do twarogu",
    rennetMlPer10L: 0,
    saltGPerLiter: 0,
    calciumChloride: false,
    productLegacyIds: ["102501", "411243", "411290"],
    steps: [
      "Podgrzej mleko i zaszczep je kulturami, pilnując stabilnej temperatury dojrzewania.",
      "Po ukwaszeniu ogrzewaj masę powoli, aż serwatka zacznie się oddzielać od ziarna.",
      "Przełóż ziarno do chusty i odstaw do odcieku, najlepiej w chłodzie.",
    ],
  },
  "yogurt-cheese": {
    id: "yogurt-cheese",
    label: "Serek jogurtowy",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.92,
    targetTempC: "45-48°C",
    cultureLegacyId: "411240",
    cultureLabel: "kultury bakterii do jogurtu",
    rennetMlPer10L: 0,
    saltGPerLiter: 0,
    calciumChloride: false,
    productLegacyIds: ["801013", "411240", "102501"],
    steps: [
      "Podgrzej mleko, zaszczep je kulturami jogurtowymi i dobrze wymieszaj.",
      "Utrzymuj ciepło przez kilka godzin, aż jogurt zgęstnieje.",
      "Schłódź gotowy jogurt; dla serka jogurtowego przełóż go dodatkowo na chustę.",
    ],
  },
  country: {
    id: "country",
    label: "Ser wiejski",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.16,
    targetTempC: "38°C",
    cultureLegacyId: "411241",
    cultureLabel: "bakterie do sera greckiego",
    rennetMlPer10L: 10,
    saltGPerLiter: 8,
    calciumChloride: true,
    productLegacyIds: ["411241", "411201", "411305", "411310"],
    steps: [
      "Podgrzej mleko, dodaj kultury i odczekaj na ich pracę.",
      "Dodaj podpuszczkę, poczekaj na zwarty skrzep i pokrój go w kostkę.",
      "Odsącz ziarno, przełóż ser do pojemniczków i zalej jogurtem lub śmietaną.",
    ],
  },
  feta: {
    id: "feta",
    label: "Feta",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.16,
    targetTempC: "38°C",
    cultureLegacyId: "411241",
    cultureLabel: "kultury bakterii do sera greckiego",
    rennetMlPer10L: 10,
    saltGPerLiter: 30,
    calciumChloride: true,
    productLegacyIds: ["411241", "411207", "411305", "411313"],
    steps: [
      "Zaszczep mleko kulturami, a po krótkiej inkubacji dodaj podpuszczkę.",
      "Pokrój skrzep, delikatnie mieszaj i przełóż masę do chusty oraz formy.",
      "Po odcieku przygotuj solankę i trzymaj w niej ser do uzyskania właściwego smaku.",
    ],
  },
  gouda: {
    id: "gouda",
    label: "Gouda",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.11,
    targetTempC: "33-35°C",
    cultureLegacyId: "411242",
    cultureLabel: "kultury bakterii do sera gouda",
    rennetMlPer10L: 8,
    saltGPerLiter: 0,
    calciumChloride: true,
    productLegacyIds: ["411242", "411209", "411312", "411225", "411331"],
    steps: [
      "Podgrzej mleko, dodaj kultury, a następnie podpuszczkę.",
      "Pokrój skrzep, wymieszaj ziarno i stopniowo dogrzewaj masę.",
      "Prasuj ser, zasól go i przenieś do spokojnego dojrzewania.",
    ],
  },
  korycinski: {
    id: "korycinski",
    label: "Ser typu korycińskiego",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.15,
    targetTempC: "38°C",
    cultureLegacyId: "411241",
    cultureLabel: "kultury bakterii do sera greckiego",
    rennetMlPer10L: 10,
    saltGPerLiter: 8,
    calciumChloride: true,
    productLegacyIds: ["411241", "411207", "411312", "411331"],
    steps: [
      "Doprowadź mleko do temperatury pracy, dodaj kultury i podpuszczkę.",
      "Po utworzeniu skrzepu pokrój go i wybierz serwatkę z garnka.",
      "Przenieś ziarno do formy, odsączaj i obracaj ser w trakcie formowania.",
    ],
  },
  halloumi: {
    id: "halloumi",
    label: "Halloumi",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.13,
    targetTempC: "38°C",
    rennetMlPer10L: 12,
    saltGPerLiter: 30,
    calciumChloride: true,
    productLegacyIds: ["411207", "411305", "411310", "102501"],
    steps: [
      "Podgrzej mleko i dodaj podpuszczkę, żeby uzyskać mocny skrzep.",
      "Odsącz i uformuj ser, a następnie zaparz porcje w gorącej serwatce.",
      "Po zaparzeniu posól ser i schłódź go przed grillowaniem lub przechowaniem.",
    ],
  },
  korbacze: {
    id: "korbacze",
    label: "Ser typu korbacze",
    sourceLabel: "mleko",
    yieldKgPerLiter: 0.12,
    targetTempC: "38°C",
    rennetMlPer10L: 12,
    saltGPerLiter: 30,
    calciumChloride: true,
    productLegacyIds: ["411207", "411305", "102501"],
    steps: [
      "Podgrzej mleko i dodaj podpuszczkę, żeby uzyskać sprężysty skrzep.",
      "Po odcieku pokrój ser i zaparz go w gorącej wodzie.",
      "Wyciągaj i składaj masę, aż zacznie przypominać nitki, a potem powieś do wyschnięcia.",
    ],
  },
  ricotta: {
    id: "ricotta",
    label: "Ricotta z serwatki",
    sourceLabel: "serwatka",
    yieldKgPerLiter: 0.045,
    targetTempC: "85-90°C",
    rennetMlPer10L: 0,
    saltGPerLiter: 0,
    calciumChloride: false,
    productLegacyIds: ["102501", "411290", "139200"],
    steps: [
      "Podgrzej serwatkę niemal do wrzenia i zakwaś ją delikatnie.",
      "Mieszaj krótko, wyłącz grzanie i pozwól drobnym płatkom sera wypłynąć.",
      "Zbierz ser na chustę i odsączaj do ulubionej konsystencji.",
    ],
  },
};

export const milkTypeLabels: Record<MilkType, string> = {
  fresh: "mleko świeże",
  "low-pasteurized": "mleko niskopasteryzowane",
  whey: "serwatka",
};

export const rennetTypeLabels: Record<RennetType, string> = {
  microbial: "podpuszczka mikrobiologiczna",
  natural: "podpuszczka naturalna",
  powder: "podpuszczka w proszku",
};

export const rennetProductIds: Record<RennetType, string> = {
  microbial: "411201",
  natural: "411207",
  powder: "411200",
};

export const meatProfiles: Record<MeatKind, MeatProfile> = {
  pork: {
    id: "pork",
    label: "wieprzowina",
    dryDays: 5,
    wetDays: 7,
    saltGPerKg: 18,
  },
  "pork-loin": {
    id: "pork-loin",
    label: "schab wieprzowy",
    dryDays: 5,
    wetDays: 8,
    saltGPerKg: 18,
  },
};

export const meatMethodLabels = {
  "ham-cooker": "szynkowarzenie",
  scalding: "parzenie",
  "smoker-roasting": "podpiekanie w wędzarni",
} satisfies Record<MeatInput["method"], string>;

export const curingMethodLabels = {
  wet: "peklowanie na mokro",
  dry: "peklowanie na sucho",
} satisfies Record<MeatInput["curingMethod"], string>;

export const curingProductLabels: Record<CuringProduct, string> = {
  "curing-salt": "peklosól",
  "salt-and-saltpeter": "sól niejodowana i saletra potasowa",
};

export const furtherProcessingLabels: Record<FurtherProcessing, string> = {
  scalding: "parzenie",
  "warm-smoking": "wędzenie na ciepło",
  "smoker-roasting": "podpiekanie w wędzarni",
};

export const woodChipLabels: Record<WoodChip, string> = {
  alder: "olcha",
  beech: "buk",
  cherry: "czereśnia",
  oak: "dąb",
};

export const defaultInputs: CalculatorInputMap = {
  wine: {
    mode: "target-volume",
    fruitId: "dark-grape",
    targetLiters: 10,
    fruitKg: 12,
    wineKind: "semi-sweet",
    strength: "medium",
  },
  tincture: {
    mode: "recipe",
    fruitId: "chokeberry",
    fruitKg: 2,
    targetStrength: 32,
    spiritStrength: 95,
    targetLiters: 2,
    alcoholLiters: 1.4,
    secondAlcoholStrength: 40,
    secondAlcoholLiters: 0,
    juiceLiters: 0.5,
    waterLiters: 0.25,
    sugarG: 500,
  },
  cheese: {
    cheeseId: "korycinski",
    milkLiters: 10,
    milkType: "fresh",
    rennetType: "natural",
  },
  meat: {
    method: "ham-cooker",
    curingMethod: "wet",
    meatKind: "pork",
    meatKg: 1.5,
    pieceWeightG: 750,
    meatThicknessCm: 7,
    curingProduct: "curing-salt",
    hamCookerSizeKg: 1.5,
    furtherProcessing: "scalding",
    extraBrineLiters: 0,
    woodChip: "alder",
  },
};

export const getCalculatorDefinition = (id: CalculatorId) =>
  calculatorDefinitions.find((definition) => definition.id === id) ??
  calculatorDefinitions[0];

export const isCalculatorId = (value: string | null | undefined): value is CalculatorId =>
  calculatorIds.includes(value as CalculatorId);

export const getCalculatorAliasTarget = (path: string) => {
  switch (path) {
    case "/kalkulator-winiarski":
      return "wine";
    case "/kalkulator-nalewkowy":
      return "tincture";
    case "/kalkulator-serowarski":
      return "cheese";
    case "/kalkulator-wedliniarski":
      return "meat";
    default:
      return defaultCalculatorId;
  }
};

export const getDefaultInput = <T extends CalculatorId>(id: T): CalculatorInputMap[T] =>
  structuredClone(defaultInputs[id]);

export const getCheeseMilkType = (input: CheeseInput) =>
  input.cheeseId === "ricotta" ? "whey" : input.milkType;
