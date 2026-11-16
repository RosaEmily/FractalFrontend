/** Shape de `landing/testimonials`: coincide 1:1 con `Review` de `ReviewsSection.vue`. */
export interface TestimonialDTO {
  name: string | null;
  career: string | null;
  /**
   * ⚠️ Profesión/empresa actual del alumno: no existe en el esquema
   * (`students` solo guarda `career`, la disciplina que estudió). El backend
   * la devuelve vacía hasta que el negocio decida dónde capturarla.
   */
  work: string;
  image: string | null;
  opinion: string;
  stars: number;
  program: string | null;
}
