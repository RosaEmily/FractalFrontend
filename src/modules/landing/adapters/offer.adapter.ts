import type { OfferDTO, OfferListDTO } from "../dto/offer.dto";
import type { Offer, OfferList, OfferStatus } from "../models/offer.model";

const STATUS_LABEL: Record<OfferStatus, string> = {
  open: "Inscripciones Abiertas",
  upcoming: "Inscripciones Cerradas",
  ongoing: "En Progreso",
  ended: "Finalizado",
};

const STATUS_CLASS: Record<OfferStatus, string> = {
  open: "bg-green-100 text-green-700",
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  ended: "bg-red-100 text-red-700",
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
