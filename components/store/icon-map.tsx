"use client";

import type { ComponentProps } from "react";

import {
  ChartPieSlice,
  Fire,
  Flask,
  Gift,
  Grains,
  House,
  Package,
  PintGlass,
  ShieldCheck,
  Sparkle,
  Star,
  Thermometer,
  Timer,
  Truck,
  Users,
  Wine,
} from "@phosphor-icons/react";

import { RecipebookIcon } from "@/components/store/recipebook-icon";
import type { IconKey } from "@/data/store";

const iconMap = {
  beer: PintGlass,
  cheese: ChartPieSlice,
  fire: Fire,
  flask: Flask,
  gift: Gift,
  grain: Grains,
  house: House,
  package: Package,
  shield: ShieldCheck,
  sparkle: Sparkle,
  star: Star,
  thermometer: Thermometer,
  timer: Timer,
  truck: Truck,
  users: Users,
  wine: Wine,
} satisfies Record<Exclude<IconKey, "book">, typeof Fire>;

type StoreIconProps = {
  icon: IconKey;
} & ComponentProps<typeof Fire>;

export function StoreIcon({ icon, ...props }: StoreIconProps) {
  if (icon === "book") {
    return <RecipebookIcon {...props} />;
  }

  const Icon = iconMap[icon];

  return <Icon {...props} />;
}
