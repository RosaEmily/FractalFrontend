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
  duration_months: number;
  price: string;
  courses: OfferCourseDTO[];
}

export type OfferListDTO = DataPaginationMeta<OfferDTO>;
