import type { PaginationMeta } from "@/shared/interface/api-response";

export type { PaginationMeta };

export interface OfferCourse {
  name: string;
  description: string;
  image_url: string;
  image_alt: string;
  tags: string[];
  teacher: string;
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
  duration_days: number;
  duration_months: number;
  price: string;
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
  tags: string[];
  teachers: string[];
  priceRange: [number, number];
  durationRange: [number, number];
}
