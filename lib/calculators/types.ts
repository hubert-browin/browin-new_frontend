import type { Product } from "@/data/products";

export type CalculatorId = "wine" | "tincture" | "cheese" | "meat";

export type CalculatorProductRef = {
  legacyId?: string;
  label: string;
  quantity: number;
  fallbackQuery?: string;
  optional?: boolean;
};

export type CalculatorDefinition = {
  id: CalculatorId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  legacyHref: string;
  accentLabel: string;
};

export type CalculatorSummaryItem = {
  label: string;
  value: string;
};

export type CalculatorIngredient = {
  label: string;
  value: string;
  detail?: string;
};

export type CalculatorResult = {
  calculatorId: CalculatorId;
  title: string;
  lead: string;
  summary: CalculatorSummaryItem[];
  ingredients: CalculatorIngredient[];
  steps: string[];
  warnings: string[];
  productRefs: CalculatorProductRef[];
};

export type ResolvedCalculatorProduct = {
  ref: CalculatorProductRef;
  product: Product;
  matchType: "legacy" | "fallback";
};

export type WineFruitId =
  | "gooseberry"
  | "dark-grape"
  | "white-grape"
  | "apple"
  | "pear"
  | "blackberry"
  | "raspberry"
  | "strawberry"
  | "plum"
  | "sour-cherry"
  | "redcurrant"
  | "blackcurrant"
  | "sweet-cherry"
  | "chokeberry";

export type WineKind = "dry" | "semi-dry" | "semi-sweet" | "sweet";
export type WineStrength = "light" | "medium" | "strong";
export type WineMode = "target-volume" | "fruit-weight";

export type WineInput = {
  mode: WineMode;
  fruitId: WineFruitId;
  targetLiters: number;
  fruitKg: number;
  wineKind: WineKind;
  strength: WineStrength;
};

export type TinctureFruitId =
  | "chokeberry"
  | "quince"
  | "common-quince"
  | "paradise-apple"
  | "plum"
  | "rosehip"
  | "sour-cherry";
export type TinctureMode = "recipe" | "abv" | "dilution";

export type TinctureInput = {
  mode: TinctureMode;
  fruitId: TinctureFruitId;
  fruitKg: number;
  targetStrength: number;
  spiritStrength: number;
  targetLiters: number;
  alcoholLiters: number;
  secondAlcoholStrength: number;
  secondAlcoholLiters: number;
  juiceLiters: number;
  waterLiters: number;
  sugarG: number;
};

export type CheeseId =
  | "twarog"
  | "yogurt-cheese"
  | "feta"
  | "gouda"
  | "korycinski"
  | "korbacze"
  | "halloumi"
  | "ricotta"
  | "country";

export type MilkType = "fresh" | "low-pasteurized" | "whey";
export type RennetType = "microbial" | "natural" | "powder";

export type CheeseInput = {
  cheeseId: CheeseId;
  milkLiters: number;
  milkType: MilkType;
  rennetType: RennetType;
};

export type MeatMethod = "ham-cooker" | "scalding" | "smoker-roasting";
export type MeatCuringMethod = "wet" | "dry";
export type MeatKind = "pork" | "pork-loin";
export type CuringProduct = "curing-salt" | "salt-and-saltpeter";
export type FurtherProcessing = "scalding" | "warm-smoking" | "smoker-roasting";
export type WoodChip = "alder" | "beech" | "cherry" | "oak";

export type MeatInput = {
  method: MeatMethod;
  curingMethod: MeatCuringMethod;
  meatKind: MeatKind;
  meatKg: number;
  pieceWeightG: number;
  meatThicknessCm: number;
  curingProduct: CuringProduct;
  hamCookerSizeKg: number;
  furtherProcessing: FurtherProcessing;
  extraBrineLiters: number;
  woodChip: WoodChip;
};

export type CalculatorInputMap = {
  wine: WineInput;
  tincture: TinctureInput;
  cheese: CheeseInput;
  meat: MeatInput;
};
