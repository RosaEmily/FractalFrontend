import type { Banner, BannerMeta } from "../models/banner.model";
import type { BannerDTO, BannerMetaDTO } from "../dto/banner.dto";

const metaAdapter = (meta: BannerMetaDTO | null): BannerMeta | null => {
  if (!meta) return null;

  return {
    inicia: meta.inicia,
    duracion: meta.duracion,
    cupos: meta.cupos,
    precio: meta.precio,
    offerName: meta.offer_name,
    offerEnrollmentStartDate: meta.offer_enrollment_start_date,
    offerEnrollmentEndDate: meta.offer_enrollment_end_date,
  };
};

export const bannerAdapter = {
  one: (dto: BannerDTO): Banner => ({
    id: dto.id,
    desktop: dto.desktop,
    mobile: dto.mobile,
    alt_desktop: dto.alt_desktop,
    alt_mobile: dto.alt_mobile,
    tag: dto.tag,
    kicker: dto.kicker,
    title: dto.title,
    sub: dto.sub,
    cta: dto.cta,
    cta2: dto.cta2,
    // Banners viejos (creados antes de que este campo existiera) llegan sin
    // `dark` en absoluto — se normaliza a `false` acá, en vez de dejar que
    // `undefined` viaje hasta el formulario y Zod lo rechace en silencio.
    dark: dto.dark ?? false,
    order: dto.order,
    offerId: dto.offer_id,
    meta: metaAdapter(dto.meta),
  }),

  many: (dtos: BannerDTO[]): Banner[] =>
    dtos.map((dto) => bannerAdapter.one(dto)),
};
