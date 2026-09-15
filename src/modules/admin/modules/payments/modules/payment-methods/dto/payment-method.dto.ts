export interface PaymentMethodDTO {
  id: number;
  name: string;
  description: string | null;
  /** Columna real de la tabla. */
  active: number;
  /** Espejo de `active` que expone la API para el grid del admin. */
  status: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodBodyDTO {
  name: string | null;
  description: string | null;
}
