export interface AuthResponse {
  expires_at: string;
  /** Zona confirmada por el backend. */
  zone: string;
  roles: string[];
}
