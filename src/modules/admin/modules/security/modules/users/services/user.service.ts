import { BaseService } from "@/modules/admin/services/base.service";
import UserRepository from "../repositories/user.repository";
import type { UserRepositoryTypes } from "../models/user.model";

class UserService extends BaseService<
  typeof UserRepository,
  UserRepositoryTypes
> {
  constructor() {
    super(UserRepository);
  }
}

export default new UserService();
