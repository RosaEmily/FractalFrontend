import type { RouteLocationRaw } from "vue-router";

/**
 * A dónde lleva cada asunto de "Requiere tu atención".
 *
 * La clave es el `key` que manda la API. Un asunto sin entrada acá se
 * renderiza sin enlace, así que se puede agregar un aviso nuevo en el
 * backend sin romper la pantalla.
 */
export const ATTENTION_ROUTES: Record<string, RouteLocationRaw | undefined> = {
  offers_below_minimum: { name: "offers.list" },
  offers_over_maximum: { name: "offers.list" },
  offers_without_sessions: { name: "classSessions.list" },
  pending_payments: { name: "enrollments.list" },
  evaluation_weights: { name: "courseEvaluations.list" },
  certificates_pending: { name: "certificates.list" },
};

/** Etiquetas de estado de una clase, según el diseño. */
export const CLASS_STATE_LABELS = {
  done: "Dictada",
  in_progress: "En curso",
  upcoming: "Próxima",
} as const;
