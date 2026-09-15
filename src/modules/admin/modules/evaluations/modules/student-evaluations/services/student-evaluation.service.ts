import { BaseService } from "@/modules/admin/services/base.service";
import StudentEvaluationRepository from "../repositories/student-evaluation.repository";
import type { StudentEvaluationRepositoryTypes } from "../models/student-evaluation.model";
import type { StudentEvaluationBulkBodyDTO } from "../dto/student-evaluation.dto";

class StudentEvaluationService extends BaseService<
  typeof StudentEvaluationRepository,
  StudentEvaluationRepositoryTypes
> {
  constructor() {
    super(StudentEvaluationRepository);
  }

  /** Upsert masivo de notas. */
  bulkSync(body: StudentEvaluationBulkBodyDTO): Promise<void> {
    return StudentEvaluationRepository.bulkSync(body);
  }
}

export default new StudentEvaluationService();
