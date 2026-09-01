import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { StudentEvaluationRepositoryTypes } from "../models/student-evaluation.model";
import { StudentEvaluationAdapter } from "../adapters/student-evaluation.adapter";

class StudentEvaluationRepository extends BaseRepository<StudentEvaluationRepositoryTypes> {
  constructor() {
    super("evaluations/students", StudentEvaluationAdapter);
  }
}

export default new StudentEvaluationRepository();
