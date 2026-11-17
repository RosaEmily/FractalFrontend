/**
 * Íconos disponibles para los enlaces del pie de página.
 *
 * Los usan el panel (selector) y la web pública (pie): un solo catálogo para que
 * lo que se elige sea exactamente lo que se dibuja. Cada valor es el interior de
 * un `<svg viewBox="0 0 24 24">` de trazo.
 */
export type FooterIconName =
  | "document"
  | "shield"
  | "users"
  | "building"
  | "briefcase"
  | "graduation"
  | "award"
  | "question"
  | "book"
  | "calendar"
  | "star"
  | "link"
  | "external"
  | "mail"
  | "phone";

export const FOOTER_ICONS: Record<FooterIconName, string> = {
  document:
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 1.8 4.5 5"/>',
  building:
    '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  graduation:
    '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  question:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17v.01"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  star: '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  external:
    '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
  phone:
    '<path d="M3 4h4l2 5-2 2c1 3 3 5 6 6l2-2 5 2v4s-1 0-2 0C10 21 3 14 3 6c0-1 0-2 0-2z"/>',
};

export const FOOTER_ICON_OPTIONS: { value: FooterIconName; label: string }[] = [
  { value: "document", label: "Documento" },
  { value: "shield", label: "Escudo (privacidad)" },
  { value: "users", label: "Personas (comunidad)" },
  { value: "building", label: "Edificio (empresas)" },
  { value: "briefcase", label: "Maletín" },
  { value: "graduation", label: "Graduación" },
  { value: "award", label: "Medalla (becas)" },
  { value: "question", label: "Pregunta" },
  { value: "book", label: "Libro" },
  { value: "calendar", label: "Calendario" },
  { value: "star", label: "Estrella" },
  { value: "link", label: "Enlace" },
  { value: "external", label: "Enlace externo" },
  { value: "mail", label: "Correo" },
  { value: "phone", label: "Teléfono" },
];

export const isFooterIcon = (value: unknown): value is FooterIconName =>
  typeof value === "string" && value in FOOTER_ICONS;

/** Ícono que se usa cuando el enlace no eligió uno. */
export const defaultFooterIcon = (type: "page" | "url" | "faqs"): FooterIconName =>
  type === "faqs" ? "question" : type === "url" ? "external" : "document";
