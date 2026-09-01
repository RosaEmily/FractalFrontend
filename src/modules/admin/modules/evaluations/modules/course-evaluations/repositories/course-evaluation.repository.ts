import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CourseEvaluationRepositoryTypes } from "../models/course-evaluation.model";
import { CourseEvaluationAdapter } from "../adapters/course-evaluation.adapter";

class CourseEvaluationRepository extends BaseRepository<CourseEvaluationRepositoryTypes> {
  constructor() {
    super("evaluations/courses", CourseEvaluationAdapter);
  }
}

export default new CourseEvaluationRepository();
