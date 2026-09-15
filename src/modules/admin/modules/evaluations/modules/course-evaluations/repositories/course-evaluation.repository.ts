import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CourseEvaluationRepositoryTypes } from "../models/course-evaluation.model";
import { CourseEvaluationAdapter } from "../adapters/course-evaluation.adapter";
import type { CourseEvaluationBulkBodyDTO } from "../dto/course-evaluation.dto";

class CourseEvaluationRepository extends BaseRepository<CourseEvaluationRepositoryTypes> {
  constructor() {
    super("evaluations/courses", CourseEvaluationAdapter);
  }

  /** Upsert masivo del cuadro de evaluación. Ver el DTO: manda el cuadro completo. */
  async bulkSync(body: CourseEvaluationBulkBodyDTO): Promise<void> {
    await apiFractal.post(`${this.route}/actions/bulk-sync`, body);
  }
}

export default new CourseEvaluationRepository();
