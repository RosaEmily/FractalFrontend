import type { Permission } from "../models/permission.model";
import type { PermissionDTO } from "../dto/permission.dto";

export const permissionAdapter = {
  one: (dto: PermissionDTO): Permission => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  }),

  many: (dtos: PermissionDTO[]): Permission[] =>
    dtos.map((dto) => permissionAdapter.one(dto)),
};
