export interface MeRoleDTO {
  id: number;
  name: "STUDENT" | "ADMIN" | "TEACHER";
  description: string;
}

export interface MeResponseDTO {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender: "m" | "f" | "o";
  gender_name: string;
  max_sessions: number;
  status: number;
  created_at: string; // ISO Date
  updated_at: string; // ISO Date
  roles: MeRoleDTO[];
}
