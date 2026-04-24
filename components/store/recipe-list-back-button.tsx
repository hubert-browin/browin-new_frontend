"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import {
  RECIPEBOOK_LAST_HREF_STORAGE_KEY,
  RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY,
  normalizeRecipebookListHref,
} from "@/lib/recipebook-navigation";

export function RecipeListBackButton() {
  const router = useRouter();

  const handleReturn = () => {
    let recipebookListHref = "/przepisnik";

    try {
      recipebookListHref = normalizeRecipebookListHref(
        window.sessionStorage.getItem(RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY) ??
          window.sessionStorage.getItem(RECIPEBOOK_LAST_HREF_STORAGE_KEY),
      );
    } catch {
      recipebookListHref = "/przepisnik";
    }

    router.push(recipebookListHref);
  };

  return (
    <button
      className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-browin-dark/62 transition-colors hover:text-browin-red md:hidden"
      onClick={handleReturn}
      type="button"
    >
      <ArrowLeft size={13} weight="bold" />
      Wróć do przepiśnika
    </button>
  );
}
