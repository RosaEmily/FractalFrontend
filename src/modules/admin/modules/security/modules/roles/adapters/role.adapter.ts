import type { Role } from "../models/role.model";
import type { RoleDTO } from "../dto/role.dto";

export const RoleAdapter = {
  one: (dto: RoleDTO): Role => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    permissions: dto.permissions,
  }),

  many: (dtos: RoleDTO[]): Role[] => dtos.map((dto) => RoleAdapter.one(dto)),
};
