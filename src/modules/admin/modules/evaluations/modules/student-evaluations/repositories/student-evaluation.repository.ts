import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { StudentEvaluationRepositoryTypes } from "../models/student-evaluation.model";
import { StudentEvaluationAdapter } from "../adapters/student-evaluation.adapter";
import type { StudentEvaluationBulkBodyDTO } from "../dto/student-evaluation.dto";

class StudentEvaluationRepository extends BaseRepository<StudentEvaluationRepositoryTypes> {
  constructor() {
    super("evaluations/students", StudentEvaluationAdapter);
  }

  /** Upsert masivo de notas. Ver el DTO: una celda vacía guarda null, no 0. */
  async bulkSync(body: StudentEvaluationBulkBodyDTO): Promise<void> {
    await apiFractal.post(`${this.route}/actions/bulk-sync`, body);
  }
}

export default new StudentEvaluationRepository();
