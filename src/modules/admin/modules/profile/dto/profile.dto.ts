import type {
  StudentProfile,
  TeacherProfile,
} from "../models/profile.model";

export interface ProfileDTO {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender: "m" | "f" | "o";
  gender_name: string;
  created_at: string;
  updated_at: string;
  password_changed_at: string | null;
  status: number;
  max_sessions: number;
  roles: ProfileRoleDTO[];  document_number?: string | null;
  document_type?: string | null;
  profile?: StudentProfile | TeacherProfile | null;
}

export interface ProfileRoleDTO {
  name: string;
  description: string | null;
}

export interface SessionDTO {
  id: number;
  ip_address: string | null;
  device_info: string | null;
  browser: string | null;
  browser_version: string | null;
  device_type: string | null;
  screen_resolution: string | null;
  language: string | null;
  timezone: string | null;
  geo_location: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  is_current: boolean;
}

export interface ChangePasswordResponseDTO {
  revoked_sessions: number;
}

/** Body del formulario de datos personales. */
/**
 * Body del formulario del ADMIN. Sus cuatro campos son obligatorios porque
 * `CrudForm` los declara en su schema y los da siempre definidos.
 */
export interface ProfileUpdateBodyDTO {
  first_name: string | null;
  last_name: string | null;
  gender: "m" | "f" | "o" | null;
  max_sessions: number | null;
}

/**
 * Body del perfil del AULA, que además edita la ficha académica.
 *
 * ⚠️ Va aparte del DTO del admin y NO lo extiende con campos opcionales: el
 * formulario del admin usa `CrudForm`, que tipa sus `fields` a partir del
 * schema, y hacer opcionales los cuatro de arriba los volvía
 * `possibly undefined` en sus cuatro `v-model`. Son dos formularios distintos
 * contra el mismo endpoint.
 */
export interface AulaProfileUpdateBodyDTO {
  first_name?: string | null;
  last_name?: string | null;
  gender?: "m" | "f" | "o" | null;
  phone?: string | null;
  address?: string | null;
  birth_date?: string | null;
  education_level?: string | null;
  career?: string | null;
  other_career?: string | null;
  specialty?: string | null;
  experience_years?: number | null;
  description?: string | null;
  academic_degree?: string | null;
  other_academic_degree?: string | null;
}

/** Body del formulario de cambio de contraseña. */
export interface ChangePasswordBodyDTO {
  current_password: string | null;
  password: string | null;
  password_confirmation: string | null;
}
