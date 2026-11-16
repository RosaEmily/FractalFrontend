import type {
  OfferFilterRangeDTO,
  OfferFiltersDTO,
} from "../dto/offer-filters.dto";
import type { OfferFilterRange, OfferFilters } from "../models/offer.model";

/*
 * Con ninguna oferta activa, `price_range`/`duration_range` llegan
 * `{ min: null, max: null }` (sin filas que agregar). El slider necesita
 * SIEMPRE un rango numérico: se cae a `fallback` en vez de propagar `null`.
 */
function toRange(dto: OfferFilterRangeDTO, fallback: OfferFilterRange): OfferFilterRange {
  const min = dto.min === null ? null : Number(dto.min);
  const max = dto.max === null ? null : Number(dto.max);

  if (min === null || max === null || Number.isNaN(min) || Number.isNaN(max)) {
    return fallback;
  }

  return { min, max };
}

export const OfferFiltersAdapter = {
  one: (dto: OfferFiltersDTO): OfferFilters => ({
    types: dto.types,
    tags: dto.tags,
    teachers: dto.teachers.map((t) => ({
      documentNumber: t.document_number,
      name: t.name,
      count: t.count,
    })),
    currencies: dto.currencies,
    priceRange: toRange(dto.price_range, { min: 0, max: 1 }),
    durationRange: toRange(dto.duration_range, { min: 1, max: 1 }),
  }),
};
