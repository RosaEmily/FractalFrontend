import { BaseService } from "@/modules/admin/services/base.service";
import RoleRepository from "../repositories/role.repository";
import type { RoleRepositoryTypes } from "../models/role.model";

class RoleService extends BaseService<
  typeof RoleRepository,
  RoleRepositoryTypes
> {
  constructor() {
    super(RoleRepository);
  }
}

export default new RoleService();
