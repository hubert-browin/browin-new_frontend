"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FavoritesContextValue = {
  favoriteIds: string[];
  count: number;
  isFavorite: (productId: string) => boolean;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
};

const STORAGE_KEY = "browin-enterprise-favorites";

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const sanitizeFavoriteIds = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((entry): entry is string => typeof entry === "string")),
  );
};

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setFavoriteIds(sanitizeFavoriteIds(JSON.parse(stored)));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds, hasHydrated]);

  const addFavorite = (productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId) ? current : [...current, productId],
    );
  };

  const removeFavorite = (productId: string) => {
    setFavoriteIds((current) => current.filter((id) => id !== productId));
  };

  const toggleFavorite = (productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        count: favoriteIds.length,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
