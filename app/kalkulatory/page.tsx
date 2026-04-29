import type { Metadata } from "next";

import { CalculatorHub } from "@/components/store/calculators/calculator-hub";
import { getCalculatorIdFromParam } from "@/lib/calculators";
import { getProducts } from "@/lib/product-feed";

type SearchParamRecord = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Kalkulatory",
  description:
    "Kalkulatory BROWIN do domowego wina, nalewek, serów i wędlin z recepturą oraz produktami do koszyka.",
};

export default async function CalculatorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  const initialCalculatorId = getCalculatorIdFromParam(params.calculator);

  return <CalculatorHub initialCalculatorId={initialCalculatorId} products={products} />;
}
