import type { CourseEvaluation } from "../models/course-evaluation.model";
import type { CourseEvaluationDTO } from "../dto/course-evaluation.dto";

/**
 * Etiqueta de la píldora de tipo de programa.
 *
 * ⚠️ No confundir con el TIPO DE EVALUACIÓN (Examen / Práctica): el diseño
 * tiene las dos columnas y suenan igual. Esta dice si el programa es un curso
 * suelto o una línea de carrera.
 */
const OFFER_TYPE_LABELS: Record<string, string> = {
  course: "Curso",
  learning_path: "Línea",
};

export const CourseEvaluationAdapter = {
  one: (dto: CourseEvaluationDTO): CourseEvaluation => ({
    id: dto.id,
    offerCourseId: dto.offer_course_id,
    evaluationTypeId: dto.evaluation_type_id,
    name: dto.name,
    weight: Number(dto.weight),
    maxScore: Number(dto.max_score),
    courseName: dto.course_name ?? null,
    offerName: dto.offer_name ?? null,
    evaluationTypeName: dto.evaluation_type_name ?? null,
    teacherName: dto.teacher_name ?? null,
    offerType: dto.offer_type ?? null,
    offerTypeLabel: OFFER_TYPE_LABELS[dto.offer_type ?? ""] ?? null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: CourseEvaluationDTO[]): CourseEvaluation[] =>
    dtos.map((dto) => CourseEvaluationAdapter.one(dto)),
};
