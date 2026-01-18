import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { PermissionRepositoryTypes } from "../models/permission.model";
import { permissionAdapter } from "../adapters/permission.adapter";

class PermissionRepository extends BaseRepository<PermissionRepositoryTypes> {
  constructor() {
    super("security/permissions", permissionAdapter);
  }
}

export default new PermissionRepository();
