export const CUSTOMER_SESSION_STORAGE_KEY = "browin-demo-customer-session";
export const CUSTOMER_SESSION_CHANGED_EVENT = "browin-demo-customer-session-change";

export type CustomerSession = {
  createdAt: string;
  email: string;
  name: string;
  provider: "form" | "google";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const parseCustomerSession = (value: unknown): CustomerSession | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.email !== "string" ||
    typeof value.name !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  return {
    createdAt: value.createdAt,
    email: value.email.trim(),
    name: value.name.trim() || "Klient BROWIN",
    provider: value.provider === "google" ? "google" : "form",
  };
};

export const getCustomerSessionSnapshot = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getCustomerSessionServerSnapshot = () => null;

export const parseCustomerSessionSnapshot = (snapshot: string | null) => {
  if (!snapshot) {
    return null;
  }

  try {
    return parseCustomerSession(JSON.parse(snapshot));
  } catch {
    return null;
  }
};

export const readCustomerSession = (): CustomerSession | null =>
  parseCustomerSessionSnapshot(getCustomerSessionSnapshot());

export const hasCustomerSession = () => Boolean(readCustomerSession());

export const subscribeCustomerSession = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, onStoreChange);
  };
};

export const notifyCustomerSessionChanged = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
};

export const writeCustomerSession = (session: CustomerSession) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CUSTOMER_SESSION_STORAGE_KEY, JSON.stringify(session));
  notifyCustomerSessionChanged();
};

export const clearCustomerSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
  notifyCustomerSessionChanged();
};
