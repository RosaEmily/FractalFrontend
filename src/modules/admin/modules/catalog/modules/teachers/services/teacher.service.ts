import { BaseService } from "@/modules/admin/services/base.service";
import TeacherRepository from "../repositories/teacher.repository";
import type { TeacherRepositoryTypes } from "../models/teacher.model";

class TeacherService extends BaseService<
  typeof TeacherRepository,
  TeacherRepositoryTypes
> {
  constructor() {
    super(TeacherRepository);
  }
}

export default new TeacherService();
