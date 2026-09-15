import type { DataPaginationMeta } from "@/shared/interface/api-response";

export interface OfferScheduleDTO {
  day: string;
  start_time: string;
  end_time: string;
}

export interface OfferCourseDTO {
  name: string;
  description: string;
  image_url: string;
  tags: string[];
  teacher: string;
  /** Datos del docente que guarda `teachers`; null si el curso no lo tiene. */
  teacher_detail: {
    specialty: string | null;
    experience_years: number | null;
    description: string | null;
    academic_degree_name: string | null;
    photo_url: string | null;
  } | null;
  start_date: string;
  end_date: string;
  schedules: OfferScheduleDTO[];
}

export interface OfferDTO {
  id: number;
  name: string;
  prefix: string;
  type: string;
  image_url: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  min_students: number;
  max_students: number;
  enrolled_students_count: number;
  duration_days: number;
  duration_months: number | null;
  /** Formateado por la API (`"$ 199.99"`). Solo para MOSTRAR. */
  price: string;
  /** Valor crudo (`"199.99"`). Es el que se usa para calcular. */
  price_raw: string | null;
  currency_id: number | null;
  courses: OfferCourseDTO[];
}

export type OfferListDTO = DataPaginationMeta<OfferDTO>;
