export interface MeResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  gender: "m" | "f" | "o";
  max_sessions: number;
  roles: string[];
}
