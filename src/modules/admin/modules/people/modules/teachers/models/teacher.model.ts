import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { TeacherDTO, TeacherBodyDTO } from "../dto/teacher.dto";

export interface Teacher {
  /** La API usa document_number como identificador, no un id numérico. */
  document_number: string;
  document_type: string | null;
  /** "DNI 41022310" — tipo y número juntos, como en el diseño. */
  documentLabel: string;
  /** Id del usuario dueño de este perfil: la foto y el correo viven allí. */
  user_id: number | null;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  specialty: string | null;
  experience_years: number | null;
  description: string | null;
  academic_degree: string | null;
  academic_degree_name: string | null;
  other_academic_degree: string | null;
  cv: string | null;
  is_favorite: number;
  status: number;
  updated_at: string;
}

export interface TeacherRepositoryTypes {
  base: RepositoryBase<Teacher, TeacherDTO>;
  create: { body: TeacherBodyDTO };
  update: { body: TeacherBodyDTO };
}
