import type { Testimonial } from "../models/testimonial.model";
import type { TestimonialDTO } from "../dto/testimonial.dto";

/** Un diploma acredita una línea de carrera; el otro caso es un curso puntual. */
const SUBJECT_TYPE_LABEL: Record<string, string> = {
  course: "Curso",
  learning_path: "Línea de carrera",
};

export const TestimonialAdapter = {
  one: (dto: TestimonialDTO): Testimonial => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id ?? null,
    enrollmentItemId: dto.enrollment_item_id ?? null,
    // MySQL serializa el decimal como string.
    rating: Number(dto.rating),
    body: dto.body,
    isFeatured: Boolean(dto.is_featured),
    studentName: dto.student_name ?? null,
    studentDocument: dto.student_document ?? null,
    studentCareer: dto.student_career ?? null,
    subjectName: dto.subject_name ?? null,
    subjectType: dto.subject_type,
    subjectTypeLabel: SUBJECT_TYPE_LABEL[dto.subject_type] ?? "Curso",
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: TestimonialDTO[]): Testimonial[] =>
    dtos.map((dto) => TestimonialAdapter.one(dto)),
};
