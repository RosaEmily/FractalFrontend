export type TestimonialSubjectType = "course" | "learning_path";

/** Respuesta de `classroom/me/testimonials`: el propio testimonio, o null. */
export interface StudentTestimonialDTO {
  id: number;
  enrollment_course_id: number | null;
  enrollment_item_id: number | null;
  rating: string;
  body: string;
  is_featured: boolean;
  status: number;
  student_name: string | null;
  student_document: string | null;
  student_career: string | null;
  subject_name: string | null;
  subject_type: TestimonialSubjectType;
  created_at: string;
  updated_at: string;
}

export interface StudentTestimonialBodyDTO {
  enrollment_course_id?: number | null;
  enrollment_item_id?: number | null;
  rating: number;
  body: string;
}
