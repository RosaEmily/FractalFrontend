/**
 * Query params reales de `GET landing/offers` (listado filtrado). Los
 * arrays (`types`, `tags`, `teachers`, `currencies`) los serializa axios como
 * `campo[]=valor` — formato de bracket que el backend ya lee para
 * `filters`/relaciones N:N (`course_tags`, `offer_courses.teacher_id`).
 */
export interface OfferQueryParams {
  page?: string;
  offset?: string;
  limit?: string;
  order?: string;
  /** Filtro genérico `filterSortAndPaginate` (JSON de PrimeVue), usado por el Home. */
  filters?: string;
  types?: string[];
  tags?: number[];
  teachers?: string[];
  currencies?: number[];
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
}
