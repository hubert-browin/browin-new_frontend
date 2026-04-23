"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function RecipeListBackButton() {
  const router = useRouter();

  const handleReturn = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/przepisnik");
  };

  return (
    <button
      className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark/42 transition-colors hover:text-browin-red md:hidden"
      onClick={handleReturn}
      type="button"
    >
      <ArrowLeft size={13} weight="bold" />
      Wróć do listy
    </button>
  );
}
