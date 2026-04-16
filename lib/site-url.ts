const LOCAL_FALLBACK_ORIGIN = "http://127.0.0.1:3000";

export function getSiteUrl() {
  const configuredSiteUrl =
    process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredSiteUrl) {
    return LOCAL_FALLBACK_ORIGIN;
  }

  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    return LOCAL_FALLBACK_ORIGIN;
  }
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}
