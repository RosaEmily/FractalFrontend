import { BaseService } from "@/modules/admin/services/base.service";
import CourseEvaluationRepository from "../repositories/course-evaluation.repository";
import type { CourseEvaluationRepositoryTypes } from "../models/course-evaluation.model";
import type { CourseEvaluationBulkBodyDTO } from "../dto/course-evaluation.dto";

class CourseEvaluationService extends BaseService<
  typeof CourseEvaluationRepository,
  CourseEvaluationRepositoryTypes
> {
  constructor() {
    super(CourseEvaluationRepository);
  }

  /** Upsert masivo del cuadro de evaluación. */
  bulkSync(body: CourseEvaluationBulkBodyDTO): Promise<void> {
    return CourseEvaluationRepository.bulkSync(body);
  }
}

export default new CourseEvaluationService();
