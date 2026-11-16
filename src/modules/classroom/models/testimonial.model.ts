export interface StudentTestimonial {
  id: number;
  enrollmentCourseId: number | null;
  enrollmentItemId: number | null;
  rating: number;
  body: string;
}
