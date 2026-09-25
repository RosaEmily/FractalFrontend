export interface ProfileRole {
  /** Identificador técnico del rol (ADMIN, TEACHER…), usado por guards. */
  name: string;
  /** Etiqueta legible para mostrar al usuario. */
  description: string | null;
}

export interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url: string | null;
  gender: "m" | "f" | "o";
  gender_name: string;
  roles: ProfileRole[];
  created_at: string;
  updated_at: string;
  /** Última vez que se cambió la contraseña (columna propia, no updated_at). */
  password_changed_at: string | null;
  /** 1 = activo, 0 = inactivo (users.status en la BD). */
  status: number;
  /** Sesiones simultáneas permitidas. Solo lectura: lo define un ADMIN. */
  max_sessions: number;
  /** Documento de la ficha académica. Null para un ADMIN, que no tiene. */
  document_number: string | null;
  document_type: string | null;
  /** Datos que viven en `students`/`teachers`. Null para un ADMIN. */
  profile: StudentProfile | TeacherProfile | null;
}

/**
 * ⚠️ `kind` discrimina la unión: sin él, TypeScript no puede distinguir qué
 * campos existen, porque alumno y docente comparten solo `phone`.
 */
export interface StudentProfile {
  kind: "student";
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  education_level: string | null;
  education_level_name: string | null;
  career: string | null;
  career_name: string | null;
  other_career: string | null;
}

export interface TeacherProfile {
  kind: "teacher";
  phone: string | null;
  specialty: string | null;
  experience_years: number | null;
  description: string | null;
  academic_degree: string | null;
  academic_degree_name: string | null;
  other_academic_degree: string | null;
}

export interface Session {
  id: number;
  ip_address: string | null;
  device_info: string | null;
  browser: string | null;
  device_type: string | null;
  os: string | null;
  /** Path del icono mdi según el tipo de dispositivo. */
  icon: string;
  location: string | null;
  last_activity: string;
  expires_at: string | null;
  is_current: boolean;
}
