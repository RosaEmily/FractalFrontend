import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { EnrollmentDTO, PaymentStatus } from "../dto/enrollment.dto";

export interface EnrollmentCourse {
  id: number;
  offerCourseId: number;
  name: string;
  progressStatus: string | null;
}

export interface Enrollment {
  id: number;
  studentId: string;
  studentName: string;
  enrollmentDate: string;
  paymentStatus: PaymentStatus;
  paymentStatusName: string;
  amountFormat: string;
  courses: EnrollmentCourse[];
  /** Nombres de los cursos, para la columna de chips. */
  courseNames: string[];
  status: number;
  updated_at: string;
}

export interface EnrollmentRepositoryTypes {
  base: RepositoryBase<Enrollment, EnrollmentDTO>;
}
