/**
 * Etiquetas de la web pública.
 *
 * La BD guarda claves técnicas en inglés (`offers.type` = `course` /
 * `learning_path`) y en pantalla tienen que leerse en español: un visitante no
 * debería ver `learning_path` en la tarjeta de un programa.
 */

/** `offers.type`, con los nombres que usa el diseño. */
export const OFFER_TYPE_LABEL: Record<string, string> = {
  course: "Curso",
  learning_path: "Línea de carrera",
};

/** Etiqueta legible de un tipo de oferta; si llega uno nuevo, se muestra tal cual. */
export const offerTypeLabel = (type: string | null | undefined): string =>
  (type && OFFER_TYPE_LABEL[type]) || type || "—";
