export const RECIPEBOOK_LAST_HREF_STORAGE_KEY = "browin.recipebook.lastHref";
export const RECIPEBOOK_LAST_LIST_HREF_STORAGE_KEY =
  "browin.recipebook.lastListHref";
export const RECIPEBOOK_SCROLL_STORAGE_KEY_PREFIX = "browin.recipebook.scroll:";

export const isRecipebookPathname = (pathname: string) =>
  pathname === "/przepisnik" || pathname.startsWith("/przepisnik/");

export const isRecipebookHref = (href: string) =>
  href === "/przepisnik" ||
  href.startsWith("/przepisnik?") ||
  href.startsWith("/przepisnik/");

export const isRecipebookListHref = (href: string) =>
  href === "/przepisnik" || href.startsWith("/przepisnik?");

export const normalizeRecipebookHref = (href: string | null) => {
  const trimmedHref = href?.trim() ?? "";

  return isRecipebookHref(trimmedHref) ? trimmedHref : "/przepisnik";
};

export const normalizeRecipebookListHref = (href: string | null) => {
  const trimmedHref = href?.trim() ?? "";

  return isRecipebookListHref(trimmedHref) ? trimmedHref : "/przepisnik";
};

export const buildCurrentRouteHref = (pathname: string, search: string) =>
  search ? `${pathname}?${search}` : pathname;

export const getRecipebookScrollStorageKey = (href: string) =>
  `${RECIPEBOOK_SCROLL_STORAGE_KEY_PREFIX}${href}`;
