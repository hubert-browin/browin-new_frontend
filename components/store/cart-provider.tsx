"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { products } from "@/data/products";
import {
  freeShippingThreshold,
  getPrimaryVariant,
  getVariantById,
} from "@/lib/catalog";

type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

type CartDetailedLine = {
  product: (typeof products)[number];
  variant: ReturnType<typeof getPrimaryVariant>;
  quantity: number;
};

type CartContextValue = {
  isOpen: boolean;
  items: CartDetailedLine[];
  count: number;
  subtotal: number;
  shippingRemaining: number;
  shippingProgress: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, variantId?: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "browin-enterprise-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as CartLine[];

        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (line) =>
                typeof line?.productId === "string" &&
                typeof line?.variantId === "string" &&
                typeof line?.quantity === "number",
            ),
          );
        }
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

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [hasHydrated, lines]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const items = lines
    .map((line) => {
      const product = products.find((candidate) => candidate.id === line.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        variant: getVariantById(product, line.variantId),
        quantity: line.quantity,
      };
    })
    .filter((item): item is CartDetailedLine => Boolean(item));

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );
  const shippingRemaining = Math.max(freeShippingThreshold - subtotal, 0);
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (productId: string, variantId?: string, quantity = 1) => {
    const product = products.find((candidate) => candidate.id === productId);

    if (!product) {
      return;
    }

    const finalVariantId = variantId ?? getPrimaryVariant(product).id;

    setLines((current) => {
      const existing = current.find(
        (line) => line.productId === productId && line.variantId === finalVariantId,
      );

      if (!existing) {
        return [...current, { productId, variantId: finalVariantId, quantity }];
      }

      return current.map((line) =>
        line.productId === productId && line.variantId === finalVariantId
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      );
    });
    setIsOpen(true);
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter(
          (line) => !(line.productId === productId && line.variantId === variantId),
        );
      }

      return current.map((line) =>
        line.productId === productId && line.variantId === variantId
          ? { ...line, quantity }
          : line,
      );
    });
  };

  const removeItem = (productId: string, variantId: string) => {
    setLines((current) =>
      current.filter(
        (line) => !(line.productId === productId && line.variantId === variantId),
      ),
    );
  };

  const clearCart = () => setLines([]);

  return (
    <CartContext.Provider
      value={{
        isOpen,
        items,
        count,
        subtotal,
        shippingRemaining,
        shippingProgress,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
