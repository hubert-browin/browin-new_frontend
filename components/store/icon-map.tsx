"use client";

import type { ComponentProps } from "react";

import {
  BookOpen,
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

import type { IconKey } from "@/data/store";

const iconMap = {
  beer: PintGlass,
  book: BookOpen,
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
} satisfies Record<IconKey, typeof Fire>;

type StoreIconProps = {
  icon: IconKey;
} & ComponentProps<typeof Fire>;

export function StoreIcon({ icon, ...props }: StoreIconProps) {
  const Icon = iconMap[icon];

  return <Icon {...props} />;
}
