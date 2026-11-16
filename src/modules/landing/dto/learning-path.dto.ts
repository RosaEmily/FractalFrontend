/** Shape de `landing/learning-paths`: líneas de carrera con al menos una oferta activa. */
export interface LearningPathDTO {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  offers_count: number;
}
