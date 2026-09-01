import type { User } from "../models/user.model";
import type { UserDTO } from "../dto/user.dto";

export const userAdapter = {
  one: (dto: UserDTO): User => ({
    id: dto.id,
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    full_name: `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim(),
    photo_url: dto.photo_url,
    gender_name: dto.gender_name,
    roles: dto.roles ?? [],
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: UserDTO[]): User[] => dtos.map((dto) => userAdapter.one(dto)),
};
