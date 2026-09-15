import { BaseService } from "@/modules/admin/services/base.service";
import ClassSessionRepository from "../repositories/class-session.repository";
import type { ClassSessionRepositoryTypes } from "../models/class-session.model";

class ClassSessionService extends BaseService<
  typeof ClassSessionRepository,
  ClassSessionRepositoryTypes
> {
  constructor() {
    super(ClassSessionRepository);
  }
}

export default new ClassSessionService();
