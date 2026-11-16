/** `course` = testimonio de un curso puntual · `learning_path` = de una línea. */
export type TestimonialSubjectType = "course" | "learning_path";

export interface TestimonialDTO {
  id: number;
  /** Un testimonio cuelga de UNO de los dos, nunca de ambos. */
  enrollment_course_id: number | null;
  enrollment_item_id: number | null;
  /** Admite medias estrellas (3.5); MySQL lo serializa como string. */
  rating: string;
  body: string;
  is_featured: boolean;
  /** Resueltos por el Resource: el listado necesita saber de quién y de qué es. */
  student_name: string | null;
  student_document: string | null;
  student_career: string | null;
  subject_name: string | null;
  subject_type: TestimonialSubjectType;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * ⚠️ Alta admin solo admite curso puntual: no existe todavía un selector de
 * línea de carrera (`enrollment_item_id`) en el panel, mismo estado que
 * `certificates` (el diploma de línea tampoco se puede emitir desde acá).
 */
export interface TestimonialBodyDTO {
  enrollment_course_id: number | null;
  rating: number | null;
  body: string | null;
}

/** Edición: nunca se reasignan los FKs, solo el contenido y la curación. */
export interface TestimonialUpdateBodyDTO {
  rating?: number;
  body?: string;
  is_featured?: boolean;
  status?: number;
}
