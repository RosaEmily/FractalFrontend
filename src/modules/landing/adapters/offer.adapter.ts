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

function resolveOfferStatus(dto: OfferDTO): OfferStatus {
  const now = new Date();
  const courseEnd = new Date(dto.courses[0]?.end_date ?? "");
  const courseStart = new Date(dto.courses[0]?.start_date ?? "");
  const enrollEnd = new Date(dto.enrollment_end_date);
  if (courseEnd < now) return "ended";
  if (courseStart <= now) return "ongoing";
  if (enrollEnd < now) return "upcoming";
  return "open";
}

export const OfferAdapter = {
  one: (dto: OfferDTO): Offer => {
    const status = resolveOfferStatus(dto);
    return {
      ...dto,
      image_alt: `Imagen representativa de ${dto.name}`,
      href: "#",
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
