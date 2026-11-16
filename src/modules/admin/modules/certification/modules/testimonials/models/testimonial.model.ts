import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  TestimonialDTO,
  TestimonialBodyDTO,
  TestimonialUpdateBodyDTO,
  TestimonialSubjectType,
} from "../dto/testimonial.dto";

export interface Testimonial {
  id: number;
  enrollmentCourseId: number | null;
  enrollmentItemId: number | null;
  rating: number;
  body: string;
  isFeatured: boolean;
  studentName: string | null;
  studentDocument: string | null;
  studentCareer: string | null;
  /** Curso puntual, o línea de carrera si es un testimonio de diploma. */
  subjectName: string | null;
  subjectType: TestimonialSubjectType;
  /** "Curso" / "Línea de carrera", ya resuelto para la UI. */
  subjectTypeLabel: string;
  status: number;
  updated_at: string;
}

export interface TestimonialRepositoryTypes {
  base: RepositoryBase<Testimonial, TestimonialDTO>;
  create: { body: TestimonialBodyDTO };
  update: { body: TestimonialUpdateBodyDTO };
}
