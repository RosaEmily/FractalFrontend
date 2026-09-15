import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { UserRepositoryTypes } from "../models/user.model";
import { userAdapter } from "../adapters/user.adapter";

class UserRepository extends BaseRepository<UserRepositoryTypes> {
  constructor() {
    super("security/users", userAdapter);
  }
}

export default new UserRepository();
