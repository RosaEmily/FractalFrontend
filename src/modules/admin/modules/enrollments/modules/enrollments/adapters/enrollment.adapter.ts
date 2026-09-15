import dayjs from "dayjs";
import type { Enrollment, EnrollmentCourse } from "../models/enrollment.model";
import type { EnrollmentDTO } from "../dto/enrollment.dto";

export const EnrollmentAdapter = {
  one: (dto: EnrollmentDTO): Enrollment => {
    const courses: EnrollmentCourse[] = (dto.courses ?? []).map((item) => ({
      id: item.id,
      offerCourseId: item.offer_course_id,
      name: item.name ?? "—",
      progressStatus: item.progress_status,
    }));

    return {
      id: dto.id,
      studentId: dto.student_id,
      studentName: dto.student_name ?? "—",
      enrollmentDate: dto.enrollment_date
        ? dayjs(dto.enrollment_date).format("DD/MM/YYYY")
        : "—",
      paymentStatus: dto.payment_status,
      paymentStatusName: dto.payment_status_name,
      amountFormat: dto.amount_format ?? "—",
      courses,
      courseNames: courses.map((course) => course.name),
      status: dto.status,
      updated_at: dto.updated_at,
    };
  },

  many: (dtos: EnrollmentDTO[]): Enrollment[] =>
    dtos.map((dto) => EnrollmentAdapter.one(dto)),
};
