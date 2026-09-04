export type OfferType = "course" | "learning_path";

export interface OfferScheduleDTO {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface OfferCourseItemDTO {
  id: number;
  course_id: number;
  name: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  meet_link: string | null;
  schedules: OfferScheduleDTO[];
}

export interface OfferDTO {
  id: number;
  name: string;
  prefix: string | null;
  type: OfferType;
  learning_path_id: number | null;
  enrollment_start_date: string;
  enrollment_end_date: string;
  min_students: number;
  max_students: number;
  enrolled_students_count: number;
  /** Precio formateado por la API. Solo para mostrar. */
  price: string | null;
  price_raw: string | null;
  currency_id: number;
  image_url: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  learning_path: string | null;
  /** Cursos con ids y valores crudos — para reconstruir el formulario. */
  course_items: OfferCourseItemDTO[];
}

/** Body de horario: `id` presente = actualiza, ausente = crea. */
export interface OfferScheduleBodyDTO {
  id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface OfferCourseBodyDTO {
  id?: number;
  course_id: number;
  teacher_id: string;
  start_date: string;
  end_date: string;
  meet_link?: string | null;
  schedules: OfferScheduleBodyDTO[];
}

export interface OfferBodyDTO {
  name: string | null;
  prefix: string | null;
  type: OfferType | null;
  learning_path_id: number | null;
  enrollment_start_date: string | null;
  enrollment_end_date: string | null;
  min_students: number | null;
  max_students: number | null;
  price: number | null;
  currency_id: number | null;
  courses: OfferCourseBodyDTO[];
}
