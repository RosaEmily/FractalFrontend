export interface AuthResponseDTO {
  token: string;
  expires_at: string;
}

export interface AuthRequestDTO {
  email: string;
  password: string;
}
