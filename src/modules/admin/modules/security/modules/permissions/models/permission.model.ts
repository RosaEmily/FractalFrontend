import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { PermissionDTO } from "../dto/permission.dto";

export interface Permission {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionRepositoryTypes {
  base: RepositoryBase<Permission, PermissionDTO>;
}
