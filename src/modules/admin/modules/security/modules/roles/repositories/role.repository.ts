import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { RoleRepositoryTypes } from "../models/role.model";
import { RoleAdapter } from "../adapters/role.adapter";

class RoleRepository extends BaseRepository<RoleRepositoryTypes> {
  constructor() {
    super("security/roles", RoleAdapter);
  }
}

export default new RoleRepository();
