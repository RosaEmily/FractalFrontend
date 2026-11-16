import type { PaginationMeta } from "@/shared/interface/api-response";

export type { PaginationMeta };

export interface OfferCourse {
  name: string;
  description: string;
  image_url: string;
  image_alt: string;
  tags: string[];
  teacher: string;
  /** Datos del docente que guarda `teachers`; null si el curso no lo tiene. */
  teacher_detail: {
    document_number: string;
    first_name: string | null;
    last_name: string | null;
    social_networks: { linkedin?: string | null; other?: string | null; instagram?: string | null } | null;
    cv: string | null;
    specialty: string | null;
    experience_years: number | null;
    description: string | null;
    academic_degree_name: string | null;
    photo_url: string | null;
  } | null;
  start_date: string;
  end_date: string;
  schedules: { day: string; start_time: string; end_time: string }[];
}

export type OfferStatus = "open" | "upcoming" | "ongoing" | "ended";

export interface Offer {
  id: number;
  name: string;
  prefix: string;
  type: string;
  image_url: string;
  image_alt: string;
  href: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  min_students: number;
  max_students: number;
  enrolled_students_count: number;
  duration_days: number | null;
  duration_months: number | null;
  /** Para MOSTRAR ("1 mes y 3 semanas"); `duration_months` es para ordenar. */
  duration_label: string | null;
  /** Formateado por la API. Solo para MOSTRAR — `Number()` sobre esto da NaN. */
  price: string;
  /** Valor crudo, el que se usa para calcular. */
  price_raw: string | null;
  currency_id: number | null;
  courses: OfferCourse[];
  status: OfferStatus;
  status_label: string;
  status_class: string;
}

export interface OfferList {
  offers: Offer[];
  meta: PaginationMeta;
}

export interface OfferFilterState {
  types: string[];
  tags: number[];
  teachers: string[];
  currencies: number[];
  priceRange: [number, number];
  durationRange: [number, number];
}

export interface OfferFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface OfferFilterTagOption {
  id: number;
  name: string;
  count: number;
}

export interface OfferFilterTeacherOption {
  documentNumber: string;
  name: string;
  count: number;
}

export interface OfferFilterCurrencyOption {
  id: number;
  code: string;
  symbol: string;
  name: string;
  count: number;
}

export interface OfferFilterRange {
  min: number;
  max: number;
}

export interface OfferFilters {
  types: OfferFilterOption[];
  tags: OfferFilterTagOption[];
  teachers: OfferFilterTeacherOption[];
  currencies: OfferFilterCurrencyOption[];
  priceRange: OfferFilterRange;
  durationRange: OfferFilterRange;
}
