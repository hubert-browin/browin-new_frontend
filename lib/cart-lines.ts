export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

export const mergeCartLines = (current: CartLine[], additions: CartLine[]) => {
  const lineMap = new Map<string, CartLine>();

  for (const line of current) {
    if (line.quantity <= 0) {
      continue;
    }

    lineMap.set(`${line.productId}::${line.variantId}`, { ...line });
  }

  for (const line of additions) {
    if (line.quantity <= 0) {
      continue;
    }

    const key = `${line.productId}::${line.variantId}`;
    const existing = lineMap.get(key);

    lineMap.set(
      key,
      existing
        ? { ...existing, quantity: existing.quantity + line.quantity }
        : { ...line },
    );
  }

  return [...lineMap.values()];
};
