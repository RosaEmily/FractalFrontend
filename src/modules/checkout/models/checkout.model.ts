/** Cómo cobra un método: decide qué pantalla de pago se muestra. */
export type PaymentMethodType = "card" | "wallet" | "redirect";

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  type: PaymentMethodType;
  sort_order: number;
}

/**
 * Una línea del carrito.
 *
 * `isPath` NO sale del campo `type` de la oferta sino de cuántos cursos trae,
 * igual que en el detalle del programa: un programa de un solo curso se compra
 * y se lee como curso suelto aunque esté marcado como línea de carrera.
 */
export interface CartItem {
  offerId: number;
  name: string;
  prefix: string;
  imageUrl: string;
  price: number;
  isPath: boolean;
  kind: string;
  meta: string;
  courseCount: number;
  durationMonths: number;
  currencyId: number;
}

/** Motivo por el que una línea del carrito no se puede comprar. */
export interface CartProblem {
  offer_id: number | null;
  code: "not_found" | "sold_out" | "already_enrolled" | "mixed_currency";
  message: string;
}

/** Importes calculados por el backend: el front nunca recalcula el IGV. */
export interface CartTotals {
  subtotal: number;
  total: number;
  base: number;
  igv: number;
  igv_rate: number;
}

export interface CartValidation {
  valid: boolean;
  problems: CartProblem[];
  totals: CartTotals;
}

export interface PurchaseResult {
  enrollment_id: number;
  total_amount: number;
  payment_status: string;
}
