export interface TagDTO {
  id: number;
  name: string;
  slug: string;
  /** Cuántos cursos usan la etiqueta (lo calcula la API). */
  courses_count: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface TagBodyDTO {
  name: string | null;
  /** Obligatorio en la API; el formulario lo sugiere desde el nombre. */
  slug: string | null;
}
