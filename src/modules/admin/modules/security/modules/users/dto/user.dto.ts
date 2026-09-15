export interface UserDTO {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender_name: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  roles: string[];
  teacher: Record<string, unknown> | null;
  student: Record<string, unknown> | null;
}

/**
 * Al crear un usuario con rol TEACHER o STUDENT, la API exige además los
 * campos del perfil correspondiente en el mismo request.
 */
export interface UserBodyDTO {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  password: string | null;
  gender: string | null;
  roles: number[];

  // Comunes a las fichas de docente y alumno
  document_type: string | null;
  document_number: string | null;
  phone: string | null;

  // Ficha de docente (rol TEACHER)
  specialty: string | null;
  experience_years: number | null;
  description: string | null;
  academic_degree: string | null;
  other_academic_degree: string | null;

  // Ficha de alumno (rol STUDENT)
  education_level: string | null;
  career: string | null;
  other_career: string | null;
  birth_date: string | null;
  address: string | null;
}
