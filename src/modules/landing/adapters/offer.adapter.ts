import type { OfferDTO, OfferListDTO } from "../dto/offer.dto";
import type { Offer, OfferList, OfferStatus } from "../models/offer.model";

/*
 * Etiquetas del diseño V3 (`v3EstadoMatricula`). Hablan del PROGRAMA, no del
 * formulario: "Matrícula abierta" dice qué puede hacer el visitante, mientras
 * que "Inscripciones Cerradas" —el texto anterior— sonaba a puerta cerrada
 * incluso cuando el programa aún no empezaba.
 */
const STATUS_LABEL: Record<OfferStatus, string> = {
  open: "Matrícula abierta",
  upcoming: "Próximo inicio",
  ongoing: "En curso",
  ended: "Cerrado",
};

/*
 * Tonos del sistema V3, no la paleta cruda de Tailwind: `bg-green-100` no
 * existe en el @theme del proyecto y desentonaba con el resto de la landing.
 */
const STATUS_CLASS: Record<OfferStatus, string> = {
  open: "bg-success-soft text-success-DEFAULT",
  upcoming: "bg-amber-soft text-amber-DEFAULT",
  ongoing: "bg-info-soft text-info-DEFAULT",
  ended: "bg-secondary-100 text-secondary-500",
};

/*
 * Sobre TODOS los cursos del programa, no solo `courses[0]`: un programa con
 * varios cursos (línea de carrera) que ya dictó el primero pero sigue con
 * otros en curso no está "Cerrado" — mirar un único curso al azar del array
 * daba un estado que dependía del ORDEN en que el backend los devolviera, no
 * del programa completo.
 */
function resolveOfferStatus(dto: OfferDTO): OfferStatus {
  const now = new Date();
  const starts = dto.courses.map((c) => new Date(c.start_date)).filter((d) => !Number.isNaN(d.getTime()));
  const ends = dto.courses.map((c) => new Date(c.end_date)).filter((d) => !Number.isNaN(d.getTime()));
  const enrollEnd = new Date(dto.enrollment_end_date);

  // El programa terminó cuando TERMINÓ EL ÚLTIMO de sus cursos, no el primero.
  const lastCourseEnd = ends.length ? new Date(Math.max(...ends.map((d) => d.getTime()))) : null;
  // Y "en curso" apenas EMPIEZA el primero.
  const firstCourseStart = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : null;

  if (lastCourseEnd && lastCourseEnd < now) return "ended";
  if (firstCourseStart && firstCourseStart <= now) return "ongoing";
  if (enrollEnd < now) return "upcoming";
  return "open";
}

export const OfferAdapter = {
  one: (dto: OfferDTO): Offer => {
    const status = resolveOfferStatus(dto);
    return {
      ...dto,
      image_alt: `Imagen representativa de ${dto.name}`,
      href: `/programs/${dto.id}`,
      courses: dto.courses.map((c) => ({
        ...c,
        image_alt: `Imagen representativa de ${c.name}`,
      })),
      status,
      status_label: STATUS_LABEL[status],
      status_class: STATUS_CLASS[status],
    };
  },

  many: (dto: OfferDTO[], meta: OfferListDTO["meta"]): OfferList => ({
    offers: dto.map((o) => OfferAdapter.one(o)),
    meta,
  }),
};
