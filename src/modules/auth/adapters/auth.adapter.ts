import type { AuthResponse } from "../models/auth.model";
import type { AuthResponseDTO } from "../dto/auth.dto";

export const authAdapter = {
  one: (dto: AuthResponseDTO): AuthResponse => ({
    expires_at: dto.expires_at,
    zone: dto.zone,
    roles: dto.roles ?? [],
  }),

  many: (dtos: AuthResponseDTO[]): AuthResponse[] =>
    dtos.map((dto) => authAdapter.one(dto)),
};
