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
  roles: ProfileRoleDTO[];
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
export interface ProfileUpdateBodyDTO {
  first_name: string | null;
  last_name: string | null;
  gender: "m" | "f" | "o" | null;
  max_sessions: number | null;
}

/** Body del formulario de cambio de contraseña. */
export interface ChangePasswordBodyDTO {
  current_password: string | null;
  password: string | null;
  password_confirmation: string | null;
}
