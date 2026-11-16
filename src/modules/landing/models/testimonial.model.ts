export interface Testimonial {
  name: string;
  career: string;
  work: string;
  /** "" cuando el alumno no tiene foto: `Review.image` no es nullable. */
  image: string;
  opinion: string;
  stars: number;
  program?: string;
}
