import dayjs from "dayjs";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";
import type { BannerMeta } from "@/modules/admin/modules/content/modules/banners/models/banner.model";

/**
 * Deriva el mismo shape de `meta` que calcula
 * `BannerMetaService::buildMeta()` en el backend, pero en el FRONTEND —
 * necesario para el preview en vivo del formulario de banner: la oferta
 * elegida todavía no se guardó, así que no hay snapshot del servidor que leer
 * todavía. Al guardar, el backend recalcula el mismo dato desde cero: esto es
 * solo para no dejar el preview vacío mientras tanto.
 *
 * Duración: igual que `Landing\OfferResource::mapDurationMonths()`, días
 * entre el primer inicio y el último fin de los CURSOS de la oferta
 * (`course_items`), no del rango de matrícula — redondeados hacia arriba.
 */
export function buildOfferBannerMeta(offer: Offer | null): BannerMeta | null {
  if (!offer) return null;

  return {
    inicia: formatInicia(offer.enrollmentStartDate),
    duracion: formatDuracion(offer.courseItems),
    cupos: formatCupos(offer.maxStudents),
    precio: offer.price,
    // Solo los calcula el backend al guardar (`BannerMetaService::buildMeta()`);
    // acá el preview en vivo no los necesita, los muestra el bloque de resumen
    // aparte a partir de la oferta ya cargada.
    offerName: null,
    offerEnrollmentStartDate: null,
    offerEnrollmentEndDate: null,
  };
}

function formatInicia(date: string | null): string | null {
  if (!date) return null;
  return dayjs(date).format("DD MMM").toUpperCase();
}

function formatDuracion(
  courseItems: Offer["courseItems"],
): string | null {
  const starts = courseItems
    .map((c) => c.startDate)
    .filter((d): d is string => Boolean(d))
    .map((d) => dayjs(d));
  const ends = courseItems
    .map((c) => c.endDate)
    .filter((d): d is string => Boolean(d))
    .map((d) => dayjs(d));

  if (!starts.length || !ends.length) return null;

  const from = starts.reduce((a, b) => (a.isBefore(b) ? a : b));
  const to = ends.reduce((a, b) => (a.isAfter(b) ? a : b));

  const days = to.diff(from, "day");
  if (days < 0) return null;

  const months = Math.max(1, Math.ceil(days / 30));
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

/** `max_students = 0` significa SIN LÍMITE (regla del negocio), no "agotado". */
function formatCupos(maxStudents: number | null): string | null {
  if (maxStudents === null) return null;
  return maxStudents === 0 ? "Sin límite" : String(maxStudents);
}
