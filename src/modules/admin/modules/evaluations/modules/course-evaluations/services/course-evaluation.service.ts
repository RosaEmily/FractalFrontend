import { BaseService } from "@/modules/admin/services/base.service";
import CourseEvaluationRepository from "../repositories/course-evaluation.repository";
import type { CourseEvaluationRepositoryTypes } from "../models/course-evaluation.model";

class CourseEvaluationService extends BaseService<
  typeof CourseEvaluationRepository,
  CourseEvaluationRepositoryTypes
> {
  constructor() {
    super(CourseEvaluationRepository);
  }
}

export default new CourseEvaluationService();
