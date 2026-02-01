import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { RoleDTO } from "../dto/role.dto";

export interface Role {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  permissions: string[];
}

export interface RoleRepositoryTypes {
  base: RepositoryBase<Role, RoleDTO>;
}
