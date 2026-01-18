import type { MeResponse } from "../models/auth.model";
import type { MeResponseDTO } from "../dto/auth.dto";

export const meAdapter = {
  one: (dto: MeResponseDTO): MeResponse => ({
    id: dto.id,
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    photo_url: dto.photo_url,
    gender: dto.gender,
    max_sessions: dto.max_sessions,
    roles: dto.roles.map((role) => role.name),
  }),

  many: (dtos: MeResponseDTO[]): MeResponse[] =>
    dtos.map((dto) => meAdapter.one(dto)),
};
