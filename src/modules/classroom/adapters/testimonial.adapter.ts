import type { StudentTestimonialDTO } from "../dto/testimonial.dto";
import type { StudentTestimonial } from "../models/testimonial.model";

export const studentTestimonialAdapter = (
  dto: StudentTestimonialDTO,
): StudentTestimonial => ({
  id: dto.id,
  enrollmentCourseId: dto.enrollment_course_id,
  enrollmentItemId: dto.enrollment_item_id,
  // MySQL serializa el decimal como string.
  rating: Number(dto.rating),
  body: dto.body,
});
