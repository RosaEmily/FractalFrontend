export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface EnrollmentCourseDTO {
  /** enrollment_course_id: lo exigen Notas, Notas finales y Certificados. */
  id: number;
  offer_course_id: number;
  name: string | null;
  progress_status: string | null;
}

export interface EnrollmentDTO {
  id: number;
  student_id: string;
  student_name: string | null;
  enrollment_date: string;
  payment_status: PaymentStatus;
  payment_status_name: string;
  amount_format: string | null;
  courses: EnrollmentCourseDTO[];
  status: number;
  created_at: string;
  updated_at: string;
}
