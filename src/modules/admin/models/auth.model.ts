export interface MeResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender: "m" | "f" | "o";
  max_sessions: number;
  roles: string[];
  /** Descripción de cada rol, en el mismo orden que `roles`. Falta en sesiones guardadas antes. */
  roleDescriptions?: string[];
  /** Permisos del panel (`["*"]` = todos). La cookie de perfil no los guarda. */
  permissions: string[];
}
