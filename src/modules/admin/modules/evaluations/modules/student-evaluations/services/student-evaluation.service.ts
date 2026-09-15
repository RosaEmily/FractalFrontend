import { BaseService } from "@/modules/admin/services/base.service";
import StudentEvaluationRepository from "../repositories/student-evaluation.repository";
import type { StudentEvaluationRepositoryTypes } from "../models/student-evaluation.model";

class StudentEvaluationService extends BaseService<
  typeof StudentEvaluationRepository,
  StudentEvaluationRepositoryTypes
> {
  constructor() {
    super(StudentEvaluationRepository);
  }
}

export default new StudentEvaluationService();
