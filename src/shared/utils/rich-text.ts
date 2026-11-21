import DOMPurify from "dompurify";
import { renderMarkdown } from "./markdown";
import { safeHref } from "./safe-url";

/**
 * Contenido enriquecido del sitio (páginas informativas): HTML escrito con el
 * editor del panel. La API ya lo sanea al guardar; aquí se vuelve a sanear al
 * PINTARLO (defensa en profundidad: el dato viaja por un JSON editable y por
 * `v-html`). Misma lista blanca que `App\Shared\Helpers\HtmlSanitizer`.
 *
 * Las páginas guardadas antes del editor están en Markdown: `toRichHtml` las
 * reconoce (no empiezan con una etiqueta) y las convierte.
 */

/** Tipografías del editor; deben coincidir con `HtmlSanitizer::FONTS`. */
export const RICH_FONTS = [
  { label: "Inter Tight", value: "Inter Tight" },
  { label: "Bricolage Grotesque", value: "Bricolage Grotesque" },
  { label: "JetBrains Mono", value: "JetBrains Mono" },
  { label: "Georgia", value: "Georgia" },
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
] as const;

export const RICH_FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40] as const;

export const RICH_LINE_HEIGHTS = [
  { label: "Compacto", value: "1.2" },
  { label: "Normal", value: "1.5" },
  { label: "Amplio", value: "1.75" },
  { label: "Doble", value: "2" },
] as const;

export const RICH_COLORS = [
  "#1c1917", "#57534e", "#a8a29e", "#e94e1b", "#dc2626", "#d97706",
  "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#ffffff",
] as const;

export const RICH_HIGHLIGHTS = ["#fff3a0", "#fed7aa", "#bbf7d0", "#bae6fd", "#ddd6fe", "#fbcfe8"] as const;

const ALLOWED_TAGS = [
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "sub", "sup",
  "ul", "ol", "li", "blockquote", "hr", "code", "pre", "a", "span",
  "table", "thead", "tbody", "tr", "th", "td",
];
const ALLOWED_ATTR = ["href", "target", "rel", "style", "colspan", "rowspan", "width"];
const ALLOWED_STYLES = new Set(["color", "background-color", "font-size", "font-family", "text-align", "line-height"]);
const FONT_NAMES = new Set([...RICH_FONTS.map((f) => f.value.toLowerCase()), "sans-serif", "serif", "monospace"]);

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i;
const SIZE = /^\d+(\.\d+)?(px|rem|em|%)$/i;
const LINE = /^\d(\.\d{1,2})?$/;
const ALIGN = /^(left|right|center|justify)$/i;

const validStyle = (prop: string, value: string): boolean => {
  if (!ALLOWED_STYLES.has(prop) || /url\(|expression|javascript:|[<>\\]/i.test(value)) return false;
  if (prop === "color" || prop === "background-color") return COLOR.test(value);
  if (prop === "font-size") return SIZE.test(value);
  if (prop === "text-align") return ALIGN.test(value);
  if (prop === "line-height") return LINE.test(value) || SIZE.test(value);
  // font-family: todas las familias deben estar en la lista.
  return value.split(",").every((f) => FONT_NAMES.has(f.trim().replace(/^["']|["']$/g, "").toLowerCase()));
};

let configured = false;
const configure = () => {
  if (configured) return;
  configured = true;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (!(node instanceof HTMLElement)) return;
    const style = node.getAttribute("style");
    if (style !== null) {
      const kept = style
        .split(";")
        .map((d) => d.split(/:(.+)/).map((x) => x?.trim()))
        .filter(([prop, value]) => prop && value && validStyle(prop.toLowerCase(), value))
        .map(([prop, value]) => `${(prop as string).toLowerCase()}:${value}`)
        .join(";");
      if (kept) node.setAttribute("style", kept);
      else node.removeAttribute("style");
    }
    if (node.hasAttribute("width")) {
      const w = parseInt(node.getAttribute("width") ?? "", 10);
      const ok = (node.tagName === "TD" || node.tagName === "TH") && /^\d{2,4}$/.test(node.getAttribute("width") ?? "") && w >= 30 && w <= 1200;
      if (ok) node.setAttribute("width", String(w));
      else node.removeAttribute("width");
    }
    if ((node.tagName === "TD" || node.tagName === "TH") && node.hasAttribute("colspan")) {
      const c = parseInt(node.getAttribute("colspan") ?? "", 10);
      if (!(c >= 1 && c <= 6)) node.removeAttribute("colspan");
    }
    if ((node.tagName === "TD" || node.tagName === "TH") && node.hasAttribute("rowspan")) {
      const r = parseInt(node.getAttribute("rowspan") ?? "", 10);
      if (!(r >= 1 && r <= 12)) node.removeAttribute("rowspan");
    }
    if (node.tagName === "A") {
      const href = safeHref(node.getAttribute("href"));
      if (!href) node.removeAttribute("href");
      if (node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer");
      else node.removeAttribute("target");
    }
  });
};

export function sanitizeRichHtml(html: string | null | undefined): string {
  configure();
  return DOMPurify.sanitize(html ?? "", { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
}

/** ¿Es HTML del editor (y no Markdown de antes)? */
export const isRichHtml = (content: string | null | undefined): boolean => /^\s*</.test(content ?? "");

/** HTML listo para el editor y para `v-html`, venga el dato en HTML o en Markdown viejo. */
export function toRichHtml(content: string | null | undefined): string {
  if (!content) return "";
  return sanitizeRichHtml(isRichHtml(content) ? content : renderMarkdown(content));
}
