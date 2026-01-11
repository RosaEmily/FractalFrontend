import type { AuthResponse } from "../models/auth.model";
import type { AuthResponseDTO } from "../dto/auth.dto";

export const authAdapter = {
  one: (dto: AuthResponseDTO): AuthResponse => ({
    token: dto.token,
    expires_at: dto.expires_at,
  }),

  many: (dtos: AuthResponseDTO[]): AuthResponse[] =>
    dtos.map((dto) => authAdapter.one(dto)),
};
