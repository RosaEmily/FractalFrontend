export interface TeacherDTO {
  document_number: string;
  document_type: string | null;
  specialty: string | null;
  experience_years: number | null;
  description: string | null;
  academic_degree: string | null;
  academic_degree_name: string | null;
  other_academic_degree: string | null;
  social_networks: Record<string, string> | null;
  phone: string | null;
  cv: string | null;
  is_favorite: number;
  status: number;
  created_at: string;
  updated_at: string;

  first_name: string;
  last_name: string;
  email: string;
  photo_url: string | null;
  gender: "m" | "f" | "o" | null;
  gender_name: string | null;
  user_id: number | null;
}

export interface TeacherBodyDTO {
  /** Instructor destacado: aparece primero en la grilla de la landing. */
  is_favorite?: boolean;
  document_type: string | null;
  document_number: string | null;
  specialty: string | null;
  experience_years: number | null;
  description: string | null;
  academic_degree: string | null;
  other_academic_degree: string | null;
  phone: string | null;
}
