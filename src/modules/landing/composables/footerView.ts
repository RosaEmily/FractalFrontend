import type { FooterColumnView, FooterItem } from "../components/blocks/FooterBlock.vue";

/**
 * Arma lo que pinta el pie de página a partir de los datos del sitio. Es una
 * función pura: la landing le pasa lo publicado y el panel (vistas previas de
 * Pie, Contactos y Redes) le pasa el borrador, así los dos arman el pie igual.
 */
export interface FooterViewInput {
  brandText?: string | null;
  legalName?: string | null;
  locationText?: string | null;
  /** Columnas de enlaces que arma el panel (Sitio web → Pie de página). */
  columns?: { title: string; links: { label: string; href: string; external: boolean; icon: string }[] }[];
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  /** Enlace `wa.me` ya resuelto, o null si no hay número. */
  whatsappHref?: string | null;
  socialNetworks?: { name: string; url: string }[];
}

/* Respaldo mientras el panel no cargue estos textos, para que el pie no quede vacío. */
const BRAND_TEXT =
  "Centro Autodesk Authorized Training Center en Perú. Formación técnica especializada en BIM, AutoCAD y herramientas digitales para arquitectura, ingeniería y construcción.";
const LEGAL_NAME = "FRACTAL STUDIO S.A.C.";
const LOCATION_TEXT = "HECHO EN LIMA · PERÚ";

export function buildFooterView(input: FooterViewInput) {
  const { email, phone, address, whatsappHref } = input;

  /* Los canales son los que cargó el panel: sin dato, no se pinta. */
  const channels: (FooterItem | null)[] = [
    email ? { icon: "mail", label: email, href: `mailto:${email}` } : null,
    phone ? { icon: "phone", label: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` } : null,
    address ? { icon: "pin", label: address, href: "/contact" } : null,
    whatsappHref
      ? { icon: "whatsapp", label: "WhatsApp · Atención 24/7", href: whatsappHref, external: true }
      : null,
  ];
  const contact = channels.filter((i): i is FooterItem => i !== null);

  const custom: FooterColumnView[] = (input.columns ?? []).map((column) => ({
    title: column.title,
    items: column.links.map((link): FooterItem => ({
      label: link.label,
      href: link.href,
      external: link.external,
      icon: link.icon,
    })),
  }));

  /* El Libro de reclamaciones es una página propia y cierra la última columna. */
  const book: FooterItem = {
    label: "Libro de reclamaciones",
    href: "/libro-de-reclamaciones",
    icon: "book",
  };
  const last = custom[custom.length - 1];
  if (last) last.items.push(book);
  else custom.push({ title: "Compañía", items: [book] });

  return {
    brandText: input.brandText ?? BRAND_TEXT,
    legalName: input.legalName ?? LEGAL_NAME,
    locationText: input.locationText ?? LOCATION_TEXT,
    socialLinks: (input.socialNetworks ?? []).map((n) => ({
      name: n.name.toLowerCase(),
      href: n.url,
    })),
    columns: [{ title: "Contacto", items: contact }, ...custom],
  };
}
