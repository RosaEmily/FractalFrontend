import { safeHref } from "./safe-url";

/**
 * Markdown mínimo y seguro para las páginas informativas del sitio.
 *
 * Soporta títulos (`#`, `##`, `###`), listas (`- `), párrafos, **negrita**,
 * *cursiva* y [enlaces](url). Todo lo demás es texto plano.
 *
 * Es seguro para `v-html` porque escapa el HTML ANTES de aplicar el formato y
 * solo deja pasar enlaces `https://`, `http://`, `mailto:`, `tel:` y rutas
 * internas (`/...`): un `javascript:` queda como texto.
 */
const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inline = (escaped: string): string =>
  escaped
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
      // `&amp;` dentro de la URL ya viene escapado; se desescapa solo para comprobar el esquema.
      const raw = url.replace(/&amp;/g, "&");
      if (!safeHref(raw)) return `${label} (${url})`;
      // Una ruta del propio sitio (`/contact`) se abre en la misma pestaña; el resto, en una nueva.
      return raw.startsWith("/")
        ? `<a href="${url}">${label}</a>`
        : `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");

export function renderMarkdown(source: string | null | undefined): string {
  const lines = escapeHtml(source ?? "").split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    }
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    const item = /^[-*]\s+(.+)$/.exec(trimmed);

    if (!trimmed) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = (heading[1] as string).length + 1; // # → h2: el h1 es el título de la página
      html.push(`<h${level}>${inline(heading[2] as string)}</h${level}>`);
    } else if (item) {
      flushParagraph();
      list.push(item[1] as string);
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  flushList();

  return html.join("\n");
}
