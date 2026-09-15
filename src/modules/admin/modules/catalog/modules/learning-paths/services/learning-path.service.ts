import { BaseService } from "@/modules/admin/services/base.service";
import LearningPathRepository from "../repositories/learning-path.repository";
import type { LearningPathRepositoryTypes } from "../models/learning-path.model";
import type { LearningPathCourseBodyDTO } from "../dto/learning-path.dto";

/**
 * El formulario trabaja con un array plano de ids (`number[]`), pero la API
 * espera `courses: [{ course_id, order }]`. El orden lo define la posición
 * en el array — el primer curso seleccionado es el primero de la ruta.
 */
export const toCourseItems = (
  courseIds: number[] = [],
): LearningPathCourseBodyDTO[] =>
  courseIds.map((courseId, index) => ({
    course_id: courseId,
    order: index + 1,
  }));

class LearningPathService extends BaseService<
  typeof LearningPathRepository,
  LearningPathRepositoryTypes
> {
  constructor() {
    super(LearningPathRepository);
  }
}

export default new LearningPathService();
