/**
 * El título de un banner es texto libre con UNA porción acentuada, marcada
 * con `**...**` (mismo shape que escribe el admin en `title`). Se usa tanto
 * en el carrusel público (`BannerSection`) como en su preview del admin —
 * vive acá para no duplicar el parseo entre los dos.
 */
export interface BannerTitlePart {
  text: string;
  accent: boolean;
}

const ACCENT_PATTERN = /\*\*(.+?)\*\*/;

/**
 * Divide el título en como máximo 3 partes (antes / acento / después),
 * igual que `titleParts` del mockup original. Sin `**...**`, el título entero
 * es una sola parte sin acento.
 */
export function parseBannerTitle(title: string | null | undefined): BannerTitlePart[] {
  if (!title) return [];

  const match = title.match(ACCENT_PATTERN);
  if (!match || !match[1]) {
    return [{ text: title, accent: false }];
  }

  const [full, accentText] = match;
  const before = title.slice(0, match.index).trim();
  const after = title.slice((match.index ?? 0) + full.length).trim();

  const parts: BannerTitlePart[] = [];
  if (before) parts.push({ text: before, accent: false });
  parts.push({ text: accentText, accent: true });
  if (after) parts.push({ text: after, accent: false });

  return parts;
}
