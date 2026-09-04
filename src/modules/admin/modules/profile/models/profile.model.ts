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
