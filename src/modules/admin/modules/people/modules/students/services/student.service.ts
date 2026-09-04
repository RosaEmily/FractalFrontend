import { BaseService } from "@/modules/admin/services/base.service";
import StudentRepository from "../repositories/student.repository";
import type { StudentRepositoryTypes } from "../models/student.model";

class StudentService extends BaseService<
  typeof StudentRepository,
  StudentRepositoryTypes
> {
  constructor() {
    super(StudentRepository);
  }
}

export default new StudentService();
