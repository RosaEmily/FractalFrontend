// services/permission.service.ts
import { BaseService } from "@/modules/admin/services/base.service";
import permissionRepository from "../repositories/permission.repository";
import type { PermissionRepositoryTypes } from "../models/permission.model";

class PermissionService extends BaseService<
  typeof permissionRepository,
  PermissionRepositoryTypes
> {
  constructor() {
    super(permissionRepository);
  }
}

export default new PermissionService();
