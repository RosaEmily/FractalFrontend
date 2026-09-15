export interface LearningPathCourseItemDTO {
  course_id: number;
  name: string;
  order: number;
}

export interface LearningPathDTO {
  id: number;
  name: string;
  description: string | null;
  /** Precio ya formateado por la API — ej: "S/ 3,800.00". Solo para mostrar. */
  price: string | null;
  /** Valor numérico crudo, para formularios de edición. */
  price_raw: string | null;
  currency_id: number;
  image_url: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  /** Nombres de los cursos, ya ordenados. */
  courses: string[];
  /** Cursos con id y orden — necesarios para reconstruir el formulario. */
  course_items: LearningPathCourseItemDTO[];
}

export interface LearningPathCourseBodyDTO {
  course_id: number;
  order: number;
}

export interface LearningPathBodyDTO {
  name: string | null;
  description: string | null;
  price: number | null;
  currency_id: number | null;
  courses: LearningPathCourseBodyDTO[];
}
