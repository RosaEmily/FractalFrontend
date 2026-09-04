export interface CourseDTO {
  id: number;
  name: string;
  description: string | null;
  /** Precio ya formateado por la API — ej: "$ 149.99". Solo para mostrar. */
  price: string | null;
  /** Valor numérico crudo, para formularios de edición. */
  price_raw: string | null;
  currency_id: number;
  image_url: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  tag_ids: number[];
}

export interface CourseBodyDTO {
  name: string | null;
  description: string | null;
  price: number | null;
  currency_id: number | null;
  tags?: number[];
}
