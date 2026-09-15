/**
 * El login ya NO devuelve el token: viaja en una cookie HttpOnly que emite el
 * backend y que el JavaScript no puede leer.
 */
export interface AuthResponseDTO {
  expires_at: string;
  zone: string;
  roles: string[];
}

export interface AuthRequestDTO {
  email: string;
  password: string;
  /** Por qué puerta entra: decide la cookie que emite el backend. */
  zone?: string;
}
