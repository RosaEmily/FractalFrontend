export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url)) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^(mailto:|tel:)/i.test(url)) return url;
  return safeWebUrl(url);
}

export function safeWebUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!/^https?:\/\//i.test(raw) || /[\u0000-\u0020\u007f\\]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    return url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
