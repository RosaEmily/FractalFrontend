export interface TeacherDTO {
  /** PK real del docente — es lo que `offer_courses.teacher_id` referencia. */
  document_number: string;
  document_type: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  experience_years: number;
  academic_degree_name: string | null;
  photo_url: string | null;
  is_favorite: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}
